/* Book Target URL & Cloud Fallback */
let url = localStorage.getItem("currentBook");
const cloudFallback = localStorage.getItem("cloudFallbackUrl");

/* PDF.js Worker Configuration */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/* State */
let pdfDoc = null;
let pageNum = 1;
let rendering = false;
let pendingPage = null;

let scale = parseFloat(localStorage.getItem("readerZoom") || "1.2");

/* Elements */
const canvas = document.getElementById("pdf-render");
const ctx = canvas.getContext("2d");
const pageInfo = document.getElementById("page-info");
const loader = document.getElementById("reader-loader");

/* Normalize URL or Local Path */
function formatPdfUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  let clean = rawUrl.replace(/\\/g, "/");
  if (!clean.startsWith("file:///")) {
    clean = "file:///" + clean.replace(/^file:\/\//, "");
  }
  return clean;
}

/* Render Page */
function renderPage(num) {
  rendering = true;

  pdfDoc.getPage(num).then(page => {
    const pixelRatio = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale });

    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);

    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform = pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : null;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      transform: transform
    };

    const renderTask = page.render(renderContext);

    renderTask.promise.then(() => {
      rendering = false;

      if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.style.display = "none";
        }, 300);
      }

      if (pendingPage !== null) {
        renderPage(pendingPage);
        pendingPage = null;
      }
    });

    pageInfo.innerText = `${pageNum} / ${pdfDoc.numPages}`;
  }).catch(err => {
    rendering = false;
    console.error("Page render error:", err);
  });
}

function queueRenderPage(num) {
  if (rendering) {
    pendingPage = num;
  } else {
    renderPage(num);
  }
}

function prevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextPage() {
  if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function zoomIn() {
  if (scale >= 3.0) return;
  scale = parseFloat((scale + 0.2).toFixed(1));
  localStorage.setItem("readerZoom", scale);
  queueRenderPage(pageNum);
}

function zoomOut() {
  if (scale <= 0.6) return;
  scale = parseFloat((scale - 0.2).toFixed(1));
  localStorage.setItem("readerZoom", scale);
  queueRenderPage(pageNum);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function goHome() {
  window.location.href = "index.html";
}

/* Load PDF Document with Automatic Cloud Fallback */
function loadPdf(targetUrl, isFallback = false) {
  const finalUrl = formatPdfUrl(targetUrl);

  const loadingTask = pdfjsLib.getDocument({
    url: finalUrl,
    cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
    cMapPacked: true
  });

  loadingTask.promise
    .then(pdf => {
      pdfDoc = pdf;
      renderPage(pageNum);
    })
    .catch(err => {
      console.warn(`Failed loading PDF at: ${finalUrl}`, err);

      // If local file failed to load, automatically attempt the remote cloud URL
      if (!isFallback && cloudFallback && cloudFallback !== targetUrl) {
        console.log("Switching to remote cloud URL:", cloudFallback);
        loadPdf(cloudFallback, true);
      } else {
        showError(`Could not open document: ${err.message || err}`);
      }
    });
}

function showError(msg) {
  if (loader) loader.style.display = "none";
  document.getElementById("pdf-container").innerHTML = `
    <div style="text-align: center; margin-top: 100px; padding: 30px; max-width: 500px;">
      <h2 style="color: #ff5b8a; margin-bottom: 12px;">Failed to Open Book</h2>
      <p style="opacity: 0.8; font-size: 14px; margin-bottom: 24px;">${msg}</p>
      <button onclick="window.location.href='index.html'" style="
        padding: 10px 24px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(97,218,251,0.2);
        color: white;
        cursor: pointer;
        font-weight: 600;
      ">Return to Bookstore</button>
    </div>
  `;
}

/* Run */
if (!url && !cloudFallback) {
  showError("No book selected. Please pick a book from the bookstore.");
} else {
  loadPdf(url || cloudFallback);
}

/* Controls */
document.getElementById("prev-page").onclick = prevPage;
document.getElementById("next-page").onclick = nextPage;
document.getElementById("zoom-in").onclick = zoomIn;
document.getElementById("zoom-out").onclick = zoomOut;
document.getElementById("fullscreen-btn").onclick = toggleFullscreen;
document.getElementById("home-btn").onclick = goHome;

/* Keyboard Navigation */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight" || e.key === "PageDown") nextPage();
  else if (e.key === "ArrowLeft" || e.key === "PageUp") prevPage();
  else if (e.key === "Escape") goHome();
  else if (e.key === "+" || e.key === "=") zoomIn();
  else if (e.key === "-") zoomOut();
});

if (localStorage.getItem("autoFullscreen") === "true") {
  document.documentElement.requestFullscreen().catch(() => {});
}