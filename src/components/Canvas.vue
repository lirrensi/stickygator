<style scoped>
.canvas {
    /* min-width: 100%;
    min-height: 100%; */
    width: 100%;
    height: 100%;
    /* height: 2000px; */
    position: relative;
    background-color: #f7f9fc;
    padding-top: 10px;
    overflow: auto;
}

.ion-palette-dark .canvas {
    background-color: #212121;
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
</style>

<template>
    <div
        class="canvas slim-scrollbar"
        ref="canvasRef"
        @click="clickEmptySpace($event)"
        @dblclick="doubleClickEmptySpace($event)"
    >
        <!-- display when in board mode -->
        <Note
            v-if="store.display === 'board'"
            v-for="note in store.currentNotesList as any"
            :key="note.note_id"
            :note="note.note_id"
        />
        <div
            v-if="store.display === 'board'"
            id="droppable-delete"
        >
            <ion-icon :icon="trashOutline"></ion-icon>
        </div>
        <!-- dipplay when in grid mode -->
        <div
            v-if="store.display === 'grid'"
            id="masonry"
        >
            <Note
                class="note-selector"
                v-for="note in store.currentNotesList as any"
                :key="note.note_id"
                :note="note.note_id"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, onMounted, watch } from "vue";
import { IonReorderGroup, IonIcon } from "@ionic/vue";
import { trashOutline } from "ionicons/icons";

import MasonryWall from "@yeger/vue-masonry-wall";
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
        console.log("Clicked on empty space", event);
        console.log("Click coordinates:", { x: event.clientX, y: event.clientY });
        var rect = event.target.getBoundingClientRect();

        // Calculate the coordinates relative to the area
        const x = roundToNearestTen(event.clientX - rect.left);
        const y = roundToNearestTen(event.clientY - rect.top);

        // Log the coordinates relative to the area
        console.log("X: " + x + ", Y: " + y);

        store.createNote({ x, y });
        initMasonry();
    }
    // TODO: set timeout => if not not edited in time => delete
}

function initMasonry() {
    setTimeout(() => {
        // const lowestWidth = store.currentNotesList.sort((a: any, b: any) => {
        //     return a.width - b.width;
        // })[0]?.width;
        // console.log("lowestWidth", lowestWidth);
        $("#masonry").masonry({
            // options...
            itemSelector: ".note-selector",
            // columnWidth: lowestWidth || 200,
            columnWidth: 100,
            gutter: 20,
            fitWidth: true,
        });
    }, 100);
}
function applyIntegrations() {
    if (store.display === "board") {
        const droppableElement: any = $("#droppable-delete");
        droppableElement.droppable({
            accept: ".note",
            tolerance: "touch",
            classes: {
                "ui-droppable-active": "ui-state-active",
                "ui-droppable-hover": "ui-state-hover",
            },
            drop: function (event, ui) {
                const noteId = ui.draggable.data("note-id");
                console.log("dropped", noteId);
                if (confirm("Are you sure you want to delete this note?")) {
                    const note = store.notes[noteId];
                    store.deleteNote(note);
                }
            },
            out: function (event, ui) {
                ui.draggable.removeClass("ui-state-highlight");
            },
            over: function (event, ui) {
                ui.draggable.addClass("ui-state-highlight");
            },
        });
    }
    if (store.display === "grid") {
        initMasonry();
    }
}
onMounted(() => {
    applyIntegrations();
});
store.$subscribe((mutation, store) => {
    applyIntegrations();
});
</script>
