<style scoped>
.tab-area-container {
    /* width: 100%; */
    /* height: 40px; */
    /* background-color: rgb(220, 220, 220); */
    /* display: flex; */
    /* flex-direction: row; */
    /* justify-content: space-between; */
    /* overflow-x: hidden; */
    /* padding: 8px; */

    position: relative;
    z-index: 3;
}

.tab-area-top {
    display: flex;
    flex-grow: 1;
}
.tab-area {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 1px 0;
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

    white-space: nowrap;
    height: 32px;
}
.tab.active {
    /* border: 1px solid rgb(100, 100, 100); */
    background-color: #d8dade;
    /* font-weight: bold; */
}

.tab.trash {
    /* min-width: 100px; */
    width: 100%;
    display: inline-flex;
    /* flex-grow: 1; */
    /* justiy-self: flex-end; */
    visibility: hidden;
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
.trash.ui-droppable-active {
    visibility: visible !important;
}
.trash.ui-droppable-hover {
    background-color: rgb(255, 0, 0) !important;
}
</style>

<template>
    <!-- .canvas-background -->
    <ion-grid class="tab-area-container">
        <ion-row>
            <ion-col size="11">
                <div class="tab-area-top">
                    <div class="tab-area slim-scrollbar">
                        <div
                            v-for="tab in tabs"
                            :class="['tab', tab.tab_id === store.currentTabIndex ? 'active' : '']"
                            :key="tab.tab_id"
                            :data-id="tab.tab_id"
                            @click="store.selectTab(tab.tab_id)"
                            @contextmenu.prevent="tabActionSheet(tab)"
                        >
                            {{ String(tab.name).substring(0, 12) }}
                            {{ String(tab.name).length > 12 ? "..." : "" }}
                            [{{ amountNotes(tab) }}]
                        </div>
                    </div>
                    <div
                        @click="newTabPrompt"
                        class="tab"
                        style="margin: 0 10px"
                    >
                        +
                    </div>
                </div>
            </ion-col>
            <ion-col
                v-show="store.display === 'board'"
                size="1"
            >
                <div
                    class="tab trash"
                    id="droppable-delete"
                >
                    <ion-icon :icon="trashOutline"></ion-icon>
                </div>
            </ion-col>
        </ion-row>
    </ion-grid>
    <!-- <div class="tab-area-container canvas-background"></div> -->
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, computed, onUpdated } from "vue";
import { alertController, actionSheetController, IonCol, IonGrid, IonRow, IonIcon } from "@ionic/vue";
import { trashOutline } from "ionicons/icons";

import { noteStore, AppSettings } from "@/store/store";
const store = noteStore();

const displayTabs = computed(() => {
    return store.appSettings.displayTabs;
});
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
    setTimeout(() => {
        const tabs: any = $(".tab-area .tab");
        console.log("initTabDroppable", tabs);

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

        const droppableElement: any = $("#droppable-delete");
        droppableElement.droppable({
            greedy: true,
            accept: ".note",
            tolerance: "pointer",
            classes: {
                // "ui-droppable-active": "ui-state-active",
                // "ui-droppable-hover": "droppable-paint-delete",
            },
            drop: function (event, ui) {
                const noteId = ui.draggable.data("note-id");
                console.log("dropped", noteId);
                if (confirm("Are you sure you want to delete this note?")) {
                    const note = store.notes[noteId];
                    store.deleteNote(note);
                }
                // remove class even if fail
                ui.draggable.removeClass("ui-state-highlight");
                tabs.droppable("enable");
            },
            out: function (event, ui) {
                ui.draggable.removeClass("ui-state-highlight");
                tabs.droppable("enable");
            },
            over: function (event, ui) {
                ui.draggable.addClass("ui-state-highlight");
                tabs.droppable("disable");
            },
        });
    }, 100);

    setTimeout(() => {}, 500);
}
function initTabSortable() {
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
}
onMounted(() => {
    $(function () {
        initTabSortable();
        initTabDroppable();

        const tabAreaNativeElem = document.querySelector(".tab-area");
        if (tabAreaNativeElem) {
            tabAreaNativeElem.addEventListener("wheel", (e: Event) => {
                // @ts-ignore
                tabAreaNativeElem.scrollLeft += e.deltaY;
            });
        }
    });
});
onUpdated(() => {
    initTabSortable();
    initTabDroppable();
});
watch(tabs, () => {
    initTabSortable();
    initTabDroppable();
});
</script>
