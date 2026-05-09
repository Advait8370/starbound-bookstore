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

  let allBooks = [];

  const API =
    "https://advait8370.github.io/Starbound-Stories-Bookstore/books.json";

  async function loadBooks() {

    try {

      const response =
        await fetch(API);

      if (!response.ok) {

        throw new Error(
          "Cannot fetch books"
        );
      }

      const data =
        await response.json();

      allBooks = data;

      displayBooks(data);

      console.log(
        "Books loaded"
      );

    } catch (err) {

      console.error(err);

      grid.innerHTML = `

        <div style="
          color:red;
          text-align:center;
          padding:40px;
          font-size:22px;
        ">

          Failed to connect to online bookstore.

        </div>

      `;
    }
  }

  function displayBooks(books) {

    grid.innerHTML = "";

    books.forEach(book => {

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

          <button class="read-btn">

            READ

          </button>

        </div>

      `;

      const btn =
        card.querySelector(
          ".read-btn"
        );

      btn.addEventListener(
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

  /* Update Button */

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