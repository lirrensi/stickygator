<style scoped>
.canvas {
    /* min-width: 100%;
    min-height: 100%; */
    width: 100%;
    /* height: 100%; */
    height: calc(100% - 10px);
    /* height: 2000px; */
    position: relative;

    padding-top: 10px;
    overflow-x: scroll;
    overflow-y: scroll;

    z-index: 4;

    clip: rect(auto, auto, auto, auto); /* Allow elements to be positioned outside */
}

#masonry {
    padding: 10px;
}

#droppable-delete {
    position: fixed;
    top: 100px;
    /* bottom: 10px; */
    /* left: 0; */
    right: 10px;
    /* margin: 0 auto; */

    width: 100px;
    height: 50px;
    border: 1px solid black;
    visibility: hidden;
    background: transparent;

    display: flex;
    justify-content: center;
    align-items: center;
    color: #000;
    font-size: 50px;
}

.ion-palette-dark #droppable-delete {
    color: #fff;
    border: 1px solid #fff;
}
</style>

<style>
.ui-state-active {
    visibility: visible !important;
}
.ui-state-hover {
    visibility: visible !important;
    background-color: rgba(214, 87, 87, 0.5) !important;
}
.ui-state-highlight.note {
    filter: opacity(0.1);
}

/* .canvas-modifier-drag {
    overflow-x: unset !important;
    overflow-y: unset !important;
} */
</style>

<template>
    <div
        class="canvas canvas-background slim-scrollbar"
        ref="canvasRef"
        @click="clickEmptySpace($event)"
        @dblclick="doubleClickEmptySpace($event)"
    >
        <!-- display when in board mode -->
        <!-- @ts-ignore -->
        <Note
            v-if="store.display === 'board'"
            v-for="note in store.currentNotesList"
            :key="note.note_id"
            :note="note.note_id"
        />
        <!-- <div
            v-if="store.display === 'board'"
            id="droppable-delete"
        >
            <ion-icon :icon="trashOutline"></ion-icon>
        </div> -->
        <!-- dipplay when in grid mode -->
        <div
            v-if="store.display === 'grid'"
            id="masonry"
        >
            <Note
                class="note-selector"
                v-for="note in store.currentNotesList"
                :key="note.note_id"
                :note="note.note_id"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, onMounted, watch, computed, onBeforeUnmount } from "vue";
import { IonReorderGroup, IonIcon } from "@ionic/vue";
import { trashOutline } from "ionicons/icons";

import Note from "./Note.vue";
import { roundToNearestTen } from "../util/math";
import { eventBus, noteStore } from "../store/store";
const store = noteStore();

const { tab } = defineProps(["tab"]);

const canvasRef = ref(null);

function clickEmptySpace(event: any) {
    if (event.target === canvasRef.value) {
        eventBus.emit("ev/canvas/clickEmptySpace");
        store.setActiveNote("");
    }
}
function doubleClickEmptySpace(event: any) {
    // detect that we clicked on canvas and not on any of the notes
    if (event.target === canvasRef.value) {
        // Clicked on empty space
        // console.log("Clicked on empty space", event);
        console.log("Click coordinates:", { x: event.clientX, y: event.clientY });
        const rect = event.target.getBoundingClientRect();
        const scrollX = event.target.scrollLeft;
        const scrollY = event.target.scrollTop;

        // Adjust coordinates with scroll offsets and round to nearest ten
        const x = roundToNearestTen(event.clientX - rect.left + scrollX);
        const y = roundToNearestTen(event.clientY - rect.top + scrollY);

        console.log("Adjusted X: " + x + ", Adjusted Y: " + y);

        store.createNote({ x, y });
        initMasonry();
    }
    // TODO: set timeout => if not not edited in time => delete
}

let masonryInstance: any = null;
function initMasonry() {
    setTimeout(() => {
        if (masonryInstance) {
            masonryInstance.masonry("destroy");
        }
        // @ts-ignore
        masonryInstance = $("#masonry").masonry({
            // options...
            itemSelector: ".note-selector",
            // columnWidth: lowestWidth || 200,
            // columnWidth: 100,
            // columnWidth: window.innerWidth / 3,
            gutter: 10,
            // fitWidth: true,
        });
        console.log("initMasonry", masonryInstance);
    }, 100);
}
function applyIntegrations() {
    if (store.display === "grid") {
        console.log("initMasonry");
        initMasonry();
    }
}
onMounted(() => {
    applyIntegrations();
    store.events.on("store/createNote", () => {
        applyIntegrations();
    });
    store.events.on("ev/canvas/requestRedraw", () => {
        applyIntegrations();
    });
});
onBeforeUnmount(() => {
    store.events.off("store/createNote");
});

store.$subscribe((mutation, store) => {
    // applyIntegrations();
});
const currentViewMode = computed(() => store.display);
const currentTab = computed(() => store.currentTabIndex);
// this is required as set canot be referenced in pinia
const searchMatchesKey = computed(() => Array.from(store.searchMatch).sort().join(","));

watch([currentViewMode, currentTab, searchMatchesKey], () => {
    applyIntegrations();
});
</script>
