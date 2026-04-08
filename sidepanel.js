// sidepanel.js v8 — multi-tab (WhatsApp + Instagram)

const TABS = {
  whatsapp: {
    url: 'https://web.whatsapp.com',
    title: 'WhatsApp <span>Web</span>',
    frame: document.getElementById('wa-frame'),
    panel: document.getElementById('wa-panel'),
    overlay: document.getElementById('wa-overlay'),
    error: document.getElementById('wa-error'),
    timeout: null,
    loaded: false
  },
  instagram: {
    url: 'https://www.instagram.com',
    title: 'Instagram',
    frame: document.getElementById('ig-frame'),
    panel: document.getElementById('ig-panel'),
    overlay: document.getElementById('ig-overlay'),
    error: document.getElementById('ig-error'),
    timeout: null,
    loaded: false
  }
};

let activeTab = 'whatsapp';

const topbarTitle = document.getElementById('topbar-title');
const modePill    = document.getElementById('mode-pill');
const modeLabel   = document.getElementById('mode-label');
const btnContacts = document.getElementById('btn-contacts');

// ── Tab switching ───────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(name) {
  if (name === activeTab) return;
  activeTab = name;
  const tab = TABS[name];

  // Update tab bar
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));

  // Show/hide panels
  for (const [key, t] of Object.entries(TABS)) {
    t.panel.style.display = key === name ? '' : 'none';
    t.frame.classList.toggle('active', key === name);
  }

  // Lazy-load Instagram on first switch
  if (name === 'instagram' && !tab.loaded) {
    tab.frame.src = tab.url;
    resetLoad(name);
  }

  // Update topbar
  topbarTitle.innerHTML = tab.title;

  // Mode pill only for WhatsApp
  modePill.classList.toggle('hidden', name !== 'whatsapp');

  // Update logo accent
  document.documentElement.style.setProperty('--accent', name === 'instagram' ? 'var(--ig)' : 'var(--green)');
}

// ── Loading / error per tab ─────────────────────────────────────────────────
function resetLoad(name) {
  const tab = TABS[name];
  tab.overlay.classList.remove('fade');
  tab.error.classList.remove('show');
  clearTimeout(tab.timeout);
  tab.timeout = setTimeout(() => {
    if (!tab.overlay.classList.contains('fade')) {
      tab.overlay.classList.add('fade');
      tab.error.classList.add('show');
    }
  }, 30000);
}

function onFrameLoad(name) {
  const tab = TABS[name];
  clearTimeout(tab.timeout);
  tab.loaded = true;
  tab.overlay.classList.add('fade');
  tab.error.classList.remove('show');
}

TABS.whatsapp.frame.addEventListener('load', () => onFrameLoad('whatsapp'));
TABS.instagram.frame.addEventListener('load', () => onFrameLoad('instagram'));

// Init WhatsApp loading
resetLoad('whatsapp');

// ── Reload / new tab buttons ────────────────────────────────────────────────
document.getElementById('btn-reload').addEventListener('click', () => {
  const tab = TABS[activeTab];
  if (activeTab === 'whatsapp') setChatMode(false);
  resetLoad(activeTab);
  tab.frame.src = tab.url;
});

document.getElementById('btn-newtab').addEventListener('click', () => {
  chrome.tabs.create({ url: TABS[activeTab].url });
});

// Retry buttons
document.querySelectorAll('.btn-retry').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.retry;
    const tab = TABS[name];
    if (name === 'whatsapp') setChatMode(false);
    resetLoad(name);
    tab.frame.src = tab.url;
  });
});

// ── WhatsApp chat mode (from content script) ────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'WA_CHAT_STATE') {
    setChatMode(msg.chatOpen);
  }
});

function setChatMode(active) {
  if (btnContacts) {
    if (active) {
      btnContacts.classList.add('visible');
    } else {
      btnContacts.classList.remove('visible');
    }
  }
  modeLabel.textContent = active ? 'Chat' : 'Lista';
}

if (btnContacts) {
  btnContacts.addEventListener('click', () => {
    chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'WA_GO_BACK' });
      }
    });
  });
}