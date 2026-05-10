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

const {
  autoUpdater
} = require(
  "electron-updater"
);

const log =
  require("electron-log");

const store =
  new Store();

/* Logger */

autoUpdater.logger = log;

autoUpdater.logger.transports.file.level =
  "info";

/* Windows */

let mainWindow;

let updateWindow;

/* Library Folder */

const booksDir =
  path.join(

    app.getPath("userData"),

    "library"

  );

fs.ensureDirSync(
  booksDir
);

/* MAIN WINDOW */

function createMainWindow() {

  mainWindow =
    new BrowserWindow({

      width: 1400,

      height: 900,

      minWidth: 1000,

      minHeight: 700,

      autoHideMenuBar: true,

      backgroundColor:
        "#050816",

      title:
        "Starbound Bookstore",

      icon: path.join(

        __dirname,

        "build",

        "icon.ico"

      ),

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

  mainWindow.loadFile(
    "app/index.html"
  );

}

/* UPDATE WINDOW */

function createUpdateWindow() {

  updateWindow =
    new BrowserWindow({

      width: 520,

      height: 650,

      resizable: false,

      frame: false,

      transparent: true,

      alwaysOnTop: true,

      show: false,

      backgroundColor:
        "#00000000",

      icon: path.join(

        __dirname,

        "build",

        "icon.ico"

      ),

      webPreferences: {

        preload:
          path.join(

            __dirname,

            "preload.js"

          ),

        contextIsolation: true,

        nodeIntegration: false

      }

    });

  updateWindow.loadFile(
    "app/update.html"
  );

  updateWindow.once(
    "ready-to-show",
    () => {

      updateWindow.show();

    }
  );
}

/* SEND UPDATE MESSAGE */

function sendUpdateMessage(
  data
) {

  if (

    updateWindow &&

    !updateWindow.isDestroyed()

  ) {

    updateWindow.webContents.send(

      "update-message",

      data

    );
  }
}

/* READY */

app.whenReady().then(() => {

  createMainWindow();

});

/* UPDATE CHECK */

ipcMain.on(
  "manual-update-check",
  async () => {

    try {

      if (

        !updateWindow ||

        updateWindow.isDestroyed()

      ) {

        createUpdateWindow();
      }

      sendUpdateMessage({

        type: "status",

        text:
          "Checking for updates..."

      });

      autoUpdater.autoDownload =
        true;

      autoUpdater.autoInstallOnAppQuit =
        true;

      await autoUpdater
        .checkForUpdates();

    } catch (err) {

      console.error(err);

      sendUpdateMessage({

        type: "status",

        text:
          "Failed to check updates."

      });

    }

  }
);

/* UPDATE EVENTS */

autoUpdater.on(
  "checking-for-update",
  () => {

    sendUpdateMessage({

      type: "status",

      text:
        "Checking for updates..."

    });

  }
);

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

autoUpdater.on(
  "error",
  err => {

    console.error(
      "AUTO UPDATE ERROR:",
      err
    );

    sendUpdateMessage({

      type: "status",

      text:
        err == null

          ? "Update failed."

          : (

              err.stack ||

              err.toString()

            )

    });

  }
);

/* DOWNLOAD BOOK */

ipcMain.handle(
  "download-book",
  async (_, book) => {

    try {

      const filePath =
        path.join(

          booksDir,

          `${book.id}.epub`

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

      response.data.pipe(
        writer
      );

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
        store.get(
          "library"
        ) || [];

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

/* GET LIBRARY */

ipcMain.handle(
  "get-library",
  async () => {

    return (

      store.get(
        "library"
      ) || []

    );

  }
);

/* REMOVE BOOK */

ipcMain.handle(
  "remove-book",
  async (_, id) => {

    let library =
      store.get(
        "library"
      ) || [];

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

/* CLOSE */

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