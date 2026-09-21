/* =========================================================
   VENTAS EN ONLINE — selección de productos y carrito
   Lee la tabla que ya existe en productos.html y construye
   encima: buscador, filtro, selección múltiple y carrito.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const tabla = document.querySelector('table');
    if (!tabla) return;

    const cuerpo = tabla.tBodies[0];
    const filas = Array.from(cuerpo.rows);
    const CLAVE = 'carrito-senati';
    let carrito = cargar();

    /* ---------- 1. Leer los datos de cada fila ---------- */

    const productos = filas.map((fila, i) => {
        const celdas = fila.cells;
        const texto = n => (celdas[n] ? celdas[n].textContent.trim() : '');
        const img = fila.querySelector('img');

        const datos = {
            id: texto(0) || 'P' + i,
            nombre: texto(1),
            marca: texto(2),
            capacidad: texto(3),
            tipo: texto(4),
            precio: leerPrecio(texto(5)),
            imagen: img ? img.getAttribute('src') : ''
        };

        fila.dataset.id = datos.id;
        fila.dataset.busqueda = [datos.id, datos.nombre, datos.marca, datos.capacidad, datos.tipo]
            .join(' ').toLowerCase();
        fila.dataset.tipo = datos.tipo;

        celdas[5].classList.add('precio');
        celdas[5].textContent = soles(datos.precio);
        if (!img && celdas[6]) {
            celdas[6].innerHTML = '<div class="sin-imagen">sin foto</div>';
        }
        return datos;
    });

    const porId = id => productos.find(p => p.id === id);

    /* ---------- 2. Columnas nuevas: selección y agregar ---------- */

    const filaCabecera = tabla.tHead.rows[0];
    filaCabecera.insertAdjacentHTML('afterbegin',
        '<th class="celda-check"><input type="checkbox" id="marcar-todos" title="Seleccionar todo"></th>');
    filaCabecera.insertAdjacentHTML('beforeend', '<th>Acción</th>');

    filas.forEach(fila => {
        const check = fila.insertCell(0);
        check.className = 'celda-check';
        check.innerHTML = '<input type="checkbox" class="check-fila">';

        const accion = fila.insertCell(-1);
        accion.innerHTML = '<button class="boton chico agregar">Agregar</button>';
    });

    /* ---------- 3. Envolver la tabla para el scroll ---------- */

    const envoltura = document.createElement('div');
    envoltura.className = 'tabla-envoltura';
    tabla.parentNode.insertBefore(envoltura, tabla);
    envoltura.appendChild(tabla);

    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.hidden = true;
    vacio.textContent = 'Ningún producto coincide con la búsqueda.';
    envoltura.after(vacio);

    /* ---------- 4. Barra de herramientas ---------- */

    const tipos = [...new Set(productos.map(p => p.tipo))];
    const barra = document.createElement('div');
    barra.className = 'barra';
    barra.innerHTML = `
        <input type="search" id="buscador" placeholder="Buscar por código, marca o capacidad">
        <select id="filtro-tipo">
            <option value="">Todos los tipos</option>
            ${tipos.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <button class="boton" id="agregar-seleccion">Agregar seleccionados</button>
        <span class="conteo" id="conteo"></span>`;
    envoltura.before(barra);

    const buscador = barra.querySelector('#buscador');
    const filtroTipo = barra.querySelector('#filtro-tipo');
    const conteo = barra.querySelector('#conteo');
    const marcarTodos = document.getElementById('marcar-todos');
    const btnSeleccion = barra.querySelector('#agregar-seleccion');

    /* ---------- 5. Panel del carrito ---------- */

    document.body.insertAdjacentHTML('beforeend', `
        <button class="carrito-flotante" id="abrir-carrito" aria-label="Abrir carrito">
            🛒 Carrito <span class="globo" id="globo">0</span>
        </button>
        <div class="velo" id="velo"></div>
        <aside class="carrito" id="carrito" aria-label="Carrito de compras">
            <div class="carrito-cabecera">
                <h2>🛒 Tu carrito</h2>
                <button class="cerrar" id="cerrar-carrito" aria-label="Cerrar">&times;</button>
            </div>
            <div class="carrito-lista" id="lista"></div>
            <div class="carrito-pie">
                <div class="total"><span>Total a pagar</span><span id="total">S/ 0.00</span></div>
                <button class="boton" id="comprar">Finalizar compra</button>
                <button class="boton secundario" id="vaciar">Vaciar carrito</button>
            </div>
        </aside>
        <div class="aviso" id="aviso" role="status" aria-live="polite"></div>`);

    const panel = document.getElementById('carrito');
    const velo = document.getElementById('velo');
    const lista = document.getElementById('lista');
    const globo = document.getElementById('globo');
    const totalTxt = document.getElementById('total');
    const aviso = document.getElementById('aviso');

    /* ---------- 6. Selección de filas ---------- */

    cuerpo.addEventListener('click', e => {
        const fila = e.target.closest('tr');
        if (!fila) return;

        if (e.target.classList.contains('agregar')) {
            agregar(fila.dataset.id, 1);
            return;
        }
        if (e.target.classList.contains('check-fila')) {
            fila.classList.toggle('seleccionada', e.target.checked);
            actualizarConteo();
            return;
        }
        const check = fila.querySelector('.check-fila');
        check.checked = !check.checked;
        fila.classList.toggle('seleccionada', check.checked);
        actualizarConteo();
    });

    marcarTodos.addEventListener('change', () => {
        filas.forEach(fila => {
            if (fila.classList.contains('oculta')) return;
            fila.querySelector('.check-fila').checked = marcarTodos.checked;
            fila.classList.toggle('seleccionada', marcarTodos.checked);
        });
        actualizarConteo();
    });

    btnSeleccion.addEventListener('click', () => {
        const elegidas = filas.filter(f => f.classList.contains('seleccionada'));
        if (!elegidas.length) return mostrarAviso('Marca al menos un producto');
        elegidas.forEach(f => agregar(f.dataset.id, 1, true));
        mostrarAviso(`${elegidas.length} producto(s) agregado(s)`);
        pintarCarrito();
    });

    function actualizarConteo() {
        const n = filas.filter(f => f.classList.contains('seleccionada')).length;
        conteo.textContent = n ? `${n} seleccionado(s)` : `${visibles()} productos`;
        btnSeleccion.disabled = n === 0;
    }

    /* ---------- 7. Buscador y filtro ---------- */

    function filtrar() {
        const texto = buscador.value.trim().toLowerCase();
        const tipo = filtroTipo.value;

        filas.forEach(fila => {
            const coincide = fila.dataset.busqueda.includes(texto) &&
                             (!tipo || fila.dataset.tipo === tipo);
            fila.classList.toggle('oculta', !coincide);
            if (!coincide) {
                fila.classList.remove('seleccionada');
                fila.querySelector('.check-fila').checked = false;
            }
        });
        vacio.hidden = visibles() > 0;
        marcarTodos.checked = false;
        actualizarConteo();
    }

    const visibles = () => filas.filter(f => !f.classList.contains('oculta')).length;

    buscador.addEventListener('input', filtrar);
    filtroTipo.addEventListener('change', filtrar);

    /* ---------- 8. Menú superior ---------- */

    document.querySelectorAll('.menu li').forEach((li, i) => {
        if (i === 0) li.classList.add('activo');
        li.addEventListener('click', () => {
            document.querySelectorAll('.menu li').forEach(o => o.classList.remove('activo'));
            li.classList.add('activo');
        });
    });

    /* ---------- 9. Lógica del carrito ---------- */

    function agregar(id, cantidad = 1, silencioso = false) {
        const producto = porId(id);
        if (!producto) return;

        const linea = carrito.find(l => l.id === id);
        if (linea) linea.cantidad += cantidad;
        else carrito.push({ id, cantidad });

        guardar();
        if (!silencioso) {
            pintarCarrito();
            mostrarAviso(`${producto.nombre} · ${producto.marca} agregado`);
        }
    }

    function cambiarCantidad(id, delta) {
        const linea = carrito.find(l => l.id === id);
        if (!linea) return;
        linea.cantidad += delta;
        if (linea.cantidad < 1) carrito = carrito.filter(l => l.id !== id);
        guardar();
        pintarCarrito();
    }

    function quitar(id) {
        carrito = carrito.filter(l => l.id !== id);
        guardar();
        pintarCarrito();
    }

    function pintarCarrito() {
        const unidades = carrito.reduce((s, l) => s + l.cantidad, 0);
        globo.textContent = unidades;

        if (!carrito.length) {
            lista.innerHTML = '<p class="carrito-vacio">Todavía no agregas productos.<br>Elige uno de la tabla para empezar.</p>';
        } else {
            lista.innerHTML = carrito.map(linea => {
                const p = porId(linea.id);
                const foto = p.imagen
                    ? `<img src="${p.imagen}" alt="">`
                    : '<div class="sin-imagen">sin foto</div>';
                return `
                <article class="item">
                    ${foto}
                    <div class="info">
                        <h3>${p.nombre}</h3>
                        <p>${p.marca} · ${p.capacidad} · ${p.tipo}</p>
                        <p>${soles(p.precio * linea.cantidad)}</p>
                        <button class="quitar" data-quitar="${p.id}">Quitar</button>
                    </div>
                    <div class="cantidad">
                        <button data-menos="${p.id}" aria-label="Quitar una unidad">−</button>
                        <span>${linea.cantidad}</span>
                        <button data-mas="${p.id}" aria-label="Agregar una unidad">+</button>
                    </div>
                </article>`;
            }).join('');
        }

        const total = carrito.reduce((s, l) => s + porId(l.id).precio * l.cantidad, 0);
        totalTxt.textContent = soles(total);
        document.getElementById('comprar').disabled = carrito.length === 0;
    }

    lista.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.mas)    cambiarCantidad(b.dataset.mas, 1);
        if (b.dataset.menos)  cambiarCantidad(b.dataset.menos, -1);
        if (b.dataset.quitar) quitar(b.dataset.quitar);
    });

    document.getElementById('vaciar').addEventListener('click', () => {
        if (!carrito.length) return;
        carrito = [];
        guardar();
        pintarCarrito();
        mostrarAviso('Carrito vacío');
    });

    document.getElementById('comprar').addEventListener('click', () => {
        const unidades = carrito.reduce((s, l) => s + l.cantidad, 0);
        const total = carrito.reduce((s, l) => s + porId(l.id).precio * l.cantidad, 0);
        mostrarAviso(`Compra registrada: ${unidades} producto(s) por ${soles(total)}`);
        carrito = [];
        guardar();
        pintarCarrito();
        cerrar();
    });

    /* ---------- 10. Abrir / cerrar el panel ---------- */

    const abrir = () => { panel.classList.add('abierto'); velo.classList.add('abierto'); };
    const cerrar = () => { panel.classList.remove('abierto'); velo.classList.remove('abierto'); };

    document.getElementById('abrir-carrito').addEventListener('click', abrir);
    document.getElementById('cerrar-carrito').addEventListener('click', cerrar);
    velo.addEventListener('click', cerrar);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

    /* ---------- 11. Utilidades ---------- */

    let temporizador;
    function mostrarAviso(mensaje) {
        aviso.textContent = mensaje;
        aviso.classList.add('visible');
        clearTimeout(temporizador);
        temporizador = setTimeout(() => aviso.classList.remove('visible'), 2600);
    }

    // Convierte "S/. 1000", "S/ 1,299.50" o "1.299,50" en un número real.
    function leerPrecio(texto) {
        let limpio = texto
            .replace(/s\s*\/\s*\.?/i, '')   // quita el símbolo S/. sin comerse el decimal
            .replace(/[^\d.,]/g, '')
            .trim();

        const coma = limpio.lastIndexOf(',');
        const punto = limpio.lastIndexOf('.');

        if (coma > punto) {
            // formato 1.299,50 → la coma es el decimal
            limpio = limpio.replace(/\./g, '').replace(',', '.');
        } else {
            // formato 1,299.50 → la coma es separador de miles
            limpio = limpio.replace(/,/g, '');
        }

        const valor = parseFloat(limpio);
        return Number.isFinite(valor) ? valor : 0;
    }

    function soles(n) {
        return 'S/ ' + n.toLocaleString('es-PE', {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        });
    }

    function guardar() {
        try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (e) { /* sin almacenamiento */ }
    }

    function cargar() {
        try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; }
    }

    /* ---------- 12. Arranque ---------- */

    carrito = carrito.filter(l => productos.some(p => p.id === l.id));
    pintarCarrito();
    actualizarConteo();
});