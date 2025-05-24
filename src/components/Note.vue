<style scoped>
.note {
    box-sizing: initial;
    /* position: absolute; */
    /* border: 1px solid white; */
    padding: 10px;
    position: relative;
    opacity: 0.96;
}
.note.dragging {
    opacity: 0.5;
}
.is-activated {
    box-shadow: 0 0 2px 2px white;
    opacity: 1;
}
.is-activated.dragging {
    opacity: 0.8;
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

.note-info {
    padding: 2px 10px;
    font-size: 10px;
    opacity: 0.5;

    display: flex;
    justify-content: space-between;
}

.note-filter-all {
    opacity: 0.1 !important;
}
.note-filter-this {
    opacity: 1 !important;
}

.inner-background {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    filter: brightness(0.9);
}
</style>
<style></style>
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
        :class="[
            'note',
            {
                'is-activated': isActivated,
                'note-filter-all': isSearchFilter && !isInSearchFilter,
                'note-filter-this': isSearchFilter && isInSearchFilter,
            },
        ]"
        :style="noteStyle(note)"
        @click="noteClick($event)"
    >
        <div
            class="inner-background"
            :style="{
                backgroundColor: noteStyle(note).backgroundColor,
            }"
        ></div>
        <!-- quill editor plugin  -->
        <QuillEditor
            ref="quillRef"
            class="custom-quill slim-scrollbar"
            :style="{ fontSize: globalFontSize + 'px' }"
            contentType="html"
            :options="quillOptions"
            :content="note.content"
            @update:content="onContentChange"
            theme="snow"
            :toolbar="`#toolbar-${noteId}`"
            @focus="isEditing = true"
            @blur="isEditing = false"
        />
        <!-- <div
            :id="`quill-${noteId}`"
            class="custom-quill"
        ></div> -->

        <!-- <textarea v-model="note.content"></textarea> -->
        <div
            class="toolbar-anchor"
            :id="`toolbar-anchor-${noteId}`"
        >
            <!-- :class="['toolbar', { 'toolbar-obstructed': toolbarObstructed }]" -->
            <!-- <div
                v-show="isActivated"
                class="toolbar"
                :id="`toolbar-${noteId}`"
            >
                
            </div> -->
            <ion-grid
                v-show="isActivated"
                class="toolbar"
                :id="`toolbar-${noteId}`"
            >
                <ion-row>
                    <ion-col size="8">
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
                        <div></div>
                    </ion-col>
                    <ion-col
                        size="4"
                        style="display: flex; align-items: center"
                    >
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
                        <!-- <div>
                        </div>
                        <div>
                        </div> -->
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col class="note-info">
                        <span :title="`created: ${moment(note.created_at || note.modified_at)}`"
                            >{{ $t("note.created") }}
                            {{ moment(note.created_at || note.modified_at).format("YY-MM-DD  hh:mm") }}</span
                        >
                        <span :title="`modified: ${moment(note.modified_at)}`"
                            >{{ $t("note.modified") }} {{ moment(note.modified_at).format("YY-MM-DD  hh:mm") }}</span
                        >
                    </ion-col>
                </ion-row>
            </ion-grid>
        </div>

        <!-- :toolbar="quillToolbarOptions" -->
    </div>
    <!-- </vue-resizable> -->
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { IonIcon, IonCol, IonGrid, IonRow } from "@ionic/vue";

import { trashOutline } from "ionicons/icons";

import { QuillEditor } from "@vueup/vue-quill";
import Quill from "quill";

import { ColorPicker } from "vue3-colorpicker";
import { readableColor } from "polished";
import moment from "moment";
import { measureTextHeight, noteDeleteHandler } from "../util/ui";
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

const isVisible = ref(false);
// const isActivated = ref(false);
const isActivated = computed(() => {
    return store.currentNoteActivated === note.value.note_id;
});
const isSearchFilter = computed(() => {
    return store.searchFilter.length;
});
const isInSearchFilter = computed(() => {
    return store.searchMatch.has(note.value.note_id);
});

const isEditing = ref(false);

function noteClick(event: any) {
    store.setActiveNote(note.value.note_id);
}

const grid = computed(() => store.grid);
function noteContentBasedHeight(note): number {
    const content = note.content;
    // calculates best heght based on content
    // content looks like this => content: "<p>dsdads</p><p>dasdasd</p><p>ddadasd</p><p>dasdasd</p><p>sdadasd</p><p><br></p>"
    // using <p> and <br> to determine content height
    // assume 1 line is 20px;

    // Count all <p> tags as individual lines
    const pTagCount = (content.match(/<p>/g) || []).length;

    // Count all <br> tags within <p> tags as additional lines
    const brTagCount = (content.match(/<br>/g) || []).length;

    // Calculate total lines
    const totalLines = pTagCount + brTagCount;

    // Assume each line is 20px in height
    const lineHeight = 20;
    return totalLines * lineHeight;
}
function noteStyle(note: any) {
    const noteOrder = note.order ?? 0;
    console.log("noteOrder", noteOrder);
    const styles: any = {
        width: `${note.width}px`,
        height: `${note.height}px`,
        backgroundColor: note.color,
        // filter: `brightness(0.8)`, // Adjust brightness to darken (0.8 makes it slightly darker)
        zIndex: isActivated.value ? noteOrder + 1000 : noteOrder + 10,
        color: `${noteReadableColor.value} !important`,
    };

    if (store.display === "board") {
        styles.position = "absolute";
        styles.left = note.x + "px";
        styles.top = note.y + "px";
    }
    if (store.display === "grid") {
        styles.marginBottom = "10px";

        // experimental
        // styles.width = Math.ceil(window.innerWidth / 4) + "px";
        const basisWidth = grid.value.width;
        // if (grid.value.cols > 1) {
        //     if (note.width > basisWidth) {
        //         styles.width = 2 * basisWidth + 20 + "px";
        //     } else {
        //         styles.width = basisWidth + "px";
        //     }
        // } else {
        //     styles.width = basisWidth + "px";
        // }
        styles.width = basisWidth + "px";
        // minumal height posible but so note still visible
        styles.minHeight = "200px";
        styles.height = measureTextHeight(note.content, basisWidth) + "px";
        // max height is 3x max regular note, so it does not overflow for the entire screen
        const screenHeight = window.innerHeight;
        let maxHeight = roundToNearestTen(2 * basisWidth);
        if (maxHeight > screenHeight) {
            maxHeight = roundToNearestTen(screenHeight - 140);
        }
        styles.maxHeight = maxHeight + "px";
    }

    checkToolBarVisibility();
    return styles;
}

function handleDeleteRequest(event: any) {
    if (event.key === "Delete" || event.key === "Backspace") {
        if (isActivated.value === true && isEditing.value === false) {
            noteDeleteHandler(note.value);
        }
    }
}

// note when clicked once = activated
// clicked again => started editing
// so double click would be starting editing it;
onBeforeUnmount(() => {
    // document.removeEventListener("keydown", handleDeleteRequest);
});
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

    // document.addEventListener("keydown", handleDeleteRequest);

    function enableNoteResizable(elem) {
        elem.resizable({
            minHeight: 200,
            minWidth: 200,
            grid: [10, 10],
            stop(event, ui) {
                console.log("resizing", ui);
                onResize(ui.size.width, ui.size.height);
            },
        });
    }
    function enableNoteDraggable(elem, canvas, isInGridMode = false) {
        elem.draggable({
            grid: [10, 10],
            cursor: "crosshair",
            scroll: true,
            cancel: `#${noteId} .ql-container`,

            helper: isInGridMode ? "clone" : "",

            // using on stop to run modification only after drag stops, as we also need to detect move to tab;
            start: function (event, ui) {
                //canvas-modifier-drag
                canvas.addClass("canvas-modifier-drag");

                noteClick(event);

                $(".note").addClass("dragging");
            },
            stop: function (element, ui) {
                canvas.removeClass("canvas-modifier-drag");

                if (!isInGridMode) {
                    onDrag(ui.position.left, ui.position.top);
                }

                $(".note").removeClass("dragging");
            },
        });
    }

    // only do resizer options when in board mode
    $(function () {
        const elem: any = $(`#${noteId}`);
        const canvas: any = $(`.canvas`);
        // allow resize even in grid mode
        if (store.display === "board") {
            // else set movable options
            enableNoteResizable(elem);
        }
        enableNoteDraggable(elem, canvas, store.display === "grid");

        // focus on conteneditabel element on double click
        elem.on("dblclick", function () {
            // Code to execute when the element is double-clicked
            $(`#${noteId} .ql-editor`).focus();
        });
    });

    // setupObserver(document.getElementById(`toolbar-${noteId}`));
});

function checkToolBarVisibility() {
    const noteElement = document.getElementById(noteId);
    const noteY = Number(noteElement?.style.top.replace("px", ""));
    console.log("noteY", noteY);
    const toolbarVisible = noteY >= 51;
    const toolBarAnchor = document.getElementById(`toolbar-anchor-${noteId}`);
    if (toolbarVisible) {
        toolBarAnchor?.classList.remove("toolbar-obstructed");
    } else {
        toolBarAnchor?.classList.add("toolbar-obstructed");
    }
}

let dragTimeout: any = null;
function onDrag(x: number, y: number) {
    // if y negative, i.e moved too far up but not completed, then reset position;
    if (y < 0) {
        y = 10;
    }
    if (x < 0) {
        x = 10;
    }
    x = roundToNearestTen(x);
    y = roundToNearestTen(y);
    store.editNote({ ...note.value, x, y });

    clearTimeout(dragTimeout);
    dragTimeout = setTimeout(() => {}, 500);

    // const toolBar = document.getElementById(`toolbar-${noteId}`);
    // const toolBarAnchor = document.getElementById(`toolbar-anchor-${noteId}`);
    // const toolbarVisible = isElementFullyVisible(toolBar);
    // console.log("toolbarVisible", toolbarVisible);

    // console.log("onDrag", x, y);
    // const toolbarVisible = y >= 21;
    // if (toolbarVisible) {
    //     toolBarAnchor?.classList.remove("toolbar-obstructed");
    // } else {
    //     toolBarAnchor?.classList.add("toolbar-obstructed");
    // }

    checkToolBarVisibility();
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
    // small hack to prevent focus lose
    setTimeout(() => {
        // @ts-ignore
        quillRef?.value?.getQuill().focus();
    }, 100);
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
    noteDeleteHandler(note.value);
}

const globalFontSize = computed(() => {
    return store.appSettings.fontSize;
});

const toolbarObstructed = ref(false);
function setupObserver(element) {
    if (!element) {
        console.error("Element not found.");
        return;
    }

    // Callback function to execute when visibility changes
    // Flag to prevent infinite loop
    let isHandlingVisibility = false;

    const intersectionCallback = entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
                if (!isHandlingVisibility) {
                    isHandlingVisibility = true;
                    console.log("Element is fully visible on screen.");
                    toolbarObstructed.value = false;
                    element.classList.remove("toolbar-obstructed");
                    setTimeout(() => (isHandlingVisibility = false), 100); // Reset flag after handling
                }
            } else {
                if (!isHandlingVisibility) {
                    isHandlingVisibility = true;
                    console.log("Element is not fully visible on screen.");
                    toolbarObstructed.value = true;
                    element.classList.add("toolbar-obstructed");
                    setTimeout(() => (isHandlingVisibility = false), 100); // Reset flag after handling
                }
            }
        });
    };

    // Options for the observer
    const observerOptions = {
        root: null, // Use the viewport as the root
        threshold: 1.0, // Trigger the callback when 100% of the target is visible
    };

    // Create the Intersection Observer
    const observer = new IntersectionObserver(intersectionCallback, observerOptions);

    // Start observing the target element
    observer.observe(element);
}

function isElementFullyVisible(element, container = document.querySelector(".canvas")) {
    var rect = element.getBoundingClientRect();
    var containerRect: any = container?.getBoundingClientRect();

    return (
        rect.top >= containerRect.top &&
        rect.left >= containerRect.left &&
        rect.bottom <= containerRect.bottom &&
        rect.right <= containerRect.right
    );
}
</script>
