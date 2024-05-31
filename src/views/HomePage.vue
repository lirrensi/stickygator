<style scoped>
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
                <!-- <ion-segment value="Classic">
                    <ion-segment-button value="Classic">
                        <ion-label>Classic</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="Masonry">
                        <ion-label>Masonry</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="Fixed">
                        <ion-label>Fixed</ion-label>
                    </ion-segment-button>
                </ion-segment> -->

                <!-- <ion-title>Sticky Board</ion-title> -->
                <ion-buttons slot="end">
                    <ion-button
                        v-if="store.display === 'grid'"
                        @click="createNote()"
                    >
                        <ion-icon
                            slot="icon-only"
                            :icon="addOutline"
                        ></ion-icon>
                    </ion-button>
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
            <Tabs></Tabs>
            <Canvas :tab="store.currentTab"></Canvas>
            <!-- <div class="canvas-wrapper">
            </div> -->
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
                                    1.3 (31.05.2024) Added move note to tab, fix resize jitter, fix masonry not properly
                                    loaded upon switching tabs.
                                </p>
                                <p>
                                    1.2 (24.05.2024) Added mobile version fixes, better grid layout, ability to add note
                                    in grid, toolbar visibility when obstruct, fix losing focus on first edit.
                                </p>
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
                        <ion-label>Do not forget to create a new tab if needed</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label>You can rename or delete a tab by right click, also reorder them</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label>Select a note and drag by toolbar or by the edge. Also can resize.</ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label>Move note to tab to move there.</ion-label>
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
import { homeOutline, settingsOutline, tvOutline, gridOutline, addOutline } from "ionicons/icons";
import { VueDraggableNext } from "vue-draggable-next";
import Canvas from "@/components/Canvas.vue";
import Tabs from "@/components/Tabs.vue";

import { makeDownloadFile, manualImportFile } from "../util/file";

import { noteStore, AppSettings } from "@/store/store";
const store = noteStore();

// create note when in grid mode
function createNote() {
    const newNote = store.createNote({ x: 0, y: 0 });
    if (newNote?.note_id) {
        // scroll to new note as it would be added at bottom
        setTimeout(() => {}, 100);
    }
}

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

    if (!localStorage.getItem("sticky-board-tutorial")) {
        setTimeout(() => {
            tutorialModalControl();
        }, 500);
    }
});
</script>
