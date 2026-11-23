const BASE_URL = 'https://books-backend-v2.b.goit.study/books';

const ALL_CATEGORIES = 'All categories';
const DESKTOP_QUERY = '(min-width: 1440px)';
const INITIAL_DESKTOP = 24;
const INITIAL_MOBILE = 10;
const LOAD_STEP = 4;

const refs = {
  filterWrap: document.querySelector('[data-books-filter-wrap]'),
  toggle: document.querySelector('[data-books-toggle]'),
  toggleLabel: document.querySelector('[data-books-toggle-label]'),
  filter: document.querySelector('[data-books-filter]'),
  list: document.querySelector('[data-books-list]'),
  more: document.querySelector('[data-books-more]'),
  shown: document.querySelector('[data-books-shown]'),
  total: document.querySelector('[data-books-total]'),
};

const state = {
  category: ALL_CATEGORIES,
  books: [],
  visible: 0,
  requestId: 0,
};

/* ---------- API ---------- */

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function getCategories() {
  const data = await fetchJson(`${BASE_URL}/category-list`);
  return data.map(item => (typeof item === 'string' ? item : item.list_name));
}

async function getAllBooks() {
  // top-books повертає масив груп: [{ list_name, books: [...] }]
  const data = await fetchJson(`${BASE_URL}/top-books`);
  const books = data.flatMap(group => group.books ?? []);
  return uniqueById(books);
}

async function getBooksByCategory(category) {
  return fetchJson(
    `${BASE_URL}/category?category=${encodeURIComponent(category)}`
  );
}

function uniqueById(books) {
  const seen = new Set();
  return books.filter(book => {
    if (seen.has(book._id)) return false;
    seen.add(book._id);
    return true;
  });
}

/* ---------- Helpers ---------- */

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatPrice(price) {
  const number = Number(price);
  if (!Number.isFinite(number)) return '';
  // у макеті ціна без копійок: "$15"
  return Number.isInteger(number) ? `$${number}` : `$${number.toFixed(2)}`;
}

function getInitialCount() {
  return window.matchMedia(DESKTOP_QUERY).matches
    ? INITIAL_DESKTOP
    : INITIAL_MOBILE;
}

/* ---------- Markup ---------- */

function createFilterMarkup(categories) {
  return [ALL_CATEGORIES, ...categories]
    .map(
      name => `
        <li class="books-filter-item">
          <button
            type="button"
            class="books-filter-btn"
            data-category="${escapeHtml(name)}"
            aria-pressed="${name === state.category}"
          >${escapeHtml(name)}</button>
        </li>`
    )
    .join('');
}

function createBookMarkup(book) {
  const { _id, title, author, price, book_image } = book;

  return `
    <li class="book-card">
      <img
        class="book-card-img"
        src="${escapeHtml(book_image)}"
        alt="${escapeHtml(title)} book cover"
        width="227"
        height="323"
        loading="lazy"
      />
      <div class="book-card-info">
        <div class="book-card-text">
          <h4 class="book-card-title">${escapeHtml(title)}</h4>
          <p class="book-card-author">${escapeHtml(author)}</p>
        </div>
        <p class="book-card-price">${formatPrice(price)}</p>
      </div>
      <button
        type="button"
        class="book-card-btn"
        data-book-id="${escapeHtml(_id)}"
      >Learn More</button>
    </li>`;
}

/* ---------- Render ---------- */

function updateCounter() {
  refs.shown.textContent = state.visible;
  refs.total.textContent = state.books.length;
  refs.more.hidden = state.visible >= state.books.length;
}

function renderInitial() {
  state.visible = Math.min(getInitialCount(), state.books.length);
  const markup = state.books
    .slice(0, state.visible)
    .map(createBookMarkup)
    .join('');
  refs.list.innerHTML = markup;
  updateCounter();
}

function renderMore() {
  const next = Math.min(state.visible + LOAD_STEP, state.books.length);
  const markup = state.books
    .slice(state.visible, next)
    .map(createBookMarkup)
    .join('');
  refs.list.insertAdjacentHTML('beforeend', markup);
  state.visible = next;
  updateCounter();
}

function showMessage(text) {
  refs.list.innerHTML = `<li class="books-message">${escapeHtml(text)}</li>`;
  state.books = [];
  state.visible = 0;
  updateCounter();
}

function setLoading(isLoading) {
  refs.list.setAttribute('aria-busy', String(isLoading));
  refs.list.classList.toggle('is-loading', isLoading);
}

function setFilterOpen(isOpen) {
  refs.filterWrap.classList.toggle('is-open', isOpen);
  refs.toggle.setAttribute('aria-expanded', String(isOpen));
}

function setActiveCategory(category) {
  state.category = category;
  refs.toggleLabel.textContent =
    category === ALL_CATEGORIES ? 'Categories' : category;
  refs.filter.querySelectorAll('.books-filter-btn').forEach(btn => {
    btn.setAttribute(
      'aria-pressed',
      String(btn.dataset.category === category)
    );
  });
}

/* ---------- Loading books ---------- */

async function loadBooks(category) {
  const requestId = ++state.requestId;
  setLoading(true);

  try {
    const books =
      category === ALL_CATEGORIES
        ? await getAllBooks()
        : await getBooksByCategory(category);

    // відповідь застаріла, якщо користувач вже обрав іншу категорію
    if (requestId !== state.requestId) return;

    state.books = books;
    if (books.length === 0) {
      showMessage('No books found in this category.');
    } else {
      renderInitial();
    }
  } catch (error) {
    if (requestId !== state.requestId) return;
    console.error(error);
    showMessage('Something went wrong. Please try again later.');
  } finally {
    if (requestId === state.requestId) setLoading(false);
  }
}

/* ---------- Events ---------- */

refs.filter.addEventListener('click', event => {
  const btn = event.target.closest('.books-filter-btn');
  if (!btn) return;

  setFilterOpen(false);
  if (btn.dataset.category === state.category) return;

  setActiveCategory(btn.dataset.category);
  loadBooks(state.category);
});

// Випадайка на mobile і tablet (на десктопі кнопка прихована CSS)
refs.toggle.addEventListener('click', () => {
  setFilterOpen(refs.toggle.getAttribute('aria-expanded') !== 'true');
});

document.addEventListener('click', event => {
  if (!refs.filterWrap.contains(event.target)) setFilterOpen(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setFilterOpen(false);
});

refs.more.addEventListener('click', renderMore);

refs.list.addEventListener('click', event => {
  const btn = event.target.closest('[data-book-id]');
  if (!btn) return;

  // Модальне вікно книги слухає цю подію і саме підвантажує дані за id
  document.dispatchEvent(
    new CustomEvent('book:open', { detail: { id: btn.dataset.bookId } })
  );
});

/* ---------- Init ---------- */

async function init() {
  try {
    const categories = await getCategories();
    refs.filter.innerHTML = createFilterMarkup(categories);
  } catch (error) {
    console.error(error);
    refs.filter.innerHTML = createFilterMarkup([]);
  }
  loadBooks(ALL_CATEGORIES);
}

init();
