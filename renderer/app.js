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
  const container = document.createElement('div');
  container.className = 'centered';
  const form = document.createElement('form');
  form.className = 'form';
  form.innerHTML = `
    <h2 id="login-title">Login to MyLibraryVault</h2>
    <input id="username" type="text" placeholder="Username" required style="width:100%;margin-bottom:16px;padding:8px;" />
    <input id="password" type="password" placeholder="Password" required style="width:100%;margin-bottom:16px;padding:8px;" />
    <div id="login-error" style="color:red;margin-bottom:8px;"></div>
    <button class="btn" type="submit" style="width:100%;">Login</button>
    <button class="btn" type="button" id="register-btn" style="width:100%;margin-top:8px;background:none;color:#2d72d9;">Create an Account</button>
    <button class="btn" type="button" id="download-btn" style="width:100%;margin-top:8px;display:none;">Download Library</button>
    <div id="download-msg" style="color:green;margin-top:8px;display:none;">Library downloaded! You can now login.</div>
  `;
  container.appendChild(form);
  root.appendChild(container);

  let isRegister = false;
  let downloaded = false;

  if (window.api && window.api.isFirstRun) {
    window.api.isFirstRun().then(fr => {
      firstRun = fr;
      console.log('[MyLibraryVault] isFirstRun:', firstRun);
      if (firstRun) {
        document.getElementById('login-title').textContent = 'Register to MyLibraryVault';
        isRegister = true;
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('download-btn').style.display = '';
      }
    }).catch(e => console.error('[MyLibraryVault] isFirstRun error:', e));
  } else {
    console.error('[MyLibraryVault] window.api.isFirstRun is not available');
  }

  form.onsubmit = async e => {
    e.preventDefault();
    const username = form.username.value;
    const password = form.password.value;
    document.getElementById('login-error').textContent = '';
    try {
      if (isRegister) {
        const u = await window.api.register(username, password);
        if (u) { user = u; render(); }
        else document.getElementById('login-error').textContent = 'Registration failed';
      } else {
        const u = await window.api.login(username, password);
        if (u) { user = u; render(); }
        else document.getElementById('login-error').textContent = 'Invalid credentials';
      }
    } catch (err) {
      console.error('[MyLibraryVault] login/register error:', err);
      document.getElementById('login-error').textContent = 'Authentication error';
    }
  };
  document.getElementById('register-btn').onclick = () => {
    isRegister = !isRegister;
    document.getElementById('login-title').textContent = isRegister ? 'Register to MyLibraryVault' : 'Login to MyLibraryVault';
    document.querySelector('button[type=submit]').textContent = isRegister ? 'Register' : 'Login';
    document.getElementById('download-btn').style.display = (isRegister && firstRun) ? '' : 'none';
  };
  document.getElementById('download-btn').onclick = async () => {
    try {
      await window.api.downloadBooks();
      downloaded = true;
      document.getElementById('download-msg').style.display = '';
    } catch (err) {
      console.error('[MyLibraryVault] downloadBooks error:', err);
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