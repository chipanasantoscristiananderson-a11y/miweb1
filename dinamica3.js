/* ==========================================================
   Sucursales Lima y Callao - interacción
   - Tarjetas y botones controlan el mapa
   - Animación de entrada de las tarjetas al hacer scroll
   - Barra de progreso en la cabecera
   ========================================================== */

// Avisa al CSS que JavaScript funciona (activa la animación de entrada)
document.documentElement.classList.add("js");

const mapa = document.getElementById("mapa");
const botones = Array.from(document.querySelectorAll(".botones-mapa button"));
const tarjetas = Array.from(document.querySelectorAll(".nieto"));
const cabecera = document.querySelector("header");
const panelMapa = document.querySelector(".hijo2");

const esMovil = window.matchMedia("(max-width: 900px)");
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

let actual = -1; // índice de la sucursal seleccionada

function comportamientoScroll() {
    return reducirMovimiento.matches ? "auto" : "smooth";
}

/* ---------- Seleccionar una sucursal ---------- */
function seleccionar(indice, desplazarAlMapa) {
    if (indice !== actual) {
        const lugar = botones[indice].dataset.lugar;

        tarjetas.forEach(function (tarjeta, i) {
            const activa = i === indice;
            tarjeta.classList.toggle("activa", activa);
            tarjeta.setAttribute("aria-pressed", activa);
        });

        botones.forEach(function (boton, i) {
            boton.setAttribute("aria-pressed", i === indice);
        });

        // La primera vez el mapa ya viene cargado desde el HTML
        if (actual !== -1) {
            mapa.classList.add("cargando");
            mapa.src = "https://www.google.com/maps?q=" + lugar + "&output=embed";
        }

        actual = indice;
    }

    // En celular el mapa está arriba: llevamos a la persona hacia él
    if (desplazarAlMapa && esMovil.matches) {
        panelMapa.scrollIntoView({ behavior: comportamientoScroll(), block: "start" });
    }
}

// Cuando el mapa termina de cargar, vuelve a verse normal
mapa.addEventListener("load", function () {
    mapa.classList.remove("cargando");
});

/* ---------- Tarjetas ---------- */
tarjetas.forEach(function (tarjeta, i) {
    if (!botones[i]) return;

    // Hacemos que la tarjeta se pueda usar con teclado
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute("role", "button");
    tarjeta.setAttribute("aria-pressed", "false");

    // Retraso escalonado para la animación de entrada
    tarjeta.style.setProperty("--retraso", i * 80 + "ms");

    tarjeta.addEventListener("click", function () {
        seleccionar(i, true);
    });

    tarjeta.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            seleccionar(i, true);
        } else if (evento.key === "ArrowDown" && tarjetas[i + 1]) {
            evento.preventDefault();
            tarjetas[i + 1].focus();
        } else if (evento.key === "ArrowUp" && tarjetas[i - 1]) {
            evento.preventDefault();
            tarjetas[i - 1].focus();
        }
    });
});

/* ---------- Botones del mapa ---------- */
botones.forEach(function (boton, i) {
    boton.setAttribute("aria-pressed", "false");

    boton.addEventListener("click", function () {
        seleccionar(i, false);

        // En escritorio, mostramos también la tarjeta correspondiente
        if (!esMovil.matches && tarjetas[i]) {
            tarjetas[i].scrollIntoView({ behavior: comportamientoScroll(), block: "nearest" });
        }
    });
});

/* ---------- Animación de entrada al hacer scroll ---------- */
if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
        function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible");
                    observador.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    tarjetas.forEach(function (tarjeta) {
        observador.observe(tarjeta);
    });
} else {
    // Navegadores muy viejos: mostramos todo sin animar
    tarjetas.forEach(function (tarjeta) {
        tarjeta.classList.add("visible");
    });
}

/* ---------- Cabecera: sombra y barra de progreso ---------- */
function actualizarCabecera() {
    const maximo = document.documentElement.scrollHeight - window.innerHeight;
    const progreso = maximo > 0 ? (window.scrollY / maximo) * 100 : 0;

    cabecera.style.setProperty("--progreso", progreso + "%");
    cabecera.classList.toggle("scrolled", window.scrollY > 8);
}

window.addEventListener("scroll", actualizarCabecera, { passive: true });
window.addEventListener("resize", actualizarCabecera);

/* ---------- Inicio ---------- */
actualizarCabecera();
seleccionar(0, false);