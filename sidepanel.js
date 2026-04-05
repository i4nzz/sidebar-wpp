// sidepanel.js v7 — recebe estado do content script via runtime messages

const view        = document.getElementById('waview');
const overlay     = document.getElementById('overlay');
const errBox      = document.getElementById('error-overlay');
const btnContacts = document.getElementById('btn-contacts');
const modeLabel   = document.getElementById('mode-label');

// ── Ouve mensagens do content script (via background) ───────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'WA_CHAT_STATE') {
    setChatMode(msg.chatOpen);
  }
});

// ── Atualiza a UI da topbar ──────────────────────────────────────────────────
function setChatMode(active) {
  if (active) {
    btnContacts.classList.add('visible');
    modeLabel.textContent = 'Chat';
  } else {
    btnContacts.classList.remove('visible');
    modeLabel.textContent = 'Lista';
  }
}

// ── Botão "← Contatos": manda o content script voltar ───────────────────────
btnContacts.addEventListener('click', () => {
  chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'WA_GO_BACK' });
    }
  });
});

// ── Carregamento do iframe ───────────────────────────────────────────────────
let loadTimeout;

function resetLoad() {
  overlay.classList.remove('fade');
  errBox.classList.remove('show');
  loadTimeout = setTimeout(() => {
    if (!overlay.classList.contains('fade')) {
      overlay.classList.add('fade');
      errBox.classList.add('show');
    }
  }, 30000);
}

view.addEventListener('load', () => {
  clearTimeout(loadTimeout);
  overlay.classList.add('fade');
  errBox.classList.remove('show');
});

resetLoad();

// ── Toolbar ──────────────────────────────────────────────────────────────────
document.getElementById('btn-reload').addEventListener('click', () => {
  setChatMode(false);
  resetLoad();
  view.src = 'https://web.whatsapp.com';
});

document.getElementById('btn-newtab').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://web.whatsapp.com' });
});

document.getElementById('btn-retry').addEventListener('click', () => {
  setChatMode(false);
  resetLoad();
  view.src = 'https://web.whatsapp.com';
});