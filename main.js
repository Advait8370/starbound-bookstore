const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");

const path = require("path");

const {
  autoUpdater
} = require("electron-updater");

let mainWindow;

let updateWindow;

/* Main Window */

function createMainWindow() {

  mainWindow =
    new BrowserWindow({

      width: 1400,

      height: 900,

      autoHideMenuBar: true,

      backgroundColor:
        "#050816",

      title:
        "Starbound Reader",

      webPreferences: {

        preload:
          path.join(
            __dirname,
            "preload.js"
          ),

        contextIsolation: true
      }

    });

  mainWindow.loadFile(
    "app/index.html"
  );
}

/* Update Window */

function createUpdateWindow() {

  updateWindow =
    new BrowserWindow({

      width: 520,

      height: 650,

      resizable: false,

      frame: false,

      transparent: true,

      alwaysOnTop: true,

      backgroundColor:
        "#00000000",

      webPreferences: {

        preload:
          path.join(
            __dirname,
            "preload.js"
          ),

        contextIsolation: true
      }

    });

  updateWindow.loadFile(
    "app/update.html"
  );
}

/* Send Update Messages */

function sendUpdateMessage(
  data
) {

  if (updateWindow) {

    updateWindow.webContents.send(
      "update-message",
      data
    );
  }
}

/* App Ready */

app.whenReady().then(() => {

  createMainWindow();

});

/* Manual Update Check */

ipcMain.on(
  "manual-update-check",
  () => {

    if (!updateWindow) {

      createUpdateWindow();
    }

    sendUpdateMessage({

      type: "status",

      text:
        "Checking for updates..."

    });

    autoUpdater
      .checkForUpdates();

  }
);

/* Update Available */

autoUpdater.on(
  "update-available",
  () => {

    sendUpdateMessage({

      type: "status",

      text:
        "Downloading update..."

    });

    sendUpdateMessage({

      type: "changelog",

      items: [

        "New Apple-style reader UI",

        "Improved fullscreen support",

        "Performance improvements",

        "Bug fixes",

        "Better PDF rendering"

      ]

    });

  }
);

/* Download Progress */

autoUpdater.on(
  "download-progress",
  progress => {

    sendUpdateMessage({

      type: "progress",

      percent:
        progress.percent

    });

  }
);

/* No Update */

autoUpdater.on(
  "update-not-available",
  () => {

    sendUpdateMessage({

      type: "status",

      text:
        "You're already using the latest version."

    });

    sendUpdateMessage({

      type: "progress",

      percent: 100

    });

  }
);

/* Update Downloaded */

autoUpdater.on(
  "update-downloaded",
  () => {

    sendUpdateMessage({

      type: "status",

      text:
        "Update downloaded. Restarting..."

    });

    setTimeout(() => {

      autoUpdater
        .quitAndInstall();

    }, 3000);

  }
);

/* Error */

autoUpdater.on(
  "error",
  err => {

    console.log(
      "Update Error:",
      err
    );

    sendUpdateMessage({

      type: "status",

      text:
        "Update failed."

    });

  }
);

/* Close */

app.on(
  "window-all-closed",
  () => {

    if (
      process.platform !==
      "darwin"
    ) {

      app.quit();
    }

  }
);