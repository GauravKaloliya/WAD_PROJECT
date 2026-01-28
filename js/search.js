/**
 * Happy Groceries - Product Data & Search System
 * Contains product catalog with search, filter, and sort functionality
 */

// ==========================================================================
// Product Database
// ==========================================================================

const products = [
  // Fruits
  { id: 1, name: "Fresh Apple", price: 50, category: "Fruits", emoji: "🍎", image: "apple.png", rating: 4.5, description: "Crisp and juicy red apples" },
  { id: 2, name: "Ripe Banana", price: 30, category: "Fruits", emoji: "🍌", image: "banana.png", rating: 4, description: "Sweet and nutritious bananas" },
  { id: 3, name: "Fresh Orange", price: 40, category: "Fruits", emoji: "🍊", image: "orange.png", rating: 4.3, description: "Vitamin C rich oranges" },
  { id: 4, name: "Sweet Mango", price: 80, category: "Fruits", emoji: "🥭", image: "mango.png", rating: 4.7, description: "King of fruits - Alphonso mango" },
  { id: 5, name: "Fresh Grapes", price: 60, category: "Fruits", emoji: "🍇", image: "grapes.png", rating: 4.2, description: "Seedless green grapes" },
  
  // Vegetables
  { id: 6, name: "Fresh Carrot", price: 30, category: "Vegetables", emoji: "🥕", image: "carrot.png", rating: 4.4, description: "Orange and crunchy carrots" },
  { id: 7, name: "Fresh Tomato", price: 25, category: "Vegetables", emoji: "🍅", image: "tomato.png", rating: 4.1, description: "Juicy red tomatoes" },
  { id: 8, name: "Crisp Lettuce", price: 35, category: "Vegetables", emoji: "🥬", image: "lettuce.png", rating: 4, description: "Fresh green lettuce" },
  { id: 9, name: "Green Capsicum", price: 45, category: "Vegetables", emoji: "🫑", image: "capsicum.png", rating: 4.3, description: "Fresh bell peppers" },
  { id: 10, name: "Fresh Onion", price: 40, category: "Vegetables", emoji: "🧅", image: "onion.png", rating: 4.5, description: "Pungent and flavorful onions" },
  
  // Dairy
  { id: 11, name: "Fresh Milk", price: 25, category: "Dairy", emoji: "🥛", image: "milk.png", rating: 4.6, description: "Pure cow milk, 1 liter" },
  { id: 12, name: "Natural Butter", price: 80, category: "Dairy", emoji: "🧈", image: "butter.png", rating: 4.4, description: "Fresh homemade butter" },
  { id: 13, name: "Fresh Paneer", price: 120, category: "Dairy", emoji: "🧀", image: "paneer.png", rating: 4.7, description: "Soft cottage cheese" },
  { id: 14, name: "Fresh Yogurt", price: 30, category: "Dairy", emoji: "🍶", image: "yogurt.png", rating: 4.3, description: "Probiotic rich curd" },
  { id: 15, name: "Fresh Cream", price: 60, category: "Dairy", emoji: "🥛", image: "cream.png", rating: 4.2, description: "Rich and thick cream" },
  
  // Snacks
  { id: 16, name: "Chocolate Cookies", price: 80, category: "Snacks", emoji: "🍪", image: "cookies.png", rating: 4.5, description: "Crunchy chocolate chip cookies" },
  { id: 17, name: "Potato Chips", price: 40, category: "Snacks", emoji: "🥔", image: "chips.png", rating: 4.1, description: "Crispy salted chips" },
  { id: 18, name: "Granola Bar", price: 50, category: "Snacks", emoji: "🍫", image: "granola.png", rating: 4.3, description: "Healthy oat granola bars" },
  { id: 19, name: "Salted Nuts", price: 100, category: "Snacks", emoji: "🥜", image: "nuts.png", rating: 4.6, description: "Mixed roasted nuts" },
  { id: 20, name: "Popcorn", price: 45, category: "Snacks", emoji: "🍿", image: "popcorn.png", rating: 4.2, description: "Butter popcorn" },
  
  // Beverages
  { id: 21, name: "Fresh Juice", price: 60, category: "Beverages", emoji: "🧃", image: "juice.png", rating: 4.4, description: "Fresh mixed fruit juice" },
  { id: 22, name: "Green Tea", price: 50, category: "Beverages", emoji: "🍵", image: "tea.png", rating: 4.5, description: "Refreshing green tea" },
  { id: 23, name: "Cold Coffee", price: 70, category: "Beverages", emoji: "☕", image: "coffee.png", rating: 4.6, description: "Iced coffee with milk" },
  { id: 24, name: "Lemon Soda", price: 35, category: "Beverages", emoji: "🥤", image: "soda.png", rating: 4.3, description: "Fresh lime soda" }
];

// ==========================================================================
// Search & Filter Functions
// ==========================================================================

/**
 * Search products by name or description
 * @param {string} query - Search query
 * @returns {Array} - Filtered products
 */
function searchProducts(query, productsArray = products) {
  if (!query || query.trim() === '') return [...productsArray];
  
  const searchTerm = query.toLowerCase().trim();
  return productsArray.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm)
  );
}

/**
 * Filter products by category
 * @param {string} category - Category name
 * @returns {Array} - Filtered products
 */
function filterByCategory(category, productsArray = products) {
  if (!category || category === 'All') return [...productsArray];
  return productsArray.filter(product => product.category === category);
}

/**
 * Filter products by price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Array} - Filtered products
 */
function filterByPrice(minPrice, maxPrice, productsArray = products) {
  return productsArray.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  );
}

/**
 * Sort products
 * @param {Array} productsArray - Products to sort
 * @param {string} sortBy - Sort criteria ('price-low', 'price-high', 'name-az', 'name-za', 'rating')
 * @returns {Array} - Sorted products
 */
function sortProducts(productsArray, sortBy) {
  const sorted = [...productsArray];
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    
    case 'name-az':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'name-za':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    
    default:
      return sorted;
  }
}

/**
 * Get products by multiple filters
 * @param {Object} options - Filter options
 * @returns {Array} - Filtered and sorted products
 */
function getFilteredProducts(options = {}) {
  let filteredProducts = [...products];
  
  // Apply search
  if (options.search) {
    filteredProducts = searchProducts(options.search, filteredProducts);
  }
  
  // Apply category filter
  if (options.category) {
    filteredProducts = filterByCategory(options.category, filteredProducts);
  }
  
  // Apply price filter
  if (options.minPrice || options.maxPrice) {
    filteredProducts = filterByPrice(
      options.minPrice || 0,
      options.maxPrice || Infinity,
      filteredProducts
    );
  }
  
  // Apply sorting
  if (options.sortBy) {
    filteredProducts = sortProducts(filteredProducts, options.sortBy);
  }
  
  return filteredProducts;
}

/**
 * Convenience helper used by pages/shop.html.
 * @param {string} query
 * @param {string} category
 * @param {string} sort
 * @returns {Array}
 */
function filterAndSearchProducts(query = '', category = 'All', sort = 'default') {
  let filtered = [...products];

  if (query && query.trim() !== '') {
    filtered = searchProducts(query, filtered);
  }

  if (category && category !== 'All') {
    filtered = filterByCategory(category, filtered);
  }

  const sortMap = {
    'name-asc': 'name-az',
    'name-desc': 'name-za',
    'price-low': 'price-low',
    'price-high': 'price-high',
    rating: 'rating'
  };

  const mappedSort = sortMap[sort];
  if (mappedSort) {
    filtered = sortProducts(filtered, mappedSort);
  }

  return filtered;
}

/**
 * Get product by ID
 * @param {number} productId - Product ID
 * @returns {Object|null} - Product or null
 */
function getProductById(productId) {
  return products.find(p => p.id === parseInt(productId)) || null;
}

/**
 * Get all categories
 * @returns {Array} - Unique categories
 */
function getCategories() {
  const categories = [...new Set(products.map(p => p.category))];
  return ['All', ...categories];
}

// ==========================================================================
// Debounce Function for Search
// ==========================================================================

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================================================
// Product Display Functions
// ==========================================================================

/**
 * Create product card HTML
 * @param {Object} product - Product
 * @returns {string} - HTML string
 */
function createProductCard(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">${product.emoji}</div>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-price">₹${product.price.toFixed(2)}</p>
      <span class="product-category">${product.category}</span>
      <div class="product-rating">⭐ ${product.rating}</div>
      <div class="product-actions">
        <div class="quantity-control">
          <button class="quantity-btn" onclick="updateQuantity('${product.id}', -1)">-</button>
          <input type="number" class="quantity-input" value="1" min="1" id="qty-${product.id}">
          <button class="quantity-btn" onclick="updateQuantity('${product.id}', 1)">+</button>
        </div>
        <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
          Add to Cart 🛒
        </button>
        <button class="wishlist-btn" onclick="toggleWishlist('${product.id}')" id="wishlist-${product.id}">
          🤍
        </button>
      </div>
    </div>
  `;
}

/**
 * Display products in container
 * @param {Array} productsArray - Products to display
 * @param {string} containerId - Container element ID
 */
function displayProducts(productsArray, containerId = 'products-container') {
  const container = document.getElementById(containerId);
  const resultsCount = document.getElementById('results-count');
  
  if (!container) {
    console.error('Container not found:', containerId);
    return;
  }
  
  if (productsArray.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <div class="text-6xl mb-4">😢</div>
        <h3 class="text-xl font-bold mb-2">No items found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    if (resultsCount) resultsCount.textContent = '0 items found';
    return;
  }
  
  container.innerHTML = productsArray.map(product => createProductCard(product)).join('');
  
  if (resultsCount) {
    resultsCount.textContent = `${productsArray.length} item${productsArray.length !== 1 ? 's' : ''} found`;
  }
  
  // Re-initialize add to cart buttons
  setTimeout(() => {
    initializeAddToCartButtons();
    initializeWishlistButtons();
  }, 100);
}

/**
 * Display categories
 * @param {Array} categories - Categories to display
 * @param {string} containerId - Container element ID
 */
function displayCategories(categories, containerId = 'categories-container') {
  const container = document.getElementById(containerId);
  
  if (!container) return;
  
  const categoryCards = categories.map(category => {
    const categoryEmojis = {
      'Fruits': '🍎',
      'Vegetables': '🥕',
      'Dairy': '🥛',
      'Snacks': '🍪',
      'Beverages': '🧃'
    };
    
    return `
      <a href="shop.html?category=${encodeURIComponent(category)}" class="category-card">
        <span class="category-emoji">${categoryEmojis[category] || '📦'}</span>
        <h3>${category}</h3>
        <p>${getProductsByCategory(category).length} items</p>
      </a>
    `;
  }).join('');
  
  container.innerHTML = categoryCards;
}

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Array} - Products in category
 */
function getProductsByCategory(category) {
  return products.filter(p => p.category === category);
}

// ==========================================================================
// Event Handlers
// ==========================================================================

/**
 * Handle search input
 * @param {string} query - Search query
 */
function handleSearch(query) {
  const filteredProducts = getFilteredProducts({
    search: query,
    category: getCurrentCategory(),
    sortBy: getCurrentSort()
  });
  displayProducts(filteredProducts);
}

/**
 * Handle category filter
 * @param {string} category - Selected category
 */
function handleCategoryFilter(category) {
  updateActiveCategoryButton(category);
  
  const filteredProducts = getFilteredProducts({
    category: category === 'All' ? null : category,
    search: getCurrentSearchQuery(),
    sortBy: getCurrentSort()
  });
  displayProducts(filteredProducts);
}

/**
 * Handle sort change
 * @param {string} sortBy - Sort option
 */
function handleSortChange(sortBy) {
  const filteredProducts = getFilteredProducts({
    sortBy: sortBy,
    category: getCurrentCategory(),
    search: getCurrentSearchQuery()
  });
  displayProducts(filteredProducts);
}

// ==========================================================================
// Utility Functions for Getting Current State
// ==========================================================================

function getCurrentCategory() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('category');
}

function getCurrentSearchQuery() {
  const searchInput = document.getElementById('search-input');
  return searchInput ? searchInput.value : '';
}

function getCurrentSort() {
  const sortSelect = document.getElementById('sort-select');
  return sortSelect ? sortSelect.value : 'name-az';
}

function updateActiveCategoryButton(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`[data-category="${category}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

function updateQuantity(productId, change) {
  const input = document.getElementById(`qty-${productId}`);
  if (input) {
    const newValue = parseInt(input.value) + change;
    if (newValue >= 1) {
      input.value = newValue;
    }
  }
}

// ==========================================================================
// Initialize on page load
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize search with debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const debouncedSearch = debounce(handleSearch, 300);
    searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });
  }
  
  // Initialize category filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.getAttribute('data-category');
      handleCategoryFilter(category);
    });
  });
  
  // Initialize sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      handleSortChange(e.target.value);
    });
  }
  
  // Display featured products on home page
  if (document.getElementById('featured-products')) {
    displayProducts(products.slice(0, 6), 'featured-products');
  }
  
  // Display all products on shop page
  if (document.getElementById('products-container')) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
      displayProducts(filterByCategory(category));
    } else {
      displayProducts(products);
    }
  }
  
  // Display categories
  if (document.getElementById('categories-container')) {
    displayCategories(getCategories().slice(1)); // Remove 'All' from display
  }
});

// ==========================================================================
// Export for module use
// ==========================================================================

/*
export {
  products,
  searchProducts,
  filterByCategory,
  filterByPrice,
  sortProducts,
  getFilteredProducts,
  getProductById,
  getCategories,
  createProductCard,
  displayProducts,
  debounce
};
*/