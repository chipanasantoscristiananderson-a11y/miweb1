// =========================================================
// El Marketing Digital — interacciones
// 1) Botón flotante de inicio
// 2) Aparición animada de cada sección al hacer scroll
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  crearBotonInicio();
  activarAnimacionDeScroll();
  activarLightbox();
  crearBotonesScroll();
});

/**
 * Crea un botón circular fijo en la esquina inferior derecha
 * que lleva a index.html. Si ya estamos en index.html,
 * el botón simplemente sube al inicio de la página.
 */
function crearBotonInicio() {
  const boton = document.createElement("a");
  boton.className = "boton-inicio";
  boton.setAttribute("aria-label", "Ir al inicio");
  boton.setAttribute("title", "Inicio");
  boton.innerHTML = "&#8962;"; // ícono de casa (sin dependencias externas)

  const enPaginaInicio = /(^|\/)index\.html?$/i.test(window.location.pathname) ||
    window.location.pathname === "/" ;

  if (enPaginaInicio) {
    boton.href = "#";
    boton.addEventListener("click", (evento) => {
      evento.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  } else {
    boton.href = "index.html";
  }

  document.body.appendChild(boton);
}

/**
 * Al hacer clic en cualquier imagen de una tarjeta ".nieto",
 * la muestra completa (sin recortar) en una capa oscura encima
 * de la página, con scroll si la imagen no cabe en pantalla.
 */
function activarLightbox() {
  const imagenes = document.querySelectorAll(".nieto img");
  if (imagenes.length === 0) return;

  imagenes.forEach((imagen) => {
    imagen.style.cursor = "zoom-in";
    imagen.addEventListener("click", () => abrirLightbox(imagen.src, imagen.alt));
  });
}

function abrirLightbox(src, alt) {
  const overlay = document.createElement("div");
  overlay.className = "lightbox";

  const imagenGrande = document.createElement("img");
  imagenGrande.src = src;
  imagenGrande.alt = alt || "";

  const botonCerrar = document.createElement("button");
  botonCerrar.className = "lightbox-cerrar";
  botonCerrar.setAttribute("aria-label", "Cerrar imagen");
  botonCerrar.innerHTML = "&times;";

  const cerrar = () => overlay.remove();

  overlay.addEventListener("click", (evento) => {
    if (evento.target === overlay) cerrar();
  });
  botonCerrar.addEventListener("click", cerrar);

  document.addEventListener("keydown", function escape(evento) {
    if (evento.key === "Escape") {
      cerrar();
      document.removeEventListener("keydown", escape);
    }
  });

  overlay.appendChild(imagenGrande);
  overlay.appendChild(botonCerrar);
  document.body.appendChild(overlay);
}

/**
 * Crea dos botones flotantes (esquina inferior izquierda) para
 * desplazarse suavemente al inicio o al final de la página.
 */
function crearBotonesScroll() {
  const contenedor = document.createElement("div");
  contenedor.className = "botones-scroll";

  const botonSubir = document.createElement("button");
  botonSubir.type = "button";
  botonSubir.setAttribute("aria-label", "Subir al inicio de la página");
  botonSubir.innerHTML = "&uarr;";
  botonSubir.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const botonBajar = document.createElement("button");
  botonBajar.type = "button";
  botonBajar.setAttribute("aria-label", "Bajar al final de la página");
  botonBajar.innerHTML = "&darr;";
  botonBajar.addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  contenedor.appendChild(botonSubir);
  contenedor.appendChild(botonBajar);
  document.body.appendChild(contenedor);
}
function activarAnimacionDeScroll() {
  const secciones = document.querySelectorAll(".nieto");

  if (!("IntersectionObserver" in window) || secciones.length === 0) {
    secciones.forEach((seccion) => seccion.classList.add("visible"));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  secciones.forEach((seccion) => observador.observe(seccion));
}