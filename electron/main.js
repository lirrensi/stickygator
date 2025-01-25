// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const fs = require("fs");
(async () => {
    const contextMenu = (await import("electron-context-menu")).default;
    // Now you can use contextMenu as usual
    contextMenu({
        showInspectElement: true, // Optionally show the "Inspect Element" option
    });
})();

// Custom paths relative to app directory
let APP_ROOT, APPDATA_DIR, USERDATA_DIR;
if (app.isPackaged) {
    APP_ROOT = path.dirname(process.execPath);
} else {
    APP_ROOT = path.join(__dirname);
}
APPDATA_DIR = path.join(APP_ROOT, "appdata");
USERDATA_DIR = path.join(APP_ROOT, "userdata");

// Ensure directories exist
function setupDirectories() {
    const dirs = [APPDATA_DIR, USERDATA_DIR];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
}
// Override default app data path to keep everything in the app directory
app.setPath("userData", APPDATA_DIR);
app.setPath("sessionData", path.join(APPDATA_DIR, "session"));
app.setPath("temp", path.join(APPDATA_DIR, "temp"));
app.setPath("logs", path.join(APPDATA_DIR, "logs"));

const createWindow = () => {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
        autoHideMenuBar: true,
    });

    // and load the index.html of the app.
    win.loadFile("dist/index.html");

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    let isClosing = false;

    win.on("close", e => {
        if (!isClosing) {
            e.preventDefault();
            // Optionally show some "Saving..." message in your window
            // win.webContents.send("saving-cleanup");
            // Set opacity to show it's closing (optional)
            win.setOpacity(0.7);
            setTimeout(() => {
                isClosing = true;
                win.close(); // This will trigger 'close' again, but this time will actually close
            }, 1500);
        }
        // When isClosing is true, the close event will proceed normally
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    setupDirectories();
    createWindow();

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
