// sidepanel.js v5 — webview controls

const view    = document.getElementById('waview');
const overlay = document.getElementById('overlay');
const errBox  = document.getElementById('error-overlay');

// Hide loading when page finishes loading
view.addEventListener('loadstop', () => {
  overlay.classList.add('fade');
  errBox.classList.remove('show');
});

// Show error if load fails
view.addEventListener('loadabort', () => {
  overlay.classList.add('fade');
  errBox.classList.add('show');
});

// Toolbar buttons
document.getElementById('btn-reload').addEventListener('click', () => {
  overlay.classList.remove('fade');
  errBox.classList.remove('show');
  view.src = 'https://web.whatsapp.com';
});

document.getElementById('btn-back').addEventListener('click', () => {
  if (view && typeof view.executeScript === 'function') {
    view.executeScript({code: 'history.back()'});
  }
});

document.getElementById('btn-newtab').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://web.whatsapp.com' });
});

document.getElementById('btn-retry').addEventListener('click', () => {
  overlay.classList.remove('fade');
  errBox.classList.remove('show');
  view.src = 'https://web.whatsapp.com';
});
