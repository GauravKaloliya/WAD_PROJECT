/**
 * Happy Groceries - Authentication System
 * Handles user registration, login, logout, session management
 * Stores users and sessions in localStorage
 */

// ==========================================================================
// Constants & Configuration
// ==========================================================================

const STORAGE_KEYS = {
  USERS: 'happyGroceries_users',
  CURRENT_USER: 'happyGroceries_currentUser',
  SESSION_TOKEN: 'happyGroceries_sessionToken'
};

// ==========================================================================
// User Management Functions
// ==========================================================================

/**
 * Register a new user
 * @param {string} name - Full name (min 3 chars)
 * @param {string} phone - Phone number (10 digits)
 * @param {string} email - Optional email
 * @param {string} password - Password (min 6 chars)
 * @returns {Object} - { success: boolean, message: string, user: object }
 */
function registerUser(name, phone, email, password) {
  try {
    // Validation
    if (!validateName(name)) {
      return { success: false, message: 'Name must be at least 3 characters long' };
    }
    
    if (!validatePhone(phone)) {
      return { success: false, message: 'Phone number must be exactly 10 digits' };
    }
    
    if (!validatePassword(password)) {
      return { success: false, message: 'Password must be at least 6 characters long' };
    }
    
    // Check if phone already exists
    const existingUsers = getUsers();
    const phoneExists = existingUsers.some(user => user.phone === phone);
    
    if (phoneExists) {
      return { success: false, message: 'Phone number already registered. Please login or use a different number.' };
    }
    
    // Create new user
    const newUser = {
      id: generateUserId(),
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      wishlist: [],
      addresses: [],
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        theme: 'light',
        fontSize: 'normal'
      }
    };
    
    // Save user
    existingUsers.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existingUsers));
    
    // Auto-login after registration
    const loginResult = loginUser(phone, password);
    
    if (loginResult.success) {
      showToast('🎉 Account created successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
    
    return loginResult;
    
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed. Please try again.' };
  }
}

/**
 * Login user
 * @param {string} phone - Phone number
 * @param {string} password - Password
 * @returns {Object} - { success: boolean, message: string, user: object }
 */
function loginUser(phone, password) {
  try {
    // Validation
    if (!validatePhone(phone)) {
      return { success: false, message: 'Invalid phone number format' };
    }
    
    if (!password) {
      return { success: false, message: 'Password is required' };
    }
    
    // Find user
    const users = getUsers();
    const user = users.find(u => u.phone === phone.trim());
    
    if (!user) {
      return { success: false, message: 'Account not found. Please sign up.' };
    }
    
    // Verify password
    if (user.password !== hashPassword(password)) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }
    
    // Create session
    const sessionToken = generateSessionToken();
    const sessionData = {
      userId: user.id,
      token: sessionToken,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, JSON.stringify(sessionData));
    
    // Show success message
    showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
    
    return { 
      success: true, 
      message: 'Login successful', 
      user: user,
      isNewUser: false
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
}

/**
 * Logout user
 */
function logoutUser() {
  try {
    const user = getCurrentUser();
    if (user) {
      showToast(`Goodbye, ${user.name.split(' ')[0]}! See you soon! 👋`, 'info');
    }
    
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    
    // Clear user-specific localStorage items
    localStorage.removeItem('happyGroceries_cart');
    
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
    
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updatedData - Object with updated fields
 * @returns {Object} - { success: boolean, message: string, user: object }
 */
function updateUserProfile(userId, updatedData) {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }
    
    const user = users[userIndex];
    
    // Update fields
    if (updatedData.name && validateName(updatedData.name)) {
      user.name = updatedData.name.trim();
    }
    
    if (updatedData.email !== undefined) {
      user.email = updatedData.email.trim();
    }
    
    if (updatedData.preferences) {
      user.preferences = { ...user.preferences, ...updatedData.preferences };
    }
    
    if (updatedData.addresses) {
      user.addresses = updatedData.addresses;
    }
    
    // Save updated users
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update current user session if this is the logged-in user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    
    showToast('Profile updated successfully! ✅', 'success');
    
    return { success: true, message: 'Profile updated successfully', user: user };
    
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, message: 'Failed to update profile' };
  }
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} - { success: boolean, message: string }
 */
function changePassword(userId, currentPassword, newPassword) {
  try {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Verify current password
    if (user.password !== hashPassword(currentPassword)) {
      return { success: false, message: 'Current password is incorrect' };
    }
    
    // Validate new password
    if (!validatePassword(newPassword)) {
      return { success: false, message: 'New password must be at least 6 characters' };
    }
    
    // Update password
    user.password = hashPassword(newPassword);
    
    // Save
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update current user session if this is the logged-in user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    
    showToast('Password updated successfully! 🔐', 'success');
    
    return { success: true, message: 'Password updated successfully' };
    
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, message: 'Failed to change password' };
  }
}

/**
 * Delete user account
 * @param {string} userId - User ID
 * @param {string} password - Password for confirmation
 * @returns {Object} - { success: boolean, message: string }
 */
function deleteAccount(userId, password) {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }
    
    const user = users[userIndex];
    
    // Verify password
    if (user.password !== hashPassword(password)) {
      return { success: false, message: 'Password is incorrect' };
    }
    
    // Remove user
    users.splice(userIndex, 1);
    
    // Save
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Logout
    logoutUser();
    
    showToast('Account deleted. Goodbye! 👋', 'info');
    
    return { success: true, message: 'Account deleted successfully' };
    
  } catch (error) {
    console.error('Account deletion error:', error);
    return { success: false, message: 'Failed to delete account' };
  }
}

// ==========================================================================
// Session & User Retrieval Functions
// ==========================================================================

/**
 * Get current logged-in user
 * @returns {Object|null} - User object or null if not logged in
 */
function getCurrentUser() {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    
    if (!userData || !sessionData) {
      return null;
    }
    
    const user = JSON.parse(userData);
    const session = JSON.parse(sessionData);
    
    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      logoutUser();
      return null;
    }
    
    return user;
    
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object|null}
 */
function getUserById(userId) {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
}

/**
 * Get all users
 * @returns {Array}
 */
function getUsers() {
  try {
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersData ? JSON.parse(usersData) : [];
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
}

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Generate unique user ID
 * @returns {string}
 */
function generateUserId() {
  return 'USR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate session token
 * @returns {string}
 */
function generateSessionToken() {
  return 'SESSION-' + Date.now() + '-' + Math.random().toString(36).substr(2, 15);
}

/**
 * Validate name
 * @param {string} name
 * @returns {boolean}
 */
function validateName(name) {
  return name && name.trim().length >= 3;
}

/**
 * Validate phone number (10 digits)
 * @param {string} phone
 * @returns {boolean}
 */
function validatePhone(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validate password (min 6 chars)
 * @param {string} password
 * @returns {boolean}
 */
function validatePassword(password) {
  return password && password.length >= 6;
}

/**
 * Validate email address
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Simple password hashing (not production-ready)
 * @param {string} password
 * @returns {string}
 */
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Check password strength
 * @param {string} password
 * @returns {Object} - { strength: 'weak'|'medium'|'strong', score: number }
 */
function checkPasswordStrength(password) {
  if (!password) return { strength: 'weak', score: 0 };
  
  let score = 0;
  
  // Length
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  
  // Variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 2) strength = 'medium';
  
  return { strength, score };
}

// ==========================================================================
// Toast Notifications
// ==========================================================================

/**
 * Show toast notification
 * @param {string} message
 * @param {string} type - 'success', 'error', 'info', 'warning'
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  // Set background based on type
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    info: '#2196F3',
    warning: '#FF9800'
  };
  
  toast.style.background = colors[type] || colors.info;
  
  // Add confetti for success
  if (type === 'success') {
    createConfetti();
  }
  
  document.body.appendChild(toast);
  
  // Remove after animation
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

/**
 * Create confetti animation
 */
function createConfetti() {
  const colors = ['#FFB3D9', '#B3E5FC', '#C8E6C9', '#FFECB3', '#FFD9B3'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }, i * 50);
  }
}

// ==========================================================================
// Auto-login on page load
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
  restoreSession();
  updateNavbar();
  initializeTheme();
});

/**
 * Restore user session if valid token exists
 */
function restoreSession() {
  try {
    const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    
    if (!sessionData || !currentUser) return;
    
    const session = JSON.parse(sessionData);
    
    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      logoutUser();
      return;
    }
    
    // Session is valid, user stays logged in
    const user = JSON.parse(currentUser);
    console.log(`Welcome back, ${user.name}! Session restored.`);
    
  } catch (error) {
    console.error('Session restore error:', error);
    logoutUser();
  }
}

// ==========================================================================
// Initialize dark mode preference
// ==========================================================================

function initializeTheme() {
  const user = getCurrentUser();
  const savedTheme = user?.preferences?.theme || 
                    localStorage.getItem('happyGroceries_theme') || 
                    'light';
  
  setTheme(savedTheme);
}

/**
 * Set theme (light/dark)
 * @param {string} theme
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('happyGroceries_theme', theme);
  
  // Update user preference if logged in
  const user = getCurrentUser();
  if (user) {
    updateUserProfile(user.id, {
      preferences: { ...user.preferences, theme }
    });
  }
}

/**
 * Check if product is in user's wishlist
 * @param {number} productId
 * @returns {boolean}
 */
function isInWishlist(productId) {
  const user = getCurrentUser();
  if (!user) return false;
  
  const wishlist = user.wishlist || [];
  return wishlist.includes(productId);
}

/**
 * Update user's wishlist
 * @param {number} productId
 * @param {boolean} add - true to add, false to remove
 * @returns {Object} - { success: boolean, message: string }
 */
function updateUserWishlist(productId, add = true) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'Please login to use wishlist' };
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }
    
    let wishlist = users[userIndex].wishlist || [];
    
    if (add) {
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
      }
    } else {
      wishlist = wishlist.filter(id => id !== productId);
    }
    
    users[userIndex].wishlist = wishlist;
    
    // Save updated users
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update current user session
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
    
    return { success: true, message: 'Wishlist updated' };
    
  } catch (error) {
    console.error('Update wishlist error:', error);
    return { success: false, message: 'Failed to update wishlist' };
  }
}

/**
 * Get all products from search.js
 * @returns {Array}
 */
function getAllProducts() {
  if (typeof products !== 'undefined') {
    return products;
  }
  return [];
}

/**
 * Get product by ID
 * @param {number} productId
 * @returns {Object|null}
 */
function getProductById(productId) {
  const allProducts = getAllProducts();
  return allProducts.find(p => p.id === productId) || null;
}

/**
 * Render star rating
 * @param {number} rating
 * @returns {string}
 */
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '½';
  stars += '☆'.repeat(emptyStars);
  
  return stars;
}

/**
 * Create and save a new order
 * @param {Object} orderData - Order information
 * @returns {Object} - Saved order with ID
 */
function addOrder(orderData) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'Please login to place an order' };
    }
    
    // Generate order ID
    const orderId = 'ORD-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
    
    // Calculate estimated delivery (3-5 days from now)
    const deliveryDays = Math.floor(Math.random() * 3) + 3;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);
    
    // Create order object
    const order = {
      orderId: orderId,
      userId: user.id,
      date: new Date().toISOString(),
      items: orderData.items.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        qty: parseInt(item.quantity),
        emoji: item.emoji,
        category: item.category
      })),
      subtotal: parseFloat(orderData.subtotal),
      tax: parseFloat(orderData.tax),
      total: parseFloat(orderData.total),
      status: 'processing',
      deliveryAddress: orderData.address,
      estimatedDelivery: estimatedDelivery.toISOString(),
      trackingNumber: 'TRACK-' + Date.now().toString().slice(-8)
    };
    
    // Get existing orders
    const ordersData = localStorage.getItem('happyGroceries_orders');
    const allOrders = ordersData ? JSON.parse(ordersData) : [];
    
    // Add new order
    allOrders.push(order);
    
    // Save orders
    localStorage.setItem('happyGroceries_orders', JSON.stringify(allOrders));
    
    showToast('Order placed successfully! 🎉', 'success');
    
    return order;
    
  } catch (error) {
    console.error('Add order error:', error);
    return { success: false, message: 'Failed to place order' };
  }
}

/**
 * Get orders for a user
 * @param {string} userId
 * @returns {Array}
 */
function getUserOrders(userId) {
  try {
    const ordersData = localStorage.getItem('happyGroceries_orders');
    if (!ordersData) return [];
    
    const allOrders = JSON.parse(ordersData);
    return allOrders.filter(order => order.userId === userId);
    
  } catch (error) {
    console.error('Get orders error:', error);
    return [];
  }
}

/**
 * Update order status
 * @param {string} orderId
 * @param {string} status - 'processing', 'shipped', 'delivered'
 * @returns {Object}
 */
function updateOrderStatus(orderId, status) {
  try {
    const ordersData = localStorage.getItem('happyGroceries_orders');
    if (!ordersData) {
      return { success: false, message: 'Orders not found' };
    }
    
    const allOrders = JSON.parse(ordersData);
    const orderIndex = allOrders.findIndex(order => order.orderId === orderId);
    
    if (orderIndex === -1) {
      return { success: false, message: 'Order not found' };
    }
    
    allOrders[orderIndex].status = status;
    localStorage.setItem('happyGroceries_orders', JSON.stringify(allOrders));
    
    return { success: true, message: 'Order status updated' };
    
  } catch (error) {
    console.error('Update order status error:', error);
    return { success: false, message: 'Failed to update order status' };
  }
}

// ==========================================================================
// Export functions for use in other files (if using modules)
// ==========================================================================

// If using ES6 modules, uncomment below:
/*
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isUserLoggedIn,
  updateUserProfile,
  changePassword,
  deleteAccount,
  validatePhone,
  validatePassword,
  checkPasswordStrength,
  showToast,
  setTheme
};
*/