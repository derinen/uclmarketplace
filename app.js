function requireElement(selector, elementType) {
  const element = document.querySelector(selector);
  if (!(element instanceof elementType)) {
    throw new Error(`Required page element is missing: ${selector}`);
  }
  return element;
}

function requireCardElement(card, selector) {
  const element = card.querySelector(selector);
  if (!element) {
    throw new Error(`Required listing element is missing: ${selector}`);
  }
  return element;
}

const cards = Array.from(document.querySelectorAll('.listing-card')).map((card) => {
  const title = requireCardElement(card, 'h3').textContent.trim();
  const description = requireCardElement(card, '.listing-description').textContent.trim();
  const category = requireCardElement(card, '.listing-category').textContent.trim();
  const price = requireCardElement(card, '.listing-meta strong').textContent.trim();
  const pickup = requireCardElement(card, '.listing-meta span').textContent.trim();
  const image = requireCardElement(card, '.listing-photo');
  const categoryId = card.dataset.category;
  if (!categoryId) {
    throw new Error(`Listing category is missing for ${title}`);
  }

  return {
    card,
    title,
    description,
    category,
    categoryId,
    price,
    pickup,
    imageSrc: image.getAttribute('src'),
    imageAlt: image.getAttribute('alt') ?? title,
    anonymous: card.dataset.anonymous === 'true',
    searchText: `${title} ${description} ${category} ${pickup}`.toLocaleLowerCase()
  };
});

const searchInput = requireElement('#search', HTMLInputElement);
const categorySelect = requireElement('#category', HTMLSelectElement);
const anonymousFilter = requireElement('#anonymous', HTMLInputElement);
const listingStatus = requireElement('#status', HTMLElement);
const listingDialog = requireElement('#panel', HTMLDialogElement);
const listingDialogTitle = requireElement('#dialog-title', HTMLHeadingElement);
const listingDialogBody = requireElement('#body', HTMLElement);
const listingDialogClose = requireElement('#close', HTMLButtonElement);
const accountButton = requireElement('#account', HTMLButtonElement);
const authDialog = requireElement('#auth-panel', HTMLDialogElement);
const authDialogClose = requireElement('#auth-close', HTMLButtonElement);
const authTitle = requireElement('#auth-title', HTMLHeadingElement);
const authForm = requireElement('#auth-form', HTMLFormElement);
const emailInput = requireElement('#ucl-email', HTMLInputElement);
const authSubmit = requireElement('#auth-submit', HTMLButtonElement);
const authStatus = requireElement('#auth-status', HTMLElement);
const requestForm = requireElement('#request-form', HTMLFormElement);
const requestTitle = requireElement('#request-title', HTMLInputElement);
const requestCategory = requireElement('#request-category', HTMLSelectElement);
const requestDetails = requireElement('#request-details', HTMLTextAreaElement);
const requestBudget = requireElement('#request-budget', HTMLInputElement);
const requestCards = requireElement('#request-cards', HTMLElement);
const requestStatus = requireElement('#request-status', HTMLElement);
const requestSubmit = requireElement('#request-form button[type="submit"]', HTMLButtonElement);
const notificationForm = requireElement('#notification-form', HTMLFormElement);
const notificationEmail = requireElement('#notification-email', HTMLInputElement);
const notificationStatus = requireElement('#notification-status', HTMLElement);

const requestStorageKey = 'ucl-marketplace-requests';
const requestCategories = new Map([
  ['', 'Any category'],
  ['architecture', 'Architecture materials'],
  ['free', 'Free stuff'],
  ['kitchen', 'Kitchen appliances'],
  ['clothes', 'Clothes'],
  ['furniture', 'Furniture'],
  ['electronics', 'Electronics'],
  ['books', 'Books & textbooks']
]);

let requests = [];
let requestStorageAvailable = true;

function isValidRequest(request) {
  return request
    && typeof request.title === 'string'
    && typeof request.details === 'string'
    && typeof request.category === 'string'
    && requestCategories.has(request.category)
    && (request.budget === null || (typeof request.budget === 'number' && Number.isFinite(request.budget) && request.budget >= 0));
}

function loadRequests() {
  let savedRequests;
  try {
    const saved = localStorage.getItem(requestStorageKey);
    savedRequests = saved === null ? [] : JSON.parse(saved);
  } catch {
    requestStorageAvailable = false;
    requestStatus.textContent = 'Saved requests could not be loaded. Browser storage may be unavailable or corrupted.';
    requestSubmit.disabled = true;
    return;
  }

  if (!Array.isArray(savedRequests) || !savedRequests.every(isValidRequest)) {
    requestStorageAvailable = false;
    requestStatus.textContent = 'Saved requests could not be loaded because the stored data is invalid.';
    requestSubmit.disabled = true;
    return;
  }

  requests = savedRequests;
}

function renderRequests() {
  if (requests.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-requests';
    emptyMessage.textContent = 'No requests yet. You could be the first!';
    requestCards.replaceChildren(emptyMessage);
    return;
  }

  const cardsToRender = requests.map((request) => {
    const card = document.createElement('article');
    card.className = 'request-card';

    const category = document.createElement('p');
    category.className = 'listing-category';
    category.textContent = requestCategories.get(request.category);

    const title = document.createElement('h4');
    title.textContent = request.title;

    const details = document.createElement('p');
    details.textContent = request.details;

    const budget = document.createElement('p');
    budget.className = 'request-budget';
    budget.textContent = request.budget === null
      ? 'No budget listed'
      : `Budget up to £${request.budget.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

    card.append(category, title, details, budget);
    return card;
  });
  requestCards.replaceChildren(...cardsToRender);
}

loadRequests();
renderRequests();

requestForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!requestStorageAvailable) return;

  const title = requestTitle.value.trim();
  const details = requestDetails.value.trim();
  requestTitle.setCustomValidity(title ? '' : 'Enter what you are looking for.');
  requestDetails.setCustomValidity(details ? '' : 'Add a few details about your request.');
  if (!requestForm.reportValidity()) return;

  const request = {
    title,
    category: requestCategory.value,
    details,
    budget: requestBudget.value === '' ? null : Number(requestBudget.value)
  };
  if (!isValidRequest(request)) {
    requestStatus.textContent = 'Check the request details and budget, then try again.';
    return;
  }

  const updatedRequests = [request, ...requests];
  try {
    localStorage.setItem(requestStorageKey, JSON.stringify(updatedRequests));
  } catch {
    requestStatus.textContent = 'This request could not be saved in browser storage. Your request has not been posted.';
    return;
  }

  requests = updatedRequests;
  renderRequests();
  requestForm.reset();
  requestStatus.textContent = 'Your request was added in this browser.';
});

notificationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!notificationForm.reportValidity()) return;

  notificationStatus.textContent = 'Notifications are not active yet. Your email was not sent or stored; follow @uclmarketplace on Instagram for updates.';
  notificationForm.reset();
});

function filterListings() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const selectedCategory = categorySelect.value;
  const anonymousOnly = anonymousFilter.checked;
  let visibleCount = 0;

  for (const listing of cards) {
    const matches = listing.searchText.includes(query)
      && (!selectedCategory || listing.categoryId === selectedCategory)
      && (!anonymousOnly || listing.anonymous);
    listing.card.hidden = !matches;
    if (matches) visibleCount += 1;
  }

  listingStatus.textContent = visibleCount === cards.length
    ? ''
    : `${visibleCount} listing${visibleCount === 1 ? '' : 's'} match your filters.`;
}

searchInput.addEventListener('input', filterListings);
categorySelect.addEventListener('change', filterListings);
anonymousFilter.addEventListener('change', filterListings);

for (const link of document.querySelectorAll('[data-listing-link]')) {
  link.addEventListener('click', (event) => {
    const listing = cards.find((item) => item.card.id === link.hash.slice(1));
    if (!listing) {
      throw new Error(`Listing not found for link: ${link.getAttribute('href')}`);
    }

    event.preventDefault();
    listingDialogTitle.textContent = listing.title;

    const summary = document.createElement('p');
    summary.className = 'listing-detail-meta';
    summary.textContent = `${listing.category} · ${listing.price}`;
    const image = document.createElement('img');
    image.className = 'listing-detail-photo';
    image.src = listing.imageSrc;
    image.alt = listing.imageAlt;
    const description = document.createElement('p');
    description.textContent = listing.description;
    const pickup = document.createElement('p');
    pickup.textContent = `Pickup: ${listing.pickup}`;
    const note = document.createElement('p');
    note.className = 'auth-note';
    note.textContent = 'Example listing only. Contact details and offers are not available in this demo.';

    listingDialogBody.replaceChildren(summary, image, description, pickup, note);
    listingDialog.showModal();
  });
}

listingDialogClose.addEventListener('click', () => listingDialog.close());

accountButton.addEventListener('click', () => {
  authDialog.showModal();
  emailInput.focus();
});
authDialogClose.addEventListener('click', () => authDialog.close());

let authMode = 'signin';
for (const modeButton of document.querySelectorAll('[data-auth-mode]')) {
  modeButton.addEventListener('click', () => {
    authMode = modeButton.dataset.authMode;
    const isSignIn = authMode === 'signin';
    authTitle.textContent = isSignIn ? 'Sign in to UCL Marketplace' : 'Create a UCL Marketplace account';
    authSubmit.textContent = isSignIn ? 'Continue to sign in' : 'Create demo account';
    authStatus.textContent = '';

    for (const button of document.querySelectorAll('[data-auth-mode]')) {
      const selected = button === modeButton;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  });
}

emailInput.addEventListener('input', () => {
  emailInput.setCustomValidity('');
  authStatus.textContent = '';
});

authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  emailInput.setCustomValidity('');

  const email = emailInput.value.trim();
  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }
  if (!/^[^\s@]+@ucl\.ac\.uk$/i.test(email)) {
    emailInput.setCustomValidity('Use a UCL email address ending exactly in @ucl.ac.uk.');
    emailInput.reportValidity();
    return;
  }

  authStatus.textContent = authMode === 'signin'
    ? 'This demo cannot sign you in. No email was sent or stored.'
    : 'This demo cannot create accounts. No email was sent or stored.';
});

filterListings();
