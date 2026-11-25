import Accordion from 'accordion-js';

const API_BASE = 'https://books-backend-v2.b.goit.study';

const DEFAULT_DETAILS_TEXT =
  'I Will Find You is a gripping thriller by the master of suspense, Harlan Coben. The story follows David Burroughs, a former prisoner wrongfully convicted of murdering his own son. When he discovers a clue suggesting his son might still be alive, David escapes from prison to uncover the truth. Fast-paced, emotional, and full of unexpected twists — this novel will keep you hooked until the very last page.';

const DEFAULT_SHIPPING_TEXT =
  'We ship across the United States within 2–5 business days. All orders are processed through USPS or a reliable courier service. Enjoy free standard shipping on orders over $50.';

const DEFAULT_RETURNS_TEXT =
  'You can return an item within 14 days of receiving your order, provided it hasn’t been used and is in its original condition. To start a return, please contact our support team — we’ll guide you through the process quickly and hassle-free.';

function formatBookPrice(price) {
  const number = Number(price);
  if (!Number.isFinite(number)) return '$15';
  return Number.isInteger(number) ? `$${number}` : `$${number.toFixed(2)}`;
}

export function initModals() {
  const bookModal = document.querySelector('[data-book-modal]');
  const contactModal = document.querySelector('[data-contact-modal]');

  if (!bookModal || !contactModal) return;

  let activeModal = null;
  let bookAccordion = null;

  const accordionEl = bookModal.querySelector('[data-book-accordion]');
  if (accordionEl) {
    bookAccordion = new Accordion(accordionEl, {
      duration: 250,
      showMultiple: false,
    });
  }

  function syncBodyScroll() {
    const hasOpenModal =
      !bookModal.classList.contains('is-hidden') ||
      !contactModal.classList.contains('is-hidden');
    document.body.classList.toggle('modal-open', hasOpenModal);
  }

  function openModal(modal) {
    activeModal = modal;
    modal.classList.remove('is-hidden');
    modal.setAttribute('aria-hidden', 'false');
    syncBodyScroll();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('is-hidden');
    modal.setAttribute('aria-hidden', 'true');

    if (modal === bookModal && bookAccordion) {
      bookAccordion.closeAll();
    }

    if (activeModal === modal) activeModal = null;
    syncBodyScroll();
  }

  [bookModal, contactModal].forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('[data-modal-close]')) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeModal) {
      closeModal(activeModal);
    }
  });

  // ==================== BOOK MODAL ====================
  const coverEl = bookModal.querySelector('[data-book-cover]');
  const titleEl = bookModal.querySelector('[data-book-title]');
  const authorEl = bookModal.querySelector('[data-book-author]');
  const priceEl = bookModal.querySelector('[data-book-price]');
  const detailsEl = bookModal.querySelector('[data-book-details]');
  const shippingEl = bookModal.querySelector('[data-book-shipping]');
  const returnsEl = bookModal.querySelector('[data-book-returns]');

  const bookForm = bookModal.querySelector('[data-book-form]');
  const qtyInput = bookModal.querySelector('[data-qty-input]');
  const decBtn = bookModal.querySelector('[data-qty-decrement]');
  const incBtn = bookModal.querySelector('[data-qty-increment]');
  const addToCartBtn = bookModal.querySelector('[data-add-to-cart]');
  const feedbackEl = bookModal.querySelector('[data-book-feedback]');

  let currentBookId = null;
  let requestCounter = 0;
  let isFetchingBook = false;

  function setBookLoading(isLoading) {
    bookModal.classList.toggle('is-loading', isLoading);
    if (feedbackEl) {
      feedbackEl.textContent = isLoading ? 'Завантаження...' : '';
    }
  }

  function getQuantity() {
    const parsed = parseInt(qtyInput.value, 10);
    const safeQty = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
    qtyInput.value = String(safeQty);
    return safeQty;
  }

  decBtn?.addEventListener('click', () => {
    qtyInput.value = String(Math.max(1, getQuantity() - 1));
  });

  incBtn?.addEventListener('click', () => {
    qtyInput.value = String(getQuantity() + 1);
  });

  qtyInput?.addEventListener('change', getQuantity);

  addToCartBtn?.addEventListener('click', () => {
    const qty = getQuantity();
    console.log('Selected books quantity:', qty, { bookId: currentBookId });
    if (feedbackEl) {
      feedbackEl.textContent = `Обрано книг для додавання в кошик: ${qty}`;
    }
  });

  bookForm?.addEventListener('submit', e => {
    e.preventDefault();
    getQuantity();
    if (feedbackEl) {
      feedbackEl.textContent = 'Дякуємо за покупку';
    }
  });

  async function openBookModal(bookId) {
    if (!bookId) return;

    if (isFetchingBook && currentBookId === bookId) return;

    const currentRequestId = ++requestCounter;
    isFetchingBook = true;
    currentBookId = bookId;

    qtyInput.value = '1';
    if (bookAccordion) {
      bookAccordion.closeAll();
    }

    if (detailsEl) detailsEl.textContent = DEFAULT_DETAILS_TEXT;
    if (shippingEl) shippingEl.textContent = DEFAULT_SHIPPING_TEXT;
    if (returnsEl) returnsEl.textContent = DEFAULT_RETURNS_TEXT;

    openModal(bookModal);
    setBookLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/books/${encodeURIComponent(bookId)}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const book = await response.json();

      if (currentRequestId !== requestCounter) return;

      const title = book.title || book.name || 'I will find you';
      const author = book.author || 'Harlan Coben';
      const imageSrc =
        book.book_image || book.image || 'https://placehold.co/309x467';

      if (coverEl) {
        coverEl.src = imageSrc;
        coverEl.alt = `${title} book cover`;
      }
      if (titleEl) titleEl.textContent = title;
      if (authorEl) authorEl.textContent = author;
      if (priceEl) priceEl.textContent = formatBookPrice(book.price);

      if (detailsEl) {
        detailsEl.textContent = book.description || DEFAULT_DETAILS_TEXT;
      }
      if (shippingEl) {
        shippingEl.textContent = book.shipping || DEFAULT_SHIPPING_TEXT;
      }
      if (returnsEl) {
        returnsEl.textContent = book.returns || DEFAULT_RETURNS_TEXT;
      }
    } catch (error) {
      if (currentRequestId !== requestCounter) return;
      console.error('Book fetch error:', error);
      if (feedbackEl) {
        feedbackEl.textContent = 'Не вдалося завантажити дані про книгу.';
      }
    } finally {
      if (currentRequestId === requestCounter) {
        isFetchingBook = false;
        bookModal.classList.remove('is-loading');
        if (feedbackEl && feedbackEl.textContent === 'Завантаження...') {
          feedbackEl.textContent = '';
        }
      }
    }
  }

  document.addEventListener('book:open', e => {
    const bookId = e.detail?.id;
    if (bookId) openBookModal(bookId);
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-book-id], [data-id], [data-_id]');
    if (!btn) return;

    const bookId =
      btn.dataset.bookId ||
      btn.dataset.id ||
      btn.dataset._id ||
      btn.closest('[data-book-id], [data-id], [data-_id]')?.dataset?.bookId;

    if (bookId) {
      openBookModal(bookId);
    }
  });

  // ==================== CONTACT MODAL ====================
  const eventNameEl = contactModal.querySelector('[data-event-name]');
  const contactForm = contactModal.querySelector('[data-contact-form]');
  const nameInput = contactModal.querySelector('#contact-name');
  const emailInput = contactModal.querySelector('#contact-email');
  const statusEl = contactModal.querySelector('[data-contact-status]');

  function setFieldError(fieldName, inputEl, message) {
    const errEl = contactModal.querySelector(`[data-error-for="${fieldName}"]`);
    if (errEl) errEl.textContent = message;
    if (inputEl) inputEl.classList.toggle('is-invalid', Boolean(message));
  }

  function openContactModal(eventTitle) {
    if (eventNameEl && eventTitle) {
      eventNameEl.textContent = eventTitle;
    }
    setFieldError('name', nameInput, '');
    setFieldError('email', emailInput, '');
    if (statusEl) statusEl.textContent = '';
    openModal(contactModal);
  }

  document.addEventListener('click', e => {
    const trigger = e.target.closest('.events-button, [data-open-contact]');
    if (!trigger) return;

    const eventCard = trigger.closest('li, article, .event-card, .events-item');
    const eventTitle =
      trigger.dataset.openContact ||
      trigger.dataset.eventTitle ||
      eventCard
        ?.querySelector('h2, h3, h4, [data-event-title]')
        ?.textContent?.trim() ||
      '';

    openContactModal(eventTitle);
  });

  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    setFieldError('name', nameInput, '');
    setFieldError('email', emailInput, '');
    if (statusEl) statusEl.textContent = '';

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;

    if (!nameVal) {
      setFieldError('name', nameInput, 'Name is required.');
      isValid = false;
    }

    if (!emailVal || !emailRegex.test(emailVal)) {
      setFieldError('email', emailInput, 'Please enter a valid email.');
      isValid = false;
    }

    if (!isValid) return;

    if (statusEl) {
      statusEl.textContent = 'You have successfully registered!';
    }
    contactForm.reset();
  });
}