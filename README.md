<h1 align="center">♟️ OFFLINE CHESS: A Retro Browser Build 👑</h1>

<p align="center">
 Offline Chess is a small, self-contained website you can open straight from a folder and play on the couch with a friend, or against a bot, with no account and no connection. The Website is currently retro-themed, with more coming soon!
  <br />
  <a href="https://github.com/AndyDerevyanko/Chess/issues">Report Bug</a>
  ·
  <a href="https://github.com/AndyDerevyanko/Chess/issues">Request Feature</a>
</p>

## 📚 Table of Contents

- [What is Offline Chess?](#-what-is-offline-chess)
- [Current State](#-current-state)
- [How to Run It](#-how-to-run-it)
- [The Pages](#-the-pages)
- [Features](#-features)
- [How It's Built](#-how-its-built)
- [Reusable Bits](#-reusable-bits)
- [What's Next](#-whats-next)

## ❓ What is Offline Chess?

<img src="images/white/king.png" width="150" align="left">

It's a chess website that runs entirely in your browser with zero dependencies. No extra installs or server needed. You double-click `index.html` and you're good to go.

All the Chess and engine logic is written in JS, with CSS and HTML responsible for the presentation.

<br clear="left"/>

## 🕹️ How to Run It

Open `index.html` in any browser.

No internet connection needed once the files are on your machine, which is the whole idea.

## 🗺️ The Pages

The site follows this navigation flow:

```
Home (index.html)
 ├── Puzzles / Drills (puzzles.html)   → one template puzzle, the rest locked
 ├── Settings (settings.html)          → one option per category, toggles are cosmetic
 ├── Game Archive (archive.html)       → one example saved game
 └── Game Setup (setup.html)
      ├── Local vs Bot ─┐
      └── Pass & Play  ─┴→ Game Board (game.html)   ← the real, playable board
                             └→ Post-Game Analysis (analysis.html)
                                  └→ back to the Archive
```

"About" is a popup on the home page instead of its own page.

## 🧩 Features

- A Retro arcade-poster theme with a CRT scanline overlay
- A real chessboard with working move legality, check, and checkmate detection 
- Two game modes on the setup screen: pass-and-play and vs-bot
- Decorative mini-boards that reuse the exact same square colors as the real board
- Styled popups driven by simple HTML attributes
- Runs fully offline: no external fonts, no network calls anywhere

## 👨‍💻 How It's Built

In progress

### Where things live

In progress

## 🔮 What's Next

In progress

## 📄 License

MIT. See [LICENSE](LICENSE).
