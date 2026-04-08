# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Extension (Manifest v3) that embeds WhatsApp Web and Instagram in a Chrome sidebar panel with tab switching. Zero dependencies — vanilla HTML/CSS/JS with no build system, bundler, or package manager.

## Development

No build or install steps. Load the extension directly in Chrome:
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory

To test changes, reload the extension from the extensions page.

## Architecture

- **manifest.json** — Extension config (Manifest v3). Declares `sidePanel`, `tabs`, `storage`, `webNavigation` permissions and host access to WhatsApp and Instagram domains.
- **background.js** — Service worker. Sets side panel to open on extension icon click and bridges messages between content scripts and sidebar.
- **sidepanel.html** — Single-file UI with embedded CSS. Contains topbar, tab bar (WhatsApp/Instagram), per-tab loading/error overlays, and iframes for each service.
- **sidepanel.js** — All runtime logic. Handles tab switching, per-tab iframe lifecycle (load/error states), toolbar actions (reload, open in tab), and WhatsApp chat mode via content script messages.
- **content.js** — Content script injected into web.whatsapp.com. Detects chat state and injects CSS for sidebar-optimized layout.
- **rules.json** — declarativeNetRequest rules to strip X-Frame-Options and CSP headers for WhatsApp and Instagram domains.

## Key Technical Details

- Iframes load each service; declarativeNetRequest strips blocking headers to allow embedding.
- Instagram iframe is lazy-loaded (only when the user switches to that tab for the first time).
- UI is in Brazilian Portuguese.
- Theming uses CSS custom properties (`--green`, `--ig`, `--bg`, `--surface`, etc.) with a dark color scheme. WhatsApp uses green accent, Instagram uses pink.
- Icons are inline SVGs — no external icon libraries.
