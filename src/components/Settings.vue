<template>
    <ion-modal
        :is-open="settingsModalOpen"
        @didDismiss="settingsModalControl(false)"
    >
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ $t("settings.title") }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="settingsModalControl(false)">
                        {{ $t("settings.close") }}
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list>
                <ion-list-header mode="ios">
                    <ion-label>{{ $t("settings.theme") }}</ion-label>
                </ion-list-header>
                <ion-item>
                    <ion-toggle
                        justify="space-between"
                        v-model="appSettings.darkTheme"
                    >
                        {{ $t("settings.darkTheme") }}
                    </ion-toggle>
                </ion-item>
                <ion-item>
                    <ion-label>{{ $t("settings.displayTabsAs") }}</ion-label>
                    <ion-select
                        v-model="appSettings.displayTabs"
                        interface="popover"
                    >
                        <ion-select-option value="top">
                            {{ $t("settings.top") }}
                        </ion-select-option>
                        <ion-select-option value="sidebar">
                            {{ $t("settings.sidebar") }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-item>
                    <ion-range
                        label-placement="start"
                        :label="$t('settings.fontSize')"
                        v-model="appSettings.fontSize"
                        :pin="true"
                        :ticks="true"
                        :snaps="true"
                        :min="10"
                        :max="24"
                    >
                    </ion-range>
                </ion-item>

                <ion-item>
                    <ion-label>{{ $t("settings.language") }}</ion-label>
                    <ion-select
                        v-model="appSettings.language"
                        interface="popover"
                        @ion-change="changeLanguage(appSettings.language)"
                    >
                        <ion-select-option
                            v-for="locale in getAllLocales()"
                            :value="locale"
                        >
                            {{ getNativeLanguageName(locale) }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-list-header mode="ios">
                    <ion-label>{{ $t("settings.importExportData") }}</ion-label>
                </ion-list-header>
                <ion-item
                    button
                    @click="exportToJson"
                >
                    <ion-label color="success">
                        {{ $t("settings.exportToJson") }}
                    </ion-label>
                </ion-item>
                <ion-item
                    button
                    @click="importFromJson(false)"
                >
                    <ion-label color="warning">
                        {{ $t("settings.importFromJsonOverwrite") }}
                    </ion-label>
                </ion-item>
                <ion-item
                    button
                    @click="importFromJson(true)"
                >
                    <ion-label color="warning">
                        {{ $t("settings.importFromJsonMerge") }}
                    </ion-label>
                </ion-item>
                <ion-item
                    button
                    @click="exportToTXT()"
                >
                    <ion-label color="warning">
                        {{ $t("settings.exportToTxt") }}
                    </ion-label>
                </ion-item>

                <ion-item
                    button
                    @click="deleteAll()"
                >
                    <ion-label color="danger">
                        {{ $t("settings.deleteAllData") }}
                    </ion-label>
                </ion-item>

                <ion-list-header mode="ios">
                    <ion-label>{{ $t("settings.info") }}</ion-label>
                </ion-list-header>
                <ion-item
                    button
                    @click="openTutorial()"
                >
                    <ion-label color="info">
                        {{ $t("settings.openTutorial") }}
                    </ion-label>
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
                            <ion-label>{{ $t("settings.changelog") }}</ion-label>
                        </ion-item>
                        <div
                            class="ion-padding"
                            slot="content"
                        >
                            <p>
                                1.6 (03.11.2024) Added full text search with fuzzy method, fix no default settings
                                causing error to display, notes in grid mode can now be dragged to change tabs, fix
                                scrollbar being ugly in webkit/moz, better border in notes, tabs also filtered in search
                                mode.
                            </p>
                            <p>
                                1.5 (01.11.2024) Added tabs sidebar option, for who has too many tabs. Grid view now
                                adaptive and will change notes height based on content like in google notes. Fixed
                                creating new note position in board mode.
                            </p>
                            <p>
                                1.4 (14.06.2024) Moved active tabs to header to save space, better trash area, fix some
                                controls overlap, export better to json, export final to txt file, import option to
                                merge, note time created/ modified display, note drag now opacity to show whats under,
                                new note now random color.
                            </p>
                            <p>
                                1.3 (31.05.2024) Added move note to tab, fix resize jitter, fix masonry not properly
                                loaded upon switching tabs.
                            </p>
                            <p>
                                1.2 (24.05.2024) Added mobile version fixes, better grid layout, ability to add note in
                                grid, toolbar visibility when obstruct, fix losing focus on first edit.
                            </p>
                            <p>
                                1.1 (19.05.2024) Added better scrollbars, font option, small changes to styles, fix
                                copy/pase between notes, ctrlS fix, theme fix, snap to grid, service worker for offline,
                                hacks for mobile version...
                            </p>
                            <p>1.0 (15.05.2024) Initial version basic</p>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
            </ion-list>
        </ion-content>
    </ion-modal>
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
    IonSelect,
    IonSelectOption,
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

import { makeDownloadFile, manualImportFile } from "../util/file";
import { tt, getAllLocales, switchLocale } from "../i18n";

import { eventBus, noteStore, AppSettings } from "../store/store";
const store = noteStore();

// for settings panel
const settingsModalOpen = ref(false);
function settingsModalControl(open = true) {
    settingsModalOpen.value = open;
}

function exportToJson() {
    const json = store.exportToJson();
    const date = new Date().toISOString().replace("T", "_");
    makeDownloadFile(json, `sssticky_board_${date}.json`);
}
function exportToTXT() {
    const str = store.exportToTxt();
    const date = new Date().toISOString().replace("T", "_");
    makeDownloadFile(str, `sssticky_board_fullExport_${date}.txt`);
}
async function importFromJson(merge = false) {
    const parsed = await manualImportFile();
    console.log("importFromJson", parsed);
    if (parsed) {
        await store.importFromJson(parsed, merge);
        alert(tt("settings.importSuccess"));
    } else {
        alert(tt("settings.importFail"));
    }
}

async function deleteAll() {
    if (confirm(tt("settings.confirmDelete")) && prompt(tt("settings.typeToConfirm")) === "1") {
        await store.dropDatabase();
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
}
function openTutorial() {
    eventBus.emit("ev/tutorial/activate");
}

function changeLanguage(value) {
    console.log("changeLanguage", value);
    switchLocale(value);
    setTimeout(() => {
        // window.location.reload();
    }, 250);
}
function getNativeLanguageName(langCode) {
    const displayNames = new Intl.DisplayNames([langCode], { type: "language" });
    return displayNames.of(langCode);
}

const appSettings: Ref<AppSettings> = ref({
    language: "en",
    darkTheme: false,
    displayTabs: "top",
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

        changeLanguage(appSettings.value.language);
    },
    { deep: true },
);
onMounted(() => {
    eventBus.on("ev/settings/activate", (data: any) => {
        settingsModalControl(true);
    });
    // wait for store to load from local storage first
    setTimeout(() => {
        appSettings.value = store.appSettings;
    }, 250);
});
</script>
