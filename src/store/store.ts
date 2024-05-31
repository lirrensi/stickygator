import { Pinia, defineStore } from "pinia";
import { v4 as uuid } from "uuid";
import { Snowflake } from "@theinternetfolks/snowflake";
import mitt from "mitt";
import localforage from "localforage";
import { isPlatform } from "@ionic/vue";

export interface TabList {
    [key: string]: Tab;
}
export interface Tab {
    tab_id: string | number;
    name: string;
    order: number;
    // notes: { [key: string]: StickyNote };
}
export interface StickyNote {
    note_id: string | number; // uuid => later snowflake
    tab_id: string | number;
    x: number; // from topleft 0 => xxx
    y: number; // from topleft 0 => xxx
    width: number;
    height: number;
    color: string;
    modified_at: number; //js ms timestamp
    content: string;
    pinned?: boolean; // will be always on top...
    order?: number;
}
export type DisplayNotes = "board" | "grid";

export interface AppSettings {
    darkTheme: boolean;
    fontSize: number;
    storageMode: "indexedDB" | "jsonFile";
    storageModeFilePath: string;
}

export interface Grid {
    cols: number;
    width: number;
}

export const eventBus = mitt();

export const noteStore = defineStore("noteStore", {
    state: () => {
        return {
            events: mitt(),
            display: "board" as DisplayNotes,
            grid: {
                width: 300,
                cols: 1,
            } as Grid,

            tabs: {} as TabList,
            notes: {} as { [key: string]: StickyNote },
            currentTabIndex: 0 as string | number,
            currentNoteActivated: 0 as string | number,

            appSettings: {} as AppSettings,
        };
    },
    getters: {
        currentTab(state) {
            return state.tabs[state.currentTabIndex] || {};
        },
        currentNotesList(state: any): StickyNote[] {
            const currentTabId = state.currentTabIndex;
            return (Object.values(state.notes) as StickyNote[])
                .filter((note: any) => note.tab_id === currentTabId)
                .sort((a: any, b: any) => b.modified_at - a.modified_at);
            // .map((note: any, index) => {
            //     note.order = index;
            //     return note;
            // });
        },
    },
    actions: {
        async init() {
            if (isPlatform("ios") || isPlatform("android")) {
                this.display = "grid";
            }
            this.restoreFromLocal();
            this.calculateGrid();
        },
        calculateGrid() {
            let basisWidth = 300;
            const cols = Math.floor(window.innerWidth / 300);
            if (cols === 1) {
                basisWidth = window.innerWidth - 20;
            }
            this.grid = {
                width: basisWidth,
                cols: cols,
            };
        },
        async restoreFromLocal() {
            const store: string | null = await localforage.getItem("store");
            if (store) {
                const { tabs, notes, currentTabIndex, appSettings } = JSON.parse(store);
                this.tabs = tabs || {};
                this.notes = notes || {};
                this.appSettings = appSettings || {};
                // create def tabs if not exist;
                // if (Object.keys(tabs).length === 0) {
                //     this.createTab("default");
                //     // this.selectTab(Object.keys(tabs)[0]);
                //     this.onSave(this);
                // }
                this.selectTab(currentTabIndex);
            } else {
                // create def tabs if not exist;
                this.createTab("default");
                this.onSave(this);
            }
        },
        async onSave(state: any) {
            console.log("onSave", state);
            localforage.setItem(
                "store",
                JSON.stringify({
                    tabs: state.tabs,
                    notes: state.notes,
                    currentTabIndex: state.currentTabIndex,
                    appSettings: state.appSettings,
                }),
            );
        },
        exportToJson() {
            return JSON.stringify({
                version: 1,
                tabs: this.tabs,
                notes: this.notes,
                appSettings: this.appSettings,
            });
        },
        async importFromJson(store) {
            await this.onSave(store);
            this.init();
        },
        toggleDisplayType() {
            this.display = this.display === "board" ? "grid" : "board";
        },
        selectTab(tab_id: string | number) {
            this.currentTabIndex = tab_id;
        },
        setActiveNote(note_id: string | number = "") {
            this.currentNoteActivated = note_id;
        },
        createTab(newTabName: string) {
            const tab_id = Number(Snowflake.generate());
            const newTab: Tab = {
                tab_id: tab_id,
                name: newTabName,
                order: Object.keys(this.tabs).length + 1,
            };
            this.tabs[tab_id] = newTab;
            this.selectTab(tab_id);
        },
        sortTabs(sortedTabIds: string[]) {
            sortedTabIds.forEach((tab_id, index) => {
                this.tabs[tab_id].order = index + 1;
            });
            console.log("sortedTabs", this.tabs);
        },
        renameTab(tab, newName) {
            this.tabs[tab.tab_id].name = newName;
        },
        deleteTab(tab) {
            this.currentTabIndex = "";
            delete this.tabs[tab.tab_id];
            Object.values(this.notes).forEach(note => {
                if (note.tab_id === tab.tab_id) {
                    delete this.notes[note.note_id];
                }
            });
        },
        createNote(coords: { x: number; y: number }) {
            if (this.currentTabIndex === "") {
                console.error("no tab selected when creating note");
                return;
            }
            const note_id = Number(Snowflake.generate());
            const newNote: StickyNote = {
                note_id: note_id,
                tab_id: this.currentTabIndex,
                x: coords.x,
                y: coords.y,
                width: 200,
                height: 200,
                color: this.appSettings.darkTheme ? "#222" : "#ddd",
                modified_at: Date.now(),
                content: "",
            };
            this.notes[note_id] = newNote;
            this.events.emit("store/createNote");
            return newNote;
        },
        editNote(noteMerge: any) {
            if (!noteMerge.note_id) {
                console.error("note id not found");
                return;
            }
            noteMerge.modified_at = Date.now();
            this.notes[noteMerge.note_id] = {
                ...this.notes[noteMerge.note_id],
                ...noteMerge,
            };
            this.notesBuildOrder();
            // console.log("note mod => ", this.notes[noteMerge.note_id]);
        },
        moveNoteToNewTab(note_id, tab_id) {
            const note = this.notes[note_id];
            note.tab_id = tab_id;
            this.notesBuildOrder();
        },
        notesBuildOrder() {
            Object.values(this.notes)
                .sort((a, b) => a.modified_at - b.modified_at)
                .forEach((note, index) => {
                    // console.log(`note order => ${note.note_id} => ${index}`);
                    this.notes[note.note_id].order = index;
                    // console.log(this.notes[note.note_id].order);
                });
        },
        deleteNote(note: StickyNote) {
            delete this.notes[note.note_id];
        },
        saveAppSettings(appSettings: AppSettings) {
            this.appSettings = appSettings;
        },
    },
});

export async function storeInit() {
    const store = noteStore();
    store.init();

    let dbSaveDelay: any = null;
    store.$subscribe(
        (mutation, state) => {
            clearTimeout(dbSaveDelay);
            dbSaveDelay = setTimeout(() => {
                store.onSave(state);
            }, 1000);
        },
        { detached: true },
    );

    window.addEventListener("resize", () => {
        store.calculateGrid();
        console.log("resize", store.grid);
    });
}
