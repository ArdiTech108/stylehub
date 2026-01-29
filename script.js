// ===========================================
// STYLEHUB - COMPLETE E-COMMERCE JS
// ===========================================

// 1. INITIALIZATION
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  // Initialize all components
  initializeDarkMode();
  initializeMobileMenu();
  initializeCart();
  initializeProducts();
  initializeFilters();
  initializeCartModal();
  initializeCheckout();
  initializeForms();
  initializeFAQ();
  initializeAuthTabs();
  initializePasswordToggle();

  // Update cart count on page load
  updateCartCount();

  console.log("StyleHub initialized successfully!");
}

// 2. DARK MODE SYSTEM
function initializeDarkMode() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const isDarkMode = localStorage.getItem("stylehub_darkmode") === "true";

  // Apply saved theme
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
  }

  // Toggle dark mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      const isNowDark = document.body.classList.contains("dark-mode");
      localStorage.setItem("stylehub_darkmode", isNowDark);

      // Change icon
      const moonIcon = this.querySelector(".fa-moon");
      const sunIcon = this.querySelector(".fa-sun");
      if (isNowDark) {
        moonIcon.style.display = "none";
        sunIcon.style.display = "block";
      } else {
        moonIcon.style.display = "block";
        sunIcon.style.display = "none";
      }
    });
  }
}

// 3. MOBILE MENU
function initializeMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      this.classList.toggle("active");

      // Change icon
      const icon = this.querySelector("i");
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !menuToggle.contains(event.target) &&
        !navLinks.contains(event.target)
      ) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });
  }
}

// 4. SHOPPING CART SYSTEM
let cart = JSON.parse(localStorage.getItem("stylehub_cart")) || [];

function initializeCart() {
  // Add to cart buttons
  document.querySelectorAll(".btn-add-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.dataset.id);
      addToCart(productId);
    });
  });

  // Clear cart button
  const clearCartBtn = document.getElementById("clearCart");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to clear your cart?")) {
        clearCart();
      }
    });
  }

  // Quantity controls in cart page
  document.querySelectorAll(".quantity-btn.minus").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.closest(".cart-item").dataset.id);
      updateCartQuantity(productId, "decrease");
    });
  });

  document.querySelectorAll(".quantity-btn.plus").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.closest(".cart-item").dataset.id);
      updateCartQuantity(productId, "increase");
    });
  });

  // Remove item buttons
  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.closest(".cart-item").dataset.id);
      removeFromCart(productId);
    });
  });
}

function addToCart(productId) {
  // In a real app, you would fetch product data from a database
  // For now, we'll use a simple product object
  const product = {
    id: productId,
    name: `Product ${productId}`,
    price: getProductPrice(productId),
    quantity: 1,
    image: getProductImage(productId),
  };

  // Check if product already in cart
  const existingItemIndex = cart.findIndex((item) => item.id === productId);

  if (existingItemIndex !== -1) {
    // Update quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // Add new item
    cart.push(product);
  }

  // Save to localStorage
  localStorage.setItem("stylehub_cart", JSON.stringify(cart));

  // Update UI
  updateCartCount();
  updateCartDisplay();

  // Show notification
  showNotification(`${product.name} added to cart!`, "success");
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("stylehub_cart", JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
  showNotification("Product removed from cart", "info");
}

function updateCartQuantity(productId, action) {
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex !== -1) {
    if (action === "increase") {
      cart[itemIndex].quantity += 1;
    } else if (action === "decrease" && cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    }

    localStorage.setItem("stylehub_cart", JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
  }
}

function clearCart() {
  cart = [];
  localStorage.setItem("stylehub_cart", JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
  showNotification("Cart cleared!", "info");
}

function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((element) => {
    element.textContent = totalItems;
  });
}

function updateCartDisplay() {
  // Update cart page if exists
  const cartItemsList = document.getElementById("cartItemsList");
  if (cartItemsList) {
    renderCartItems(cartItemsList);
    updateCartTotals();
  }

  // Update cart modal if exists
  const cartModalItems = document.getElementById("cartItems");
  if (cartModalItems) {
    renderCartModalItems(cartModalItems);
    updateCartModalTotals();
  }
}

function renderCartItems(container) {
  if (cart.length === 0) {
    container.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <a href="products.html" class="shop-btn">
                    <i class="fas fa-shopping-bag"></i> Shop Now
                </a>
            </div>
        `;
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <i class="${item.image}"></i>
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-category">${item.category || "General"}</p>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn minus">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Reattach event listeners
  document.querySelectorAll(".quantity-btn.minus").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.closest(".cart-item").dataset.id);
      updateCartQuantity(productId, "decrease");
    });
  });

  document.querySelectorAll(".quantity-btn.plus").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.closest(".cart-item").dataset.id);
      updateCartQuantity(productId, "increase");
    });
  });

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.closest(".cart-item").dataset.id);
      removeFromCart(productId);
    });
  });
}

function renderCartModalItems(container) {
  if (cart.length === 0) {
    container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-modal-item" data-id="${item.id}">
            <div class="cart-modal-item-image">
                <i class="${item.image}"></i>
            </div>
            <div class="cart-modal-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <button class="remove-cart-item">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
    )
    .join("");

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-cart-item").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.closest(".cart-modal-item").dataset.id);
      removeFromCart(productId);
    });
  });
}

function updateCartTotals() {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Update elements if they exist
  const itemCountElement = document.getElementById("itemCount");
  const subtotalElement = document.getElementById("subtotal");
  const shippingElement = document.getElementById("shipping");
  const taxElement = document.getElementById("tax");
  const totalElement = document.getElementById("total");

  if (itemCountElement) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    itemCountElement.textContent = totalItems;
  }

  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingElement)
    shippingElement.textContent =
      shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
  if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function updateCartModalTotals() {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const cartTotalElement = document.getElementById("cartTotal");
  if (cartTotalElement) {
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
  }
}

// Helper functions for product data
function getProductPrice(productId) {
  // Mock prices for demo
  const prices = {
    1: 29.99,
    2: 49.99,
    3: 19.99,
    4: 89.99,
    5: 39.99,
    6: 59.99,
    7: 24.99,
    8: 34.99,
    9: 44.99,
    10: 29.99,
    11: 79.99,
    12: 19.99,
    13: 14.99,
    14: 99.99,
    15: 49.99,
  };
  return prices[productId] || 29.99;
}

function getProductImage(productId) {
  // Mock images for demo
  const images = [
    "fas fa-tools",
    "fas fa-home",
    "fas fa-laptop",
    "fas fa-tshirt",
    "fas fa-shoe-prints",
    "fas fa-headphones",
    "fas fa-mobile-alt",
    "fas fa-couch",
    "fas fa-utensils",
    "fas fa-book",
  ];
  return images[productId % images.length];
}

// 5. PRODUCTS DISPLAY
function initializeProducts() {
  // View product buttons
  document.querySelectorAll(".btn-view").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.dataset.id);
      showProductDetails(productId);
    });
  });

  // Featured products on homepage
  displayFeaturedProducts();
}

function displayFeaturedProducts() {
  const featuredContainer = document.getElementById("featuredProducts");
  if (!featuredContainer) return;

  // Featured products data
  const featuredProducts = [
    {
      id: 1,
      name: "Professional Drill",
      category: "tools",
      price: 89.99,
      rating: 4.7,
    },
    {
      id: 2,
      name: "Memory Foam Mattress",
      category: "home",
      price: 599.99,
      rating: 4.9,
    },
    {
      id: 3,
      name: "Gaming Laptop",
      category: "tech",
      price: 1299.99,
      rating: 4.8,
    },
    {
      id: 4,
      name: "Men's Casual Shirt",
      category: "clothing",
      price: 34.99,
      rating: 4.5,
    },
    {
      id: 5,
      name: "Running Shoes",
      category: "shoes",
      price: 89.99,
      rating: 4.8,
    },
    {
      id: 6,
      name: "Wireless Earbuds",
      category: "tech",
      price: 129.99,
      rating: 4.7,
    },
  ];

  featuredContainer.innerHTML = featuredProducts
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-image">
                <i class="${getProductImage(product.id)}"></i>
            </div>
            <div class="product-content">
                <p class="product-category">${
                  product.category.charAt(0).toUpperCase() +
                  product.category.slice(1)
                }</p>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(
                      2
                    )}</span>
                </div>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span class="review-count">(${
                      Math.floor(Math.random() * 100) + 50
                    })</span>
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-view" data-id="${product.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Reattach event listeners
  document.querySelectorAll(".btn-add-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.dataset.id);
      addToCart(productId);
    });
  });

  document.querySelectorAll(".btn-view").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.dataset.id);
      showProductDetails(productId);
    });
  });
}

function generateStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 === rating) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }
  return stars;
}

function showProductDetails(productId) {
  // Create modal
  const modal = document.createElement("div");
  modal.className = "modal product-details-modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Product Details</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="product-details-content">
                <div class="product-details-image">
                    <i class="${getProductImage(productId)} fa-4x"></i>
                </div>
                <div class="product-details-info">
                    <h2 class="product-details-title">Product ${productId}</h2>
                    <div class="product-details-price">$${getProductPrice(
                      productId
                    ).toFixed(2)}</div>
                    <div class="product-details-rating">
                        ${generateStars(4.5)}
                        <span>(128 reviews)</span>
                    </div>
                    <p class="product-details-description">
                        This is a high-quality product with excellent features. 
                        Perfect for everyday use and built to last.
                    </p>
                    <div class="product-details-features">
                        <h4>Features:</h4>
                        <ul>
                            <li>Premium quality materials</li>
                            <li>Easy to use</li>
                            <li>Long-lasting durability</li>
                            <li>Warranty included</li>
                        </ul>
                    </div>
                    <div class="product-details-actions">
                        <button class="btn-add-cart" data-id="${productId}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-close-modal">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Show modal with animation
  setTimeout(() => modal.classList.add("active"), 10);

  // Close modal
  const closeBtn = modal.querySelector(".modal-close");
  const closeModalBtn = modal.querySelector(".btn-close-modal");

  const closeModal = () => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  };

  closeBtn.addEventListener("click", closeModal);
  closeModalBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Add to cart button in modal
  const addToCartBtn = modal.querySelector(".btn-add-cart");
  addToCartBtn.addEventListener("click", () => {
    addToCart(productId);
    closeModal();
  });
}

// 6. FILTERS AND SEARCH
function initializeFilters() {
  // Category filter buttons
  document.querySelectorAll(".category-btn, .filter-btn").forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      document.querySelectorAll(".category-btn, .filter-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Add active class to clicked button
      this.classList.add("active");

      // Get category
      const category = this.dataset.category;

      // Filter products (in a real app, this would filter actual products)
      filterProductsByCategory(category);
    });
  });

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchProducts(this.value);
    });

    // Enter key search
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchProducts(this.value);
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      const searchValue = document.getElementById("searchInput").value;
      searchProducts(searchValue);
    });
  }

  // Sort functionality
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortProducts(this.value);
    });
  }
}

function filterProductsByCategory(category) {
  // In a real app, this would filter actual products
  // For demo, we'll just show a message
  if (category === "all") {
    showNotification("Showing all products", "info");
  } else {
    showNotification(`Showing ${category} products`, "info");
  }
}

function searchProducts(query) {
  if (query.trim() === "") {
    showNotification("Please enter a search term", "warning");
    return;
  }

  showNotification(`Searching for: ${query}`, "info");
  // In a real app, this would perform an actual search
}

function sortProducts(sortBy) {
  const sortOptions = {
    default: "Default sorting",
    "price-low": "Price: Low to High",
    "price-high": "Price: High to Low",
    name: "Name: A to Z",
  };

  showNotification(`Sorted by: ${sortOptions[sortBy]}`, "info");
  // In a real app, this would actually sort products
}

// 7. CART MODAL
function initializeCartModal() {
  const cartBtn = document.getElementById("cartBtn");
  const cartModal = document.getElementById("cartModal");
  const closeCart = document.querySelector(".close-cart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (cartBtn && cartModal) {
    cartBtn.addEventListener("click", function (e) {
      e.preventDefault();
      cartModal.classList.add("active");
      updateCartModalTotals();
    });
  }

  if (closeCart) {
    closeCart.addEventListener("click", function () {
      cartModal.classList.remove("active");
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      const cartModal = document.getElementById("cartModal");
      if (cartModal) cartModal.classList.remove("active");

      if (cart.length === 0) {
        showNotification("Your cart is empty!", "error");
        return;
      }

      // Show checkout modal or redirect
      showCheckoutModal();
    });
  }

  // Close modal when clicking outside
  if (cartModal) {
    cartModal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active");
      }
    });
  }
}

// 8. CHECKOUT SYSTEM
function initializeCheckout() {
  const checkoutBtn = document.querySelector(".checkout-btn:not(#checkoutBtn)");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (cart.length === 0) {
        showNotification("Your cart is empty!", "error");
        return;
      }
      showCheckoutModal();
    });
  }
}

function showCheckoutModal() {
  const modal = document.createElement("div");
  modal.className = "modal checkout-modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-credit-card"></i> Checkout</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="checkout-steps">
                <div class="step active">1. Cart</div>
                <div class="step">2. Details</div>
                <div class="step">3. Payment</div>
                <div class="step">4. Confirm</div>
            </div>
            <form class="checkout-form">
                <div class="form-step active" id="step1">
                    <h4>Review Your Order</h4>
                    <div class="order-summary">
                        ${cart
                          .map(
                            (item) => `
                            <div class="order-item">
                                <span>${item.name} × ${item.quantity}</span>
                                <span>$${(item.price * item.quantity).toFixed(
                                  2
                                )}</span>
                            </div>
                        `
                          )
                          .join("")}
                        <div class="order-totals">
                            ${generateOrderTotals()}
                        </div>
                    </div>
                </div>
                <div class="form-step" id="step2">
                    <h4>Shipping Information</h4>
                    <input type="text" placeholder="Full Name" required>
                    <input type="email" placeholder="Email" required>
                    <input type="tel" placeholder="Phone Number" required>
                    <input type="text" placeholder="Address" required>
                    <input type="text" placeholder="City" required>
                    <input type="text" placeholder="Zip Code" required>
                    <select required>
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                    </select>
                </div>
                <div class="form-step" id="step3">
                    <h4>Payment Method</h4>
                    <div class="payment-options">
                        <label class="payment-option">
                            <input type="radio" name="payment" value="card" checked>
                            <i class="fas fa-credit-card"></i> Credit Card
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="payment" value="paypal">
                            <i class="fab fa-paypal"></i> PayPal
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="payment" value="cash">
                            <i class="fas fa-money-bill-wave"></i> Cash on Delivery
                        </label>
                    </div>
                    <div class="card-details">
                        <input type="text" placeholder="Card Number" maxlength="16">
                        <div class="card-row">
                            <input type="text" placeholder="MM/YY" maxlength="5">
                            <input type="text" placeholder="CVC" maxlength="3">
                        </div>
                        <input type="text" placeholder="Name on Card">
                    </div>
                </div>
                <div class="form-step" id="step4">
                    <h4>Order Confirmation</h4>
                    <div class="confirmation">
                        <i class="fas fa-check-circle"></i>
                        <h3>Order Placed Successfully!</h3>
                        <p>Thank you for your purchase. Your order has been received.</p>
                        <div class="order-info">
                            <p><strong>Order ID:</strong> STYLE-${Math.floor(
                              10000 + Math.random() * 90000
                            )}</p>
                            <p><strong>Total Amount:</strong> ${generateOrderTotals(
                              true
                            )}</p>
                            <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                        </div>
                        <p>You will receive an email confirmation shortly.</p>
                    </div>
                </div>
                <div class="form-navigation">
                    <button type="button" class="prev-btn">Previous</button>
                    <button type="button" class="next-btn">Next</button>
                    <button type="submit" class="submit-btn">Place Order</button>
                </div>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  // Show modal
  setTimeout(() => modal.classList.add("active"), 10);

  // Setup checkout steps
  setupCheckoutSteps(modal);

  // Close modal
  const closeBtn = modal.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      setTimeout(() => modal.remove(), 300);
    }
  });
}

function generateOrderTotals(onlyTotal = false) {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (onlyTotal) {
    return `$${total.toFixed(2)}`;
  }

  return `
        <div class="order-total-row">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="order-total-row">
            <span>Shipping:</span>
            <span>${shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div class="order-total-row">
            <span>Tax:</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="order-total-row total">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;
}

function setupCheckoutSteps(modal) {
  let currentStep = 1;
  const steps = modal.querySelectorAll(".step");
  const formSteps = modal.querySelectorAll(".form-step");
  const prevBtn = modal.querySelector(".prev-btn");
  const nextBtn = modal.querySelector(".next-btn");
  const submitBtn = modal.querySelector(".submit-btn");
  const form = modal.querySelector(".checkout-form");

  function updateSteps() {
    // Update step indicators
    steps.forEach((step, index) => {
      step.classList.toggle("active", index + 1 === currentStep);
    });

    // Show current form step
    formSteps.forEach((step, index) => {
      step.classList.toggle("active", index + 1 === currentStep);
    });

    // Update buttons
    prevBtn.style.display = currentStep > 1 ? "block" : "none";
    nextBtn.style.display = currentStep < 4 ? "block" : "none";
    submitBtn.style.display = currentStep === 4 ? "block" : "none";
  }

  prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      updateSteps();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (validateStep(currentStep, modal)) {
      if (currentStep < 4) {
        currentStep++;
        updateSteps();
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentStep === 4) {
      completeOrder(modal);
    }
  });

  // Payment method toggle
  const paymentOptions = modal.querySelectorAll('input[name="payment"]');
  const cardDetails = modal.querySelector(".card-details");

  paymentOptions.forEach((option) => {
    option.addEventListener("change", function () {
      if (this.value === "card") {
        cardDetails.style.display = "block";
      } else {
        cardDetails.style.display = "none";
      }
    });
  });
}

function validateStep(step, modal) {
  switch (step) {
    case 2:
      // Validate shipping information
      const inputs = modal.querySelectorAll("#step2 input, #step2 select");
      for (let input of inputs) {
        if (!input.value.trim()) {
          showNotification(
            `Please fill in ${input.placeholder || "this field"}`,
            "error"
          );
          input.focus();
          return false;
        }
      }
      return true;

    case 3:
      // Validate payment
      const paymentMethod = modal.querySelector(
        'input[name="payment"]:checked'
      );
      if (!paymentMethod) {
        showNotification("Please select a payment method", "error");
        return false;
      }

      if (paymentMethod.value === "card") {
        const cardNumber = modal.querySelector(
          'input[placeholder="Card Number"]'
        );
        const cardExpiry = modal.querySelector('input[placeholder="MM/YY"]');
        const cardCVC = modal.querySelector('input[placeholder="CVC"]');
        const cardName = modal.querySelector(
          'input[placeholder="Name on Card"]'
        );

        if (!cardNumber.value.trim() || cardNumber.value.length !== 16) {
          showNotification(
            "Please enter a valid 16-digit card number",
            "error"
          );
          cardNumber.focus();
          return false;
        }

        if (
          !cardExpiry.value.trim() ||
          !/^\d{2}\/\d{2}$/.test(cardExpiry.value)
        ) {
          showNotification("Please enter a valid expiry date (MM/YY)", "error");
          cardExpiry.focus();
          return false;
        }

        if (!cardCVC.value.trim() || cardCVC.value.length !== 3) {
          showNotification("Please enter a valid 3-digit CVC", "error");
          cardCVC.focus();
          return false;
        }

        if (!cardName.value.trim()) {
          showNotification("Please enter the name on card", "error");
          cardName.focus();
          return false;
        }
      }
      return true;

    default:
      return true;
  }
}

function completeOrder(modal) {
  // Clear cart
  cart = [];
  localStorage.setItem("stylehub_cart", JSON.stringify(cart));
  updateCartCount();

  // Show success message
  showNotification(
    "Order placed successfully! Thank you for your purchase.",
    "success"
  );

  // Close modal after delay
  setTimeout(() => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }, 2000);
}

// 9. FORMS
function initializeForms() {
  // Contact form
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);

      // Validate
      if (!data.name || !data.email || !data.message) {
        showNotification("Please fill in all required fields", "error");
        return;
      }

      // Simulate form submission
      showNotification(
        "Message sent successfully! We'll get back to you soon.",
        "success"
      );
      this.reset();
    });
  }

  // Newsletter form
  const newsletterForms = document.querySelectorAll(".newsletter");
  newsletterForms.forEach((form) => {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector("button");

    if (button && input) {
      button.addEventListener("click", function (e) {
        e.preventDefault();

        if (!input.value || !isValidEmail(input.value)) {
          showNotification("Please enter a valid email address", "error");
          return;
        }

        showNotification("Subscribed to newsletter successfully!", "success");
        input.value = "";
      });
    }
  });

  // Promo code
  const applyPromoBtn = document.getElementById("applyPromo");
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", function () {
      const promoInput = document.getElementById("promoInput");
      const promoCode = promoInput ? promoInput.value.trim().toUpperCase() : "";

      if (promoCode === "WELCOME10") {
        showNotification("10% discount applied!", "success");
      } else if (promoCode === "FREESHIP") {
        showNotification("Free shipping applied!", "success");
      } else if (promoCode) {
        showNotification("Invalid promo code", "error");
      } else {
        showNotification("Please enter a promo code", "warning");
      }
    });
  }
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// 10. FAQ SYSTEM
function initializeFAQ() {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      const faqItem = this.parentElement;

      // Close other FAQ items
      document.querySelectorAll(".faq-item").forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove("active");
        }
      });

      // Toggle current FAQ item
      faqItem.classList.toggle("active");
    });
  });
}

// 11. AUTH TABS (Login/Register)
function initializeAuthTabs() {
  const authTabs = document.querySelectorAll(".auth-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  authTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.dataset.tab;

      // Update active tab
      authTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Show corresponding content
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${tabName}Tab`) {
          content.classList.add("active");
        }
      });
    });
  });

  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = this.querySelector("#loginEmail");
      const password = this.querySelector("#loginPassword");

      if (!email.value || !password.value) {
        showNotification("Please fill in all fields", "error");
        return;
      }

      // Simulate login
      showNotification("Logged in successfully!", "success");
      this.reset();
    });
  }

  // Register form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = this.querySelector("#registerEmail");
      const password = this.querySelector("#registerPassword");
      const confirmPassword = this.querySelector("#confirmPassword");

      if (!email.value || !password.value || !confirmPassword.value) {
        showNotification("Please fill in all fields", "error");
        return;
      }

      if (password.value !== confirmPassword.value) {
        showNotification("Passwords do not match", "error");
        return;
      }

      // Simulate registration
      showNotification("Account created successfully!", "success");
      this.reset();
    });
  }
}

// 12. PASSWORD TOGGLE
function initializePasswordToggle() {
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input");
      const icon = this.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });
}

// 13. NOTIFICATION SYSTEM
function showNotification(message, type = "info") {
  // Remove existing notifications
  document.querySelectorAll(".notification").forEach((notification) => {
    notification.remove();
  });

  // Create notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  // Set icon based on type
  let icon = "info-circle";
  if (type === "success") icon = "check-circle";
  if (type === "error") icon = "exclamation-circle";
  if (type === "warning") icon = "exclamation-triangle";

  notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// 14. SCROLL TO TOP
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// 15. SCROLL TO PRODUCTS
function scrollToProducts() {
  const productsSection = document.getElementById("products");
  if (productsSection) {
    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } else {
    // Redirect to products page
    window.location.href = "products.html";
  }
}

// 16. MAKE FUNCTIONS GLOBAL FOR HTML ONCLICK ATTRIBUTES
window.scrollToProducts = scrollToProducts;
window.scrollToTop = scrollToTop;
window.showNotification = showNotification;

// 17. SMOOTH SCROLL FOR ANCHOR LINKS
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Skip if it's just "#"
    if (href === "#") return;

    const targetElement = document.querySelector(href);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update URL without page reload
      history.pushState(null, null, href);
    }
  });
});

// 18. LAZY LOAD IMAGES
function lazyLoadImages() {
  const images = document.querySelectorAll("img[data-src]");

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// 19. LOAD MORE PRODUCTS
function loadMoreProducts() {
  const loadMoreBtn = document.querySelector(".load-more-button");
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener("click", function () {
    this.classList.add("loading");
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would load more products here
      showNotification("More products loaded!", "success");

      this.classList.remove("loading");
      this.innerHTML = '<i class="fas fa-plus"></i> Load More';
    }, 1500);
  });
}

// 20. PRODUCT IMAGE ZOOM (for product details)
function initializeImageZoom() {
  const productImages = document.querySelectorAll(".product-image");

  productImages.forEach((image) => {
    image.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.05)";
    });

    image.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });
}

// 21. ADD TO WISHLIST
function initializeWishlist() {
  const wishlistBtns = document.querySelectorAll(".btn-wishlist");

  wishlistBtns.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.dataset.id;
      const isActive = this.classList.contains("active");

      if (isActive) {
        this.classList.remove("active");
        this.innerHTML = '<i class="far fa-heart"></i>';
        showNotification("Removed from wishlist", "info");
      } else {
        this.classList.add("active");
        this.innerHTML = '<i class="fas fa-heart"></i>';
        showNotification("Added to wishlist", "success");
      }

      // Save to localStorage
      let wishlist =
        JSON.parse(localStorage.getItem("stylehub_wishlist")) || [];

      if (isActive) {
        wishlist = wishlist.filter((id) => id !== parseInt(productId));
      } else {
        wishlist.push(parseInt(productId));
      }

      localStorage.setItem("stylehub_wishlist", JSON.stringify(wishlist));
    });
  });
}

// 22. PRODUCT QUICK VIEW
function initializeQuickView() {
  document.querySelectorAll(".quick-view-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.dataset.id;
      showProductDetails(productId);
    });
  });
}

// 23. SIZE SELECTOR
function initializeSizeSelector() {
  document.querySelectorAll(".size-option").forEach((option) => {
    option.addEventListener("click", function () {
      if (this.classList.contains("disabled")) return;

      // Remove active class from all options
      this.parentElement.querySelectorAll(".size-option").forEach((opt) => {
        opt.classList.remove("active");
      });

      // Add active class to clicked option
      this.classList.add("active");

      // Update selected size
      const size = this.textContent.trim();
      showNotification(`Size ${size} selected`, "info");
    });
  });
}

// 24. COLOR SELECTOR
function initializeColorSelector() {
  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", function () {
      // Remove active class from all swatches
      this.parentElement.querySelectorAll(".color-swatch").forEach((s) => {
        s.classList.remove("active");
      });

      // Add active class to clicked swatch
      this.classList.add("active");

      // Get color
      const color = this.style.backgroundColor || this.dataset.color;
      showNotification(`Color selected: ${color}`, "info");
    });
  });
}

// 25. PRODUCT COMPARE
function initializeProductCompare() {
  const compareBtns = document.querySelectorAll(".btn-compare");
  let compareList = JSON.parse(localStorage.getItem("stylehub_compare")) || [];

  compareBtns.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.dataset.id);

      if (compareList.includes(productId)) {
        // Remove from compare
        compareList = compareList.filter((id) => id !== productId);
        this.classList.remove("active");
        this.innerHTML = '<i class="fas fa-exchange-alt"></i> Compare';
        showNotification("Removed from compare", "info");
      } else {
        // Add to compare (max 3 products)
        if (compareList.length >= 3) {
          showNotification("You can only compare up to 3 products", "warning");
          return;
        }

        compareList.push(productId);
        this.classList.add("active");
        this.innerHTML = '<i class="fas fa-check"></i> Added';
        showNotification("Added to compare", "success");
      }

      localStorage.setItem("stylehub_compare", JSON.stringify(compareList));
    });
  });
}

// 26. BACK TO TOP BUTTON
function initializeBackToTop() {
  const backToTopBtn = document.createElement("button");
  backToTopBtn.className = "back-to-top";
  backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  backToTopBtn.style.display = "none";

  document.body.appendChild(backToTopBtn);

  // Show/hide button based on scroll position
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  // Scroll to top when clicked
  backToTopBtn.addEventListener("click", scrollToTop);
}

// 27. INITIALIZE ALL FEATURES
function initializeAllFeatures() {
  // Call all initialization functions
  initializeBackToTop();
  lazyLoadImages();
  loadMoreProducts();
  initializeImageZoom();
  initializeWishlist();
  initializeQuickView();
  initializeSizeSelector();
  initializeColorSelector();
  initializeProductCompare();
}

// Run all initialization when page loads
initializeAllFeatures();

// 28. UTILITY FUNCTIONS
function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

// 29. SESSION MANAGEMENT
function checkSession() {
  // Check if user is logged in (in a real app)
  const isLoggedIn = localStorage.getItem("stylehub_loggedin") === "true";

  if (isLoggedIn) {
    // Update UI for logged in user
    const userBtns = document.querySelectorAll(".user-btn");
    userBtns.forEach((btn) => {
      btn.innerHTML = '<i class="fas fa-user-check"></i>';
      btn.title = "My Account";
    });
  }
}

// 30. PAGE TRANSITIONS
function initializePageTransitions() {
  // Add fade-in animation to main content
  const mainContent = document.querySelector("main");
  if (mainContent) {
    mainContent.style.opacity = "0";
    mainContent.style.animation = "fadeIn 0.5s ease forwards";
  }

  // Add animation to product cards
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add("fade-in");
  });
}

// 31. ERROR HANDLING
window.addEventListener("error", function (e) {
  console.error("JavaScript Error:", e.error);
  showNotification("An error occurred. Please try again.", "error");
});

// 32. OFFLINE DETECTION
window.addEventListener("online", function () {
  showNotification("You are back online!", "success");
});

window.addEventListener("offline", function () {
  showNotification("You are offline. Some features may not work.", "warning");
});

// 33. PERFORMANCE MONITORING
if ("performance" in window) {
  window.addEventListener("load", function () {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`Page loaded in ${pageLoadTime}ms`);
    }, 0);
  });
}

// 34. ANALYTICS (basic)
function trackEvent(eventName, data = {}) {
  // In a real app, send to analytics service
  console.log("Event tracked:", eventName, data);

  // Store in localStorage for demo
  let analytics = JSON.parse(localStorage.getItem("stylehub_analytics")) || [];
  analytics.push({
    event: eventName,
    data: data,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 100 events
  if (analytics.length > 100) {
    analytics = analytics.slice(-100);
  }

  localStorage.setItem("stylehub_analytics", JSON.stringify(analytics));
}

// Track page views
trackEvent("page_view", {
  page: window.location.pathname,
  referrer: document.referrer,
});

// Track cart events
const originalAddToCart = addToCart;
addToCart = function (productId) {
  originalAddToCart.call(this, productId);
  trackEvent("add_to_cart", { productId: productId });
};

// 35. EXPORT DATA (for debugging)
function exportCartData() {
  const data = {
    cart: cart,
    timestamp: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "stylehub-cart-data.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

// 36. IMPORT DATA (for debugging)
function importCartData(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.cart) {
        cart = data.cart;
        localStorage.setItem("stylehub_cart", JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
        showNotification("Cart data imported successfully!", "success");
      }
    } catch (error) {
      showNotification("Invalid data file", "error");
    }
  };

  reader.readAsText(file);
}

// 37. RESET ALL DATA
function resetAllData() {
  if (
    confirm("Are you sure you want to reset all data? This cannot be undone.")
  ) {
    localStorage.clear();
    cart = [];
    updateCartCount();
    updateCartDisplay();
    showNotification("All data has been reset", "info");
    location.reload();
  }
}

// 38. KEYBOARD SHORTCUTS
document.addEventListener("keydown", function (e) {
  // Ctrl/Cmd + S to save cart
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    exportCartData();
    showNotification("Cart data exported", "success");
  }

  // Escape to close modals
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.active").forEach((modal) => {
      modal.classList.remove("active");
      setTimeout(() => modal.remove(), 300);
    });
  }

  // Space to scroll to top
  if (e.key === " " && e.target === document.body) {
    e.preventDefault();
    scrollToTop();
  }
});

// 39. PRINT FUNCTIONALITY
function printPage() {
  window.print();
}

// 40. SHARE FUNCTIONALITY
function shareProduct(productId) {
  if (navigator.share) {
    navigator.share({
      title: `Product ${productId}`,
      text: "Check out this amazing product!",
      url: window.location.href,
    });
  } else {
    // Fallback: copy to clipboard
    const tempInput = document.createElement("input");
    tempInput.value = `${window.location.origin}/product.html?id=${productId}`;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showNotification("Link copied to clipboard!", "success");
  }
}

// 41. THEME SWITCHER (additional themes)
function switchTheme(themeName) {
  const themes = {
    light: {
      "--primary": "#7c3aed",
      "--background": "#f8fafc",
      "--surface": "#ffffff",
      "--text": "#1e293b",
    },
    dark: {
      "--primary": "#a78bfa",
      "--background": "#0f172a",
      "--surface": "#1e293b",
      "--text": "#f1f5f9",
    },
    blue: {
      "--primary": "#3b82f6",
      "--background": "#eff6ff",
      "--surface": "#ffffff",
      "--text": "#1e3a8a",
    },
    green: {
      "--primary": "#10b981",
      "--background": "#ecfdf5",
      "--surface": "#ffffff",
      "--text": "#065f46",
    },
  };

  const theme = themes[themeName] || themes["light"];

  for (const [property, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(property, value);
  }

  localStorage.setItem("stylehub_theme", themeName);
  showNotification(`Theme switched to ${themeName}`, "success");
}

// 42. LANGUAGE SWITCHER
function switchLanguage(langCode) {
  const translations = {
    en: {
      add_to_cart: "Add to Cart",
      view_details: "View Details",
      cart_empty: "Your cart is empty",
    },
    es: {
      add_to_cart: "Añadir al Carrito",
      view_details: "Ver Detalles",
      cart_empty: "Tu carrito está vacío",
    },
    fr: {
      add_to_cart: "Ajouter au Panier",
      view_details: "Voir Détails",
      cart_empty: "Votre panier est vide",
    },
  };

  const lang = translations[langCode] || translations["en"];

  // Update all translatable elements
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.dataset.translate;
    if (lang[key]) {
      element.textContent = lang[key];
    }
  });

  localStorage.setItem("stylehub_language", langCode);
  showNotification(`Language switched to ${langCode.toUpperCase()}`, "success");
}

// 43. CURRENCY CONVERTER
async function convertCurrency(amount, fromCurrency, toCurrency) {
  // In a real app, use an API like exchangerate-api.com
  const rates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.0,
  };

  const rate = rates[toCurrency] / rates[fromCurrency];
  return amount * rate;
}

// 44. PASSWORD STRENGTH CHECKER
function checkPasswordStrength(password) {
  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety checks
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return {
    score: strength,
    level: strength <= 2 ? "Weak" : strength <= 4 ? "Medium" : "Strong",
  };
}

// 45. FORM VALIDATION
function validateForm(form) {
  const inputs = form.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add("error");

      // Add error message
      if (
        !input.nextElementSibling ||
        !input.nextElementSibling.classList.contains("error-message")
      ) {
        const errorMsg = document.createElement("div");
        errorMsg.className = "error-message";
        errorMsg.textContent = "This field is required";
        input.parentNode.insertBefore(errorMsg, input.nextSibling);
      }
    } else {
      input.classList.remove("error");

      // Remove error message
      const errorMsg = input.nextElementSibling;
      if (errorMsg && errorMsg.classList.contains("error-message")) {
        errorMsg.remove();
      }
    }
  });

  return isValid;
}

// 46. COOKIE CONSENT
function initializeCookieConsent() {
  if (!localStorage.getItem("stylehub_cookies_accepted")) {
    const cookieBanner = document.createElement("div");
    cookieBanner.className = "cookie-banner";
    cookieBanner.innerHTML = `
            <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
            <button class="accept-cookies">Accept</button>
            <button class="reject-cookies">Reject</button>
        `;

    document.body.appendChild(cookieBanner);

    // Accept cookies
    cookieBanner
      .querySelector(".accept-cookies")
      .addEventListener("click", function () {
        localStorage.setItem("stylehub_cookies_accepted", "true");
        cookieBanner.remove();
      });

    // Reject cookies
    cookieBanner
      .querySelector(".reject-cookies")
      .addEventListener("click", function () {
        localStorage.setItem("stylehub_cookies_accepted", "false");
        cookieBanner.remove();
      });
  }
}

// 47. PROGRESS BAR FOR LONG OPERATIONS
function showProgressBar(message) {
  const progressBar = document.createElement("div");
  progressBar.className = "progress-overlay";
  progressBar.innerHTML = `
        <div class="progress-container">
            <p>${message}</p>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
        </div>
    `;

  document.body.appendChild(progressBar);

  return {
    update: (percentage) => {
      const progress = progressBar.querySelector(".progress");
      progress.style.width = `${percentage}%`;
    },
    hide: () => {
      progressBar.remove();
    },
  };
}

// 48. TOOLTIPS
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll("[data-tooltip]");

  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", function () {
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.textContent = this.dataset.tooltip;
      document.body.appendChild(tooltip);

      const rect = this.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top - 10}px`;
      tooltip.style.transform = "translate(-50%, -100%)";

      this.tooltipElement = tooltip;
    });

    element.addEventListener("mouseleave", function () {
      if (this.tooltipElement) {
        this.tooltipElement.remove();
        this.tooltipElement = null;
      }
    });
  });
}

// 49. DRAG AND DROP FOR CART
function initializeDragAndDrop() {
  const cartItems = document.querySelectorAll(".cart-item");

  cartItems.forEach((item) => {
    item.setAttribute("draggable", "true");

    item.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", this.dataset.id);
      this.classList.add("dragging");
    });

    item.addEventListener("dragend", function () {
      this.classList.remove("dragging");
    });
  });

  const cartContainer = document.querySelector(".cart-items-list");
  if (cartContainer) {
    cartContainer.addEventListener("dragover", function (e) {
      e.preventDefault();
      const draggingItem = document.querySelector(".dragging");
      const afterElement = getDragAfterElement(this, e.clientY);

      if (afterElement == null) {
        this.appendChild(draggingItem);
      } else {
        this.insertBefore(draggingItem, afterElement);
      }
    });
  }
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".cart-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// 50. FINAL INITIALIZATION CALL
// This ensures everything runs after the DOM is fully loaded
window.onload = function () {
  checkSession();
  initializePageTransitions();
  initializeCookieConsent();
  initializeTooltips();
  initializeDragAndDrop();

  // Update cart display on page load
  updateCartDisplay();
};
