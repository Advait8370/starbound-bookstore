window.onload = () => {

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

  const libraryBtn =
    document.getElementById(
      "library-btn"
    );

  const libraryModal =
    document.getElementById(
      "library-modal"
    );

  const closeLibrary =
    document.getElementById(
      "close-library"
    );

  const libraryGrid =
    document.getElementById(
      "library-grid"
    );

  const settingsUpdateBtn =
    document.getElementById(
      "settings-update-btn"
    );

  const fullscreenToggle =
    document.getElementById(
      "fullscreen-toggle"
    );

  const animationToggle =
    document.getElementById(
      "animation-toggle"
    );

  const zoomSetting =
    document.getElementById(
      "zoom-setting"
    );

  const clearFavorites =
    document.getElementById(
      "clear-favorites"
    );

  let allBooks = [];

  let showingFavorites = false;

  const libraryBooks = [];

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

    if (books.length === 0) {

      libraryGrid.innerHTML = `

        <div class="error">

          No downloaded books.

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

        <h3>${book.title}</h3>

        <button class="remove-book-btn">

          Remove

        </button>

      `;

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

    console.log(
      "Fetching books..."
    );

    const response =
      await fetch(

        "https://advait8370.github.io/Starbound-Stories-Bookstore/books.json",

        {
          method: "GET",
          cache: "no-cache"
        }

      );

    console.log(
      "Response:",
      response.status
    );

    const data =
      await response.json();

    console.log(
      "Books:",
      data
    );

    allBooks = data;

    displayBooks(data);

  } catch (err) {

    console.error(
      "BOOK LOAD ERROR:",
      err
    );

    grid.innerHTML = `

      <div class="error">

        Failed to load bookstore.<br><br>

        ${err}

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

          if (localBook) {

            return;
          }

          downloadBtn.innerText =
            "Downloading...";

          const result =
            await window.electronAPI
              .downloadBook(book);

          if (result.success) {

            downloadBtn.innerText =
              "Downloaded";

            await loadLibrary();

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

          if (localBook) {

            localStorage.setItem(
              "currentBook",
              localBook.localPath
            );

          } else {

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

  /* FAVORITES FILTER */

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

  /* LIBRARY */

  libraryBtn.addEventListener(
    "click",
    async () => {

      libraryModal.style.display =
        "flex";

      renderLibrary();
    }
  );

  closeLibrary.addEventListener(
    "click",
    () => {

      libraryModal.style.display =
        "none";
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

  /* SETTINGS STORAGE */

  fullscreenToggle.checked =

    localStorage.getItem(
      "autoFullscreen"
    ) === "true";

  animationToggle.checked =

    localStorage.getItem(
      "animations"
    ) !== "false";

  zoomSetting.value =

    localStorage.getItem(
      "readerZoom"
    ) || "1.2";

  /* FULLSCREEN */

  fullscreenToggle.addEventListener(
    "change",
    () => {

      localStorage.setItem(

        "autoFullscreen",

        fullscreenToggle.checked

      );
    }
  );

  /* ANIMATIONS */

  animationToggle.addEventListener(
    "change",
    () => {

      localStorage.setItem(

        "animations",

        animationToggle.checked

      );

      document.body.classList.toggle(

        "no-animations",

        !animationToggle.checked

      );
    }
  );

  if (

    localStorage.getItem(
      "animations"
    ) === "false"

  ) {

    document.body.classList.add(
      "no-animations"
    );
  }

  /* ZOOM */

  zoomSetting.addEventListener(
    "change",
    () => {

      localStorage.setItem(

        "readerZoom",

        zoomSetting.value

      );
    }
  );

  /* CLEAR FAVORITES */

  clearFavorites.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "favorites"
      );

      alert(
        "Favorites cleared."
      );

      displayBooks(allBooks);
    }
  );

  /* START */

  (async () => {

    await loadLibrary();

    loadBooks();

  })();

};