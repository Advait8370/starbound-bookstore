/* Current Book */

let url =
  localStorage.getItem(
    "currentBook"
  );

/* Local Windows Fix */

if (

  url &&
  !url.startsWith("http")

) {

  url = encodeURI(

    "file:///" +

    url.replace(
      /\\/g,
      "/"
    )

  );

}

/* Worker */

pdfjsLib.GlobalWorkerOptions.workerSrc =

  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/* PDF */

let pdfDoc = null;

let pageNum = 1;

let rendering = false;

let pendingPage = null;

/* Zoom */

let scale =
  parseFloat(

    localStorage.getItem(
      "readerZoom"
    ) || "1.2"

  );

/* Canvas */

const canvas =
  document.getElementById(
    "pdf-render"
  );

const ctx =
  canvas.getContext("2d");

/* Page Info */

const pageInfo =
  document.getElementById(
    "page-info"
  );

/* Render */

function renderPage(num) {

  rendering = true;

  pdfDoc.getPage(num)
    .then(page => {

      const viewport =
        page.getViewport({
          scale
        });

      canvas.height =
        viewport.height;

      canvas.width =
        viewport.width;

      const renderTask =
        page.render({

          canvasContext: ctx,

          viewport

        });

      renderTask.promise.then(() => {

        rendering = false;

        if (

          pendingPage !== null

        ) {

          renderPage(
            pendingPage
          );

          pendingPage = null;
        }

      });

      pageInfo.innerText =

        `${pageNum} / ${pdfDoc.numPages}`;

    });

}

/* Queue */

function queueRenderPage(num) {

  if (rendering) {

    pendingPage = num;

  } else {

    renderPage(num);

  }

}

/* Previous */

function prevPage() {

  if (pageNum <= 1)
    return;

  pageNum--;

  queueRenderPage(
    pageNum
  );

}

/* Next */

function nextPage() {

  if (

    pageNum >= pdfDoc.numPages

  ) return;

  pageNum++;

  queueRenderPage(
    pageNum
  );

}

/* Zoom In */

function zoomIn() {

  scale += 0.2;

  localStorage.setItem(

    "readerZoom",

    scale

  );

  queueRenderPage(
    pageNum
  );

}

/* Zoom Out */

function zoomOut() {

  scale -= 0.2;

  if (scale < 0.5)
    scale = 0.5;

  localStorage.setItem(

    "readerZoom",

    scale

  );

  queueRenderPage(
    pageNum
  );

}

/* Fullscreen */

function toggleFullscreen() {

  if (

    !document.fullscreenElement

  ) {

    document.documentElement
      .requestFullscreen();

  } else {

    document.exitFullscreen();

  }

}

/* Home */

function goHome() {

  window.location.href =
    "index.html";

}

/* Load PDF */

pdfjsLib.getDocument({

  url:
    decodeURIComponent(url)

})
.promise
.then(pdf => {

  pdfDoc = pdf;

  renderPage(pageNum);

})
.catch(err => {

  console.error(err);

  document.body.innerHTML = `

    <div style="
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      height:100vh;
      font-size:22px;
      flex-direction:column;
      gap:20px;
    ">

      Failed to load PDF.

      <div style="
        font-size:14px;
        opacity:0.7;
      ">

        ${err}

      </div>

    </div>

  `;

});

/* Controls */

document.getElementById(
  "prev-page"
).onclick = prevPage;

document.getElementById(
  "next-page"
).onclick = nextPage;

document.getElementById(
  "zoom-in"
).onclick = zoomIn;

document.getElementById(
  "zoom-out"
).onclick = zoomOut;

document.getElementById(
  "fullscreen-btn"
).onclick =
  toggleFullscreen;

document.getElementById(
  "home-btn"
).onclick = goHome;

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

/* Auto Fullscreen */

if (

  localStorage.getItem(
    "autoFullscreen"
  ) === "true"

) {

  document.documentElement
    .requestFullscreen()
    .catch(() => {});

}