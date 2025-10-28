// app.js — versión con cálculo de ganancia (Opción 3)
const STORAGE_KEY = 'inventario_local';

// referencias DOM
const lista = document.getElementById('lista');
const buscar = document.getElementById('buscar');
const ordenar = document.getElementById('ordenar');
const btnAgregarMostrar = document.getElementById('btn-agregar-mostrar');
const form = document.getElementById('form-agregar');
const guardar = document.getElementById('guardar');

// inputs del formulario (agregamos precio_compra)
const inputNombre = document.getElementById('producto');
const inputCategoria = document.getElementById('categoria');
const inputCantidad = document.getElementById('cantidad');
const inputPrecioCompra = document.getElementById('precio_compra'); // <-- nuevo
const inputPrecio = document.getElementById('precio');

// cargar productos desde localStorage (o array vacío)
let productos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// guarda en localStorage
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
}

// función para calcular ganancias
function calcularGanancias(producto) {
  // aseguramos números
  const compra = Number(producto.precio_compra) || 0;
  const venta  = Number(producto.precio) || 0;
  const cantidad = Number(producto.cantidad) || 0;

  const ganancia_unitaria = venta - compra;                    // ganancia por unidad
  const ganancia_total = ganancia_unitaria * cantidad;         // ganancia total por stock
  const margen = compra > 0 ? (ganancia_unitaria / compra) * 100 : null; // margen sobre compra  en %

  return {
    ganancia_unitaria,
    ganancia_total,
    margen // puede ser null si compra = 0
  };
}

// render de tarjetas (muestra ganancias)
function renderCards(items) {
  lista.innerHTML = '';
  if (!items.length) {
    lista.innerHTML = '<p>No hay productos aún.</p>';
    return;
  }
  items.forEach(p => {
    const { ganancia_unitaria, ganancia_total, margen } = calcularGanancias(p);

    const div = document.createElement('div');
    div.className = 'card-product ' + (p.cantidad <= 3 ? 'low' : '');

    // clase para ganancia positiva/negativa
    const claseGan = ganancia_unitaria >= 0 ? 'ganancia positiva' : 'ganancia negativa';

    div.innerHTML = `
      <h3>${escapar(p.nombre)}</h3>
      <p class="categoria">${escapar(p.categoria)}</p>
      <p>Cantidad: ${Number(p.cantidad)}</p>
      <p>Precio venta: S/ ${Number(p.precio).toFixed(2)}</p>
      <p>Precio compra: S/ ${Number(p.precio_compra).toFixed(2)}</p>
      <p class="${claseGan}">Ganancia por unidad: S/ ${ganancia_unitaria.toFixed(2)}</p>
      <p class="detalle-ganancia">Ganancia total (stock): S/ ${ganancia_total.toFixed(2)}${margen !== null ? ' · Margen: ' + margen.toFixed(1) + '%' : ''}</p>
      <div class="actions">
        <button class="editar" data-id="${p.id}">Editar</button>
        <button class="eliminar" data-id="${p.id}">Eliminar</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

// función para escapar texto y evitar inyección básica
function escapar(text) {
  return String(text || '').replace(/[&<>"'`]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'
  }[c]));
}

// actualiza la vista aplicando búsqueda/orden
function refreshView() {
  let items = [...productos];
  const q = (buscar && buscar.value || '').trim().toLowerCase();
  if (q) items = items.filter(p => (p.nombre || '').toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q));
  const ord = (ordenar && ordenar.value) || '';
  if (ord) {
    const [campo, dir] = ord.split('-');
    items.sort((a, b) => dir === 'asc' ? (Number(a[campo]) - Number(b[campo])) : (Number(b[campo]) - Number(a[campo])));
  }
  renderCards(items);
}

// evento mostrar/ocultar formulario
if (btnAgregarMostrar && form) {
  btnAgregarMostrar.addEventListener('click', () => {
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
      inputNombre && inputNombre.focus();
    }
  });
}

// limpiar inputs
function limpiarFormulario() {
  if (inputNombre) inputNombre.value = '';
  if (inputCategoria) inputCategoria.value = '';
  if (inputCantidad) inputCantidad.value = '';
  if (inputPrecioCompra) inputPrecioCompra.value = '';
  if (inputPrecio) inputPrecio.value = '';
}

// evento guardar (agregar nuevo producto)
// ahora guardamos precio_compra también
if (guardar) {
  guardar.addEventListener('click', () => {
    const nombre = (inputNombre && inputNombre.value || '').trim();
    const categoria = (inputCategoria && inputCategoria.value || '').trim();
    const cantidad = Number(inputCantidad && inputCantidad.value);
    const precio_compra = Number(inputPrecioCompra && inputPrecioCompra.value);
    const precio = Number(inputPrecio && inputPrecio.value);

    // validación básica: todos los campos requeridos
    if (!nombre || !categoria || isNaN(cantidad) || isNaN(precio_compra) || isNaN(precio)) {
      return alert('Por favor completa todos los campos (incluye precio de compra y venta).');
    }

    // id único simple
    const id = productos.length ? productos[productos.length - 1].id + 1 : 1;
    const nuevo = { id, nombre, categoria, cantidad, precio_compra, precio };
    productos.push(nuevo);
    save();
    refreshView();
    limpiarFormulario();
    if (form) form.classList.add('hidden');
  });
}

// delegación para editar/eliminar desde las tarjetas
if (lista) {
  lista.addEventListener('click', (e) => {
    const idAttr = e.target.dataset.id;
    if (!idAttr) return;
    const id = Number(idAttr);
    if (e.target.classList.contains('eliminar')) {
      if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
      productos = productos.filter(p => p.id !== id);
      save();
      refreshView();
    } else if (e.target.classList.contains('editar')) {
      const p = productos.find(x => x.id === id);
      if (!p) return;
      // para simplificar editaremos la cantidad; puedes expandir a editar precios si quieres
      const nuevo = prompt('Nueva cantidad para ' + p.nombre, p.cantidad);
      if (nuevo !== null && !isNaN(Number(nuevo))) {
        p.cantidad = Number(nuevo);
        save();
        refreshView();
      }
    }
  });
}

// eventos búsqueda y ordenar
if (buscar) buscar.addEventListener('input', refreshView);
if (ordenar) ordenar.addEventListener('change', refreshView);

// inicializar vista
refreshView();