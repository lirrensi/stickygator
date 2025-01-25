<style scoped>
.canvas-wrapper {
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;
    position: relative;
}
.app-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
}
.wrapper-row {
    flex-direction: row;
}
.wrapper-col {
    flex-direction: column;
}

/* search bar overwrite styles */
ion-searchbar {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    min-height: 1px !important;
    height: 28px !important;
}
ion-input {
    --border-style: 1px solid red;
}
</style>

<template>
    <ion-page id="main">
        <ion-header
            :translucent="false"
            mode="ios"
        >
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button
                        v-if="store.appSettings.displayTabs === 'sidebar'"
                        @click="store.toggleSidebar()"
                    >
                        <ion-icon
                            slot="icon-only"
                            :icon="menu"
                        ></ion-icon>
                    </ion-button>
                    <ion-segment
                        :value="store.display"
                        @ionChange="event => store.toggleDisplayType(event.detail.value as any)"
                    >
                        <ion-segment-button value="board">
                            <ion-label>{{ $t("topMenu.displayOptionBoard") }}</ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="grid">
                            <ion-label>{{ $t("topMenu.displayOptionGrid") }}</ion-label>
                        </ion-segment-button>
                    </ion-segment>

                    <!-- <ion-button @click="store.toggleDisplayType()">
                        <ion-icon
                            slot="icon-only"
                            :icon="store.display === 'board' ? tvOutline : gridOutline"
                        ></ion-icon>
                    </ion-button> -->
                </ion-buttons>

                <!-- <Tabs></Tabs> -->

                <!-- <ion-title>Toolbar</ion-title> -->
                <div style="display: flex; justify-content: center; width: 100%">
                    <!-- <ion-searchbar></ion-searchbar> -->
                    <!-- <input type="search" /> -->
                    <ion-input
                        class="header-search-bar"
                        style="width: 50%"
                        :placeholder="$t(`topMenu.searchPlaceholder`)"
                        :clear-input="true"
                        @ionInput="onSearchFilter($event.target.value)"
                    ></ion-input>
                </div>

                <!-- <ion-title>Sticky Board</ion-title> -->
                <ion-buttons slot="end">
                    <ion-button
                        :class="[store.display === 'grid' ? 'visible' : 'not-visible']"
                        @click="createNote()"
                    >
                        <ion-icon
                            slot="icon-only"
                            :icon="addOutline"
                        ></ion-icon>
                    </ion-button>
                    <ion-button @click="() => eventBus.emit(`ev/settings/activate`)">
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
            <div :class="[`app-wrapper`, displayTabs === 'top' ? `wrapper-col` : `wrapper-row`]">
                <Tabs></Tabs>
                <Canvas :tab="store.currentTab"></Canvas>
            </div>
            <!-- <div class="canvas-wrapper">
    </div> -->
        </ion-content>

        <!-- settings modal -->
        <Settings></Settings>

        <!-- tutorial modal -->
        <TutorialModal></TutorialModal>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, computed } from "vue";
import {
    IonContent,
    IonSplitPane,
    IonListHeader,
    IonMenu,
    IonHeader,
    IonSearchbar,
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
import { homeOutline, settingsOutline, tvOutline, gridOutline, addOutline, menu } from "ionicons/icons";

import debounce from "lodash/debounce";

import Canvas from "@/components/Canvas.vue";
import Tabs from "@/components/Tabs.vue";

import TutorialModal from "@/components/TutorialModal.vue";
import Settings from "@/components/Settings.vue";

import { eventBus, noteStore, AppSettings } from "@/store/store";
const store = noteStore();

const displayTabs = computed(() => {
    return store.appSettings.displayTabs;
});

// create note when in grid mode
function createNote() {
    const newNote = store.createNote({ x: 0, y: 0 });
    if (newNote?.note_id) {
        // scroll to new note as it would be added at bottom
        setTimeout(() => {}, 100);
    }
}
const onSearchFilter = debounce((value = "") => {
    value = value?.trim().toLowerCase();
    console.log("onSearchFilter", value);
    if (value.length >= 2) {
        store.setSearchFilter(value);
    } else {
        store.setSearchFilter(""); // Set empty if length is less than 2
    }
}, 250);
</script>
