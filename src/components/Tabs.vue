<style scoped>
.tab-area-container {
    position: relative;
    z-index: 3;
    display: flex;

    padding: 6px;
}

/* control classes */
.topbar {
}
.sidebar {
}

.tab-area-container.topbar {
    width: 100%;
    padding: 4px;

    flex-direction: row;
    justify-content: space-between;
}
.tab-area-container.sidebar {
    height: 100%;

    flex-direction: column;
}
.tab-area-container.sidebar.enabled {
    width: 300px;
}
.tab-area-container.sidebar.disabled {
    width: 1px;
}

.tab-area-top {
    display: flex;
    flex-grow: 1;
    /* padding: 4px; */
    /* padding-left: 8px; */
}
.topbar .tab-area-top {
    flex-direction: row;
    width: 90%;
    /* to accomodate sidebar  */
    /* padding-bottom: 8px; */
}
.sidebar .tab-area-top {
    flex-direction: column;
    flex-grow: 1;

    height: auto;
    overflow-x: hidden;
    /* overflow-y: scroll; */
}
.tab-area {
    display: flex;
    padding-bottom: 4px;
}
@-moz-document url-prefix() {
    .tab-area {
        padding-bottom: 8px;
    }
}
.topbar .tab-area {
    flex-direction: row;
    overflow-x: scroll;
    overflow-y: hidden;
}
.sidebar .tab-area {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
}
.tab {
    cursor: pointer;

    font-variant: tabular-nums;

    display: inline-flex;

    align-items: center;
    padding: 5px 10px;
    /* border: 1px solid rgb(210, 210, 210); */
    background-color: #f6f8fc;
    border-radius: 10px;
    /* border-bottom: 3px solid rgba(100, 100, 100, 0.1); */

    /* margin-right: 4px; */

    white-space: nowrap;
    height: 32px;
}
.topbar .tab {
    padding: 5px 10px;
    margin: 0 4px;
    justify-content: center;
}
.sidebar .tab {
    /* padding: 10px 5px; */
    margin: 4px 0px;
    justify-content: space-between;
}
.tab.active {
    /* border: 1px solid rgb(100, 100, 100); */
    background-color: #d8dade;
    /* font-weight: bold; */
}

.newtab {
    border: 1px solid rgb(178, 178, 178);
    justify-content: center !important;
}
.topbar .newtab {
    margin: 0 10px;
}
.sidebar .newtab {
    margin-bottom: 16px;
}

.trash {
    width: 5vw;
    width: 100%;
}
.tab.trash {
    /* min-width: 100px; */
    display: flex;
    justify-content: center;
    /* flex-grow: 1; */
    /* justiy-self: flex-end; */
    visibility: hidden;
}
.topbar .trash {
    max-width: 80px;
}
.sidebar .trash {
    height: 48px;
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

.text-no-overflow {
    white-space: nowrap; /* Prevent text wrapping */
    overflow: hidden; /* Hide any overflow */
    text-overflow: ellipsis; /* Show ellipsis (...) if text is cut off */
}
.note-amount-indicator {
    opacity: 0.5;
}
.topbar .note-amount-indicator {
    margin-left: 6px;
}
.sidebar .note-amount-indicator {
    /* width: 10%; */
}

.note-filter-all {
    opacity: 0.1 !important;
}
.note-filter-this {
    opacity: 1 !important;
}
.ion-palette-dark .note-filter-this {
    opacity: 0.4 !important;
}
</style>

<template>
    <!-- .canvas-background -->
    <div
        :class="[
            `tab-area-container`,
            displayTabs === 'top' ? `topbar` : `sidebar`,
            sidebarHidden ? `disabled` : `enabled`,
        ]"
    >
        <div :class="[`tab-area-top`]">
            <div
                v-if="displayTabs === 'sidebar'"
                @click="newTabPrompt"
                class="tab newtab"
            >
                +
            </div>
            <div class="tab-area slim-scrollbar">
                <div
                    v-for="tab in tabs"
                    :class="[
                        'tab',
                        // isSearchFilter ? (isInSearchFilter(tab) ? 'note-filter-this' : 'note-filter-all') : '',
                        tab.tab_id === store.currentTabIndex ? 'active' : '',
                    ]"
                    :key="tab.tab_id"
                    :data-id="tab.tab_id"
                    @click="store.selectTab(tab.tab_id)"
                    @contextmenu.prevent="tabActionSheet(tab)"
                >
                    <span
                        class="text-no-overflow"
                        style="width: 90%"
                    >
                        <span v-if="displayTabs === 'top'">
                            {{ String(tab.name).substring(0, 12) }}
                            {{ String(tab.name).length > 12 ? "..." : "" }}
                        </span>
                        <span v-if="displayTabs === 'sidebar'">
                            {{ String(tab.name) }}
                        </span>
                    </span>
                    <span class="note-amount-indicator">
                        <span v-if="displayTabs === 'top'"> [{{ amountNotes(tab) }}] </span>
                        <span v-if="displayTabs === 'sidebar'">
                            {{ amountNotes(tab) }}
                        </span>
                    </span>
                </div>
            </div>
            <div
                v-if="displayTabs === 'top'"
                @click="newTabPrompt"
                class="tab"
            >
                +
            </div>
        </div>
        <div
            v-show="store.display === 'board'"
            class="tab trash"
            id="droppable-delete"
        >
            <ion-icon :icon="trashOutline"></ion-icon>
        </div>
    </div>
    <!-- <div class="tab-area-container canvas-background"></div> -->
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, computed, onUpdated } from "vue";
import { alertController, actionSheetController, IonCol, IonGrid, IonRow, IonIcon } from "@ionic/vue";
import { trashOutline } from "ionicons/icons";

import { noteDeleteHandler } from "../util/ui";
import { tt } from "../i18n";

import { noteStore, AppSettings, eventBus } from "@/store/store";
const store = noteStore();

const displayTabs = computed(() => {
    return store.appSettings.displayTabs;
});
const sidebarHidden = computed(() => {
    return store.sidebarHidden;
});
const tabs = computed(() => store.currentTabList);
// function amountNotes(tab) {
//     const isSearchRunning = Boolean(store.searchFilter.length);
//     console.log(`isSearchRunning: ${isSearchRunning}`);
//     return store.getCurrentNotesList(tab.tab_id, isSearchRunning).length;
// }
const amountNotes = (tab: any) => tab.notesAmount;

const isSearchFilter = computed(() => {
    return store.searchFilter.length;
});
const isInSearchFilter = (tab: any) => {
    return store.searchMatch.has(tab.tab_id);
};

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
        header: tt("tabs.tabsMenuHeader"),
        buttons: [
            {
                text: tt("tabs.renameHeader"),
                data: {
                    action: "share",
                },
                handler: async () => {
                    const alert = await alertController.create({
                        header: tt("tabs.renameHeader"),
                        inputs: [
                            {
                                placeholder: tt("tabs.renamePlaceholder"),
                                value: tab.name,
                                attributes: {
                                    maxlength: 48,
                                },
                            },
                        ],
                        buttons: [
                            {
                                text: tt("cancel"),
                                role: "cancel",
                                handler: () => {
                                    console.log("Rename canceled");
                                },
                            },
                            {
                                text: tt("ok"),
                                role: "confirm",
                                handler: data => {
                                    console.log("Alert confirmed", data[0]);
                                    if (data[0].length >= 2) {
                                        store.renameTab(tab, data[0]);
                                    }
                                },
                            },
                        ],
                    });
                    alert.present();
                },
            },
            {
                text: tt("tabs.deleteAction"),
                role: "destructive",
                data: {
                    action: "delete",
                },
                handler: () => {
                    const message = `
                    ${tt("tabs.deletePrompt", { name: tab.name })}
                    ${tt("tabs.notesCount", { count: amountNotes(tab) })}
                    `;
                    if (confirm(message)) {
                        store.deleteTab(tab);
                    }
                },
            },
            {
                text: tt("cancel"),
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

                    // emit event for canvas to redraw when in board mode
                    if (store.display === "grid") {
                        store.events.emit("ev/canvas/requestRedraw");
                    }
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
                const note = store.notes[noteId];
                noteDeleteHandler(note);
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
        // axis: "x",
        axis: displayTabs.value === "top" ? "x" : "y",
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

function initMouseWheenOnTabs() {
    const tabAreaNativeElem = document.querySelector(".tab-area");
    if (tabAreaNativeElem) {
        tabAreaNativeElem.addEventListener("wheel", (e: Event) => {
            // @ts-ignore
            tabAreaNativeElem.scrollLeft += e.deltaY;
        });
    }
}
function onStateChange() {
    initTabSortable();
    initTabDroppable();
    if (displayTabs.value === "top") {
        initMouseWheenOnTabs();
    }
}
onMounted(() => {
    $(function () {
        onStateChange();
    });
});
onUpdated(() => {
    onStateChange();
});
watch(tabs, () => {
    onStateChange();
});
</script>
