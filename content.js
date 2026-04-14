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

  // ── Reação com tomate ────────────────────────────────────────────────────

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SIDEBAR_WPP_REACT_TOMATO') {
      reactWithTomato();
    }
  });

  function waitFor(fn, timeout = 3000, interval = 150) {
    return new Promise((resolve, reject) => {
      const result = fn();
      if (result) return resolve(result);
      const id = setInterval(() => {
        const r = fn();
        if (r) { clearInterval(id); clearTimeout(t); resolve(r); }
      }, interval);
      const t = setTimeout(() => { clearInterval(id); reject(new Error('timeout')); }, timeout);
    });
  }

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  function simulateHover(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const opts = { bubbles: true, cancelable: true, clientX: cx, clientY: cy };
    el.dispatchEvent(new MouseEvent('mouseenter', { ...opts, bubbles: false }));
    el.dispatchEvent(new MouseEvent('mouseover', opts));
    el.dispatchEvent(new MouseEvent('mousemove', opts));
  }

  async function reactWithTomato() {
    try {
      // 1. Conversa aberta?
      const main = document.querySelector('#main');
      if (!main) return;

      // 2. Última mensagem
      const messages = main.querySelectorAll('div.message-in, div.message-out');
      if (!messages.length) return;
      const lastMsg = messages[messages.length - 1];

      // Scroll into view
      lastMsg.scrollIntoView({ block: 'center' });
      await wait(100);

      // 3. Hover para mostrar o botão de reação
      const row = lastMsg.closest('[role="row"]') || lastMsg;
      simulateHover(row);
      simulateHover(lastMsg);

      // Hover mais agressivo — subir pelos pais
      let el = lastMsg;
      for (let i = 0; i < 5 && el; i++) {
        simulateHover(el);
        el = el.parentElement;
      }
      await wait(300);

      // 4. Achar o botão de reagir (ícone de emoji que aparece ao passar o mouse)
      let reactBtn = null;
      const iconSelectors = [
        'span[data-icon="react"]',
        'span[data-icon="emoji-reaction"]',
        'span[data-icon="react-filled"]',
        'span[data-icon="emoji"]',
      ];
      for (const sel of iconSelectors) {
        reactBtn = row.querySelector(sel) || main.querySelector(sel);
        if (reactBtn) break;
      }

      // Fallback: busca por aria-label
      if (!reactBtn) {
        const btns = row.querySelectorAll('span[role="button"], button, div[role="button"]');
        for (const b of btns) {
          const label = (b.getAttribute('aria-label') || '').toLowerCase();
          if (label.includes('react') || label.includes('reag') || label.includes('emoji')) {
            reactBtn = b;
            break;
          }
        }
      }

      if (!reactBtn) return;

      // 5. Clicar no botão de reação
      const clickTarget = reactBtn.closest('button, [role="button"], div[tabindex]') || reactBtn;
      clickTarget.click();
      await wait(300);

      // 6. Clicar no "+" para abrir o picker completo de emojis
      const addBtn = await waitFor(() => {
        // Seletores diretos por data-icon
        const iconNames = [
          'add-reaction', 'emoji-add', 'plus', 'add-emoji',
          'plus-large', 'plus-thumb', 'reaction-add',
        ];
        for (const name of iconNames) {
          const el = document.querySelector('span[data-icon="' + name + '"]');
          if (el) return el;
        }

        // Busca por aria-label no botão "+"
        const allBtns = document.querySelectorAll('button, [role="button"], span[role="button"], li[role="option"]');
        for (const b of allBtns) {
          const label = (b.getAttribute('aria-label') || b.getAttribute('title') || '').toLowerCase();
          if (label.includes('all') || label.includes('more') || label.includes('todos') || label.includes('mais')) {
            return b;
          }
          // Botão cujo conteúdo é literalmente "+"
          if (b.textContent.trim() === '+') return b;
        }

        // Fallback: último item clicável no popup de reações rápidas
        // O popup geralmente é um container que apareceu perto da mensagem
        const popups = document.querySelectorAll(
          '[data-animate-modal-popup="true"], div[data-animate-dropdown-item="true"]'
        );
        for (const popup of popups) {
          const items = popup.querySelectorAll('span[data-icon], button, [role="button"]');
          if (items.length) return items[items.length - 1];
        }

        // Fallback final: qualquer span com SVG de "+" (um círculo com uma cruz)
        const svgSpans = document.querySelectorAll('span[data-icon] svg');
        for (const svg of svgSpans) {
          const paths = svg.querySelectorAll('path');
          // O ícone de "+" geralmente tem um path de cruz
          for (const path of paths) {
            const d = path.getAttribute('d') || '';
            // Heurística: "+" icons têm "M" (moveto) seguido de "H" ou "V" (linhas retas cruzadas)
            if (d.includes('H') && d.includes('V') && d.length < 120) {
              return svg.closest('span[data-icon]') || svg.parentElement;
            }
          }
        }

        return null;
      }, 2000);

      const addTarget = addBtn.closest('button, [role="button"], div[tabindex], li') || addBtn;
      addTarget.click();
      await wait(400);

      // 7. Achar o input de busca de emoji
      const searchInput = await waitFor(() => {
        const inputs = document.querySelectorAll('input[type="text"], div[contenteditable="true"]');
        for (const inp of inputs) {
          const ph = (inp.getAttribute('placeholder') || inp.getAttribute('aria-label') || '').toLowerCase();
          if (ph.includes('pesquis') || ph.includes('search') || ph.includes('emoji') || ph.includes('buscar')) {
            return inp;
          }
        }
        return null;
      }, 2000);

      // 8. Digitar "tomato" na busca
      searchInput.focus();
      searchInput.click();
      await wait(100);

      // Compatibilidade com React: usar native setter
      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter && searchInput instanceof HTMLInputElement) {
        nativeSetter.call(searchInput, 'tomato');
      } else {
        searchInput.textContent = 'tomato';
      }
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(500);

      // 9. Clicar no emoji de tomate 🍅
      const tomatoEmoji = await waitFor(() => {
        // Busca por img com alt contendo tomato/tomate
        const imgs = document.querySelectorAll('button img, [role="button"] img, [role="gridcell"] img, [role="option"] img, li img');
        for (const img of imgs) {
          const alt = (img.getAttribute('alt') || '').toLowerCase();
          if (alt.includes('tomato') || alt.includes('tomate') || alt === '🍅') {
            return img.closest('button, [role="button"], [role="gridcell"], [role="option"], li') || img;
          }
        }
        // Busca por elemento contendo o emoji diretamente
        const elems = document.querySelectorAll('button, [role="button"], [role="gridcell"], [role="option"], li');
        for (const el of elems) {
          if (el.textContent.trim() === '🍅') return el;
        }
        // Busca por data-emoji
        const dataEmoji = document.querySelectorAll('[data-emoji]');
        for (const el of dataEmoji) {
          if (el.getAttribute('data-emoji') === '🍅') return el;
        }
        return null;
      }, 2000);

      tomatoEmoji.click();
    } catch {
      // Falha silenciosa
    }
  }

  // ── Inicializa ───────────────────────────────────────────────────────────
  injectCSS();

})();