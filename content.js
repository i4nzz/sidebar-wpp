// content.js — roda DIRETAMENTE em web.whatsapp.com
// Detecta se uma conversa está aberta e envia mensagem para a sidebar

(function () {
  'use strict';

  // ── Injeta o CSS de modo sidebar ────────────────────────────────────────
  const STYLE_ID = 'wa-sidebar-inject';

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* ── Layout otimizado para sidebar ── */
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  // ── Inicializa ───────────────────────────────────────────────────────────
  injectCSS();

})();