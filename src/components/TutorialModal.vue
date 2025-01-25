<template>
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
            <div v-html="tt('tutorial')"></div>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, computed } from "vue";
import {
    IonContent,
    IonListHeader,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonButtons,
    IonButton,
    IonList,
    IonModal,
    IonItem,
} from "@ionic/vue";
import { eventBus, noteStore } from "../store/store";

import { tt } from "../i18n";

const tutorialModalOpen = ref(false);
function tutorialModalControl(open = true) {
    tutorialModalOpen.value = open;
    localStorage.setItem("sticky-board-tutorial", "true");
}
onMounted(() => {
    eventBus.on("ev/tutorial/activate", (data: any) => {
        tutorialModalControl(true);
    });
    if (!localStorage.getItem("sticky-board-tutorial")) {
        setTimeout(() => {
            tutorialModalControl(true);
        }, 500);
    }
});
</script>
