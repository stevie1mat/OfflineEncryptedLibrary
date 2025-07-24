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
    subtitle: 'To log in, enter your username.',
    username: 'Your username',
    login: 'Sign in',
    error: 'Invalid username',
    support: "Don't hesitate to contact us",
    supportEmail: 'support@mylibraryvault.com',
  },
  fr: {
    title: 'Bonjour!',
    subtitle: 'Pour vous connecter à votre compte, renseignez votre nom d\'utilisateur.',
    username: 'Votre nom d\'utilisateur',
    login: 'Se connecter',
    error: 'Nom d\'utilisateur invalide',
    support: "N'hésitez pas à nous contacter",
    supportEmail: 'support@bonsante.com',
  },
  hi: {
    title: 'नमस्ते!',
    subtitle: 'लॉगिन करने के लिए अपना उपयोगकर्ता नाम दर्ज करें।',
    username: 'आपका उपयोगकर्ता नाम',
    login: 'साइन इन करें',
    error: 'अमान्य उपयोगकर्ता नाम',
    support: 'संपर्क करने में संकोच न करें',
    supportEmail: 'support@mylibraryvault.com',
  },
};

function getLang() {
  return localStorage.getItem('lang') || 'en';
}
function setLang(lang) {
  localStorage.setItem('lang', lang);
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

  // Build login card
  const container = document.createElement('div');
  container.className = 'login-container';
  container.innerHTML = `
    <div class="login-card">
      <div class="login-left">
        <div>
          <div class="login-logo">SecureRead</div>
          <select class="lang-select" id="lang-select">
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="hi">🇮🇳 हिन्दी</option>
          </select>
          <div class="login-title">${t.title}</div>
          <div class="login-subtitle">${t.subtitle}</div>
          <form class="login-form" id="login-form">
            <input id="username" type="text" placeholder="${t.username}" required />
            <div id="login-error" style="color:red;margin-bottom:8px;"></div>
            <button class="login-btn" type="submit">${t.login}</button>
          </form>
        </div>
        <div class="support">
          ${t.support}<br />
          <a href="mailto:support@secureread.com">support@secureread.com</a>
        </div>
      </div>
      <div class="login-right">
        <img class="login-image" src="https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg" alt="plant" />
      </div>
    </div>
  `;
  root.appendChild(container);

  // Set language dropdown
  const langSelect = document.getElementById('lang-select');
  langSelect.value = lang;
  langSelect.onchange = (e) => {
    setLang(e.target.value);
    renderLogin();
  };

  // Login form logic
  const form = document.getElementById('login-form');
  form.onsubmit = async e => {
    e.preventDefault();
    const username = form.username.value;
    document.getElementById('login-error').textContent = '';
    try {
      const u = await window.api.login(username, '');
      if (u) { user = u; render(); }
      else document.getElementById('login-error').textContent = t.error;
    } catch (err) {
      console.error('[MyLibraryVault] login error:', err);
      document.getElementById('login-error').textContent = 'Authentication error';
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