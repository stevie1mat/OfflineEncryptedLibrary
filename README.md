# OfflineEncryptedLibrary (MyLibraryVault)

A secure, offline-first digital library desktop app for Windows, built with Electron, Node.js, and SQLite. Store, view, and protect PDF books with strong encryption and robust offline access.

---

## Features

- **User Authentication**
  - Login with username and password (demo: `demo` / `demo123`)
  - Credentials stored securely (bcrypt)
  - Device binding to prevent unauthorized copy

- **First-Time Setup**
  - Downloads and encrypts sample PDF(s) on first run
  - All PDFs stored as AES-256 encrypted files
  - Metadata stored in local SQLite database

- **Offline-Only Access**
  - App works fully offline after initial setup
  - Book list with titles, authors, and covers
  - Secure custom PDF viewer (no copy, print, or export)
  - Watermark with username on every page

- **Security**
  - AES-256 encryption for all PDFs
  - Passwords hashed with bcrypt
  - Encrypted local config and device binding
  - No decrypted files ever written to disk

- **Admin/Content Management**
  - Easily add new books by placing encrypted files and updating metadata

---

## Quick Start

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Run the app**
   ```sh
   npm start
   ```

3. **Login**
   - Username: `demo`
   - Password: `demo123`

---

## Project Structure

- `main.js` — Electron main process, handles DB, crypto, IPC
- `preload.js` — Securely exposes backend APIs to frontend
- `renderer/` — UI code (HTML, JS, CSS)
- `books.db` — Local SQLite database (auto-created)
- `pdfs/` — Encrypted PDF storage (auto-created)

---

## Security Notes
- All PDFs are encrypted with AES-256 and never stored decrypted on disk
- Passwords are hashed with bcrypt
- Device binding prevents copying the app to another machine
- The PDF viewer disables copy, print, and export, and overlays a watermark

---

## Customization
- To add your own books, use the admin tool or add encrypted PDFs and update the database
- To change branding, edit `renderer/index.html` and `app.js`

---

## License
MIT (or your preferred license) 