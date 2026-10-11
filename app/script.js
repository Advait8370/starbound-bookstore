window.onload = () => {
  /* Elements */
  const grid = document.getElementById("bookGrid");
  const search = document.getElementById("search");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettings = document.getElementById("close-settings");
  const themeToggle = document.getElementById("theme-toggle");
  const favoritesBtn = document.getElementById("favorites-btn");
  const settingsUpdateBtn = document.getElementById("settings-update-btn");
  const fullscreenToggle = document.getElementById("fullscreen-toggle");
  const zoomSetting = document.getElementById("zoom-setting");

  /* Tabs */
  const homeTab = document.getElementById("home-tab");
  const libraryTab = document.getElementById("library-tab");
  const homePage = document.getElementById("home-page");
  const libraryPage = document.getElementById("library-page");
  const libraryGrid = document.getElementById("library-grid");

  /* State */
  let allBooks = [];
  let showingFavorites = false;
  const libraryBooks = [];

  /* CLOUD API */
  const API = "https://starbound-stories-bookstore.vercel.app/books.json";

  /* FAVORITES */
  function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  }

  function saveFavorite(title) {
    let favs = getFavorites();
    if (!favs.includes(title)) {
      favs.push(title);
    } else {
      favs = favs.filter(f => f !== title);
    }
    localStorage.setItem("favorites", JSON.stringify(favs));
  }

  /* LOAD OFFLINE LIBRARY */
  async function loadLibrary() {
    if (window.electronAPI && typeof window.electronAPI.getLibrary === "function") {
      const books = await window.electronAPI.getLibrary();
      libraryBooks.length = 0;
      libraryBooks.push(...books);
    } else {
      const localStored = JSON.parse(localStorage.getItem("pwa_offline_library") || "[]");
      libraryBooks.length = 0;
      libraryBooks.push(...localStored);
    }
  }

  /* RENDER OFFLINE LIBRARY */
  async function renderLibrary() {
    await loadLibrary();
    libraryGrid.innerHTML = "";
    const statsEl = document.getElementById("library-stats");
    if (statsEl) {
      statsEl.innerText = `${libraryBooks.length} Books`;
    }

    if (libraryBooks.length === 0) {
      libraryGrid.innerHTML = `
        <div class="empty-library">
          <h2>No Offline Books</h2>
          <p>Download books to read offline.</p>
        </div>
      `;
      return;
    }

    libraryBooks.forEach(book => {
      const card = document.createElement("div");
      card.className = "library-card";
      card.innerHTML = `
        <img src="${book.cover}" alt="${book.title}" loading="lazy">
        <div class="library-info">
          <h3>${book.title}</h3>
          <div class="offline-badge">✓ Offline</div>
          <div class="library-actions">
            <button class="read-library-btn">Read</button>
            <button class="remove-book-btn">Remove</button>
          </div>
        </div>
      `;

      /* Read */
      card.querySelector(".read-library-btn").addEventListener("click", () => {
        const targetPath = book.localPath || book.pdf;
        localStorage.setItem("currentBook", targetPath);
        localStorage.setItem("cloudFallbackUrl", book.pdf);
        window.location.href = "reader.html";
      });

      /* Remove */
      card.querySelector(".remove-book-btn").addEventListener("click", async () => {
        if (window.electronAPI && typeof window.electronAPI.removeBook === "function") {
          await window.electronAPI.removeBook(book.id);
        } else {
          const updated = libraryBooks.filter(b => b.id !== book.id);
          localStorage.setItem("pwa_offline_library", JSON.stringify(updated));
        }
        await loadLibrary();
        renderLibrary();
        displayBooks(allBooks);
      });

      libraryGrid.appendChild(card);
    });
  }

  /* FETCH CATALOG FROM CLOUD */
  async function loadBooks() {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: rgba(255,255,255,0.7);">
        Loading books from cloud...
      </div>
    `;

    try {
      const response = await fetch(API, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      allBooks = data;
      displayBooks(data);
    } catch (err) {
      console.error("Cloud bookstore load failed:", err);
      grid.innerHTML = `
        <div class="error" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff5b8a;">
          <h2>Failed to load bookstore</h2>
          <p style="opacity: 0.8; margin-top: 8px;">Could not connect to ${API}</p>
          <button onclick="location.reload()" style="margin-top: 16px; padding: 10px 20px; border-radius: 12px; border: none; background: rgba(97,218,251,0.2); color: white; cursor: pointer;">
            Retry
          </button>
        </div>
      `;
    }
  }

  /* DISPLAY BOOKS */
  function displayBooks(books) {
    grid.innerHTML = "";
    const favorites = getFavorites();

    books.forEach(book => {
      const isFav = favorites.includes(book.title);
      const localBook = libraryBooks.find(b => b.id === book.id);

      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <img src="${book.cover}" alt="${book.title}" loading="lazy">
        <div class="book-info">
          <h2>${book.title}</h2>
          <p>${book.universe}</p>
          <div class="card-actions">
            <button class="fav-btn" title="Add to favorites">${isFav ? "❤" : "♡"}</button>
            <button class="download-btn">${localBook ? "Downloaded" : "Download"}</button>
            <button class="read-btn">READ</button>
          </div>
        </div>
      `;

      const favBtn = card.querySelector(".fav-btn");
      const downloadBtn = card.querySelector(".download-btn");
      const readBtn = card.querySelector(".read-btn");

      /* Favorite */
      favBtn.addEventListener("click", () => {
        saveFavorite(book.title);
        displayBooks(
          showingFavorites
            ? allBooks.filter(b => getFavorites().includes(b.title))
            : allBooks
        );
      });

      /* Download */
      downloadBtn.addEventListener("click", async () => {
        if (localBook) return;
        downloadBtn.innerText = "Downloading...";

        if (window.electronAPI && typeof window.electronAPI.downloadBook === "function") {
          const result = await window.electronAPI.downloadBook(book);
          if (result && result.success) {
            downloadBtn.innerText = "Downloaded";
            await loadLibrary();
            renderLibrary();
          } else {
            downloadBtn.innerText = "Failed";
          }
        } else {
          // PWA fallback
          const currentOffline = JSON.parse(localStorage.getItem("pwa_offline_library") || "[]");
          currentOffline.push(book);
          localStorage.setItem("pwa_offline_library", JSON.stringify(currentOffline));
          downloadBtn.innerText = "Downloaded";
          await loadLibrary();
          renderLibrary();
        }
      });

      /* Read */
      readBtn.addEventListener("click", () => {
        const savedBook = libraryBooks.find(b => b.id === book.id);
        const bookPath = (savedBook && savedBook.localPath) ? savedBook.localPath : book.pdf;
        localStorage.setItem("currentBook", bookPath);
        localStorage.setItem("cloudFallbackUrl", book.pdf);
        window.location.href = "reader.html";
      });

      grid.appendChild(card);
    });
  }

  /* Search */
  if (search) {
    search.addEventListener("input", () => {
      const value = search.value.toLowerCase().trim();
      const filtered = allBooks.filter(book =>
        book.title.toLowerCase().includes(value) ||
        book.universe.toLowerCase().includes(value)
      );
      displayBooks(filtered);
    });
  }

  /* Favorites Toggle */
  if (favoritesBtn) {
    favoritesBtn.addEventListener("click", () => {
      showingFavorites = !showingFavorites;
      favoritesBtn.classList.toggle("active");
      if (showingFavorites) {
        const favs = getFavorites();
        displayBooks(allBooks.filter(b => favs.includes(b.title)));
      } else {
        displayBooks(allBooks);
      }
    });
  }

  /* Settings Modal */
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      settingsModal.style.display = "flex";
    });
  }

  if (closeSettings) {
    closeSettings.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  }

  /* Theme Toggle */
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      localStorage.setItem("theme", document.body.classList.contains("light-mode"));
    });
  }

  if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("light-mode");
  }

  /* Updates Trigger */
  if (settingsUpdateBtn) {
    settingsUpdateBtn.addEventListener("click", async () => {
      settingsUpdateBtn.innerText = "Checking...";
      if (typeof checkForGitHubUpdate === "function") {
        await checkForGitHubUpdate(true);
      } else if (window.electronAPI && typeof window.electronAPI.checkForUpdates === "function") {
        window.electronAPI.checkForUpdates();
      }
      setTimeout(() => {
        settingsUpdateBtn.innerText = "Check Updates";
      }, 2000);
    });
  }

  /* Reader Settings */
  if (fullscreenToggle) {
    fullscreenToggle.checked = localStorage.getItem("autoFullscreen") === "true";
    fullscreenToggle.addEventListener("change", () => {
      localStorage.setItem("autoFullscreen", fullscreenToggle.checked);
    });
  }

  if (zoomSetting) {
    zoomSetting.value = localStorage.getItem("readerZoom") || "1.2";
    zoomSetting.addEventListener("change", () => {
      localStorage.setItem("readerZoom", zoomSetting.value);
    });
  }

  /* Tabs Switch */
  if (homeTab && libraryTab) {
    homeTab.addEventListener("click", () => {
      homeTab.classList.add("active");
      libraryTab.classList.remove("active");
      homePage.classList.add("active-page");
      libraryPage.classList.remove("active-page");
    });

    libraryTab.addEventListener("click", async () => {
      libraryTab.classList.add("active");
      homeTab.classList.remove("active");
      libraryPage.classList.add("active-page");
      homePage.classList.remove("active-page");
      renderLibrary();
    });
  }

  /* App Initialization */
  (async () => {
    await loadLibrary();
    await loadBooks();
  })();
};