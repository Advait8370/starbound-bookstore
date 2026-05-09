const {
  contextBridge,
  ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
  "electronAPI",
  {

    onMessage: callback =>

      ipcRenderer.on(
        "update-message",
        (event, data) =>
          callback(data)
      ),

    checkForUpdates: () =>

      ipcRenderer.send(
        "manual-update-check"
      )

  }
);