const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');

// App data paths
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'books.db');
const pdfDir = path.join(userDataPath, 'pdfs');
const configPath = path.join(userDataPath, 'config.enc');

// Ensure directories exist
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// AES-256 key for local encryption (should be derived from user password or device binding)
let aesKey = null;

// Initialize SQLite DB
let db;
function initDb() {
  db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      device_id TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      author TEXT,
      cover BLOB,
      file_path TEXT,
      available_offline INTEGER DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);
    // Insert sample user and book if not present
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (row && row.count === 0) {
        const deviceId = getDeviceId();
        const passwordHash = bcrypt.hashSync('demo123', 10);
        db.run('INSERT INTO users (username, password_hash, device_id) VALUES (?, ?, ?)', ['demo', passwordHash, deviceId]);
      }
    });
    db.get('SELECT COUNT(*) as count FROM books', (err, row) => {
      if (row && row.count === 0) {
        // Create a dummy PDF if not present
        const samplePdfPath = path.join(__dirname, 'sample.pdf');
        if (!fs.existsSync(samplePdfPath)) {
          fs.writeFileSync(samplePdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 72 120 Td (Hello MyLibraryVault) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000212 00000 n \ntrailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n312\n%%EOF','utf8'));
        }
        // Encrypt the PDF
        const pdfData = fs.readFileSync(samplePdfPath);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.alloc(32), iv); // Use zero key for demo
        const encPdf = Buffer.concat([iv, cipher.update(pdfData), cipher.final()]);
        const encPath = path.join(pdfDir, 'file_001.enc');
        fs.writeFileSync(encPath, encPdf);
        db.run('INSERT INTO books (title, author, cover, file_path, available_offline) VALUES (?, ?, ?, ?, 1)',
          ['Sample Book', 'Admin', null, encPath]);
      }
    });
  });
}

// Device binding (Windows machine ID)
function getDeviceId() {
  // Use hostname + username as a simple device ID (for demo; use a better method in production)
  return os.hostname() + '_' + os.userInfo().username;
}

// Secure config storage
function saveConfig(key, value) {
  const cipher = crypto.createCipher('aes-256-cbc', aesKey);
  let enc = cipher.update(JSON.stringify(value), 'utf8', 'hex');
  enc += cipher.final('hex');
  db.run('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', [key, enc]);
}
function loadConfig(key) {
  return new Promise((resolve) => {
    db.get('SELECT value FROM config WHERE key = ?', [key], (err, row) => {
      if (err || !row) return resolve(null);
      try {
        const decipher = crypto.createDecipher('aes-256-cbc', aesKey);
        let dec = decipher.update(row.value, 'hex', 'utf8');
        dec += decipher.final('utf8');
        resolve(JSON.parse(dec));
      } catch {
        resolve(null);
      }
    });
  });
}

// Electron window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
    resizable: false,
    fullscreenable: false,
    title: 'MyLibraryVault',
  });
  win.removeMenu();
  win.loadFile('renderer/index.html');
}

app.whenReady().then(() => {
  initDb();
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for authentication, book management, etc.

ipcMain.handle('isFirstRun', async () => {
  return new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      resolve(row && row.count === 0);
    });
  });
});

ipcMain.handle('register', async (event, username, password) => {
  return new Promise((resolve) => {
    const deviceId = getDeviceId();
    const passwordHash = bcrypt.hashSync(password, 10);
    aesKey = crypto.scryptSync(password + deviceId, 'mylibraryvault', 32);
    db.run('INSERT INTO users (username, password_hash, device_id) VALUES (?, ?, ?)', [username, passwordHash, deviceId], function (err) {
      if (err) return resolve(null);
      resolve({ username });
    });
  });
});

ipcMain.handle('login', async (event, username, password) => {
  return new Promise((resolve) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (!row) return resolve(null);
      // No password check, just username
      aesKey = crypto.scryptSync(username + getDeviceId(), 'mylibraryvault', 32);
      resolve({ username });
    });
  });
});

ipcMain.handle('getBooks', async () => {
  return new Promise((resolve) => {
    db.all('SELECT id, title, author, cover, available_offline FROM books', (err, rows) => {
      if (err) return resolve([]);
      // Convert cover BLOB to base64
      rows.forEach(row => {
        if (row.cover) row.cover = Buffer.from(row.cover).toString('base64');
      });
      resolve(rows);
    });
  });
});

ipcMain.handle('readBook', async (event, bookId) => {
  return new Promise((resolve) => {
    db.get('SELECT file_path FROM books WHERE id = ?', [bookId], (err, row) => {
      if (!row) return resolve(null);
      const encPath = row.file_path;
      fs.readFile(encPath, (err, encData) => {
        if (err) return resolve(null);
        // Decrypt PDF in memory
        try {
          const iv = encData.slice(0, 16);
          const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
          let dec = Buffer.concat([
            decipher.update(encData.slice(16)),
            decipher.final()
          ]);
          resolve(dec);
        } catch {
          resolve(null);
        }
      });
    });
  });
});

ipcMain.handle('downloadBooks', async () => {
  // Simulate downloading and encrypting a PDF file and metadata
  // In production, fetch from secure server
  const samplePdfPath = path.join(__dirname, 'sample.pdf');
  if (!fs.existsSync(samplePdfPath)) {
    // Create a dummy PDF if not present
    fs.writeFileSync(samplePdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 72 120 Td (Hello MyLibraryVault) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000212 00000 n \ntrailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n312\n%%EOF','utf8'));
  }
  // Encrypt the PDF
  const pdfData = fs.readFileSync(samplePdfPath);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  const encPdf = Buffer.concat([iv, cipher.update(pdfData), cipher.final()]);
  const encPath = path.join(pdfDir, 'file_001.enc');
  fs.writeFileSync(encPath, encPdf);
  // Insert into DB
  db.run('INSERT OR IGNORE INTO books (title, author, cover, file_path, available_offline) VALUES (?, ?, ?, ?, 1)',
    ['Sample Book', 'Admin', null, encPath],
    (err) => {}
  );
  return true;
}); 