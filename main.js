const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");

const path =
  require("path");

const fs =
  require("fs-extra");

const axios =
  require("axios");

const Store =
  require("electron-store").default;

const store =
  new Store();

const {
  autoUpdater
} = require(
  "electron-updater"
);

let mainWindow;

let updateWindow;

const booksDir = path.join(
  app.getPath("userData"),
  "library"
);

fs.ensureDirSync(booksDir);

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

  contextIsolation: true,

  webSecurity: false,

  allowRunningInsecureContent: true
}

    });

  mainWindow.loadFile(
    "app/index.html"
  );

  mainWindow.webContents.openDevTools();
}

/* Update Window */

function createUpdateWindow() {

  updateWindow =
    new BrowserWindow({

      width: 520,

      height: 650,

      icon: path.join(
  __dirname,
  "build",
  "icon.ico"
),

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

  contextIsolation: true,

  nodeIntegration: false,

  webSecurity: false
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

/* Ready */

app.whenReady().then(() => {

  createMainWindow();

});

/* Manual Update Check */

ipcMain.on(
  "manual-update-check",
  async () => {

    try {

      /* Create Update Window */

      if (

        !updateWindow ||

        updateWindow.isDestroyed()

      ) {

        createUpdateWindow();
      }

      /* Show Status */

      sendUpdateMessage({

        type: "status",

        text:
          "Checking for updates..."

      });

      /* Force GitHub Check */

      autoUpdater.autoDownload =
        true;

      autoUpdater.autoInstallOnAppQuit =
        true;

      /* Check */

      await autoUpdater
        .checkForUpdates();

    } catch (err) {

      console.error(
        "Update Check Error:",
        err
      );

      sendUpdateMessage({

        type: "status",

        text:
          "Failed to check for updates."

      });
    }

  }
);

/* Update Available */

autoUpdater.on(
  "update-available",
  info => {

    console.log(
      "Update available:",
      info.version
    );

    sendUpdateMessage({

      type: "status",

      text:
        `Downloading v${info.version}...`

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
        "You're using the latest version."

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
        Math.round(
          progress.percent
        )

    });

  }
);

/* Downloaded */

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

    console.error(err);

    sendUpdateMessage({

      type: "status",

      text:
        "Update failed."

    });

  }
);

/* Download Book */

ipcMain.handle(
  "download-book",
  async (_, book) => {

    try {

      const filePath = path.join(

        booksDir,

        `${book.id}.pdf`

      );

      const response =
        await axios({

          method: "GET",

          url: book.pdf,

          responseType: "stream"

        });

      const writer =
        fs.createWriteStream(
          filePath
        );

      response.data.pipe(writer);

      await new Promise(
        (resolve, reject) => {

          writer.on(
            "finish",
            resolve
          );

          writer.on(
            "error",
            reject
          );

        }
      );

      let library =
        store.get("library") || [];

      const exists =
        library.find(
          b => b.id === book.id
        );

      if (!exists) {

        library.push({

          id: book.id,

          title: book.title,

          universe: book.universe,

          cover: book.cover,

          localPath: filePath

        });

        store.set(
          "library",
          library
        );
      }

      return {
        success: true
      };

    } catch (err) {

      console.error(err);

      return {
        success: false
      };
    }
  }
);

/* Get Library */

ipcMain.handle(
  "get-library",
  async () => {

    return (
      store.get("library") || []
    );
  }
);

/* Remove Book */

ipcMain.handle(
  "remove-book",
  async (_, id) => {

    let library =
      store.get("library") || [];

    const book =
      library.find(
        b => b.id === id
      );

    if (book) {

      try {

        fs.removeSync(
          book.localPath
        );

      } catch {}
    }

    library =
      library.filter(
        b => b.id !== id
      );

    store.set(
      "library",
      library
    );

    return {
      success: true
    };
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

  }
);

/* Progress */

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

  }
);

/* Downloaded */

autoUpdater.on(
  "update-downloaded",
  () => {

    sendUpdateMessage({

      type: "status",

      text:
        "Restarting to install update..."

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

    console.log(err);

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