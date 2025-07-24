console.log('[MyLibraryVault] app.js loaded');
if (typeof window.api === 'undefined') {
  console.error('[MyLibraryVault] window.api is undefined. Preload script may not be working.');
}

// Simple state
let user = null;
let books = [];
let viewingBook = null;
let firstRun = false;

const root = document.getElementById('root');
if (!root) {
  console.error('[MyLibraryVault] #root element not found in index.html');
}

// Language translations
const translations = {
  en: {
    title: 'Welcome!',
    subtitle: 'To log in, enter your library ID.',
    username: 'Your library ID',
    login: 'Sign in',
    error: 'Please enter a valid email ID',
    support: "Don't hesitate to contact us",
    supportEmail: 'support@secureread.com',
  },
  hi: {
    title: 'नमस्ते!',
    subtitle: 'लॉगिन करने के लिए अपनी लाइब्रेरी आईडी दर्ज करें।',
    username: 'आपकी लाइब्रेरी आईडी',
    login: 'साइन इन करें',
    error: 'कृपया एक मान्य ईमेल आईडी दर्ज करें',
    support: 'संपर्क करने में संकोच न करें',
    supportEmail: 'support@secureread.com',
  },
};

function getLang() {
  return localStorage.getItem('lang') || 'en';
}
function setLang(lang) {
  localStorage.setItem('lang', lang);
}

function showDialog(message) {
  let modal = document.getElementById('secure-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'secure-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-message"></div>
        <button class="modal-close">OK</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').onclick = () => {
      modal.style.display = 'none';
    };
    modal.onclick = (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        modal.style.display = 'none';
      }
    };
  }
  modal.querySelector('.modal-message').textContent = message;
  modal.style.display = 'flex';
}

function showSuccessDialog(message, callback) {
  let modal = document.getElementById('secure-modal-success');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'secure-modal-success';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content success">
        <div class="modal-message"></div>
        <button class="modal-close">OK</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').onclick = () => {
      modal.style.display = 'none';
      if (callback) callback();
    };
    modal.onclick = (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        modal.style.display = 'none';
        if (callback) callback();
      }
    };
  }
  modal.querySelector('.modal-message').textContent = message;
  modal.style.display = 'flex';
}

function render() {
  console.log('[MyLibraryVault] render() called. user:', user, 'viewingBook:', viewingBook);
  root.innerHTML = '';
  if (!user) {
    renderLogin();
    return;
  }
  if (viewingBook) {
    renderViewer(viewingBook);
    return;
  }
  renderBookList();
}

function renderLogin() {
  console.log('[MyLibraryVault] renderLogin()');
  const lang = getLang();
  const t = translations[lang];
  root.innerHTML = '';

  // Add language dropdown at top right
  let langDropdown = document.getElementById('global-lang-select');
  if (!langDropdown) {
    langDropdown = document.createElement('select');
    langDropdown.id = 'global-lang-select';
    langDropdown.className = 'global-lang-select';
    langDropdown.innerHTML = `
      <option value="en">🇬🇧 English</option>
      <option value="hi">🇮🇳 हिन्दी</option>
    `;
    document.body.appendChild(langDropdown);
  }
  langDropdown.value = lang;
  langDropdown.onchange = (e) => {
    setLang(e.target.value);
    renderLogin();
  };

  // Build login card
  const container = document.createElement('div');
  container.className = 'login-container';
  container.innerHTML = `
    <div class="login-card">
      <div class="login-left">
        <div>
          <div class="login-title">${t.title}</div>
          <div class="login-subtitle">${t.subtitle}</div>
          <form class="login-form" id="login-form">
            <input id="username" type="text" placeholder="${t.username}" required />
            <div id="login-error" style="color:red;margin-bottom:8px;"></div>
            <button class="login-btn" type="submit">${t.login}</button>
          </form>
        </div>
      </div>
      <div class="login-right">
        <img class="login-image" src="https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg" alt="plant" />
      </div>
    </div>
  `;
  root.appendChild(container);

  // Login form logic
  const form = document.getElementById('login-form');
  form.onsubmit = async e => {
    e.preventDefault();
    const username = form.username.value;
    document.getElementById('login-error').textContent = '';
    const btn = form.querySelector('.login-btn');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>' + originalText;
    try {
      const u = await window.api.login(username, '');
      if (u) {
        showSuccessDialog('Login successful!', () => { user = u; render(); });
      }
      else showDialog(t.error);
    } catch (err) {
      console.error('[MyLibraryVault] login error:', err);
      showDialog('Authentication error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  };
}

function renderBookList() {
  console.log('[MyLibraryVault] renderBookList()');
  const container = document.createElement('div');
  container.style.display = 'flex';
  // Sidebar
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `<h2 style="margin-bottom:32px;">MyLibraryVault</h2><div style="flex:1"></div>`;
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn btn-logout';
  logoutBtn.textContent = 'Logout';
  logoutBtn.onclick = () => { user = null; render(); };
  sidebar.appendChild(logoutBtn);
  container.appendChild(sidebar);
  // Main
  const main = document.createElement('main');
  main.className = 'main';
  main.innerHTML = `<h3>Welcome, ${user.username}</h3><div id="books" style="display:flex;flex-wrap:wrap;gap:24px;margin-top:24px;"></div>`;
  container.appendChild(main);
  root.appendChild(container);
  if (window.api && window.api.getBooks) {
    window.api.getBooks().then(bs => {
      books = bs;
      console.log('[MyLibraryVault] getBooks:', books);
      const booksDiv = document.getElementById('books');
      books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
          <div class="cover">${book.cover ? `<img src="data:image/png;base64,${book.cover}" style="width:100%;height:100%;object-fit:cover;" />` : 'No Cover'}</div>
          <div style="font-weight:bold;margin-bottom:4px;">${book.title}</div>
          <div style="color:#888;margin-bottom:12px;">${book.author}</div>
        `;
        const readBtn = document.createElement('button');
        readBtn.className = 'btn';
        readBtn.textContent = 'Read';
        readBtn.onclick = () => { viewingBook = book; render(); };
        card.appendChild(readBtn);
        booksDiv.appendChild(card);
      });
    }).catch(e => console.error('[MyLibraryVault] getBooks error:', e));
  } else {
    console.error('[MyLibraryVault] window.api.getBooks is not available');
  }
}

function renderViewer(book) {
  console.log('[MyLibraryVault] renderViewer()', book);
  const container = document.createElement('div');
  container.style.height = '100vh';
  container.style.background = '#222';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  // Top bar
  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML = `<button class="btn" id="back-btn" style="margin-right:16px;background:#fff;color:#2d72d9;">Back</button><span style="font-weight:bold;font-size:18px;">${book.title}</span><span id="page-info" style="margin-left:auto;"></span>`;
  container.appendChild(topbar);
  // PDF area
  const pdfArea = document.createElement('div');
  pdfArea.style.flex = '1';
  pdfArea.style.display = 'flex';
  pdfArea.style.justifyContent = 'center';
  pdfArea.style.alignItems = 'center';
  pdfArea.style.background = '#222';
  const canvas = document.createElement('canvas');
  canvas.className = 'pdf-canvas';
  pdfArea.appendChild(canvas);
  container.appendChild(pdfArea);
  // Nav bar
  const nav = document.createElement('div');
  nav.className = 'topbar';
  nav.style.justifyContent = 'center';
  nav.innerHTML = `<button class="btn" id="prev-btn" style="margin-right:16px;background:#fff;color:#2d72d9;">Prev</button><button class="btn" id="next-btn" style="background:#fff;color:#2d72d9;">Next</button>`;
  container.appendChild(nav);
  root.appendChild(container);

  let pageNum = 1;
  let numPages = 1;
  let pdfDoc = null;

  document.getElementById('back-btn').onclick = () => { viewingBook = null; render(); };

  // Disable right-click, copy, print, selection
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey && (e.key === 'c' || e.key === 'p' || e.key === 's')) || e.key === 'PrintScreen') {
      e.preventDefault();
    }
  });

  // Load PDF.js
  if (!window.pdfjsLib) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => loadPdf();
    document.body.appendChild(script);
  } else {
    loadPdf();
  }

  function loadPdf() {
    window.api.readBook(book.id).then(async (pdfData) => {
      pdfDoc = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
      numPages = pdfDoc.numPages;
      renderPage(pageNum);
    });
  }

  function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        // Watermark
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.font = '24px Arial';
        ctx.fillStyle = '#2d72d9';
        ctx.rotate(-0.2);
        ctx.fillText(user.username + ' - MyLibraryVault', 40, 60);
        ctx.restore();
        document.getElementById('page-info').textContent = `Page ${pageNum} / ${numPages}`;
      });
    });
  }

  document.getElementById('prev-btn').onclick = () => {
    if (pageNum > 1) {
      pageNum--;
      renderPage(pageNum);
    }
  };
  document.getElementById('next-btn').onclick = () => {
    if (pageNum < numPages) {
      pageNum++;
      renderPage(pageNum);
    }
  };
}

// Initial render
console.log('[MyLibraryVault] Initial render');
render();

// Add spinner CSS
const style = document.createElement('style');
style.innerHTML = `
.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2.5px solid #fff;
  border-top: 2.5px solid #3ecf8e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);

// Add modal CSS
style.innerHTML += `
#secure-modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0; top: 0; right: 0; bottom: 0;
  align-items: center;
  justify-content: center;
  font-family: 'Urbanist', 'Segoe UI', Arial, sans-serif;
}
#secure-modal .modal-backdrop {
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(30, 41, 59, 0.18);
  backdrop-filter: blur(2px);
}
#secure-modal .modal-content {
  position: relative;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px #0002;
  padding: 36px 36px 24px 36px;
  min-width: 280px;
  max-width: 92vw;
  text-align: center;
  z-index: 2;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  border: 1.5px solid #eaf7ef;
}
#secure-modal .modal-message {
  font-size: 1.13em;
  color: #d32f2f;
  margin-bottom: 0;
  font-weight: 600;
  letter-spacing: 0.01em;
}
#secure-modal .modal-close {
  background: #3ecf8e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 36px;
  font-size: 1em;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px #3ecf8e22;
  font-weight: 500;
  outline: none;
}
#secure-modal .modal-close:hover, #secure-modal .modal-close:focus {
  background: #2da06a;
  box-shadow: 0 4px 16px #3ecf8e33;
}
`;

// Add success modal CSS
style.innerHTML += `
#secure-modal-success {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0; top: 0; right: 0; bottom: 0;
  align-items: center;
  justify-content: center;
  font-family: 'Urbanist', 'Segoe UI', Arial, sans-serif;
}
#secure-modal-success .modal-backdrop {
  position: absolute;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(30, 41, 59, 0.12);
  backdrop-filter: blur(2px);
}
#secure-modal-success .modal-content.success {
  position: relative;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px #0002;
  padding: 36px 36px 24px 36px;
  min-width: 280px;
  max-width: 92vw;
  text-align: center;
  z-index: 2;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  border: 1.5px solid #eaf7ef;
}
#secure-modal-success .modal-message {
  font-size: 1.13em;
  color: #219653;
  margin-bottom: 0;
  font-weight: 600;
  letter-spacing: 0.01em;
}
#secure-modal-success .modal-close {
  background: #3ecf8e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 36px;
  font-size: 1em;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px #3ecf8e22;
  font-weight: 500;
  outline: none;
}
#secure-modal-success .modal-close:hover, #secure-modal-success .modal-close:focus {
  background: #2da06a;
  box-shadow: 0 4px 16px #3ecf8e33;
}
`; 