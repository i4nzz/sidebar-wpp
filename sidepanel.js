// sidepanel.js v6 — iframe controls

const view    = document.getElementById('waview');
const overlay = document.getElementById('overlay');
const errBox  = document.getElementById('error-overlay');

// Hide loading when iframe finishes loading
view.addEventListener('load', () => {
  overlay.classList.add('fade');
  errBox.classList.remove('show');
});

// Handle load errors via timeout fallback
// (iframes don't have a reliable error event for blocked loads)
let loadTimeout = setTimeout(() => {
  // If after 30s the overlay is still visible, assume an error
  if (!overlay.classList.contains('fade')) {
    overlay.classList.add('fade');
    errBox.classList.add('show');
  }
}, 30000);

view.addEventListener('load', () => {
  clearTimeout(loadTimeout);
});

// Toolbar buttons
document.getElementById('btn-reload').addEventListener('click', () => {
  overlay.classList.remove('fade');
  errBox.classList.remove('show');
  loadTimeout = setTimeout(() => {
    if (!overlay.classList.contains('fade')) {
      overlay.classList.add('fade');
      errBox.classList.add('show');
    }
  }, 30000);
  view.src = 'https://web.whatsapp.com';
});

document.getElementById('btn-back').addEventListener('click', () => {
  try {
    view.contentWindow.history.back();
  } catch (e) {
    // cross-origin restriction — ignore
  }
});

document.getElementById('btn-newtab').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://web.whatsapp.com' });
});

document.getElementById('btn-retry').addEventListener('click', () => {
  overlay.classList.remove('fade');
  errBox.classList.remove('show');
  loadTimeout = setTimeout(() => {
    if (!overlay.classList.contains('fade')) {
      overlay.classList.add('fade');
      errBox.classList.add('show');
    }
  }, 30000);
  view.src = 'https://web.whatsapp.com';
});
