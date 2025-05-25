# STICKYGATOR

**STICKYGATOR** is a modern, offline-first sticky notes and kanban-board app for desktops (and mobile/tablet support). Perfect for organizing quick notes, todos, and ideas—drag 'em, resize 'em, color 'em, tab 'em, and never lose your stuff.  
Inspired by [zonote](https://github.com/zonetti/zonote) and extended for power users.

# demo

# [demo](https://lirrensi.github.io/stickygator/)

![Showcase Image_1](https://github.com/lirrensi/stickygator/raw/main/img_showcase/1.png)

## ✨ Features

-   **Offline-first:** All notes and settings are saved _locally_ (browser IndexedDB / desktop storage).  
    _No accounts, no servers, no cloud needed._

-   **Flexible Layouts:**

    -   _Board mode:_ Free positioning and sizing; notes are draggable and resizable anywhere.
    -   _Grid mode:_ Adaptive grid layout. Notes auto-size by content, just like Google Keep.
    -   _Tabs:_ Group notes visually. Move notes between tabs easily. Tab sidebar or top bar switch available.

-   **Rich Text Editing:**  
    Each note uses a modern, rich text editor—supports bold, italic, underline, blockquotes, headers, lists, and more.
-   **Colorful Notes:**  
    Quickly change background color per note; text color automatically adapts for legibility.

-   **Search:**  
    Fuzzy full-text search through all content—instantly highlights matching notes and tabs.

-   **Import/Export:**

    -   _Export_: Save all your notes to `.json` (structured data) or `.txt` (plain text archive)
    -   _Import_: Restore or merge from backups easily with support for merging or overwriting.

-   **Trash/Deletion:**  
    Delete individual notes/tabs. "Delete All" option for a full reset (requires double-confirmation).

-   **Accessibility:**

    -   Adjustable font size (great for big monitors)
    -   Fully keyboard navigable (Delete/backspace to delete a note, etc.)
    -   Mobile touch-friendly.

-   **Multilingual:**  
    Supports multiple languages. The UI adapts to your language. Select more from Settings.

-   **Customizable UI:**
    -   Light/Dark modes
    -   Move tabs sidebar (left or top)
    -   Dynamic collapsing sidebar for more workspace

---

![Showcase Image_1](https://github.com/lirrensi/stickygator/raw/main/img_showcase/2.png)
![Showcase Image_1](https://github.com/lirrensi/stickygator/raw/main/img_showcase/3.png)

## 🚀 Getting Started

### Web Version

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Run locally:**
    ```bash
    npm run dev
    ```

### Electron/Desktop Version

1. **Build app:**
    ```bash
    npm run build
    ```
2. **Prepare Electron app:**
    - Move the `/dist` folder into your Electron project root.
    - Install dependencies:
        ```bash
        npm install
        ```
    - _Optional:_ Configure file paths if you use a custom storage location.
    - Build desktop package:
        ```bash
        npm run package
        ```
    - **Portable by default.** All data is stored in `appdata` (`indexedDB`) in your app folder — take your notes anywhere!

---

## 📝 Usage Tips

-   **Create note:** Double-click anywhere on blank board/grid.
-   **Edit note:** Just click a note to focus. All changes save instantly.
-   **Resize/Move:** Drag edges/corners or just drag the whole note.
-   **Change color:** Palette button on toolbar.
-   **Move between tabs:** Drag note (in grid mode) onto desired tab.
-   **Search:** Start typing in the search bar; fuzzy search with instant filtering/highlighting.
-   **Export/Import:** Access from Settings (click ⚙️). You can merge or overwrite on import.

---

## 📦 Data Structure

All information is kept client-side in IndexedDB and can be exported as JSON for backup or transferred between browsers/devices.

-   **Notes:** Have content (HTML), timestamps, scroll position, colors, tab association, and more.
-   **Tabs:** Ordered, can be renamed/sorted/deleted.
-   **Settings:** Language, dark mode, font size, tab bar position, etc.

---

## 🛠️ Tech Stack

-   [Vue 3](https://vuejs.org/) + [Pinia](https://pinia.vuejs.org/) for app logic/state
-   [Quill](https://quilljs.com/) for the note editor
-   [Ionic Vue](https://ionicframework.com/docs/vue/overview) for UI
-   [localforage](https://github.com/localForage/localForage) for cross-browser storage
-   [Fuse.js](https://fusejs.io/) for fast fuzzy search

---

## 🤝 Credits / Inspiration

-   Inspired by [zonote](https://github.com/zonetti/zonote) (great grid notes app!)
-   UI elements from [Ionic Framework](https://ionicframework.com/)
-   [Vue 3 Color Picker](https://github.com/ruabick/vue3-colorpicker)

---

## ⚠️ Caveats

-   Desktop focus: Best on desktop/laptop. Mobile layout is adaptive but grid is recommended.
-   All data is **local only** unless exported — don't clear browser storage accidentally!

---

## 📜 License

MIT License.

---

Let me know if you want any sections changed or more advanced usage guide!
