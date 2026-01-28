/**
 * Happy Groceries - Cart Management System
 * Handles all cart operations with localStorage persistence
 * Per-user cart isolation
 */

// ==========================================================================
// Constants
// ==========================================================================

const CART_STORAGE_KEY = 'happyGroceries_cart';

// ==========================================================================
// Cart Management Functions
// ==========================================================================

/**
 * Get cart for current user
 * @returns {Array} - Array of cart items
 */
function getCart() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.warn('User not logged in, returning empty cart');
      return [];
    }
    
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    const allCarts = cartData ? JSON.parse(cartData) : {};
    
    return allCarts[currentUser.id] || [];
    
  } catch (error) {
    console.error('Get cart error:', error);
    return [];
  }
}

/**
 * Save cart for current user
 * @param {Array} cart - Cart items array
 */
function saveCart(cart) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.warn('User not logged in, cannot save cart');
      return false;
    }
    
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    const allCarts = cartData ? JSON.parse(cartData) : {};
    
    allCarts[currentUser.id] = cart;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(allCarts));
    
    updateCartCounter();
    return true;
    
  } catch (error) {
    console.error('Save cart error:', error);
    return false;
  }
}

/**
 * Add product to cart
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to add
 * @returns {Object} - { success: boolean, message: string }
 */
function addToCart(product, quantity = 1) {
  try {
    if (!product || !product.id) {
      return { success: false, message: 'Invalid product' };
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'Please login to add items to cart' };
    }
    
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const cartItem = {
        ...product,
        quantity: quantity,
        addedAt: new Date().toISOString()
      };
      cart.push(cartItem);
    }
    
    saveCart(cart);
    
    showToast(`${product.name} added to cart! 🛒`, 'success');
    
    return { success: true, message: 'Item added to cart' };
    
  } catch (error) {
    console.error('Add to cart error:', error);
    return { success: false, message: 'Failed to add item to cart' };
  }
}

/**
 * Remove product from cart
 * @param {string} productId - Product ID
 * @returns {Object} - { success: boolean, message: string }
 */
function removeFromCart(productId) {
  try {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found in cart' };
    }
    
    const removedItem = cart[itemIndex];
    cart.splice(itemIndex, 1);
    saveCart(cart);
    
    showToast(`${removedItem.name} removed from cart`, 'info');
    
    return { success: true, message: 'Item removed from cart' };
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    return { success: false, message: 'Failed to remove item from cart' };
  }
}

/**
 * Update product quantity in cart
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Object} - { success: boolean, message: string }
 */
function updateQuantity(productId, quantity) {
  try {
    if (!quantity || quantity < 1) {
      return { success: false, message: 'Quantity must be at least 1' };
    }
    
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found in cart' };
    }
    
    cart[itemIndex].quantity = quantity;
    saveCart(cart);
    
    return { success: true, message: 'Quantity updated' };
    
  } catch (error) {
    console.error('Update quantity error:', error);
    return { success: false, message: 'Failed to update quantity' };
  }
}

/**
 * Clear entire cart
 * @returns {Object} - { success: boolean, message: string }
 */
function clearCart() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'User not logged in' };
    }
    
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    const allCarts = cartData ? JSON.parse(cartData) : {};
    
    delete allCarts[currentUser.id];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(allCarts));
    
    updateCartCounter();
    showToast('Cart cleared!', 'info');
    
    return { success: true, message: 'Cart cleared' };
    
  } catch (error) {
    console.error('Clear cart error:', error);
    return { success: false, message: 'Failed to clear cart' };
  }
}

// ==========================================================================
// Cart Calculation Functions
// ==========================================================================

/**
 * Calculate cart subtotal (before tax)
 * @returns {number}
 */
function calculateSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + (price * quantity);
  }, 0);
}

/**
 * Calculate tax amount (8%)
 * @returns {number}
 */
function calculateTax() {
  const subtotal = calculateSubtotal();
  return subtotal * 0.08;
}

/**
 * Calculate cart total (subtotal + tax)
 * @returns {number}
 */
function calculateTotal() {
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  return subtotal + tax;
}

/**
 * Get total item count in cart
 * @returns {number}
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    return total + (parseInt(item.quantity) || 0);
  }, 0);
}

// ==========================================================================
// Cart Display Functions
// ==========================================================================

/**
 * Display cart items on cart page
 */
function displayCart() {
  try {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCart = document.getElementById('empty-cart');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
      if (emptyCart) emptyCart.classList.remove('hidden');
      if (cartContainer) cartContainer.classList.add('hidden');
      if (cartSummary) cartSummary.classList.add('hidden');
      return;
    }
    
    // Hide empty message, show cart
    if (emptyCart) emptyCart.classList.add('hidden');
    if (cartContainer) cartContainer.classList.remove('hidden');
    if (cartSummary) cartSummary.classList.remove('hidden');
    
    // Clear existing items
    cartContainer.innerHTML = '';
    
    // Display each cart item
    cart.forEach(item => {
      const cartItemElement = createCartItemElement(item);
      cartContainer.appendChild(cartItemElement);
    });
    
    // Update summary
    updateCartSummary();
    
  } catch (error) {
    console.error('Display cart error:', error);
  }
}

/**
 * Create cart item DOM element
 * @param {Object} item - Cart item
 * @returns {HTMLElement}
 */
function createCartItemElement(item) {
  const cartItem = document.createElement('div');
  cartItem.className = 'cart-item';
  cartItem.setAttribute('data-product-id', item.id);
  
  cartItem.innerHTML = `
    <div class="cart-item-image">
      ${item.emoji || '📦'}
    </div>
    <div class="cart-item-details">
      <h4 class="cart-item-name">${item.name}</h4>
      <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
      <div class="quantity-control mt-2">
        <button class="quantity-btn" onclick="updateQuantityFromCart('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
        <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantityFromCart('${item.id}', this.value)">
        <button class="quantity-btn" onclick="updateQuantityFromCart('${item.id}', ${item.quantity + 1})">+</button>
      </div>
    </div>
    <button class="remove-item-btn" onclick="removeFromCart('${item.id}')" title="Remove item">✕</button>
  `;
  
  return cartItem;
}

/**
 * Update cart summary (subtotal, tax, total)
 */
function updateCartSummary() {
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();
  
  const subtotalElement = document.getElementById('cart-subtotal');
  const taxElement = document.getElementById('cart-tax');
  const totalElement = document.getElementById('cart-total');
  
  if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
  if (taxElement) taxElement.textContent = `₹${tax.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
  
  // Update checkout button state
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = getCart().length === 0;
  }
}

// ==========================================================================
// Helper Functions for Event Handlers
// ==========================================================================

/**
 * Update quantity from cart page (for quantity buttons)
 * @param {string} productId
 * @param {number} newQuantity
 */
function updateQuantityFromCart(productId, newQuantity) {
  const quantity = parseInt(newQuantity);
  
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const result = updateQuantity(productId, quantity);
  
  if (result.success) {
    displayCart(); // Refresh cart display
  }
}

/**
 * Initialize add to cart buttons on product cards
 */
function initializeAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const quantity = parseInt(this.getAttribute('data-quantity')) || 1;
      
      const product = getProductById(productId);
      
      if (product) {
        addToCart(product, quantity);
        
        // Optional: animate button
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
      }
    });
  });
}

/**
 * Get product by ID (from search.js products array)
 * @param {string} productId
 * @returns {Object|null}
 */
function getProductById(productId) {
  return products.find(p => p.id == productId) || null;
}

// ==========================================================================
// Cart Counter Management
// ==========================================================================

/**
 * Update cart counter in navbar
 */
function updateCartCounter() {
  const counterElement = document.getElementById('cart-counter');
  const itemCount = getCartItemCount();
  
  if (counterElement) {
    if (itemCount > 0) {
      counterElement.textContent = itemCount;
      counterElement.style.display = 'flex';
    } else {
      counterElement.style.display = 'none';
    }
  }
}

// ==========================================================================
// Check if user is logged in before accessing cart
// ==========================================================================

function checkCartAccess() {
  if (!isUserLoggedIn()) {
    showToast('Please login to view your cart!', 'warning');
    setTimeout(() => {
      window.location.href = '/pages/login.html';
    }, 1500);
    return false;
  }
  return true;
}

// ==========================================================================
// Export functions for use in other files
// ==========================================================================

// If using ES6 modules, uncomment below:
/*
export {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  getCartItemCount,
  displayCart,
  updateCartCounter
};
*/