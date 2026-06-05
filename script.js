/*
  SPA logic for Tasty Bite website. This file manages routing, authentication,
  cart state, reviews, settings, and admin moderation. Comments are included
  for easier local readability and future extension.
*/

const state = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@tastybite.com',
      password: 'admin123',
      role: 'admin',
      orders: [],
      favorites: ['Breakfast'],
    },
    {
      id: 2,
      name: 'Sikander',
      email: 'user@tastybite.com',
      password: 'user123',
      role: 'customer',
      orders: [],
      favorites: ['Iced Latte'],
    },
  ],
  menuItems: [
    {
      id: 'breakfast',
      title: 'Breakfast',
      price: 220,
      description: 'Classic favorites and healthy morning picks to start the day right.',
    },
    {
      id: 'lunch',
      title: 'Lunch',
      price: 340,
      description: 'Hearty sandwiches, fresh salads, and tasty midday meals served with style.',
    },
    {
      id: 'beverages',
      title: 'Beverages',
      price: 180,
      description: 'Refreshing drinks, specialty coffees, and fresh juices to keep you energized.',
    },
    {
      id: 'snacks',
      title: 'Snacks',
      price: 260,
      description: 'Perfect bites to share or enjoy while relaxing with friends.',
    },
    {
      id: 'pastries',
      title: 'Pastries & Desserts',
      price: 240,
      description: 'Freshly baked treats and sweet delights made daily to satisfy every craving.',
    },
  ],
  reviews: [
    { id: 1, author: 'John Doe', text: 'Great coffee and friendly service!', approved: true },
    { id: 2, author: 'Jane Smith', text: 'Best breakfast place in town!', approved: true },
    { id: 3, author: 'Bob Johnson', text: 'Love their pastries!', approved: true },
    { id: 4, author: 'Alice Williams', text: 'Amazing atmosphere and delicious food.', approved: true },
    { id: 5, author: 'Charlie Brown', text: 'Highly recommend the lunch specials.', approved: true },
    { id: 6, author: 'Diana Miller', text: 'Perfect spot for a quick bite.', approved: true },
  ],
  homeSections: new Set(['home', 'menu', 'about', 'contact']),
  routeMap: {
    login: 'login-page',
    cart: 'cart-page',
    profile: 'profile-page',
    orders: 'history-page',
    history: 'history-page',
    rewards: 'rewards-page',
    reservations: 'reservations-page',
    settings: 'settings-page',
    faq: 'faq-page',
    support: 'support-page',
    'about-us': 'about-us-page',
    admin: 'admin-page',
    logout: 'logout-page',
  },
};

const elements = {
  pages: document.querySelectorAll('.page'),
  cartBadge: document.querySelector('.cart-badge'),
  addCartButtons: document.querySelectorAll('.add-to-cart-btn'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  reviewForm: document.getElementById('review-form'),
  reviewText: document.getElementById('review-text'),
  reviewsList: document.getElementById('reviews-list'),
  cartItems: document.getElementById('cart-items'),
  checkoutDetails: document.getElementById('checkout-details'),
  placeOrderBtn: document.getElementById('place-order-btn'),
  adminSections: document.getElementById('admin-sections'),
  adminUsersCount: document.getElementById('admin-users-count'),
  adminOrdersCount: document.getElementById('admin-orders-count'),
  adminReviewsCount: document.getElementById('admin-reviews-count'),
  themeToggle: document.getElementById('theme-toggle'),
  notificationsToggle: document.getElementById('notifications-toggle'),
  fontIncreaseBtn: document.getElementById('font-increase'),
  fontResetBtn: document.getElementById('font-reset'),
  backButtons: document.querySelectorAll('.back-btn'),
  menuToggle: document.querySelector('.menu-toggle'),
  dropdownContent: document.querySelector('.dropdown-content'),
};

function getLocalStorageObject(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function persistState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
  return getLocalStorageObject('tastyBite-user', null);
}

function setCurrentUser(user) {
  persistState('tastyBite-user', user);
}

function logoutUser() {
  localStorage.removeItem('tastyBite-user');
  showToast('Logged out successfully.');
}

function getCart() {
  return getLocalStorageObject('tastyBite-cart', []);
}

function setCart(cart) {
  persistState('tastyBite-cart', cart);
}

function updateCartBadge() {
  const cart = getCart();
  if (elements.cartBadge) {
    elements.cartBadge.textContent = cart.length;
  }
}

function showPage(pageId) {
  elements.pages.forEach((page) => {
    const active = page.id === pageId;
    page.classList.toggle('active', active);
    page.classList.toggle('hidden', !active);
  });
}

function showHomeSection(anchorId = 'home') {
  showPage('home-page');
  const target = document.getElementById(anchorId);
  if (target) {
    window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handleRoute() {
  const rawHash = window.location.hash.replace('#', '').toLowerCase();
  const hash = rawHash || 'home';

  if (state.homeSections.has(hash)) {
    showHomeSection(hash);
    return;
  }

  const pageId = state.routeMap[hash];
  if (!pageId) {
    showHomeSection();
    return;
  }

  if (hash === 'logout') {
    logoutUser();
    renderLogoutPage();
    showPage('logout-page');
    return;
  }

  if (hash === 'admin' && !isAdmin()) {
    showToast('Admin access requires signing in as admin.');
    window.location.hash = 'login';
    return;
  }

  showPage(pageId);

  if (hash === 'profile') renderProfilePage();
  if (hash === 'orders') renderHistoryPage();
  if (hash === 'rewards') renderRewardsPage();
  if (hash === 'reservations') renderReservationsPage();
  if (hash === 'settings') renderSettings();
  if (hash === 'admin') renderAdminPanel();
}

function isAuthenticated() {
  return Boolean(getCurrentUser());
}

function isAdmin() {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 320);
  }, 2200);
}

function findMenuItem(itemId) {
  return state.menuItems.find((item) => item.id === itemId);
}

function addToCart(itemId) {
  const item = findMenuItem(itemId);
  if (!item) {
    showToast('This item is unavailable.');
    return;
  }
  const cart = getCart();
  cart.push({ ...item, cartId: `${Date.now()}-${Math.random()}` });
  setCart(cart);
  updateCartBadge();
  showToast(`${item.title} added to cart.`);
}

function removeFromCart(cartId) {
  const cart = getCart().filter((entry) => entry.cartId !== cartId);
  setCart(cart);
  renderCart();
  updateCartBadge();
}

function renderCart() {
  const cart = getCart();
  if (!elements.cartItems || !elements.checkoutDetails) return;
  elements.cartItems.innerHTML = '';

  if (!cart.length) {
    elements.cartItems.innerHTML = '<p>Your basket is empty. Add items from the menu to continue.</p>';
    elements.checkoutDetails.innerHTML = '<div class="checkout-row"><span>Total</span><strong>₹0</strong></div>';
    return;
  }

  cart.forEach((item) => {
    const itemCard = document.createElement('div');
    itemCard.className = 'cart-item';
    itemCard.innerHTML = `
      <div>
        <h4>${item.title}</h4>
        <div class="cart-meta">
          <span>${item.description}</span>
          <span>Price: ₹${item.price}</span>
        </div>
      </div>
      <div class="cart-action">
        <button data-cart-id="${item.cartId}">Remove</button>
      </div>
    `;
    elements.cartItems.appendChild(itemCard);
  });

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  elements.checkoutDetails.innerHTML = `
    <div class="checkout-row"><span>Items</span><strong>${cart.length}</strong></div>
    <div class="checkout-row"><span>Estimated total</span><strong>₹${total}</strong></div>
  `;

  elements.cartItems.querySelectorAll('button[data-cart-id]').forEach((button) => {
    button.addEventListener('click', () => removeFromCart(button.dataset.cartId));
  });
}

function renderReviews() {
  if (!elements.reviewsList) return;
  elements.reviewsList.innerHTML = '';
  const approvedReviews = state.reviews.filter((review) => review.approved);

  approvedReviews.forEach((review) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <h3>${review.author}</h3>
      <p>${review.text}</p>
    `;
    elements.reviewsList.appendChild(card);
  });
}

function renderProfilePage() {
  const user = getCurrentUser();
  const profileContent = document.getElementById('profile-content');
  if (!profileContent) return;
  if (!user) {
    profileContent.innerHTML = '<p>Please sign in to view your profile and preferences.</p>';
    return;
  }

  profileContent.innerHTML = `
    <div class="profile-summary">
      <p>Welcome back, <strong>${user.name}</strong>!</p>
      <ul>
        <li>Email: ${user.email}</li>
        <li>Role: ${user.role}</li>
        <li>Completed orders: ${user.orders.length}</li>
        <li>Top favorites: ${user.favorites.join(', ')}</li>
      </ul>
    </div>
  `;
}

function renderHistoryPage() {
  const user = getCurrentUser();
  const historyContent = document.getElementById('history-content');
  if (!historyContent) return;
  if (!user) {
    historyContent.innerHTML = '<p>Please sign in to view your order history.</p>';
    return;
  }

  if (!user.orders.length) {
    historyContent.innerHTML = '<p>No orders yet. Place your first order from the menu page.</p>';
    return;
  }

  historyContent.innerHTML = `
    <div class="order-list">
      ${user.orders
        .map((order) => `
          <div class="admin-section">
            <h3>Order #${order.id}</h3>
            <p>${order.createdAt}</p>
            <p>${order.items.map((item) => item.title).join(', ')}</p>
            <p><strong>Total: ₹${order.total}</strong></p>
          </div>
        `)
        .join('')}
    </div>
  `;
}

function renderRewardsPage() {
  const user = getCurrentUser();
  const rewardsContent = document.getElementById('rewards-content');
  if (!rewardsContent) return;
  if (!user) {
    rewardsContent.innerHTML = '<p>Please sign in to access your reward balance.</p>';
    return;
  }

  const points = user.orders.length * 20 + 100;
  rewardsContent.innerHTML = `
    <div class="admin-section">
      <h3>Reward balance</h3>
      <p><strong>${points} points</strong></p>
      <p>Redeem points on your next order for discounts and free drinks.</p>
    </div>
  `;
}

function renderReservationsPage() {
  const reservationsContent = document.getElementById('reservations-content');
  if (!reservationsContent) return;
  reservationsContent.innerHTML = `
    <div class="admin-section">
      <h3>Reserve a table</h3>
      <p>Reservations are handled by phone. Call us at 7696267064 to book your preferred time slot.</p>
    </div>
  `;
}

function renderSettings() {
  const theme = localStorage.getItem('tastyBite-theme') || 'light';
  const notifications = getLocalStorageObject('tastyBite-notifications', true);
  document.body.classList.toggle('dark', theme === 'dark');
  if (elements.themeToggle) {
    elements.themeToggle.checked = theme === 'dark';
  }
  if (elements.notificationsToggle) {
    elements.notificationsToggle.checked = notifications;
  }
}

function renderAdminPanel() {
  if (!elements.adminSections || !elements.adminUsersCount || !elements.adminOrdersCount || !elements.adminReviewsCount) {
    return;
  }

  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    elements.adminSections.innerHTML = '<p>Admin access requires an administrator session.</p>';
    return;
  }

  elements.adminUsersCount.textContent = state.users.length;
  elements.adminOrdersCount.textContent = state.users.reduce((sum, entry) => sum + entry.orders.length, 0);
  elements.adminReviewsCount.textContent = state.reviews.length;

  const reviewModeration = state.reviews
    .map((review) => `
      <div class="admin-section">
        <h3>${review.author}</h3>
        <p>${review.text}</p>
        <div class="settings-row">
          <span>Status: ${review.approved ? 'Approved' : 'Pending'}</span>
          <button class="secondary-btn admin-action" data-action="toggle-review" data-id="${review.id}">
            ${review.approved ? 'Disable' : 'Approve'}
          </button>
          <button class="secondary-btn admin-action" data-action="delete-review" data-id="${review.id}">
            Delete
          </button>
        </div>
      </div>
    `)
    .join('');

  const userOrders = state.users
    .map((entry) => `
      <div class="admin-section">
        <h3>${entry.name}</h3>
        <p>${entry.orders.length} completed orders</p>
      </div>
    `)
    .join('');

  elements.adminSections.innerHTML = `
    <div class="admin-section">
      <h3>Moderate Reviews</h3>
      ${reviewModeration || '<p>No reviews available.</p>'}
    </div>
    <div class="admin-section">
      <h3>User activity</h3>
      ${userOrders}
    </div>
  `;

  elements.adminSections.querySelectorAll('.admin-action').forEach((button) => {
    button.addEventListener('click', () => {
      const reviewId = Number(button.dataset.id);
      const action = button.dataset.action;
      if (action === 'toggle-review') {
        state.reviews = state.reviews.map((review) =>
          review.id === reviewId ? { ...review, approved: !review.approved } : review,
        );
      }
      if (action === 'delete-review') {
        state.reviews = state.reviews.filter((review) => review.id !== reviewId);
      }
      renderAdminPanel();
      renderReviews();
      showToast('Admin changes saved.');
    });
  });
}

function renderLogoutPage() {
  const logoutPage = document.getElementById('logout-page');
  if (!logoutPage) return;
  const main = logoutPage.querySelector('main');
  if (!main) return;
  main.innerHTML = '<p>You are now logged out. Browse the home screen and sign in again to continue.</p>';
}

function applySavedTheme() {
  const theme = localStorage.getItem('tastyBite-theme') || 'light';
  document.body.classList.toggle('dark', theme === 'dark');
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('tastyBite-theme', isDark ? 'dark' : 'light');
  showToast(`Switched to ${isDark ? 'dark' : 'light'} mode.`);
}

function adjustFontSize(increase = true) {
  const currentSize = Number(getComputedStyle(document.documentElement).fontSize.replace('px', '')) || 16;
  const nextSize = increase ? Math.min(currentSize + 1.5, 20) : 16;
  document.documentElement.style.fontSize = `${nextSize}px`;
  showToast(increase ? 'Font increased.' : 'Font size reset.');
}

function handleLoginSubmit(event) {
  event.preventDefault();
  if (!elements.loginEmail || !elements.loginPassword) return;

  const email = elements.loginEmail.value.trim().toLowerCase();
  const password = elements.loginPassword.value.trim();
  const user = state.users.find((entry) => entry.email.toLowerCase() === email && entry.password === password);

  if (!user) {
    showToast('Invalid email or password.');
    return;
  }

  setCurrentUser(user);
  showToast(`Welcome back, ${user.name}!`);
  renderProfilePage();
  if (user.role === 'admin') renderAdminPanel();
  window.location.hash = 'profile';
}

function handleReviewSubmit(event) {
  event.preventDefault();
  if (!elements.reviewText) return;

  if (!isAuthenticated()) {
    showToast('Please login to leave a review.');
    window.location.hash = 'login';
    return;
  }

  const reviewText = elements.reviewText.value.trim();
  if (!reviewText) {
    showToast('Review text cannot be empty.');
    return;
  }

  const user = getCurrentUser();
  state.reviews.unshift({
    id: Date.now(),
    author: user.name,
    text: reviewText,
    approved: true,
  });
  elements.reviewText.value = '';
  renderReviews();
  showToast('Review submitted successfully.');
}

function handlePlaceOrder() {
  if (!isAuthenticated()) {
    showToast('Please login to place an order.');
    window.location.hash = 'login';
    return;
  }

  const cart = getCart();
  if (!cart.length) {
    showToast('Your cart is empty. Add items before checkout.');
    return;
  }

  const user = getCurrentUser();
  const order = {
    id: Date.now(),
    createdAt: new Date().toLocaleString(),
    items: cart.map((item) => ({ title: item.title, price: item.price })),
    total: cart.reduce((sum, item) => sum + item.price, 0),
  };

  user.orders.push(order);
  setCurrentUser(user);
  state.users = state.users.map((entry) => (entry.id === user.id ? user : entry));
  setCart([]);
  updateCartBadge();
  renderCart();
  showToast('Order placed successfully. Thank you!');
}

function initializeEvents() {
  elements.addCartButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.menu-card');
      const itemId = card?.dataset.menuId;
      if (itemId) addToCart(itemId);
    });
  });

  elements.orderBtn?.addEventListener('click', () => {
    window.location.hash = 'cart';
  });

  elements.loginForm?.addEventListener('submit', handleLoginSubmit);
  elements.reviewForm?.addEventListener('submit', handleReviewSubmit);
  elements.placeOrderBtn?.addEventListener('click', handlePlaceOrder);

  elements.backButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.location.hash = 'home';
    });
  });

  elements.menuToggle?.addEventListener('click', (event) => {
    event.preventDefault();
    elements.dropdownContent.classList.toggle('open');
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.menu-dropdown')) {
      elements.dropdownContent?.classList.remove('open');
    }
  });

  elements.themeToggle?.addEventListener('click', toggleTheme);
  elements.notificationsToggle?.addEventListener('change', () => {
    persistState('tastyBite-notifications', elements.notificationsToggle.checked);
    showToast(elements.notificationsToggle.checked ? 'Notifications enabled.' : 'Notifications disabled.');
  });
  elements.fontIncreaseBtn?.addEventListener('click', () => adjustFontSize(true));
  elements.fontResetBtn?.addEventListener('click', () => adjustFontSize(false));
}

function init() {
  applySavedTheme();
  initializeEvents();
  updateCartBadge();
  renderReviews();
  renderProfilePage();
  renderCart();
  renderAdminPanel();
  if (window.location.hash) {
    handleRoute();
  } else {
    showHomeSection('home');
  }
  window.addEventListener('hashchange', handleRoute);
}

init();
