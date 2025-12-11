// preload.js
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { contextBridge, ipcRenderer, webFrame } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Expose spell check related functions
  setSpellCheckProvider: (language, autoCorrectWord, provider) => {
    webFrame.setSpellCheckProvider(language, autoCorrectWord, provider);
  },
  
  // Expose IPC methods if needed
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  receive: (channel, func) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});

// Enable spell checking in the renderer process
// This is important for context menu spell check functionality