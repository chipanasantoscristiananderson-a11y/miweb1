/* =================================
MODO OSCURO
================================= */

const raiz = document.documentElement;
const botonModo = document.getElementById("btnModo");

botonModo.addEventListener("click", function () {
    if (raiz.getAttribute("data-theme") === "dark") {
        raiz.setAttribute("data-theme", "light");
    } else {
        raiz.setAttribute("data-theme", "dark");
    }

    // Guarda la elección para la próxima vez que abra la página
    localStorage.setItem("tema", raiz.getAttribute("data-theme"));
});


/* =================================
FUNCIÓN PARA MOSTRAR UN MENSAJE
(los botones la llaman con onclick="mostrarMensaje()")
================================= */

const aviso = document.getElementById("aviso");
let temporizador;

function mostrarMensaje() {
    aviso.textContent =
        "Gracias por tu interés. Pronto nos pondremos en contacto contigo.";

    aviso.classList.add("visible");

    // Si se presiona otra vez, reinicia el tiempo de espera
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
        aviso.classList.remove("visible");
    }, 3500);

}

// Muestra u oculta el formulario de contacto
function mostrarFormulario() {
    const caja = document.getElementById("cajaFormulario");

    if (caja.style.display === "none") {
        caja.style.display = "block"; // lo muestra
    } else {
        caja.style.display = "none"; // lo oculta
    }
}


document.getElementById("btnMarketing").addEventListener("click", function () {
    window.location.href = "marketing.html";
});
