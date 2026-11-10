(function () {
  'use strict';

  // ===== CONFIGURACIÓN DE WHATSAPP =====
  const WHATSAPP_NUMBER = '51999888777'; // ← CAMBIA por tu número real

  // ===== Datos de productos con imágenes de brookies/postres =====
  const productos = [
    {
      id: 1,
      nombre: 'Chocolate Clásico',
      sabor: 'Sabor intenso a chocolate',
      imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb7_d8oKhxPEvxaP2HQlzNNpD5R-AJgrlkJYOEPfq6X7yIXE6Qr0oaUaQ&s=10',
      color: '#4a2c1a',
      precio: 5.00
    },
    {
      id: 2,
      nombre: 'Blanco con Frutos Rojos',
      sabor: 'Chocolate blanco con frutos rojos',
      imagen: 'https://images.unsplash.com/photo-1551050485-c2a889f3c7ff?w=600&h=400&fit=crop',
      color: '#fce4ec',
      precio: 5.00
    },
    {
      id: 3,
      nombre: 'Caramelo Salado',
      sabor: 'Dulce caramelo con toque salado',
      imagen: 'https://images.unsplash.com/photo-1488460801189-758677385725?w=600&h=400&fit=crop',
      color: '#f4a261',
      precio: 5.00
    },
    {
      id: 4,
      nombre: 'Doble Chocolate',
      sabor: 'Chocolate con chunks de chocolate',
      imagen: 'https://entertainingwithbeth.com/wp-content/uploads/2016/03/EWB194_ChocChunkCookie_VERT.jpg',
      color: '#2b1a13',
      precio: 5.00
    },
    {
      id: 5,
      nombre: 'Vegano / Sin Gluten',
      sabor: 'Opción vegana y sin gluten',
      imagen: 'https://images.unsplash.com/photo-1508403183184-71fe99b91b98?w=600&h=400&fit=crop',
      color: '#2a9d8f',
      precio: 5.00
    },
    {
      id: 6,
      nombre: 'Naranja Cítrico',
      sabor: 'Toque cítrico de naranja',
      imagen: 'https://images.unsplash.com/photo-1579784941543-499827d6142f?w=600&h=400&fit=crop',
      color: '#ff8c42',
      precio: 5.00
    }
  ];

  // ===== Estado del carrito =====
  let carrito = JSON.parse(localStorage.getItem('dulcefusion_carrito')) || [];

  // ===== Elementos del DOM =====
  const productGrid = document.getElementById('product-grid');
  const cartTrigger = document.getElementById('cart-trigger');
  const cartCount = document.getElementById('cart-count');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');
  const cartItems = document.getElementById('cart-items');
  const cartTotalValue = document.getElementById('cart-total');
  const cartClear = document.getElementById('cart-clear');
  const cartCheckout = document.getElementById('cart-checkout');

  const checkoutModal = document.getElementById('checkout-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalItems = document.getElementById('modal-items');
  const modalTotal = document.getElementById('modal-total');
  const checkoutForm = document.getElementById('checkout-form');

  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // ===== Inicialización =====
  function init() {
    renderProductos();
    renderCart();
    updateCartCount();

    cartTrigger.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', closeCart);
    cartClose.addEventListener('click', closeCart);
    cartClear.addEventListener('click', clearCart);
    cartCheckout.addEventListener('click', openCheckout);

    modalOverlay.addEventListener('click', closeCheckout);
    modalClose.addEventListener('click', closeCheckout);
    checkoutForm.addEventListener('submit', handleCheckout);
  }

  // ===== Render productos =====
  function renderProductos() {
    productGrid.innerHTML = productos.map(p => `
      <article class="product-card" style="--product-color:${p.color};">
        <div class="product-image">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
               onerror="this.style.display='none'; this.parentElement.style.background='var(--product-color)'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center'; this.parentElement.style.fontSize='3rem'; this.parentElement.innerHTML='<span style=\"font-size:3rem;\">🍪</span>';">
        </div>
        <h3>${p.nombre}</h3>
        <span class="product-sabor">${p.sabor}</span>
        <span class="product-precio">S/ ${p.precio.toFixed(2)}</span>
        <button class="btn btn-primary" onclick="addToCart(${p.id})">Agregar al carrito</button>
      </article>
    `).join('');
  }

  // ===== Carrito =====
  function addToCart(id) {
    const producto = productos.find(p => p.id === id);
    const existente = carrito.find(item => item.id === id);

    if (existente) {
      existente.qty += 1;
    } else {
      carrito.push({ ...producto, qty: 1 });
    }

    saveCart();
    renderCart();
    updateCartCount();
    showToast(`${producto.nombre} agregado al carrito`);
    toggleCart();
  }

  function changeQty(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      carrito = carrito.filter(i => i.id !== id);
    }
    saveCart();
    renderCart();
    updateCartCount();
  }

  function removeItem(id) {
    carrito = carrito.filter(i => i.id !== id);
    saveCart();
    renderCart();
    updateCartCount();
  }

  function clearCart() {
    carrito = [];
    saveCart();
    renderCart();
    updateCartCount();
    closeCart();
  }

  function saveCart() {
    localStorage.setItem('dulcefusion_carrito', JSON.stringify(carrito));
  }

  function renderCart() {
    if (carrito.length === 0) {
      cartItems.innerHTML = '<p style="color:var(--color-text-muted); text-align:center; padding:20px;">Tu carrito está vacío</p>';
      cartTotalValue.textContent = 'S/ 0.00';
      return;
    }

    cartItems.innerHTML = carrito.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.imagen}" alt="${item.nombre}"
               onerror="this.style.display='none'; this.parentElement.style.background='${item.color}'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center'; this.parentElement.style.fontSize='1.8rem'; this.parentElement.innerHTML='<span style=\"font-size:1.8rem;\">🍪</span>';">
        </div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.nombre}</span>
          <span class="cart-item-sabor">${item.sabor}</span>
          <span class="cart-item-precio">S/ ${item.precio.toFixed(2)} c/u</span>
          <div class="cart-item-qty">
            <button onclick="changeQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${item.id}, 1)">+</button>
            <button class="cart-item-remove" onclick="removeItem(${item.id})">Eliminar</button>
          </div>
        </div>
      </div>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + item.precio * item.qty, 0);
    cartTotalValue.textContent = `S/ ${total.toFixed(2)}`;
  }

  function updateCartCount() {
    const count = carrito.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = count;
  }

  function toggleCart() {
    cartDrawer.classList.toggle('open');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
  }

  // ===== Checkout / Pago =====
  function openCheckout() {
    if (carrito.length === 0) {
      showToast('Tu carrito está vacío');
      return;
    }

    closeCart();
    renderCheckoutItems();
    checkoutModal.classList.add('open');
  }

  function renderCheckoutItems() {
    modalItems.innerHTML = carrito.map(item => `
      <div class="modal-item">
        <span class="modal-item-name">${item.nombre} ×${item.qty}</span>
        <span class="modal-item-precio">S/ ${(item.precio * item.qty).toFixed(2)}</span>
      </div>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + item.precio * item.qty, 0);
    modalTotal.textContent = `S/ ${total.toFixed(2)}`;
  }

  function closeCheckout() {
    checkoutModal.classList.remove('open');
  }

  function handleCheckout(e) {
    e.preventDefault();

    const nombre = document.getElementById('checkout-name').value.trim();
    const telefono = document.getElementById('checkout-phone').value.trim();
    const direccion = document.getElementById('checkout-address').value.trim();

    if (!nombre || !telefono || !direccion) {
      showToast('Por favor completa todos los campos');
      return;
    }

    const total = carrito.reduce((sum, item) => sum + item.precio * item.qty, 0);
    const fecha = new Date().toLocaleString('es-PE');

    let mensaje = `*🍪 Nuevo pedido - Dulce Fusion*\n\n`;
    mensaje += `*Cliente:* ${nombre}\n`;
    mensaje += `*Teléfono:* ${telefono}\n`;
    mensaje += `*Dirección:* ${direccion}\n`;
    mensaje += `*Fecha:* ${fecha}\n\n`;
    mensaje += `*Productos:*\n`;

    carrito.forEach((item, index) => {
      mensaje += `${index + 1}. ${item.nombre} ×${item.qty} - S/ ${(item.precio * item.qty).toFixed(2)}\n`;
    });

    mensaje += `\n*Total: S/ ${total.toFixed(2)}*\n`;
    mensaje += `*Precio unitario: S/ 5.00 c/u*\n`;
    mensaje += `\nGracias por tu compra en Dulce Fusion 🍪✨`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;

    window.open(whatsappUrl, '_blank');

    carrito = [];
    saveCart();
    renderCart();
    updateCartCount();
    checkoutForm.reset();
    closeCheckout();

    showToast(`¡Pedido listo! Se abrió WhatsApp. Total: S/ ${total.toFixed(2)}`);
  }

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  window.addToCart = addToCart;
  window.changeQty = changeQty;
  window.removeItem = removeItem;

  document.addEventListener('DOMContentLoaded', init);

})();