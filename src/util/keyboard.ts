import { noteStore } from "../store/store";
import { noteDeleteHandler } from "./ui";

export function overrideCtrlS() {
    document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && event.code === "KeyS") {
            event.preventDefault(); // Prevent the default action (e.g., browser save dialog)
            console.log("Ctrl+S was pressed");
            // Add your custom handling code here
        }
    });
}

export function mapTouchEvents() {
    function touchHandler(event) {
        var touches = event.changedTouches,
            first = touches[0],
            type = "";
        switch (event.type) {
            case "touchstart":
                type = "mousedown";
                break;
            case "touchmove":
                type = "mousemove";
                break;
            case "touchend":
                type = "mouseup";
                break;
            default:
                return;
        }

        // initMouseEvent(type, canBubble, cancelable, view, clickCount,
        //                screenX, screenY, clientX, clientY, ctrlKey,
        //                altKey, shiftKey, metaKey, button, relatedTarget);

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(
            type,
            true,
            true,
            window,
            1,
            first.screenX,
            first.screenY,
            first.clientX,
            first.clientY,
            false,
            false,
            false,
            false,
            0 /*left*/,
            null,
        );

        first.target.dispatchEvent(simulatedEvent);
        // event.preventDefault();
    }

    function init() {
        document.addEventListener("touchstart", touchHandler, true);
        document.addEventListener("touchmove", touchHandler, true);
        document.addEventListener("touchend", touchHandler, true);
        document.addEventListener("touchcancel", touchHandler, true);
    }
    init();
}

export function addDeleteHandler() {
    // add event on DELETE button for desktop
    document.addEventListener("keydown", function (event) {
        if (event.key === "Delete" || event.key === "Backspace") {
            const store = noteStore();
            // here we must ping the actual note, to determine if its text edited focused or not
            // we want to trigger note delete only when we focused it by edge and not by text
            // as with text editing, DELETE AND BACKSPACE keys are used for both.
            store.events.emit("ev/note/requestDelete");
        }
    });
}
