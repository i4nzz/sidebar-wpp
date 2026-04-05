// background.js v6 — bridge entre content script e sidepanel

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Repassa mensagens do content script para a sidebar (e vice-versa)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Content script → sidebar: estado do chat
  if (msg.type === 'WA_CHAT_STATE') {
    // Envia para todos os listeners (a sidebar ouvirá isso)
    chrome.runtime.sendMessage(msg).catch(() => {});
  }
});