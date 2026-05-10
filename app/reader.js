const url =
  localStorage.getItem(
    "currentBook"
  );

/* EPUB */

const book =
  ePub(url);

/* Container */

const container =
  document.getElementById(
    "pdf-container"
  );

/* Viewer */

const viewer =
  document.createElement(
    "div"
  );

viewer.id = "epub-viewer";

container.appendChild(
  viewer
);

/* Rendition */

const rendition =
  book.renderTo(

    "epub-viewer",

    {

      width: "100%",

      height: "100%",

      spread: "none"

    }

  );

/* Display */

rendition.display();

/* State */

let currentScale =
  parseFloat(

    localStorage.getItem(
      "readerZoom"
    ) || "1.2"

  );

/* Zoom */

function applyZoom() {

  viewer.style.transform =
    `scale(${currentScale})`;

  viewer.style.transformOrigin =
    "top center";
}

applyZoom();

/* Page Info */

book.ready.then(() => {

  document.getElementById(
    "page-count"
  ).textContent =
    book.navigation.toc.length || 0;

});

/* Navigation */

let currentChapter = 1;

function updatePageInfo() {

  document.getElementById(
    "page-num"
  ).textContent =
    currentChapter;
}

/* NEXT */

async function nextPage() {

  await rendition.next();

  currentChapter++;

  updatePageInfo();
}

/* PREV */

async function prevPage() {

  if (currentChapter <= 1)
    return;

  await rendition.prev();

  currentChapter--;

  updatePageInfo();
}

/* ZOOM IN */

function zoomIn() {

  currentScale += 0.15;

  localStorage.setItem(

    "readerZoom",

    currentScale

  );

  applyZoom();
}

/* ZOOM OUT */

function zoomOut() {

  if (currentScale <= 0.5)
    return;

  currentScale -= 0.15;

  localStorage.setItem(

    "readerZoom",

    currentScale

  );

  applyZoom();
}

/* FULLSCREEN */

function toggleFullscreen() {

  if (!document.fullscreenElement) {

    document.documentElement
      .requestFullscreen();

  } else {

    document.exitFullscreen();
  }
}

/* HOME */

function goHome() {

  window.location.href =
    "index.html";
}

/* AUTO FULLSCREEN */

if (

  localStorage.getItem(
    "autoFullscreen"
  ) === "true"

) {

  document.documentElement
    .requestFullscreen()
    .catch(() => {});
}

/* Keyboard */

document.addEventListener(
  "keydown",
  e => {

    if (
      e.key === "ArrowRight"
    ) {

      nextPage();
    }

    if (
      e.key === "ArrowLeft"
    ) {

      prevPage();
    }

  }
);

/* Update Info */

updatePageInfo();

/* Error */

book.ready.catch(err => {

  console.error(err);

  container.innerHTML = `

    <h2 style="
      color:red;
      margin-top:40px;
    ">

      Failed to load EPUB.

    </h2>

  `;
});