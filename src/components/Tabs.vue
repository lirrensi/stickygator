<style scoped>
.tab-area-container {
    width: 100%;
    /* height: 40px; */
    /* background-color: rgb(220, 220, 220); */
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;

    position: relative;
    z-index: 3;
}
.tab-area {
    display: flex;
    flex-flow: row wrap;
}
.tab {
    cursor: pointer;

    font-variant: tabular-nums;

    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    /* border: 1px solid rgb(210, 210, 210); */
    background-color: #f6f8fc;
    border-radius: 10px;
    /* border-bottom: 3px solid rgba(100, 100, 100, 0.1); */
    margin-right: 4px;
}
.tab.active {
    /* border: 1px solid rgb(100, 100, 100); */
    background-color: #d8dade;
    /* font-weight: bold; */
}

.ion-palette-dark .tab-area-container {
    /* background-color: rgb(38, 38, 38); */
    /* border-bottom: 1px solid rgba(200, 200, 200, 0.25); */
}
.ion-palette-dark .tab {
    /* border: 1px dashed rgba(200, 200, 200, 1);
    border-bottom: 3px solid rgba(200, 200, 200, 0.1); */
    background-color: #2f2f2f;
    opacity: 0.5;
}
.ion-palette-dark .tab.active {
    /* border-bottom: 3px solid rgba(255, 255, 255); */
    background-color: #2f2f2f;
    opacity: 1;
}

.ui-droppable-active {
    /* background-color: rgba(189, 69, 69, 0.2); */
    outline: 1px solid #fff;
}
.ui-droppable-hover {
    background-color: rgb(91, 255, 203) !important;
    opacity: 1 !important;
}
</style>

<template>
    <div class="tab-area-container canvas-background">
        <div class="tab-area">
            <div
                v-for="tab in tabs"
                :class="['tab', tab.tab_id === store.currentTabIndex ? 'active' : '']"
                :key="tab.tab_id"
                :data-id="tab.tab_id"
                @click="store.selectTab(tab.tab_id)"
                @contextmenu.prevent="tabActionSheet(tab)"
            >
                {{ tab.name }}
                [{{ amountNotes(tab) }}]
            </div>
        </div>
        <!-- <vue-draggable-next
                    class="tab-area"
                    :list="tabs"
                    @change="onTabMoved"
                >
                </vue-draggable-next> -->
        <div
            @click="newTabPrompt"
            class="tab"
        >
            +
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, computed, onUpdated } from "vue";
import { alertController, actionSheetController } from "@ionic/vue";

import { noteStore, AppSettings } from "@/store/store";
const store = noteStore();

const tabs = computed(() => Object.values(store.tabs).sort((a, b) => a.order - b.order));
const amountNotes = tab => Object.values(store.notes).filter(note => note.tab_id === tab.tab_id).length;

// tabs controls
const newTabPrompt = async () => {
    const alert = await alertController.create({
        header: "Create a new tab",
        inputs: [
            {
                placeholder: "Name",
                attributes: {
                    maxlength: 24,
                },
            },
        ],
        buttons: [
            {
                text: "Cancel",
                role: "cancel",
                handler: () => {
                    console.log("Alert canceled");
                },
            },
            {
                text: "OK",
                role: "confirm",
                handler: data => {
                    console.log("Alert confirmed", data[0]);
                    if (data[0].length >= 2) {
                    }
                    store.createTab(data[0]);
                },
            },
        ],
    });

    await alert.present();
};
const tabActionSheet = async tab => {
    const actionSheet = await actionSheetController.create({
        header: "Tab",
        buttons: [
            {
                text: "Rename",
                data: {
                    action: "share",
                },
                handler: async () => {
                    const alert = await alertController.create({
                        header: "Rename tab",
                        inputs: [
                            {
                                placeholder: "Name",
                                value: tab.name,
                                attributes: {
                                    maxlength: 24,
                                },
                            },
                        ],
                        buttons: [
                            {
                                text: "Cancel",
                                role: "cancel",
                                handler: () => {
                                    console.log("Rename canceled");
                                },
                            },
                            {
                                text: "OK",
                                role: "confirm",
                                handler: data => {
                                    console.log("Alert confirmed", data[0]);
                                    if (data[0].length >= 2) {
                                    }
                                    store.renameTab(tab, data[0]);
                                },
                            },
                        ],
                    });
                    alert.present();
                },
            },
            {
                text: "Delete",
                role: "destructive",
                data: {
                    action: "delete",
                },
                handler: () => {
                    const message = `
                    Are you sure you want to delete ${tab.name} tab?
                    All notes will be deleted.
                    It has ${amountNotes(tab)} notes.
                    No undo.
                    `;
                    if (confirm(message)) {
                        store.deleteTab(tab);
                    }
                },
            },

            {
                text: "Cancel",
                role: "cancel",
                data: {
                    action: "cancel",
                },
            },
        ],
    });

    await actionSheet.present();
};

function initTabDroppable() {
    const tabs: any = $(".tab-area .tab");

    tabs.droppable({
        accept: ".note",
        tolerance: "pointer",
        classes: {
            // "ui-droppable-active": "ui-state-active",
            // "ui-droppable-hover": "ui-state-hover",
        },
        drop: function (event, ui) {
            const tabId = $(event.target).data("id");
            const noteId = ui.draggable.data("note-id");
            console.log("dropped", tabId, noteId);
            // need to wait for draggable hander to upd position;
            setTimeout(() => {
                store.moveNoteToNewTab(noteId, tabId);
            }, 100);
        },
    });
}
onMounted(() => {
    $(function () {
        const tabArea: any = $(".tab-area");

        tabArea.sortable({
            axis: "x",
            tolerance: "pointer",
            update(event, ui) {
                console.log("tabArea.update", event, ui);
                const newSortedTabs = $(".tab")
                    .map(function () {
                        return $(this).data("id");
                    })
                    .get()
                    .filter(id => id);
                console.log("newSortedTabs", newSortedTabs);
                store.sortTabs(newSortedTabs);
            },
        });
        initTabDroppable();
    });
});
onUpdated(() => {
    initTabDroppable();
});
</script>
