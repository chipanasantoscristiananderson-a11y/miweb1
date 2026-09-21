document.addEventListener("DOMContentLoaded", () => {
    const imagenes = document.querySelectorAll(".img-galeria");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const contenedorIndicadores = document.getElementById("indicadores");

    let indiceActual = 0;
    let temporizador;

    // 1. Crear dinámicamente los puntos indicativos en la parte inferior
    imagenes.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => cambiarImagen(index));
        contenedorIndicadores.appendChild(dot);
    });

    const dots = document.querySelectorAll(".dot");

    // 2. Función que alterna la imagen visible
    function cambiarImagen(nuevoIndice) {
        // Ocultar la foto actual y desactivar su punto
        imagenes[indiceActual].classList.remove("active");
        dots[indiceActual].classList.remove("active");

        // Calcular la siguiente foto asegurando un ciclo continuo
        indiceActual = (nuevoIndice + imagenes.length) % imagenes.length;

        // Mostrar la nueva foto y activar su punto
        imagenes[indiceActual].classList.add("active");
        dots[indiceActual].classList.add("active");

        // Reiniciar el contador de 3 segundos
        reiniciarAutoplay();
    }

    function siguienteImagen() {
        cambiarImagen(indiceActual + 1);
    }

    function anteriorImagen() {
        cambiarImagen(indiceActual - 1);
    }

    // 3. Asignar los clics de los botones
    if (btnNext) btnNext.addEventListener("click", siguienteImagen);
    if (btnPrev) btnPrev.addEventListener("click", anteriorImagen);

    // 4. Iniciar pase automático de imágenes cada 3000 ms (3 segundos)
    function iniciarAutoplay() {
        temporizador = setInterval(siguienteImagen, 3000);
    }

    function reiniciarAutoplay() {
        clearInterval(temporizador);
        iniciarAutoplay();
    }

    iniciarAutoplay();
});