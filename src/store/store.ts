import { Pinia, defineStore } from "pinia";
import { v4 as uuid } from "uuid";
import { Snowflake } from "@theinternetfolks/snowflake";
import mitt from "mitt";
import localforage from "localforage";
import Fuse from "fuse.js";
import { memoize } from "lodash";

import { tt, getAllLocales, switchLocale } from "../i18n";

import Quill from "quill";
import { isPlatform } from "@ionic/vue";
import { noteRandomColor } from "../util/ui";

export interface TabList {
    [key: string]: Tab;
}
export interface Tab {
    tab_id: string | number;
    name: string;
    order: number;

    notesAmount?: number;
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
    created_at?: number;
    modified_at: number; //js ms timestamp
    content: string;
    pinned?: boolean; // will be always on top...
    order?: number;
}
export type DisplayNotes = "board" | "grid";

export interface AppSettings {
    language: string;
    darkTheme: boolean;
    displayTabs: "top" | "sidebar";
    fontSize: number;
    storageMode: "indexedDB" | "jsonFile";
    storageModeFilePath: string;
}

export interface Grid {
    cols: number;
    width: number;
}

export const eventBus = mitt();

const divTempElement: HTMLElement = document.createElement("div");

export const noteStore = defineStore("noteStore", {
    state: () => {
        return {
            // event bus for convinience
            events: eventBus,

            // local display settings
            display: "board" as DisplayNotes,
            grid: {
                width: 300,
                cols: 1,
            } as Grid,

            sidebarHidden: false as boolean,

            currentNoteActivated: 0 as string | number,
            currentTabIndex: 0 as string | number,

            searchFilter: "" as string,
            searchMatch: new Set() as Set<string | number>,

            // actual data here, that is saved
            tabs: {} as TabList,
            notes: {} as { [key: string]: StickyNote },
            appSettings: {} as AppSettings,
        };
    },
    getters: {
        currentTabList(state): Tab[] {
            let tabs = Object.values(state.tabs);
            if (this.searchFilter.length) {
                tabs = tabs.filter((tab: any) => this.searchMatch.has(tab.tab_id));
            }
            tabs.sort((a, b) => a.order - b.order);
            tabs.forEach(tab => {
                let notesAmount = 0;
                let thisTabNotes = Object.values(state.notes).filter((note: StickyNote) => note.tab_id === tab.tab_id);

                if (this.searchFilter.length) {
                    thisTabNotes = thisTabNotes.filter((note: StickyNote) => this.searchMatch.has(note.note_id));
                    console.log("filter applied => ", [...thisTabNotes]);
                }
                notesAmount = thisTabNotes.length;
                tab.notesAmount = notesAmount;
            });
            console.log("tabs", tabs);
            return tabs;
        },
        currentTab(state) {
            return state.tabs[state.currentTabIndex] || {};
        },
        currentNotesList(state: any): StickyNote[] {
            return state.getCurrentNotesList(state.currentTabIndex, false);
        },
    },
    actions: {
        async init() {
            if (isPlatform("ios") || isPlatform("android")) {
                this.display = "grid";
            }
            await this.restoreFromLocal();
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
                this.selectTab(currentTabIndex);
            } else {
                // create def tabs if not exist;
                // defaultTabName
                this.createTab(tt(`defaultTabName`));
                // apply default settings
                const browserLanguage = navigator.language.slice(0, 2);
                const possibleLanguages = getAllLocales();
                if (possibleLanguages.includes(browserLanguage)) {
                    this.appSettings.language = browserLanguage;
                    switchLocale(browserLanguage);
                } else {
                    this.appSettings.language = "en";
                }
                this.appSettings.darkTheme = false;
                this.appSettings.displayTabs = "top";
                this.appSettings.fontSize = 16;
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
        exportToTxt() {
            let megaString = ``;
            const notes = Object.values(this.notes);
            notes.forEach(note => {
                // const noteElements = `
                // ========= Note ==========
                // Tab: ${this.tabs[note.tab_id].name}
                // Created at: ${new Date(note.created_at || note.modified_at).toLocaleString()}
                // Modified at: ${new Date(note.modified_at).toLocaleString()}
                // Color: ${note.color}

                // ${note.content}
                // ==========================
                // `;
                const noteElements = [
                    "========= Note ==========",
                    `Tab: ${this.tabs[note.tab_id].name}`,
                    `Created at: ${new Date(note.created_at || note.modified_at).toLocaleString()}`,
                    `Modified at: ${new Date(note.modified_at).toLocaleString()}`,
                    `Color: ${note.color}`,
                    "\n",
                    note.content,
                    "========================",
                    "\n",
                ];
                noteElements.forEach(element => {
                    megaString += element;
                    megaString += "\n";
                });
                // megaString += noteString;
            });
            return megaString;
        },
        async importFromJson(store, merge = false) {
            if (merge) {
                this.tabs = { ...this.tabs, ...store.tabs };
                this.notes = { ...this.notes, ...store.notes };
                this.appSettings = { ...this.appSettings, ...store.appSettings };
            }
            await this.onSave(store);
            this.init();
        },
        toggleDisplayType(value: DisplayNotes) {
            if (value) {
                this.display = value;
            } else {
                this.display = this.display === "board" ? "grid" : "board";
            }
        },
        toggleSidebar() {
            this.sidebarHidden = !this.sidebarHidden;
        },
        selectTab(tab_id: string | number) {
            this.currentTabIndex = tab_id;
        },
        setActiveNote(note_id: string | number = "") {
            this.currentNoteActivated = note_id;
        },
        // setSearchFilter(filter: string = "") {
        //     this.searchFilter = filter;

        //     console.log("searchFilter", this.searchFilter);
        //     if (this.searchFilter.length) {
        //         const notes: StickyNote[] = Object.values(this.notes);
        //         notes.forEach((note: any) => {
        //             const noteContent = note.content.toLowerCase();
        //             const match = noteContent.includes(this.searchFilter);
        //             if (match) {
        //                 this.searchMatch.add(note.note_id);
        //                 this.searchMatch.add(note.tab_id);
        //             } else {
        //                 this.searchMatch.delete(note.note_id);
        //                 this.searchMatch.delete(note.tab_id);
        //             }
        //         });
        //     } else {
        //         this.searchMatch.clear();
        //     }
        // },

        setSearchFilter(filter: string = "") {
            this.searchFilter = filter;

            if (!this.searchFilter.length) {
                this.searchMatch.clear();
                return;
            }

            const notes: StickyNote[] = Object.values(this.notes);
            console.log("notes", notes);

            // Create search objects without modifying notes
            // Use a temporary element to handle HTML parsing for better text extraction
            const searchObjects = notes.map(note => ({
                note_id: note.note_id,
                tab_id: note.tab_id,
                // text: (() => {
                //     divTempElement.innerHTML = note.content;
                //     // Extract and return the text content as lowercase, stripping extra whitespace
                //     return (divTempElement as any).textContent.trim().toLowerCase();
                // })(),
                text: note.content,
            }));

            console.log("searchObjects", searchObjects);

            // Initialize fuzzy search on just the text property
            const fuse = new Fuse(searchObjects, {
                keys: ["text"],
                shouldSort: false,
                ignoreLocation: true,
                threshold: 0.2,
            });

            // Get matches
            const matches: any = fuse.search(this.searchFilter);

            console.log("matches", matches);

            // Update the Set
            this.searchMatch.clear();
            matches.forEach(({ item }) => {
                this.searchMatch.add(item.note_id);
                this.searchMatch.add(item.tab_id);
            });
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
            const date = Date.now();
            const newNote: StickyNote = {
                note_id: note_id,
                tab_id: this.currentTabIndex,
                x: coords.x,
                y: coords.y,
                width: 200,
                height: 200,
                // color: this.appSettings.darkTheme ? "#222" : "#ddd",
                color: noteRandomColor(),
                created_at: date,
                modified_at: date,
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
            // this.notesBuildOrder();
            // console.log("note mod => ", this.notes[noteMerge.note_id]);
        },
        moveNoteToNewTab(note_id, tab_id) {
            const note = this.notes[note_id];
            note.tab_id = tab_id;
            // this.notesBuildOrder();
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
            this.currentNoteActivated = 0;
            delete this.notes[note.note_id];
        },
        saveAppSettings(appSettings: AppSettings) {
            this.appSettings = appSettings;
        },
        async dropDatabase() {
            return await localforage.clear();
        },
        getCurrentNotesList(tab_id, withSearchOnly = false): StickyNote[] {
            const state = this;
            const targetTabId = tab_id || state.currentTabIndex;

            let notes: StickyNote[] = Object.values(state.notes);
            // apply filter based on tab selected
            notes = notes.filter((note: any) => note.tab_id === targetTabId);
            // implement sort

            let notesFound: StickyNote[] = [];
            let notesNotFound: StickyNote[] = [];
            for (let note of notes) {
                state.searchMatch.has(note.note_id) ? notesFound.push(note) : notesNotFound.push(note);
            }
            notesFound = notesFound.sort((a: any, b: any) => b.modified_at - a.modified_at);
            // NOTE THAT WE MODIFY IN GETTER, but we are going to do it anyway in each reorder;
            notesFound.forEach((note, index) => {
                note.order = 500 + index;
            });
            if (withSearchOnly) {
                return notesFound;
            }
            notesNotFound = notesNotFound.sort((a: any, b: any) => b.modified_at - a.modified_at);
            notesNotFound.forEach((note, index) => {
                note.order = index;
            });
            return ([] as any[]).concat(notesFound, notesNotFound);
        },
    },
});

export async function storeInit() {
    const store = noteStore();
    await store.init();

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
