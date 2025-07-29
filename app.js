// --- Product Data (Simulated) ---
const products = [
    { id: 1, name: "Wireless Headphones", price: 79.99, image: "https://placehold.co/300x200/4a4a4a/ffffff?text=Headphones" },
    { id: 2, name: "Smartwatch Pro", price: 199.99, image: "https://placehold.co/300x200/4a4a4a/ffffff?text=Smartwatch" },
    { id: 3, name: "Portable Bluetooth Speaker", price: 49.99, image: "https://placehold.co/300x200/4a4a4a/ffffff?text=Speaker" },
    { id: 4, name: "Gaming Mouse RGB", price: 34.99, image: "https://placehold.co/300x200/4a4a4a/ffffff?text=Gaming+Mouse" },
    { id: 5, name: "USB-C Hub 7-in-1", price: 59.99, image: "https://placehold.co/300x200/4a4a4a/ffffff?text=USB-C+Hub" },
    { id: 6, name: "Ergonomic Keyboard", price: 89.99, image: "https://placehold.co/300x200/4a4a4a/ffffff?text=Keyboard" }
];

// --- DOM Elements ---
const productGrid = document.querySelector('.product-grid');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const emptyCartMessage = document.getElementById('empty-cart-message');
const notifyButton = document.getElementById('notify-btn');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// --- Cart State (using Local Storage for persistence) ---
let cart = JSON.parse(localStorage.getItem('ecommerce_cart')) || [];

// --- Functions ---

/**
 * Renders all products to the product grid.
 */
function renderProducts() {
    productGrid.innerHTML = ''; // Clear existing products
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>High-quality, durable, and stylish.</p>
                <span class="product-price">$${product.price.toFixed(2)}</span>
                <button class="button add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = parseInt(event.target.dataset.id);
            addToCart(productId);
        });
    });
}

/**
 * Adds a product to the cart.
 * @param {number} productId - The ID of the product to add.
 */
function addToCart(productId) {
    const productToAdd = products.find(p => p.id === productId);
    if (productToAdd) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        updateCartDisplay();
        saveCart();
        showNotification(`Added ${productToAdd.name} to cart!`, 'success');
    }
}

/**
 * Removes a product from the cart or decreases its quantity.
 * @param {number} productId - The ID of the product to remove.
 * @param {boolean} removeAll - If true, removes all instances of the product.
 */
function removeFromCart(productId, removeAll = false) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        if (removeAll || cart[itemIndex].quantity <= 1) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity--;
        }
        updateCartDisplay();
        saveCart();
        const productName = products.find(p => p.id === productId)?.name || 'Item';
        showNotification(`${removeAll ? 'Removed all' : 'Decreased quantity of'} ${productName}.`, 'info');
    }
}

/**
 * Updates the cart display (items, count, total).
 */
function updateCartDisplay() {
    cartItemsContainer.innerHTML = ''; // Clear existing cart items
    let total = 0;

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
    } else {
        emptyCartMessage.classList.add('hidden');
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button data-id="${item.id}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button data-id="${item.id}" data-action="increase">+</button>
                    <button data-id="${item.id}" data-action="remove-all">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
            total += item.price * item.quantity;
        });

        // Add event listeners for cart item actions
        cartItemsContainer.querySelectorAll('.cart-item-actions button').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                const action = event.target.dataset.action;
                if (action === 'increase') {
                    addToCart(productId);
                } else if (action === 'decrease') {
                    removeFromCart(productId);
                } else if (action === 'remove-all') {
                    removeFromCart(productId, true);
                }
            });
        });
    }

    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartTotalSpan.textContent = total.toFixed(2);
}

/**
 * Saves the current cart state to Local Storage.
 */
function saveCart() {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
}

/**
 * Displays a temporary message box.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'info' for styling.
 */
function showNotification(message, type = 'info') {
    const notificationBox = document.createElement('div');
    notificationBox.classList.add('notification-box');
    notificationBox.textContent = message;

    // Basic styling for the notification box
    notificationBox.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${type === 'success' ? 'hsl(120, 60%, 40%)' : 'hsl(210, 80%, 55%)'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
        font-family: var(--font-body);
        font-size: 1rem;
        text-align: center;
    `;

    document.body.appendChild(notificationBox);

    // Animate in
    setTimeout(() => {
        notificationBox.style.opacity = '1';
        notificationBox.style.transform = 'translateX(-50%) translateY(-10px)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        notificationBox.style.opacity = '0';
        notificationBox.style.transform = 'translateX(-50%) translateY(20px)';
        notificationBox.addEventListener('transitionend', () => {
            notificationBox.remove();
        });
    }, 3000); // Notification disappears after 3 seconds
}


// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// --- Push Notifications (Client-side) ---
notifyButton.addEventListener('click', () => {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('Notifications enabled!', 'success');
                // You can now subscribe the user to push notifications
                // This typically involves sending a Subscription object to your backend
                // For this demo, we'll just show a local notification
                if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                    navigator.serviceWorker.ready.then(swRegistration => {
                        swRegistration.showNotification('Welcome to E-Shop PWA!', {
                            body: 'You will receive updates on new products and offers!',
                            icon: 'icons/icon-192x192.png',
                            badge: 'icons/icon-72x72.png',
                            vibrate: [200, 100, 200],
                            data: {
                                url: window.location.origin // Open the app when clicked
                            }
                        });
                    });
                } else {
                    new Notification('Welcome to E-Shop PWA!', {
                        body: 'You will receive updates on new products and offers!',
                        icon: 'icons/icon-192x192.png'
                    });
                }
            } else {
                showNotification('Notification permission denied.', 'info');
            }
        });
    } else {
        showNotification('Your browser does not support notifications.', 'info');
    }
});

// --- Navigation Logic ---
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetSectionId = event.target.dataset.section;

        // Remove active class from all links and sections
        navLinks.forEach(nav => nav.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        // Add active class to clicked link and target section
        event.target.classList.add('active');
        document.getElementById(targetSectionId).classList.add('active');

        // If navigating to cart, update cart display
        if (targetSectionId === 'cart') {
            updateCartDisplay();
        }
    });
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartDisplay(); // Initialize cart display on load
});
