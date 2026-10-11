const CURRENT_VERSION = '1.0.0';
const GITHUB_REPO = 'Advait8370/starbound-bookstore';

const ring = document.getElementById("ring-progress");
const circumference = 2 * Math.PI * 70;

ring.style.strokeDasharray = circumference;
ring.style.strokeDashoffset = circumference;

/* Set Progress Visuals */
function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  ring.style.strokeDashoffset = offset;
  document.getElementById("progress-fill").style.width = percent + "%";
  document.getElementById("progress-text").innerText = Math.floor(percent) + "%";
}

/* Compare Semver */
function isNewer(remote, current) {
  const r = remote.replace(/^v/, '').split('.').map(Number);
  const c = current.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(r.length, c.length); i++) {
    const rNum = r[i] || 0;
    const cNum = c[i] || 0;
    if (rNum > cNum) return true;
    if (rNum < cNum) return false;
  }
  return false;
}

/* Check GitHub API directly */
async function runGitHubUpdateCheck() {
  const statusEl = document.getElementById("status");
  const subtitleEl = document.getElementById("subtitle");
  const badgeEl = document.getElementById("version-badge");
  const listEl = document.getElementById("changes-list");
  const downloadBtn = document.getElementById("download-update-btn");
  const statusIcon = document.getElementById("status-icon");

  setProgress(25);

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    setProgress(65);

    if (!res.ok) {
      statusEl.innerText = "No GitHub releases found yet";
      subtitleEl.innerText = "You are on the latest version.";
      setProgress(100);
      statusIcon.style.animation = "none";
      statusIcon.innerText = "✓";
      listEl.innerHTML = `<li>Current build: v${CURRENT_VERSION}</li><li>No newer release tags available on GitHub.</li>`;
      return;
    }

    const data = await res.json();
    const latestVersion = (data.tag_name || "1.0.0").replace(/^v/, '');
    badgeEl.innerText = `v${latestVersion}`;

    setProgress(100);
    statusIcon.style.animation = "none";

    if (isNewer(latestVersion, CURRENT_VERSION)) {
      statusIcon.innerText = "↑";
      statusEl.innerText = `New version available: v${latestVersion}`;
      subtitleEl.innerText = "An update is ready for download.";
      downloadBtn.href = data.html_url;
      downloadBtn.style.display = "inline-block";

      // Render release notes / changelog
      listEl.innerHTML = "";
      if (data.body) {
        const lines = data.body.split('\n').filter(l => l.trim().length > 0);
        lines.slice(0, 5).forEach(line => {
          const li = document.createElement("li");
          li.innerText = line.replace(/^[*-]\s*/, '');
          listEl.appendChild(li);
        });
      } else {
        listEl.innerHTML = `<li>Release v${latestVersion} published on GitHub.</li>`;
      }
    } else {
      statusIcon.innerText = "✓";
      statusEl.innerText = "Starbound is up to date!";
      subtitleEl.innerText = `You are running the latest version (v${CURRENT_VERSION}).`;
      listEl.innerHTML = `<li>Version: v${CURRENT_VERSION}</li><li>Everything is current and verified against GitHub.</li>`;
    }
  } catch (err) {
    console.error("Update check failed:", err);
    setProgress(100);
    statusIcon.style.animation = "none";
    statusIcon.innerText = "!";
    statusEl.innerText = "Could not reach GitHub";
    subtitleEl.innerText = "Check your internet connection.";
  }
}

/* Electron IPC Listener (if running inside Electron container) */
if (window.electronAPI && typeof window.electronAPI.onMessage === "function") {
  window.electronAPI.onMessage(data => {
    if (data.type === "status") {
      document.getElementById("status").innerText = data.text;
    }
    if (data.type === "progress") {
      setProgress(data.percent);
    }
    if (data.type === "changelog") {
      const list = document.getElementById("changes-list");
      list.innerHTML = "";
      data.items.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
      });
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  runGitHubUpdateCheck();
});