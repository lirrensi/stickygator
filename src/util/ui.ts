import { StickyNote, noteStore } from "../store/store";
import { tt } from "../i18n";

export function noteRandomColor(): string {
    const presetColors = [
        "#FCB02E",
        "#F57D01",
        "#E66A19",
        "#8E243A",
        "#1F87E8",
        "#0085B1",
        "#05A041",
        "#FF5733",
        "#C70039",
        "#900C3F",
        "#581845",
        "#28B463",
        "#1D8348",
        "#2874A6",
        "#7D3C98",
        "#6C3483",
        "#CA6F1E",
        "#AF601A",
        "#F4D03F",
        "#D68910",
    ];

    return presetColors[Math.floor(Math.random() * presetColors.length)];
}

const TextMeasurer = (() => {
    // Create a hidden measurement container once
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.visibility = "hidden";
    container.style.whiteSpace = "normal";
    document.body.appendChild(container);

    // Configure the container once based on fixed width and font properties
    return function measureTextHeight(text, width, fontSize = "16px", lineHeight = "1.5") {
        container.style.width = `${width}px`;
        container.style.fontSize = fontSize;
        container.style.lineHeight = lineHeight;

        // Set the text content and measure the height
        container.innerText = text;
        return container.offsetHeight;
    };
})();
export const measureTextHeight = TextMeasurer;

export function noteDeleteHandler(note: StickyNote) {
    const store = noteStore();
    // const note = store.notes[noteId];

    // TODO: remake into proper confirmation dialog
    if (confirm(tt(`uiPromptDeleteNote`))) {
        store.deleteNote(note);
        // emit event for canvas to redraw when in board mode
        if (store.display === "grid") {
            store.events.emit("ev/canvas/requestRedraw");
        }
    }
}
