document.addEventListener('DOMContentLoaded', function() {
    protectRoutes();
    initializeNavbar();
    initializeThemeToggle();

    if (typeof updateCartCounter === 'function') {
        updateCartCounter();
    }

    const currentPage = getCurrentPageName();
    if (currentPage === 'index.html') {
        loadFeaturedProducts();
    }

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
});

function getCurrentPageName() {
    const raw = window.location.pathname.split('/').pop() || '';
    return raw === '' ? 'index.html' : raw;
}

function protectRoutes() {
    const protectedPages = new Set([
        'profile.html',
        'orders.html',
        'settings.html',
        'wishlist.html',
        'cart.html',
        'checkout.html'
    ]);

    const currentPage = getCurrentPageName();
    if (!protectedPages.has(currentPage)) return;

    if (typeof isUserLoggedIn !== 'function' || isUserLoggedIn()) return;

    const messages = {
        profile: 'Please login to view your profile',
        orders: 'Please login to view your orders',
        settings: 'Please login to access settings',
        wishlist: 'Please login to view wishlist',
        cart: 'Please login to view your cart',
        checkout: 'Please login to checkout'
    };

    const key = currentPage.replace('.html', '');
    const message = messages[key] || 'Please login to continue';

    if (typeof redirectToLogin === 'function') {
        redirectToLogin(message);
        return;
    }

    window.location.href = isInPagesDir() ? 'login.html' : 'pages/login.html';
}

function initializeNavbar() {
    const isLoggedIn = typeof isUserLoggedIn === 'function' && isUserLoggedIn();
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');

    if (isLoggedIn) {
        const user = getCurrentUser();
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        if (userName && user?.name) userName.textContent = user.name.split(' ')[0];
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }

    updateActiveNavLink();
}

function updateActiveNavLink() {
    const currentPage = getCurrentPageName();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');

        const href = link.getAttribute('href') || '';
        const hrefPage = href.split('/').pop().split('?')[0].split('#')[0];

        if (hrefPage === currentPage || (currentPage === 'index.html' && hrefPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');

    if (typeof initializeTheme === 'function') {
        initializeTheme();
    }

    updateThemeToggleIcon();

    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        const currentPreference = typeof getThemePreference === 'function'
            ? getThemePreference()
            : (localStorage.getItem('happyGroceries_theme') || 'light');

        const currentEffective = typeof getEffectiveTheme === 'function'
            ? getEffectiveTheme(currentPreference)
            : currentPreference;

        const nextPreference = currentEffective === 'dark' ? 'light' : 'dark';

        if (typeof applyTheme === 'function') {
            applyTheme(nextPreference);
        } else {
            document.documentElement.setAttribute('data-theme', nextPreference);
            localStorage.setItem('happyGroceries_theme', nextPreference);
        }

        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (user) {
            updateUserProfile(
                user.id,
                { preferences: { ...user.preferences, theme: nextPreference } },
                { showToast: false }
            );
        }

        updateThemeToggleIcon();
    });
}

function updateThemeToggleIcon() {
    const themeIcon = document.querySelector('#themeToggle .theme-icon');
    if (!themeIcon) return;

    const preference = typeof getThemePreference === 'function'
        ? getThemePreference()
        : (localStorage.getItem('happyGroceries_theme') || 'light');

    const effective = typeof getEffectiveTheme === 'function'
        ? getEffectiveTheme(preference)
        : preference;

    themeIcon.textContent = effective === 'dark' ? '☀️' : '🌙';
}

function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    const featuredProducts = getAllProducts().slice(0, 8);
    container.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');

    attachProductCardListeners();
}

function createProductCard(product) {
    const isWishlisted = isInWishlist(product.id);
    const heartIcon = isWishlisted ? '💖' : '🤍';

    return `
        <div class="product-card" data-product-id="${product.id}">
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-product-id="${product.id}">
                ${heartIcon}
            </button>
            <div class="product-image">${product.emoji}</div>
            <h3 class="product-name">${product.name}</h3>
            <span class="product-category">${product.category}</span>
            <div class="product-rating">${renderStars(product.rating)} (${product.rating})</div>
            <p class="product-price">₹${product.price}</p>
            <div class="product-actions">
                <div class="quantity-controls">
                    <button class="qty-btn qty-decrease" data-product-id="${product.id}">−</button>
                    <input type="number" class="qty-input" value="1" min="1" max="99" data-product-id="${product.id}">
                    <button class="qty-btn qty-increase" data-product-id="${product.id}">+</button>
                </div>
                <button class="btn-add-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `;
}

function attachProductCardListeners() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    document.querySelectorAll('.qty-decrease').forEach(btn => {
        btn.addEventListener('click', handleQuantityDecrease);
    });

    document.querySelectorAll('.qty-increase').forEach(btn => {
        btn.addEventListener('click', handleQuantityIncrease);
    });

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', handleWishlistToggle);
    });

    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('input', handleQuantityInput);
    });
}

function handleAddToCart(e) {
    if (!isUserLoggedIn()) {
        if (typeof redirectToLogin === 'function') {
            redirectToLogin('Please login to add items to cart');
        }
        return;
    }

    const productId = parseInt(e.target.dataset.productId);
    const product = getProductById(productId);
    const qtyInput = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
    const quantity = parseInt(qtyInput?.value) || 1;

    if (!product) return;

    const result = addToCart(product, quantity);
    if (!result?.success) {
        showToast(result?.message || 'Failed to add item to cart', 'error');
        return;
    }

    if (qtyInput) qtyInput.value = 1;
}

function handleQuantityDecrease(e) {
    const productId = e.target.dataset.productId;
    const input = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
    let value = parseInt(input?.value) || 1;
    if (value > 1 && input) {
        input.value = value - 1;
    }
}

function handleQuantityIncrease(e) {
    const productId = e.target.dataset.productId;
    const input = document.querySelector(`.qty-input[data-product-id="${productId}"]`);
    let value = parseInt(input?.value) || 1;
    if (value < 99 && input) {
        input.value = value + 1;
    }
}

function handleQuantityInput(e) {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
        e.target.value = 1;
    } else if (value > 99) {
        e.target.value = 99;
    }
}

function handleWishlistToggle(e) {
    e.stopPropagation();

    if (!isUserLoggedIn()) {
        if (typeof redirectToLogin === 'function') {
            redirectToLogin('Please login to use wishlist');
        }
        return;
    }

    const productId = parseInt(e.target.dataset.productId);
    const isCurrentlyWishlisted = isInWishlist(productId);

    updateUserWishlist(productId, !isCurrentlyWishlisted);

    e.target.textContent = !isCurrentlyWishlisted ? '💖' : '🤍';
    e.target.classList.toggle('active');

    showToast(!isCurrentlyWishlisted ? 'Added to wishlist 💖' : 'Removed from wishlist');
}

function toggleWishlist(productId) {
    const id = parseInt(productId);

    if (!isUserLoggedIn()) {
        if (typeof redirectToLogin === 'function') {
            redirectToLogin('Please login to use wishlist');
        }
        return;
    }

    const currently = isInWishlist(id);
    updateUserWishlist(id, !currently);

    const btn = document.getElementById(`wishlist-${id}`);
    if (btn) {
        btn.textContent = currently ? '🤍' : '💖';
        btn.classList.toggle('active', !currently);
    }

    showToast(!currently ? 'Added to wishlist 💖' : 'Removed from wishlist');
}

function initializeWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const idFromData = btn.getAttribute('data-product-id');
        const idFromElement = btn.id?.startsWith('wishlist-') ? btn.id.replace('wishlist-', '') : null;
        const id = parseInt(idFromData || idFromElement);

        if (!id) return;

        const wishlisted = isInWishlist(id);
        btn.textContent = wishlisted ? '💖' : '🤍';
        btn.classList.toggle('active', wishlisted);
    });
}

function renderProductGrid(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😢</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => createProductCard(product)).join('');
    attachProductCardListeners();
}
