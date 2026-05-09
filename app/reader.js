const url =
  localStorage.getItem("currentBook");

const container =
  document.getElementById("pdf-container");

let pdfDoc = null;

let currentPage = 1;

let currentScale = 1.2;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function loadPDF() {

  try {

    pdfDoc = await pdfjsLib
      .getDocument(url)
      .promise;

    renderPage(currentPage);

    console.log("PDF Loaded");

  } catch (err) {

    console.error(err);

    container.innerHTML = `

      <h2 style="
        color:red;
        margin-top:40px;
      ">
        Failed to load PDF.
      </h2>

    `;
  }
}

async function renderPage(num) {

  container.innerHTML = "";

  const page =
    await pdfDoc.getPage(num);

  const viewport =
    page.getViewport({
      scale: currentScale
    });

  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");

  canvas.width =
    viewport.width;

  canvas.height =
    viewport.height;

  container.appendChild(canvas);

  await page.render({

    canvasContext: ctx,

    viewport: viewport

  }).promise;

  document.getElementById("page-num")
    .textContent = currentPage;

  document.getElementById("page-count")
    .textContent = pdfDoc.numPages;

  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });
}

function nextPage() {

  if (
    currentPage >= pdfDoc.numPages
  ) return;

  currentPage++;

  renderPage(currentPage);
}

function prevPage() {

  if (currentPage <= 1)
    return;

  currentPage--;

  renderPage(currentPage);
}

function zoomIn() {

  currentScale += 0.15;

  renderPage(currentPage);
}

function zoomOut() {

  if (currentScale <= 0.5)
    return;

  currentScale -= 0.15;

  renderPage(currentPage);
}

function toggleFullscreen() {

  if (!document.fullscreenElement) {

    document.documentElement
      .requestFullscreen();

  } else {

    document.exitFullscreen();
  }
}

function goHome() {

  window.location.href =
    "index.html";
}

loadPDF();