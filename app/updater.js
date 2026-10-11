const CURRENT_APP_VERSION = '1.0.0';
const GITHUB_REPO = 'Advait8370/starbound-bookstore';

async function checkForGitHubUpdate(manual = false) {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!response.ok) {
      if (manual) showNotificationBanner('No updates found or repository is private.');
      return;
    }

    const data = await response.json();
    const latestTag = data.tag_name ? data.tag_name.replace(/^v/, '') : null;

    if (latestTag && isNewerVersion(latestTag, CURRENT_APP_VERSION)) {
      showUpdateBanner(latestTag, data.html_url);
    } else if (manual) {
      showNotificationBanner(`You're already up to date! (v${CURRENT_APP_VERSION})`);
    }
  } catch (err) {
    console.warn('Update check bypassed:', err);
    if (manual) showNotificationBanner('Could not connect to GitHub.');
  }
}

function isNewerVersion(remote, local) {
  const rParts = remote.split('.').map(Number);
  const lParts = local.split('.').map(Number);
  for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
    const r = rParts[i] || 0;
    const l = lParts[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

function showUpdateBanner(newVersion, releaseUrl) {
  if (document.getElementById('starbound-update-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'starbound-update-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    background: rgba(16, 20, 45, 0.92);
    border: 1px solid rgba(127, 92, 255, 0.4);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(20px);
    border-radius: 18px;
    padding: 16px 22px;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    display: flex;
    align-items: center;
    gap: 18px;
    animation: fadeDown 0.4s ease;
  `;

  banner.innerHTML = `
    <div>
      <div style="font-weight: 700; font-size: 15px; color: #61dafb;">New Update Available (v${newVersion})</div>
      <div style="font-size: 13px; color: rgba(255, 255, 255, 0.7); margin-top: 2px;">A fresh version of Starbound is ready to download.</div>
    </div>
    <div style="display: flex; gap: 8px;">
      <a href="${releaseUrl}" target="_blank" rel="noopener noreferrer" style="
        background: linear-gradient(135deg, rgba(97,218,251,0.3), rgba(127,92,255,0.4));
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 8px 16px;
        border-radius: 12px;
        text-decoration: none;
        font-size: 13px;
        font-weight: 600;
        display: inline-block;
      ">Get Update</a>
      <button onclick="document.getElementById('starbound-update-banner').remove()" style="
        background: rgba(255,255,255,0.08);
        border: none;
        color: rgba(255,255,255,0.7);
        padding: 8px 12px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 13px;
      ">Dismiss</button>
    </div>
  `;

  document.body.appendChild(banner);
}

function showNotificationBanner(message) {
  const existing = document.getElementById('starbound-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'starbound-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    background: rgba(20, 25, 45, 0.9);
    border: 1px solid rgba(97, 218, 251, 0.3);
    backdrop-filter: blur(20px);
    border-radius: 14px;
    padding: 12px 20px;
    color: white;
    font-size: 13px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  `;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

window.addEventListener('DOMContentLoaded', () => {
  checkForGitHubUpdate(false);
});