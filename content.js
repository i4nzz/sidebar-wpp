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
      /* ── Modo chat: esconde painel esquerdo, expande o direito ── */

      /* Container principal do WA */
      body.wa-sidebar-chat #app > div,
      body.wa-sidebar-chat .app-wrapper-web {
        overflow: hidden !important;
      }

      /* Painel esquerdo (lista de conversas) — oculta */
      body.wa-sidebar-chat [data-testid="chat-list-search"],
      body.wa-sidebar-chat #pane-side,
      body.wa-sidebar-chat ._3q4NP,
      body.wa-sidebar-chat [style*="width: 30%"],
      body.wa-sidebar-chat [style*="width: 25%"] {
        display: none !important;
      }

      /* Painel direito (conversa ativa) — ocupa tudo */
      body.wa-sidebar-chat #main {
        width: 100% !important;
        flex: 1 !important;
        min-width: 0 !important;
      }

      /* Garante layout correto no wrapper geral */
      body.wa-sidebar-chat [data-testid="conversation-panel-wrapper"],
      body.wa-sidebar-chat ._2Ts6i,
      body.wa-sidebar-chat ._3RGKj {
        width: 100% !important;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  // ── Detecta estado atual ─────────────────────────────────────────────────
  function isChatOpen() {
    const main = document.getElementById('main');
    const intro = document.querySelector(
      '[data-testid="intro-md-beta-logo-dark"], ' +
      '[data-testid="intro-md-beta-logo-light"], ' +
      '[data-asset-intro-image-light], ' +
      '[data-asset-intro-image-dark], ' +
      '.landing-wrapper, ._2rFrt'
    );
    // Chat está aberto se existe #main E não há tela de boas-vindas
    return !!(main && !intro);
  }

  // ── Aplica ou remove a classe no <body> ──────────────────────────────────
  let lastState = null;

  function updateMode() {
    const open = isChatOpen();
    if (open === lastState) return;
    lastState = open;

    if (open) {
      document.body.classList.add('wa-sidebar-chat');
    } else {
      document.body.classList.remove('wa-sidebar-chat');
    }

    // Notifica a sidebar panel sobre a mudança
    chrome.runtime.sendMessage({ type: 'WA_CHAT_STATE', chatOpen: open });
  }

  // ── Função "voltar para lista" (chamada pela sidebar) ────────────────────
  function goBackToList() {
    // Tenta clicar no botão nativo de voltar do header do chat
    const backBtn = document.querySelector(
      '[data-testid="back"], ' +
      '[aria-label="Back"], ' +
      '[aria-label="Voltar"]'
    );
    if (backBtn) {
      backBtn.click();
      return;
    }
    // Fallback: remove a classe (a lista reaparece visualmente)
    document.body.classList.remove('wa-sidebar-chat');
    lastState = false;
    chrome.runtime.sendMessage({ type: 'WA_CHAT_STATE', chatOpen: false });
  }

  // ── Ouve mensagens vindas da sidebar ────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'WA_GO_BACK') goBackToList();
  });

  // ── Inicializa ───────────────────────────────────────────────────────────
  injectCSS();
  updateMode();

  // Observer para mudanças no DOM (SPA — rotas mudam sem reload)
  const observer = new MutationObserver(() => {
    injectCSS(); // garante que o CSS está sempre presente
    updateMode();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-testid', 'style']
  });

  // Poll leve de segurança (fallback para mudanças que o observer possa perder)
  setInterval(updateMode, 800);

})();