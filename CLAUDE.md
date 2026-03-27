# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome Extension (Manifest v3) that embeds WhatsApp Web in a Chrome sidebar panel. Zero dependencies — vanilla HTML/CSS/JS with no build system, bundler, or package manager.

## Development

No build or install steps. Load the extension directly in Chrome:
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory

To test changes, reload the extension from the extensions page.

## Architecture

- **manifest.json** — Extension config (Manifest v3). Declares `sidePanel`, `tabs`, `storage`, `webNavigation` permissions and host access to `https://web.whatsapp.com/*`.
- **background.js** — Service worker. Sets side panel to open on extension icon click.
- **sidepanel.html** — Single-file UI with embedded CSS. Contains toolbar, loading spinner overlay, error overlay, and a `<webview>` embedding WhatsApp Web.
- **sidepanel.js** — All runtime logic (~240 lines). Handles webview lifecycle (load/error states), toolbar actions (back, reload, open in tab), and UI state transitions with fade animations.

## Key Technical Details

- The webview uses a custom user-agent string and `partition="persist:whatsapp"` for isolated storage.
- UI is in Brazilian Portuguese.
- Theming uses CSS custom properties (`--green`, `--bg`, `--surface`, etc.) with a dark green color scheme.
- Icons are inline SVGs — no external icon libraries.
