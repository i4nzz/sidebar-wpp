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
  },
  claude: {
    url: 'https://claude.ai',
    title: 'Claude',
    frame: document.getElementById('cl-frame'),
    panel: document.getElementById('cl-panel'),
    overlay: document.getElementById('cl-overlay'),
    error: document.getElementById('cl-error'),
    timeout: null,
    loaded: false
  }
};

let activeTab = 'whatsapp';

const topbarTitle = document.getElementById('topbar-title');
const topbarLogo = document.getElementById('topbar-logo');

const LOGO_ICONS = {
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
  claude: '<svg viewBox="0 0 24 24"><path d="M4.709 15.955l4.397-10.985c.2-.499.378-.999.378-1.35 0-.847-.616-1.345-1.329-1.345-.776 0-1.335.609-1.6 1.345L1.143 16.954c-.152.398-.243.756-.243 1.02 0 .847.672 1.345 1.384 1.345.765 0 1.33-.595 1.595-1.345l.83-2.02zm7.28 0l4.398-10.985c.199-.499.378-.999.378-1.35 0-.847-.617-1.345-1.33-1.345-.775 0-1.334.609-1.6 1.345L8.424 16.954c-.152.398-.243.756-.243 1.02 0 .847.672 1.345 1.384 1.345.765 0 1.33-.595 1.594-1.345l.83-2.02zm5.634 3.364c.94 0 1.678-.756 1.678-1.693 0-.94-.738-1.693-1.678-1.693-.94 0-1.693.753-1.693 1.693 0 .937.753 1.693 1.693 1.693z"/></svg>'
};

const LOGO_COLORS = {
  whatsapp: { bg: 'rgba(0,230,118,.12)', border: 'rgba(0,230,118,.25)' },
  instagram: { bg: 'rgba(225,48,108,.12)', border: 'rgba(225,48,108,.25)' },
  claude: { bg: 'rgba(204,120,92,.12)', border: 'rgba(204,120,92,.25)' }
};

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

  // Lazy-load on first switch (Instagram, Claude)
  if (name !== 'whatsapp' && !tab.loaded) {
    tab.frame.src = tab.url;
    resetLoad(name);
  }

  // Show tomato button only for WhatsApp
  btnTomato.style.display = name === 'whatsapp' ? '' : 'none';

  // Update topbar
  topbarTitle.innerHTML = tab.title;

  // Update logo icon and accent
  topbarLogo.innerHTML = LOGO_ICONS[name];
  topbarLogo.style.background = LOGO_COLORS[name].bg;
  topbarLogo.style.borderColor = LOGO_COLORS[name].border;
  const accentMap = { whatsapp: 'var(--green)', instagram: 'var(--ig)', claude: 'var(--claude)' };
  document.documentElement.style.setProperty('--accent', accentMap[name]);
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
TABS.claude.frame.addEventListener('load', () => onFrameLoad('claude'));

// Init WhatsApp loading
resetLoad('whatsapp');

// ── Reload / new tab buttons ────────────────────────────────────────────────
document.getElementById('btn-reload').addEventListener('click', () => {
  const tab = TABS[activeTab];
  resetLoad(activeTab);
  tab.frame.src = tab.url;
});

document.getElementById('btn-newtab').addEventListener('click', () => {
  chrome.tabs.create({ url: TABS[activeTab].url });
});

// Tomato react button — only visible on WhatsApp tab
const btnTomato = document.getElementById('btn-tomato');
btnTomato.addEventListener('click', () => {
  TABS.whatsapp.frame.contentWindow.postMessage(
    { type: 'SIDEBAR_WPP_REACT_TOMATO' },
    'https://web.whatsapp.com'
  );
});

// Retry buttons
document.querySelectorAll('.btn-retry').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.retry;
    const tab = TABS[name];
    resetLoad(name);
    tab.frame.src = tab.url;
  });
});

