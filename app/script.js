window.onload = () => {

  const grid =
    document.getElementById(
      "bookGrid"
    );

  const search =
    document.getElementById(
      "search"
    );

  const updateBtn =
    document.getElementById(
      "update-btn"
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

  let allBooks = [];

  let showingFavorites = false;

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

  /* LOAD BOOKS */

  async function loadBooks() {

    try {

      const response =
        await fetch(API);

      const data =
        await response.json();

      allBooks = data;

      displayBooks(data);

    } catch (err) {

      console.error(err);

      grid.innerHTML = `

        <div class="error">

          Failed to connect to online bookstore.

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

      const readBtn =
        card.querySelector(
          ".read-btn"
        );

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

      readBtn.addEventListener(
        "click",
        () => {

          localStorage.setItem(
            "currentBook",
            book.pdf
          );

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

  /* LOAD THEME */

  if (

    localStorage.getItem(
      "theme"
    ) === "true"

  ) {

    document.body.classList.add(
      "light-mode"
    );
  }

  /* UPDATE BUTTON */

  updateBtn.addEventListener(
    "click",
    () => {

      updateBtn.classList.add(
        "loading"
      );

      window.electronAPI
        .checkForUpdates();

      setTimeout(() => {

        updateBtn.classList.remove(
          "loading"
        );

      }, 4000);

    }
  );

  loadBooks();

};