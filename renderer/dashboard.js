// Static sample data
const books = [
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    cover: 'https://images-na.ssl-images-amazon.com/images/I/81H9Z3P1gWL.jpg',
    rating: 4.7,
    pages: 320,
    reviews: 110,
    ratings: 643,
    description: 'Timeless lessons on wealth, greed, and happiness.'
  },
  {
    title: 'How Innovation Works',
    author: 'Matt Ridley',
    cover: 'https://images-na.ssl-images-amazon.com/images/I/81r+LNw2QSL.jpg',
    rating: 4.5,
    pages: 280,
    reviews: 90,
    ratings: 500,
    description: 'And why it flourishes in freedom.'
  },
  {
    title: 'Company of One',
    author: 'Paul Jarvis',
    cover: 'https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg',
    rating: 4.8,
    pages: 320,
    reviews: 110,
    ratings: 643,
    description: 'Why staying small is the next big thing for business.'
  },
  {
    title: 'Stupore E Tremori',
    author: 'Amelie Nothomb',
    cover: 'https://images-na.ssl-images-amazon.com/images/I/71pWc5Q1QwL.jpg',
    rating: 4.2,
    pages: 210,
    reviews: 60,
    ratings: 300,
    description: 'A unique perspective on Japanese corporate culture.'
  }
];

const categories = [
  'All', 'Sci-Fi', 'Fantasy', 'Drama', 'Business', 'Education', 'Geography'
];

function renderDashboard() {
  document.body.innerHTML = `
    <div class="dashboard-root">
      <aside class="sidebar">
        <div class="sidebar-logo"><img src="https://mbcmumbai.com/wp-content/uploads/2021/08/WhatsApp_Image_2021-08-20_at_17.24.14-removebg-preview.png" alt="Logo" /></div>
        <nav class="sidebar-nav">
          <a class="nav-item active"><span>🏠</span> Discover</a>
          <a class="nav-item"><span>📚</span> Category</a>
          <a class="nav-item"><span>📖</span> My Library</a>
          <a class="nav-item"><span>⬇️</span> Download</a>
          <a class="nav-item"><span>🎧</span> Audio Books</a>
          <a class="nav-item"><span>❤️</span> Favourite</a>
          <a class="nav-item"><span>⚙️</span> Settings</a>
          <a class="nav-item"><span>❓</span> Support</a>
          <a class="nav-item"><span>🚪</span> Logout</a>
        </nav>
      </aside>
      <main class="main-content">
        <header class="top-bar">
          <input class="search-bar" placeholder="Search your favourite books" />
          <div class="top-bar-right">
            <span class="notif-icon">🔔</span>
            <div class="user-info">
              <img class="user-avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
              <span class="user-name">Balogun</span>
            </div>
          </div>
        </header>
        <section class="recommended-section">
          <div class="section-header">
            <h2>Recommended</h2>
            <a class="see-all">See All &rarr;</a>
          </div>
          <div class="recommended-list">
            ${books.map(book => `
              <div class="book-card">
                <img src="${book.cover}" alt="${book.title}" />
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
              </div>
            `).join('')}
          </div>
        </section>
        <section class="categories-section">
          <div class="section-header">
            <h2>Categories</h2>
          </div>
          <div class="category-chips">
            ${categories.map((cat, i) => `<span class="chip${i === 0 ? ' active' : ''}">${cat}</span>`).join('')}
          </div>
          <div class="category-list">
            ${books.map(book => `
              <div class="book-card small">
                <img src="${book.cover}" alt="${book.title}" />
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
              </div>
            `).join('')}
          </div>
        </section>
      </main>
      <aside class="right-panel">
        <div class="right-book-card">
          <img src="${books[2].cover}" alt="${books[2].title}" />
          <div class="right-title">${books[2].title}</div>
          <div class="right-author">${books[2].author}</div>
          <div class="right-rating">${'★'.repeat(Math.round(books[2].rating))} <span>${books[2].rating}</span></div>
          <div class="right-stats">
            <span>${books[2].pages} Pages</span>
            <span>${books[2].ratings} Ratings</span>
            <span>${books[2].reviews} Reviews</span>
          </div>
          <div class="right-desc">${books[2].description}</div>
          <button class="read-now">Read Now</button>
        </div>
      </aside>
    </div>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700&display=swap');
      body, .dashboard-root { font-family: 'Urbanist', Arial, sans-serif; background: #f7f9fb; margin: 0; }
      .dashboard-root { display: flex; min-height: 100vh; }
      .sidebar { width: 90px; background: #fff; box-shadow: 2px 0 16px #0001; display: flex; flex-direction: column; align-items: center; padding: 24px 0; }
      .sidebar-logo img { width: 48px; margin-bottom: 32px; }
      .sidebar-nav { display: flex; flex-direction: column; gap: 18px; width: 100%; align-items: center; }
      .nav-item { display: flex; flex-direction: column; align-items: center; color: #7a7a7a; text-decoration: none; font-size: 1.1em; padding: 8px 0; border-radius: 12px; width: 100%; transition: background 0.2s, color 0.2s; cursor: pointer; }
      .nav-item.active, .nav-item:hover { background: #eaf7ef; color: #2d72d9; }
      .nav-item span { font-size: 1.5em; margin-bottom: 2px; }
      .main-content { flex: 1; padding: 36px 32px 32px 32px; }
      .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
      .search-bar { flex: 1; max-width: 420px; padding: 12px 18px; border-radius: 16px; border: none; background: #f1f3f6; font-size: 1.1em; margin-right: 24px; }
      .top-bar-right { display: flex; align-items: center; gap: 18px; }
      .notif-icon { font-size: 1.5em; color: #7a7a7a; cursor: pointer; }
      .user-info { display: flex; align-items: center; gap: 10px; }
      .user-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #eaf7ef; }
      .user-name { font-weight: 600; color: #222; }
      .recommended-section, .categories-section { margin-bottom: 32px; }
      .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
      .section-header h2 { font-size: 1.3em; font-weight: 700; margin: 0; }
      .see-all { color: #2d72d9; font-size: 1em; text-decoration: none; cursor: pointer; font-weight: 500; }
      .recommended-list, .category-list { display: flex; gap: 24px; overflow-x: auto; }
      .book-card { background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 18px 14px 14px 14px; display: flex; flex-direction: column; align-items: center; min-width: 140px; max-width: 140px; transition: box-shadow 0.2s; cursor: pointer; }
      .book-card img { width: 90px; height: 130px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }
      .book-title { font-weight: 600; font-size: 1em; color: #222; margin-bottom: 2px; text-align: center; }
      .book-author { color: #888; font-size: 0.98em; text-align: center; }
      .book-card.small { min-width: 110px; max-width: 110px; padding: 10px 6px 10px 6px; }
      .book-card.small img { width: 60px; height: 90px; }
      .category-chips { display: flex; gap: 12px; margin-bottom: 18px; }
      .chip { background: #f1f3f6; color: #2d72d9; border-radius: 16px; padding: 7px 18px; font-size: 1em; cursor: pointer; transition: background 0.2s, color 0.2s; }
      .chip.active, .chip:hover { background: #2d72d9; color: #fff; }
      .right-panel { width: 320px; background: #183153; color: #fff; border-radius: 0 24px 24px 0; padding: 36px 28px; display: flex; flex-direction: column; align-items: center; box-shadow: -2px 0 16px #0001; }
      .right-book-card { width: 100%; display: flex; flex-direction: column; align-items: center; }
      .right-book-card img { width: 120px; height: 170px; object-fit: cover; border-radius: 12px; margin-bottom: 18px; box-shadow: 0 2px 12px #0002; }
      .right-title { font-size: 1.2em; font-weight: 700; margin-bottom: 4px; text-align: center; }
      .right-author { color: #b3c0d1; font-size: 1em; margin-bottom: 8px; text-align: center; }
      .right-rating { color: #ffd600; font-size: 1.1em; margin-bottom: 10px; text-align: center; }
      .right-rating span { color: #fff; font-size: 1em; margin-left: 6px; }
      .right-stats { display: flex; gap: 16px; font-size: 0.98em; color: #b3c0d1; margin-bottom: 12px; justify-content: center; }
      .right-desc { color: #eaf7ef; font-size: 1em; margin-bottom: 18px; text-align: center; }
      .read-now { background: #3ecf8e; color: #fff; border: none; border-radius: 8px; padding: 12px 36px; font-size: 1.1em; font-family: inherit; cursor: pointer; font-weight: 600; transition: background 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px #3ecf8e22; }
      .read-now:hover, .read-now:focus { background: #2da06a; box-shadow: 0 4px 16px #3ecf8e33; }
      @media (max-width: 1200px) { .right-panel { display: none; } }
      @media (max-width: 900px) { .main-content { padding: 18px 4vw; } .sidebar { width: 60px; } .sidebar-logo img { width: 36px; } }
    </style>
  `;
}

// Call this after login success
// renderDashboard(); 