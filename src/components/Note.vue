<style scoped>
.note {
    /* position: absolute; */
    /* border: 1px solid white; */
    padding: 10px;
    position: relative;
}
.is-activated {
    box-shadow: 0 0 2px 2px white;
}
textarea {
    padding: 5px;
    width: 100%;
    height: 100%;
    resize: none; /* Disable resize */
    box-sizing: border-box; /* Ensure padding and border are included in width and height */
    /* Add additional styling for the textarea if needed */
    background-color: transparent;
    border: 0.5px solid rgba(255, 255, 255, 0.25);
}

.toolbar {
    position: absolute;
    width: 100%;
    /* top: -50px; */
    bottom: calc(100% - -10px);
    left: 0;
    border: 0 !important;
    background-color: rgba(0, 0, 0, 0.2);

    display: flex;
    justify-content: space-between;
}

.ion-palette-dark .toolbar {
    background-color: rgba(255, 255, 255, 0.8);
}
</style>
<template>
    <!-- <vue-draggable-resizable
        :parent="true"
        :x="note.x"
        :y="note.y"
        :w="note.width"
        :h="note.height"
        @dragging="onDrag"
    > -->
    <!-- <vue-resizable
        
        :fitParent="true"
        dragSelector=".note"
        :l="note.x"
        :t="note.y"
        :width="note.width"
        :height="note.height"
    > -->
    <div
        :id="noteId"
        :data-note-id="note.note_id"
        ref="noteRef"
        :class="['note', { 'is-activated': isActivated }]"
        :style="noteStyle(note)"
        @click="noteClick($event)"
    >
        <!-- quill editor plugin  -->
        <QuillEditor
            ref="quillRef"
            class="custom-quill"
            :style="{ fontSize: globalFontSize + 'px' }"
            contentType="html"
            :options="quillOptions"
            :content="note.content"
            @update:content="onContentChange"
            theme="snow"
            :toolbar="`#toolbar-${noteId}`"
        />
        <!-- <div
            :id="`quill-${noteId}`"
            class="custom-quill"
        ></div> -->

        <!-- <textarea v-model="note.content"></textarea> -->
        <div
            v-show="isActivated"
            class="toolbar"
            :id="`toolbar-${noteId}`"
        >
            <!-- Default Quill buttons -->
            <div>
                <button class="ql-bold"></button>
                <button class="ql-italic"></button>
                <button class="ql-underline"></button>
                <button class="ql-strike"></button>
                <button class="ql-blockquote"></button>
                <!-- <button class="ql-code-block"></button> -->
                <!-- <select class="ql-header">
                    <option value="1"></option>
                    <option value="2"></option>
                    <option selected></option>
                </select> -->
                <!-- <button
                    class="ql-list"
                    value="ordered"
                ></button> -->
                <!-- <button
                    class="ql-list"
                    value="bullet"
                ></button> -->
                <!-- <button
                    class="ql-script"
                    value="sub"
                ></button> -->
                <!-- <button
                    class="ql-script"
                    value="super"
                ></button> -->
                <!-- <button
                    class="ql-indent"
                    value="-1"
                ></button> -->
                <!-- <button
                    class="ql-indent"
                    value="+1"
                ></button> -->
                <!-- <select class="ql-size">
                    <option value="small"></option>
                    <option selected></option>
                    <option value="large"></option>
                    <option value="huge"></option>
                </select> -->

                <!-- <select class="ql-font">
                    <option selected></option>
                </select> -->
                <!-- <select class="ql-color">
                    <option selected></option>
                </select> -->
                <!-- <select class="ql-background">
                    <option selected></option>
                </select> -->
                <!-- <select class="ql-align">
                    <option selected></option>
                    <option value="center"></option>
                    <option value="right"></option>
                    <option value="justify"></option>
                </select> -->

                <button
                    class="ql-header"
                    value="1"
                ></button>
                <button
                    class="ql-header"
                    value="2"
                ></button>

                <button
                    class="ql-align"
                    value="center"
                ></button>
                <button
                    class="ql-align"
                    value="right"
                ></button>

                <button class="ql-clean"></button>
            </div>
            <div style="display: flex; align-items: center">
                <ColorPicker
                    :pureColor="note.color"
                    @pureColorChange="onColorChange"
                />

                <ion-icon
                    :style="{
                        color: `#4b5563`,
                        fontSize: `18px`,
                        cursor: 'pointer',
                    }"
                    :icon="trashOutline"
                    @click="onDeleteNote($event)"
                ></ion-icon>
            </div>
        </div>

        <!-- :toolbar="quillToolbarOptions" -->
    </div>
    <!-- </vue-resizable> -->
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { IonIcon } from "@ionic/vue";

import { trashOutline } from "ionicons/icons";

import { QuillEditor } from "@vueup/vue-quill";
import Quill from "quill";

import { ColorPicker } from "vue3-colorpicker";
import { readableColor } from "polished";
import { roundToNearestTen } from "../util/math";

import { eventBus, noteStore } from "../store/store";
const store = noteStore();

// props note  === note id, we get it and map to one from the store
const props = defineProps(["note"]);
// const note = store.notes[props.note];
const note = computed(() => store.notes[props.note]);
console.log("note", note, props.note);

// watch(note, () => {
//     // store.setActiveNote(note.note_id);
//     console.log("change///", note);
//     note.modified_at = Date.now();
// });

const noteRef = ref(null);
const noteId = `note-${note.value.note_id}`;
// const isActivated = ref(false);
const isActivated = computed(() => {
    return store.currentNoteActivated === note.value.note_id;
});
const isEditing = ref(false);

function noteClick(event: any) {
    store.setActiveNote(note.value.note_id);
}

function noteStyle(note: any) {
    const noteOrder = note.order ?? 0;
    console.log("noteOrder", noteOrder);
    const styles: any = {
        width: note.width + "px",
        height: note.height + "px",
        backgroundColor: note.color,
        // zIndex: Math.ceil(note.modified_at / 10000000), // position based on last change;
        zIndex: isActivated.value ? noteOrder + 1000 : noteOrder + 10,
        color: noteReadableColor.value + " !important",
    };

    if (store.display === "board") {
        styles.position = "absolute";
        styles.left = note.x + "px";
        styles.top = note.y + "px";
    }
    if (store.display === "grid") {
        styles.marginBottom = "20px";
    }
    return styles;
}
// note when clicked once = activated
// clicked again => started editing
// so double click would be starting editing it;
onMounted(() => {
    eventBus.on("ev/canvas/clickEmptySpace", event => {
        console.log("canvas/clickEmptySpace => ", note);
        // isActivated.value = false;
        isEditing.value = false;
    });
    eventBus.on("ev/note/noteActivate", (data: any) => {
        if (data.note_id !== note.value.note_id) {
            // isActivated.value = false;
            isEditing.value = false;
        }
    });

    // only do resizer options when in board mode
    $(function () {
        const elem: any = $(`#${noteId}`);
        // allow resize even in grid mode
        elem.resizable({
            minHeight: 200,
            minWidth: 200,
            grid: [10, 10],
            resize(event, ui) {
                onResize(ui.size.width, ui.size.height);
            },
        });
        if (store.display === "board") {
            elem.draggable({
                grid: [10, 10],
                containment: "parent",
                cursor: "crosshair",
                scroll: true,
                // snap: true,
                // handle: `toolbar-${noteId}`,
                cancel: `#${noteId} .ql-container`,
                drag: function (element, ui) {
                    // console.log("dragging note", arguments);
                    // console.log("dragObject", dragObject.position.top, dragObject.position.left);
                    onDrag(ui.position.left, ui.position.top);
                },
            });
        }

        // focus on conteneditabel element on double click
        elem.on("dblclick", function () {
            // Code to execute when the element is double-clicked
            $(`#${noteId} .ql-editor`).focus();
        });
    });
});

function onDrag(x: number, y: number) {
    // note.x = x;
    // note.y = y;
    x = roundToNearestTen(x);
    y = roundToNearestTen(y);
    store.editNote({ ...note.value, x, y });
}
function onResize(width: number, height: number) {
    // for this also need to update local
    // note.width = width;
    // note.height = height;
    width = roundToNearestTen(width);
    height = roundToNearestTen(height);
    store.editNote({ ...note.value, width, height });
}
function onContentChange(content: string) {
    store.editNote({ ...note.value, content });
}

const quillOptions = {
    readOnly: false,
    theme: "snow",
    bounds: "#" + noteId,
    formats: ["bold", "italic", "underline", "strike", "blockquote", "header", "list", "bullet", "indent", "align"],
};
const quillToolbarOptions = {
    container: "#toolbar-" + noteId,
};
const quillDelayInit = ref(false);
const quillRef = ref(null);

const noteReadableColor = ref(textColor(note.value.color));
function textColor(color: string) {
    try {
        return readableColor(color);
    } catch (e) {
        return "unset";
    }
}
function onColorChange(color: string) {
    // console.log(arguments);
    store.editNote({ ...note.value, color });
    // note.value.color = color;
    noteReadableColor.value = textColor(color);
}
function onDeleteNote(event) {
    const noteEmpty = note.value.content.length === 0;
    if (!noteEmpty && confirm("Are you sure you want to delete this note?")) {
        store.deleteNote(note.value);
    }
}

const globalFontSize = computed(() => {
    return store.appSettings.fontSize;
});
</script>
