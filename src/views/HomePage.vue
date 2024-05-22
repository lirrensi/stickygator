<style scoped>
.tab-area-container {
    width: 100%;
    height: 40px;
    background-color: rgb(220, 220, 220);
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 4px;
}
.tab-area {
    display: flex;
    flex-direction: row;
}
.tab {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
    border: 1px solid rgba(100, 100, 100, 0.25);
    border-bottom: 3px solid rgba(100, 100, 100, 0.1);
    margin-right: 2px;
}
.tab.active {
    border-bottom: 3px solid rgb(100, 100, 100);
}

.ion-palette-dark .tab-area-container {
    background-color: rgb(38, 38, 38);
    border-bottom: 1px solid rgba(200, 200, 200, 0.25);
}
.ion-palette-dark .tab {
    border: 1px solid rgba(200, 200, 200, 0.25);
    border-bottom: 3px solid rgba(200, 200, 200, 0.1);
}
.ion-palette-dark .tab.active {
    border-bottom: 3px solid rgba(255, 255, 255);
}

.canvas-wrapper {
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;
    position: relative;
}
</style>

<template>
    <ion-page>
        <ion-header :translucent="false">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="store.toggleDisplayType()">
                        <ion-icon
                            slot="icon-only"
                            :icon="store.display === 'board' ? tvOutline : gridOutline"
                        ></ion-icon>
                    </ion-button>
                </ion-buttons>
                <!-- <ion-segment value="all">
                    <ion-segment-button value="all">
                        <ion-label>All</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="favorites">
                        <ion-label>Favorites</ion-label>
                    </ion-segment-button>
                </ion-segment> -->
                <ion-title>Sticky Board</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="settingsModalControl(true)">
                        <ion-icon
                            slot="icon-only"
                            :icon="settingsOutline"
                        ></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content
            :fullscreen="false"
            :scrollX="false"
            :scrollY="false"
        >
            <div class="tab-area-container">
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
            <div class="canvas-wrapper">
                <Canvas :tab="store.currentTab"></Canvas>
            </div>
        </ion-content>

        <!-- settings modal -->
        <ion-modal
            :is-open="settingsModalOpen"
            @didDismiss="settingsModalControl(false)"
        >
            <ion-header>
                <ion-toolbar>
                    <ion-title>Settings</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="settingsModalControl(false)">Close</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-list>
                    <ion-list-header mode="ios">
                        <ion-label>Theme</ion-label>
                    </ion-list-header>
                    <ion-item>
                        <ion-toggle
                            justify="space-between"
                            v-model="appSettings.darkTheme"
                            >Dark Theme</ion-toggle
                        >
                    </ion-item>
                    <ion-item>
                        <ion-range
                            label-placement="start"
                            label="Font size"
                            v-model="appSettings.fontSize"
                            :pin="true"
                            :ticks="true"
                            :snaps="true"
                            :min="10"
                            :max="24"
                        >
                        </ion-range>
                    </ion-item>

                    <ion-list-header mode="ios">
                        <ion-label>Import/Export data</ion-label>
                    </ion-list-header>
                    <ion-item
                        button
                        @click="exportToJson"
                    >
                        <ion-label color="success">Export to JSON</ion-label>
                    </ion-item>
                    <ion-item
                        button
                        @click="importFromJson"
                    >
                        <ion-label color="warning">Import from JSON</ion-label>
                    </ion-item>
                    <ion-item button>
                        <ion-label color="danger">Delete all data</ion-label>
                    </ion-item>

                    <ion-list-header mode="ios">
                        <ion-label>Info</ion-label>
                    </ion-list-header>
                    <ion-item
                        button
                        @click="tutorialModalControl(true)"
                    >
                        <ion-label color="info">Open tutorial</ion-label>
                    </ion-item>
                    <ion-accordion-group
                        class="ion-padding"
                        ref="accordionGroup"
                    >
                        <ion-accordion value="first">
                            <ion-item
                                slot="header"
                                color="light"
                            >
                                <ion-label>Changelog</ion-label>
                            </ion-item>
                            <div
                                class="ion-padding"
                                slot="content"
                            >
                                <p>
                                    1.1 (19.05.2024) Added better scrollbars, font option, small changes to styles, fix
                                    copy/pase between notes, ctrlS fix, theme fix, snap to grid, service worker for
                                    offline, hacks for mobile version...
                                </p>
                                <p>1.0 (15.05.2024) Initial version basic</p>
                            </div>
                        </ion-accordion>
                    </ion-accordion-group>
                </ion-list>
            </ion-content>
        </ion-modal>

        <!-- tutorial modal -->
        <ion-modal
            :is-open="tutorialModalOpen"
            @didDismiss="tutorialModalControl(false)"
        >
            <ion-header>
                <ion-toolbar>
                    <ion-title>Tutorial</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="tutorialModalControl(false)">Close</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <ion-list>
                    <ion-item>
                        <ion-label>Click on empty area to create a note</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label>Do not forget to create a new tab</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label>You can rename or delete a tab by right click</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label>Select a note and drag by toolbar or by the edge. Also can resize.</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label>Click on trash icon or move note to top right to delete</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label
                            >In note, <br />use [] to create task list, <br />- to start a list, and use tab to
                            indent</ion-label
                        >
                    </ion-item>
                    <ion-item>
                        <ion-label
                            >Changes are auto saved locally on browser, absolutely nothing is sent to any server. Can
                            also be used fully offline.</ion-label
                        >
                    </ion-item>
                </ion-list>
            </ion-content>
        </ion-modal>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, computed } from "vue";
import {
    IonContent,
    IonListHeader,
    IonHeader,
    IonPage,
    IonAccordion,
    IonAccordionGroup,
    IonRange,
    IonTitle,
    IonToolbar,
    alertController,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonButtons,
    IonButton,
    IonList,
    IonToggle,
    IonIcon,
    IonModal,
    IonItem,
    actionSheetController,
    IonInput,
} from "@ionic/vue";
import { homeOutline, settingsOutline, tvOutline, gridOutline } from "ionicons/icons";
import { VueDraggableNext } from "vue-draggable-next";
import Canvas from "@/components/Canvas.vue";

import { makeDownloadFile, manualImportFile } from "../util/file";

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

// for settings panel
const settingsModalOpen = ref(false);
function settingsModalControl(open = true) {
    settingsModalOpen.value = open;
}

const tutorialModalOpen = ref(false);
function tutorialModalControl(open = true) {
    tutorialModalOpen.value = open;
    localStorage.setItem("sticky-board-tutorial", "true");
}

function exportToJson() {
    const json = store.exportToJson();
    makeDownloadFile(json, "sticky-board.json");
}
async function importFromJson() {
    const parsed = await manualImportFile();
    console.log("importFromJson", parsed);
    if (parsed) {
        await store.importFromJson(parsed);
        alert("Import successful");
    } else {
        alert("Import failed");
    }
}

const appSettings: Ref<AppSettings> = ref({
    darkTheme: false,
    fontSize: 16,
    storageMode: "indexedDB",
    storageModeFilePath: "",
});
watch(
    appSettings,
    () => {
        // save to store on change
        store.saveAppSettings(appSettings.value);

        if (appSettings.value.darkTheme) {
            document.documentElement.classList.add("ion-palette-dark");
        } else {
            document.documentElement.classList.remove("ion-palette-dark");
        }
    },
    { deep: true },
);
onMounted(() => {
    // wait for store to load from local storage first
    setTimeout(() => {
        appSettings.value = store.appSettings;
    }, 250);

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
    });

    if (!localStorage.getItem("sticky-board-tutorial")) {
        setTimeout(() => {
            tutorialModalControl();
        }, 500);
    }
});
</script>
