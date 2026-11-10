(function () {
  'use strict';

  // ===== CONFIGURACIÓN DE WHATSAPP =====
  const WHATSAPP_NUMBER = '51999888777'; // ← CAMBIA por tu número real

  // ===== Datos por defecto de productos =====
  const productosPorDefecto = [
    {
      id: 1,
      nombre: 'Chocolate Clásico',
      sabor: 'Sabor intenso a chocolate',
      imagen: '',
      color: '#4a2c1a',
      precio: 5.00
    },
    {
      id: 2,
      nombre: 'Blanco con Frutos Rojos',
      sabor: 'Chocolate blanco con frutos rojos',
      imagen: '',
      color: '#fce4ec',
      precio: 5.00
    },
    {
      id: 3,
      nombre: 'Caramelo Salado',
      sabor: 'Dulce caramelo con toque salado',
      imagen: '',
      color: '#f4a261',
      precio: 5.00
    },
    {
      id: 4,
      nombre: 'Doble Chocolate',
      sabor: 'Chocolate con chunks de chocolate',
      imagen: '',
      color: '#2b1a13',
      precio: 5.00
    },
    {
      id: 5,
      nombre: 'Vegano / Sin Gluten',
      sabor: 'Opción vegana y sin gluten',
      imagen: '',
      color: '#2a9d8f',
      precio: 5.00
    },
    {
      id: 6,
      nombre: 'Naranja Cítrico',
      sabor: 'Toque cítrico de naranja',
      imagen: '',
      color: '#ff8c42',
      precio: 5.00
    }
  ];

  // ===== Cargar configuración guardada o usar por defecto =====
  let productos = cargarConfiguracion();

  function cargarConfiguracion() {
    const guardada = localStorage.getItem('dulcefusion_config');
    if (guardada) {
      try {
        const config = JSON.parse(guardada);
        return productosPorDefecto.map(p => {
          const c = config.find(item => item.id === p.id);
          return c ? { ...p, ...c } : p;
        });
      } catch (e) {
        console.error('Error al cargar configuración:', e);
      }
    }
    return productosPorDefecto.map(p => ({ ...p }));
  }

  function guardarConfiguracion() {
    localStorage.setItem('dulcefusion_config', JSON.stringify(productos));
  }

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

  // ===== Generar SVG de galleta (fallback si no hay imagen) =====
  function generarSVGProducto(color) {
    return `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.2" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="85" fill="${color}" stroke="rgba(0,0,0,0.15)" stroke-width="3"/>
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="4"/>
        <circle cx="70" cy="70" r="6" fill="rgba(0,0,0,0.25)"/>
        <circle cx="130" cy="130" r="5" fill="rgba(0,0,0,0.25)"/>
        <circle cx="110" cy="75" r="4" fill="rgba(0,0,0,0.25)"/>
        <circle cx="85" cy="125" r="5" fill="rgba(0,0,0,0.25)"/>
        <circle cx="125" cy="95" r="4" fill="rgba(0,0,0,0.25)"/>
        <circle cx="75" cy="115" r="4" fill="rgba(0,0,0,0.25)"/>
        <circle cx="50" cy="50" r="3" fill="rgba(255,255,255,0.15)"/>
        <circle cx="150" cy="150" r="3" fill="rgba(255,255,255,0.15)"/>
        <circle cx="60" cy="140" r="2" fill="rgba(255,255,255,0.15)"/>
        <circle cx="140" cy="60" r="2" fill="rgba(255,255,255,0.15)"/>
        <ellipse cx="100" cy="70" rx="40" ry="15" fill="rgba(255,255,255,0.1)"/>
        <rect x="0" y="0" width="200" height="200" fill="url(#grad)"/>
      </svg>
    `;
  }

  // ===== Render productos =====
  function renderProductos() {
    productGrid.innerHTML = productos.map(p => `
      <article class="product-card" style="--product-color:${p.color};">
        <div class="product-image">
          ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='${generarSVGProducto(p.color).replace(/'/g, "\\'")}';">` : generarSVGProducto(p.color)}
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
          ${item.imagen ? `<img src="${item.imagen}" alt="${item.nombre}" onerror="this.style.display='none'; this.parentElement.innerHTML='${generarSVGProducto(item.color).replace(/'/g, "\\'")}';">` : generarSVGProducto(item.color)}
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

  // Exponer funciones globales para uso en HTML (onclick)
  window.addToCart = addToCart;
  window.changeQty = changeQty;
  window.removeItem = removeItem;

  // Exponer productos y guardar para el panel admin
  window.dulcefusion = {
    productos,
    guardarConfiguracion,
    cargarConfiguracion
  };

  document.addEventListener('DOMContentLoaded', init);

})();