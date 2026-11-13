// --- 1. EFECTO 3D INTERACTIVO EN EL SOBRE ---
const cartaSobre = document.getElementById("invitationLetter");
if (cartaSobre) {
    cartaSobre.addEventListener("mousemove", (e) => {
        const rect = cartaSobre.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        cartaSobre.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    cartaSobre.addEventListener("mouseleave", () => {
        cartaSobre.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
}

// --- 2. APERTURA DEL SOBRE Y MÚSICA ---
function abrirInvitacion() {
    const overlay = document.getElementById("overlay");
    const seal = document.getElementById("openInvitation");
    const contenido = document.getElementById("contenido");
    const hero = document.querySelector(".hero");
    const musica = document.getElementById("musica");

    seal.classList.add("broken");
    lanzarDestellosApertura();

    setTimeout(() => {
        overlay.classList.add("opening");
    }, 220);

    setTimeout(() => {
        overlay.style.display = "none";
        contenido.style.display = "block";
        hero.classList.add("hero-visible");

        musica.play()
            .then(() => actualizarEstadoVisualMusica(true))
            .catch(() => actualizarEstadoVisualMusica(false));

        iniciarPetalos();
        actualizarAlHacerScroll();
    }, 1250);
}

// --- 3. REPRODUCTORES SINCRONIZADOS CON ECUALIZADOR Y ANIMACIÓN ---
const audio = document.getElementById("musica");
const discoPrincipal = document.getElementById("vinyl");
const reproductorPrincipal = document.getElementById("musicPlayer");
const floatingPlayer = document.getElementById("floatingPlayer");
const floatingVinyl = document.getElementById("floatingVinyl");
const heroEq = document.getElementById("heroEq");
const floatingEq = document.getElementById("floatingEq");
const floatingStatus = document.getElementById("floatingStatus");

function actualizarEstadoVisualMusica(reproduciendo) {
    if (reproduciendo) {
        discoPrincipal.classList.add("spinning");
        floatingVinyl.classList.add("spinning");
        reproductorPrincipal.classList.add("playing");
        floatingPlayer.classList.add("is-playing");
        if (heroEq) heroEq.classList.add("active");
        if (floatingEq) floatingEq.classList.add("active");
        if (floatingStatus) floatingStatus.innerText = "Sonando ahora";
    } else {
        discoPrincipal.classList.remove("spinning");
        floatingVinyl.classList.remove("spinning");
        reproductorPrincipal.classList.remove("playing");
        floatingPlayer.classList.remove("is-playing");
        if (heroEq) heroEq.classList.remove("active");
        if (floatingEq) floatingEq.classList.remove("active");
        if (floatingStatus) floatingStatus.innerText = "En pausa · Tocar";
    }
}

function alternarMusica() {
    if (audio.paused) {
        audio.play().then(() => actualizarEstadoVisualMusica(true));
    } else {
        audio.pause();
        actualizarEstadoVisualMusica(false);
    }
}

reproductorPrincipal.onclick = alternarMusica;
floatingPlayer.onclick = alternarMusica;

// --- 4. SCROLL: BARRA SUPERIOR, REPRODUCTOR FLOTANTE, PARALLAX Y CRONOGRAMA ---
function actualizarAlHacerScroll() {
    const scrollY = window.scrollY;
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progreso = scrollTotal > 0 ? (scrollY / scrollTotal) * 100 : 0;

    // Barra de progreso superior
    const barra = document.getElementById("scrollProgress");
    if (barra) barra.style.width = `${progreso}%`;

    // Estilo dinámico de la barra de navegación
    const topbar = document.getElementById("topbar");
    if (topbar) {
        topbar.classList.toggle("scrolled", scrollY > 60);
    }

    // Parallax suave en la foto de portada
    const heroBg = document.getElementById("heroBg");
    if (heroBg && scrollY < window.innerHeight * 1.2) {
        heroBg.style.transform = `translateY(${scrollY * 0.25}px) scale(1.05)`;
    }

    // Mostrar u ocultar reproductor flotante
    const overlay = document.getElementById("overlay");
    if (overlay.style.display === "none" && scrollY > 250) {
        floatingPlayer.classList.add("show");
    } else {
        floatingPlayer.classList.remove("show");
    }

    // Progreso dinámico de la línea del cronograma
    const timelineWrapper = document.getElementById("timelineWrapper");
    const timelineLine = document.getElementById("timelineLine");
    if (timelineWrapper && timelineLine) {
        const rect = timelineWrapper.getBoundingClientRect();
        const centroPantalla = window.innerHeight * 0.65;
        const avance = Math.min(Math.max((centroPantalla - rect.top) / rect.height, 0), 1);
        timelineLine.style.height = `${avance * 100}%`;

        // Iluminar cada evento al alcanzarlo
        const entradas = timelineWrapper.querySelectorAll(".timeline-entry");
        entradas.forEach((entrada) => {
            const entradaRect = entrada.getBoundingClientRect();
            if (entradaRect.top < centroPantalla) {
                entrada.classList.add("lit");
            } else {
                entrada.classList.remove("lit");
            }
        });
    }

    revelarAlHacerScroll();
}

window.addEventListener("scroll", actualizarAlHacerScroll, { passive: true });

// --- 5. GALERÍA Y VISOR DE FOTOS PROFESIONAL (LIGHTBOX + SWIPE + TECLADO) ---
let fotosGaleria = [];
let indiceFotoActual = 0;

function inicializarGaleria() {
    const items = document.querySelectorAll("#photoGallery .gallery-item");
    const dotsContainer = document.getElementById("lightboxDots");
    if (!items.length || !dotsContainer) return;

    fotosGaleria = Array.from(items).map((item) => ({
        src: item.querySelector("img").src,
        caption: item.querySelector(".gallery-caption span")?.innerText || ""
    }));

    dotsContainer.innerHTML = "";
    fotosGaleria.forEach((_, idx) => {
        const dot = document.createElement("span");
        dot.className = "lightbox-dot";
        dot.onclick = (e) => {
            e.stopPropagation();
            mostrarFotoEnIndice(idx);
        };
        dotsContainer.appendChild(dot);
    });
}

function mostrarFotoEnIndice(indice) {
    if (!fotosGaleria.length) inicializarGaleria();

    indiceFotoActual = (indice + fotosGaleria.length) % fotosGaleria.length;
    const foto = fotosGaleria[indiceFotoActual];

    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxCounter = document.getElementById("lightboxCounter");
    const dots = document.querySelectorAll(".lightbox-dot");

    lightboxImg.classList.add("switching");

    setTimeout(() => {
        lightboxImg.src = foto.src;
        lightboxCaption.innerText = foto.caption;
        lightboxCounter.innerText = `${indiceFotoActual + 1} / ${fotosGaleria.length}`;

        dots.forEach((d, i) => d.classList.toggle("active", i === indiceFotoActual));
        lightboxImg.classList.remove("switching");
    }, 150);
}

function abrirFoto(indice) {
    if (!fotosGaleria.length) inicializarGaleria();
    const lightbox = document.getElementById("lightbox");
    mostrarFotoEnIndice(indice);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
}

function cambiarFoto(direccion) {
    mostrarFotoEnIndice(indiceFotoActual + direccion);
}

function cerrarFoto() {
    document.getElementById("lightbox").classList.remove("open");
    document.body.style.overflow = "";
}

function cerrarFotoDesdeFondo(event) {
    if (event.target.id === "lightbox" || event.target.id === "lightboxStage") {
        cerrarFoto();
    }
}

// Navegación por teclado en Lightbox
document.addEventListener("keydown", (e) => {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox || !lightbox.classList.contains("open")) return;

    if (e.key === "Escape") cerrarFoto();
    if (e.key === "ArrowRight") cambiarFoto(1);
    if (e.key === "ArrowLeft") cambiarFoto(-1);
});

// Navegación táctil (deslizar con el dedo en celulares)
const lightboxStage = document.getElementById("lightboxStage");
let touchStartX = 0;
if (lightboxStage) {
    lightboxStage.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxStage.addEventListener("touchend", (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 45) {
            cambiarFoto(diff > 0 ? 1 : -1);
        }
    }, { passive: true });
}

inicializarGaleria();

// --- 6. ANIMACIÓN SUAVE EN CASCADA AL HACER SCROLL ---
function revelarAlHacerScroll() {
    const elementos = document.querySelectorAll(".reveal");
    const alturaVentana = window.innerHeight;

    elementos.forEach((el) => {
        const distanciaTop = el.getBoundingClientRect().top;
        if (distanciaTop < alturaVentana - 65) {
            el.classList.add("active");
        }
    });
}

// --- 7. CUENTA REGRESIVA CON LATIDO EN SEGUNDOS ---
const fechaEvento = new Date("November 28, 2026 18:00:00").getTime();

function actualizarCuentaRegresiva() {
    const ahora = new Date().getTime();
    const diferencia = fechaEvento - ahora;

    if (diferencia < 0) return;

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = String(dias).padStart(2, '0');
    document.getElementById("hours").innerText = String(horas).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutos).padStart(2, '0');

    const secEl = document.getElementById("seconds");
    secEl.innerText = String(segundos).padStart(2, '0');
    secEl.classList.add("tick-pulse");
    setTimeout(() => secEl.classList.remove("tick-pulse"), 200);
}

setInterval(actualizarCuentaRegresiva, 1000);
actualizarCuentaRegresiva();

// --- 8. COPIAR ALIAS CON TOAST DE CONFIRMACIÓN ---
function copyAlias() {
    const aliasText = document.getElementById("aliasText").innerText;
    const btn = document.getElementById("copyBtn");
    const toast = document.getElementById("luxuryToast");

    navigator.clipboard.writeText(aliasText).then(() => {
        const textoOriginal = btn.innerText;
        btn.innerText = "¡Alias Copiado! ✓";
        btn.style.background = "#6F7B4D";

        if (toast) toast.classList.add("visible");

        setTimeout(() => {
            btn.innerText = textoOriginal;
            btn.style.background = "";
            if (toast) toast.classList.remove("visible");
        }, 2500);
    });
}

// --- 9. ENVÍO DE CONFIRMACIÓN POR WHATSAPP ---
function enviarWhatsApp(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const cantidad = document.getElementById("cantidad").value;
    const mensaje = document.getElementById("mensaje").value.trim();

    const numeroWhatsApp = "5493435097919";

    let texto = `¡Hola! Confirmo mi asistencia a la Boda Civil de Kevin y Luciana.%0A%0A`;
    texto += `*Nombre:* ${nombre}%0A`;
    texto += `*Teléfono:* ${telefono}%0A`;
    texto += `*Cantidad de personas:* ${cantidad}`;
    if (mensaje) {
        texto += `%0A*Mensaje:* ${mensaje}`;
    }

    window.open(`https://wa.me/${numeroWhatsApp}?text=${texto}`, '_blank');
}

// --- 10. DESTELLOS DORADOS AL ROMPER EL SELLO Y PÉTALOS ---
function lanzarDestellosApertura() {
    const canvas = document.getElementById("petals");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chispas = [];
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2 + 40;

    for (let i = 0; i < 65; i++) {
        const angulo = Math.random() * Math.PI * 2;
        const velocidad = Math.random() * 8 + 2;
        chispas.push({
            x: centroX,
            y: centroY,
            vx: Math.cos(angulo) * velocidad,
            vy: Math.sin(angulo) * velocidad,
            r: Math.random() * 3.8 + 1.5,
            alpha: 1
        });
    }

    function animarChispas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let vivas = false;
        chispas.forEach((c) => {
            if (c.alpha > 0) {
                vivas = true;
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(197, 160, 89, ${c.alpha})`;
                ctx.fill();
                c.x += c.vx;
                c.y += c.vy;
                c.alpha -= 0.018;
            }
        });
        if (vivas) requestAnimationFrame(animarChispas);
    }
    animarChispas();
}

function iniciarPetalos() {
    const canvas = document.getElementById("petals");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const petalos = [];
    const colores = ["rgba(197, 160, 89, 0.3)", "rgba(232, 220, 203, 0.42)", "rgba(107, 31, 42, 0.15)"];

    for (let i = 0; i < 28; i++) {
        petalos.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 4.5 + 2.5,
            d: Math.random() * 1 + 0.4,
            color: colores[Math.floor(Math.random() * colores.length)],
            angulo: Math.random() * Math.PI * 2
        });
    }

    function dibujar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petalos.forEach((p) => {
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, p.angulo, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            p.y += p.d;
            p.x += Math.sin(p.angulo) * 0.45;
            p.angulo += 0.015;

            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        });
        requestAnimationFrame(dibujar);
    }
    dibujar();
}
