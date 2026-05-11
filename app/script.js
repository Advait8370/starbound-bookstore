window.onload = () => {

  /* Elements */

  const grid =
    document.getElementById(
      "bookGrid"
    );

  const search =
    document.getElementById(
      "search"
    );

  const settingsBtn =
    document.getElementById(
      "settings-btn"
    );

  const settingsModal =
    document.getElementById(
      "settings-modal"
    );

  const closeSettings =
    document.getElementById(
      "close-settings"
    );

  const themeToggle =
    document.getElementById(
      "theme-toggle"
    );

  const favoritesBtn =
    document.getElementById(
      "favorites-btn"
    );

  const settingsUpdateBtn =
    document.getElementById(
      "settings-update-btn"
    );

  const fullscreenToggle =
    document.getElementById(
      "fullscreen-toggle"
    );

  const zoomSetting =
    document.getElementById(
      "zoom-setting"
    );

  /* Tabs */

  const homeTab =
    document.getElementById(
      "home-tab"
    );

  const libraryTab =
    document.getElementById(
      "library-tab"
    );

  const homePage =
    document.getElementById(
      "home-page"
    );

  const libraryPage =
    document.getElementById(
      "library-page"
    );

  const libraryGrid =
    document.getElementById(
      "library-grid"
    );

  /* State */

  let allBooks = [];

  let showingFavorites =
    false;

  const libraryBooks = [];

  /* API */

  const API =
    "https://advait8370.github.io/Starbound-Stories-Bookstore/books.json";

  /* FAVORITES */

  function getFavorites() {

    return JSON.parse(

      localStorage.getItem(
        "favorites"
      ) || "[]"

    );

  }

  function saveFavorite(title) {

    let favs =
      getFavorites();

    if (!favs.includes(title)) {

      favs.push(title);

    } else {

      favs =
        favs.filter(
          f => f !== title
        );

    }

    localStorage.setItem(

      "favorites",

      JSON.stringify(favs)

    );

  }

  /* LOAD LIBRARY */

  async function loadLibrary() {

    const books =
      await window.electronAPI
        .getLibrary();

    libraryBooks.length = 0;

    libraryBooks.push(...books);

  }

  /* RENDER LIBRARY */

async function renderLibrary() {

  const books =
    await window.electronAPI
      .getLibrary();

  libraryGrid.innerHTML = "";

  document.getElementById(
    "library-stats"
  ).innerText =

    `${books.length} Books`;

  if (books.length === 0) {

    libraryGrid.innerHTML = `

      <div class="empty-library">

        <h2>
          No Offline Books
        </h2>

        <p>
          Download books to read offline.
        </p>

      </div>

    `;

    return;
  }

  books.forEach(book => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "library-card";

    card.innerHTML = `

      <img src="${book.cover}">

      <div class="library-info">

        <h3>${book.title}</h3>

        <div class="offline-badge">

          ✓ Offline

        </div>

        <div class="library-actions">

          <button class="read-library-btn">

            Read

          </button>

          <button class="remove-book-btn">

            Remove

          </button>

        </div>

      </div>

    `;

    /* Read */

    card.querySelector(
      ".read-library-btn"
    ).addEventListener(
      "click",
      () => {

        localStorage.setItem(

          "currentBook",

          book.localPath

        );

        window.location.href =
          "reader.html";

      }
    );

    /* Remove */

    card.querySelector(
      ".remove-book-btn"
    ).addEventListener(
      "click",
      async () => {

        await window.electronAPI
          .removeBook(book.id);

        await loadLibrary();

        renderLibrary();

        displayBooks(allBooks);

      }
    );

    libraryGrid.appendChild(card);

  });

}

  /* LOAD BOOKS */

  async function loadBooks() {

    try {

      const response =
        await fetch(

          API,

          {
            cache: "no-cache"
          }

        );

      const data =
        await response.json();

      allBooks = data;

      displayBooks(data);

    } catch (err) {

      console.error(err);

      grid.innerHTML = `

        <div class="error">

          Failed to load bookstore.

        </div>

      `;

    }

  }

  /* DISPLAY */

  function displayBooks(books) {

    grid.innerHTML = "";

    const favorites =
      getFavorites();

    books.forEach(book => {

      const isFav =
        favorites.includes(
          book.title
        );

      const localBook =
        libraryBooks.find(
          b => b.id === book.id
        );

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "book-card";

      card.innerHTML = `

        <img src="${book.cover}">

        <div class="book-info">

          <h2>${book.title}</h2>

          <p>${book.universe}</p>

          <div class="card-actions">

            <button class="fav-btn">

              ${isFav ? "❤" : "♡"}

            </button>

            <button class="download-btn">

              ${localBook
                ? "Downloaded"
                : "Download"}

            </button>

            <button class="read-btn">

              READ

            </button>

          </div>

        </div>

      `;

      const favBtn =
        card.querySelector(
          ".fav-btn"
        );

      const downloadBtn =
        card.querySelector(
          ".download-btn"
        );

      const readBtn =
        card.querySelector(
          ".read-btn"
        );

      /* FAVORITE */

      favBtn.addEventListener(
        "click",
        () => {

          saveFavorite(
            book.title
          );

          displayBooks(

            showingFavorites

              ? allBooks.filter(

                  b =>

                    getFavorites()
                    .includes(
                      b.title
                    )

                )

              : allBooks

          );

        }
      );

      /* DOWNLOAD */

      downloadBtn.addEventListener(
        "click",
        async () => {

          if (localBook)
            return;

          downloadBtn.innerText =
            "Downloading...";

          const result =
            await window.electronAPI
              .downloadBook(book);

          if (result.success) {

            downloadBtn.innerText =
              "Downloaded";

            await loadLibrary();

            renderLibrary();

          } else {

            downloadBtn.innerText =
              "Failed";

          }

        }
      );

      /* READ */

      readBtn.addEventListener(
        "click",
        () => {

          const localBook =
            libraryBooks.find(
              b => b.id === book.id
            );

          /* Offline */

          if (localBook) {

            localStorage.setItem(

              "currentBook",

              localBook.localPath

            );

          }

          /* Online */

          else {

            localStorage.setItem(

              "currentBook",

              book.pdf

            );

          }

          window.location.href =
            "reader.html";

        }
      );

      grid.appendChild(card);

    });

  }

  /* SEARCH */

  search.addEventListener(
    "input",
    () => {

      const value =
        search.value
          .toLowerCase();

      const filtered =
        allBooks.filter(book =>

          book.title
            .toLowerCase()
            .includes(value)

        );

      displayBooks(filtered);

    }
  );

  /* FAVORITES */

  favoritesBtn.addEventListener(
    "click",
    () => {

      showingFavorites =
        !showingFavorites;

      favoritesBtn.classList.toggle(
        "active"
      );

      if (showingFavorites) {

        const favs =
          getFavorites();

        displayBooks(

          allBooks.filter(
            b =>
              favs.includes(
                b.title
              )
          )

        );

      } else {

        displayBooks(allBooks);

      }

    }
  );

  /* SETTINGS */

  settingsBtn.addEventListener(
    "click",
    () => {

      settingsModal.style.display =
        "flex";

    }
  );

  closeSettings.addEventListener(
    "click",
    () => {

      settingsModal.style.display =
        "none";

    }
  );

  /* THEME */

  themeToggle.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "light-mode"
      );

      localStorage.setItem(

        "theme",

        document.body.classList.contains(
          "light-mode"
        )

      );

    }
  );

  if (

    localStorage.getItem(
      "theme"
    ) === "true"

  ) {

    document.body.classList.add(
      "light-mode"
    );

  }

  /* UPDATE */

  settingsUpdateBtn
    .addEventListener(
      "click",
      () => {

        settingsUpdateBtn.innerText =
          "Checking...";

        window.electronAPI
          .checkForUpdates();

        setTimeout(() => {

          settingsUpdateBtn.innerText =
            "Check Updates";

        }, 4000);

      }
    );

  /* SETTINGS */

  fullscreenToggle.checked =

    localStorage.getItem(
      "autoFullscreen"
    ) === "true";

  zoomSetting.value =

    localStorage.getItem(
      "readerZoom"
    ) || "1.2";

  fullscreenToggle.addEventListener(
    "change",
    () => {

      localStorage.setItem(

        "autoFullscreen",

        fullscreenToggle.checked

      );

    }
  );

  zoomSetting.addEventListener(
    "change",
    () => {

      localStorage.setItem(

        "readerZoom",

        zoomSetting.value

      );

    }
  );

  /* TABS */

  homeTab.addEventListener(
    "click",
    () => {

      homeTab.classList.add(
        "active"
      );

      libraryTab.classList.remove(
        "active"
      );

      homePage.classList.add(
        "active-page"
      );

      libraryPage.classList.remove(
        "active-page"
      );

    }
  );

  libraryTab.addEventListener(
    "click",
    async () => {

      libraryTab.classList.add(
        "active"
      );

      homeTab.classList.remove(
        "active"
      );

      libraryPage.classList.add(
        "active-page"
      );

      homePage.classList.remove(
        "active-page"
      );

      renderLibrary();

    }
  );

  /* START */

  (async () => {

    await loadLibrary();

    await loadBooks();

  })();

};