// RUTA: /src/js/modules/perfilEspecialista.js
// ============================================================================
// 👤 PERFIL ESPECIALISTA – TUFFYPET (FINAL)
// Carga datos desde apiMock, valida sesión, controla opiniones, dudas y citas.
// ============================================================================

import { apiMock } from "./apiMock.js";
import { calendar } from "./calendar.js";
import { showMessage } from "../utils/uiUtils.js";

export const init = (data) => {
    const proId = data?.proId;

    if (!proId) {
        console.error("❌ No llegó el proId al perfilEspecialista.js");
        return;
    }

    const profile = apiMock.getProfile(proId);
    if (!profile) {
        console.error(`❌ No existe especialista con ID ${proId}`);
        return;
    }

    renderHeader(profile);
    renderGallery(profile);
    renderServices(profile);
    renderReviews(profile);
    renderDudas(profile);
    renderModalityControls(profile);

    initCitaButton(profile);
    initOpinionButton(profile);
    initPreguntaButton(profile);
    initBackButton();

    // Cargar calendario inicial
    calendar.render("perfilCalendar", proId, profile.allowsOnline ? "online" : "presencial");
};

// ============================================================================
// 🟦 HEADER
// ============================================================================
function renderHeader(profile) {
    document.getElementById("perfilNombre").textContent = profile.name;
    document.getElementById("perfilEspecialidad").textContent = profile.specialty ?? "";
    document.getElementById("perfilSubEspecialidad").textContent = profile.subSpecialty ?? "";
    document.getElementById("perfilFoto").src = profile.profilePicUrl;
    document.getElementById("perfilDireccion").textContent = profile.address ?? "";
    document.getElementById("perfilRating").textContent = profile.rating ?? "";
    document.getElementById("perfilReviewCount").textContent = `${profile.reviewCount} Opiniones`;
}

// ============================================================================
// 🖼 GALERÍA
// ============================================================================
function renderGallery(profile) {
    const container = document.getElementById("perfilGaleria");
    if (!container) return;

    container.innerHTML = "";

    profile.gallery?.forEach(item => {
        const div = document.createElement("div");
        div.className = "gallery-item";

        if (item.type === "image") {
            div.innerHTML = `<img src="${item.url}" alt="">`;
        } else if (item.type === "video") {
            div.innerHTML = `
                <iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>
            `;
        }

        container.appendChild(div);
    });
}

// ============================================================================
// 💼 SERVICIOS
// ============================================================================
function renderServices(profile) {
    const container = document.getElementById("perfilServicios");
    if (!container) return;
    container.innerHTML = "";

    profile.services?.forEach(s => {
        const div = document.createElement("div");
        div.className = "service-item";
        div.innerHTML = `
            <h4>${s.name}</h4>
            <p>${s.details}</p>
            <span class="price">$${s.price} MXN</span>
        `;
        container.appendChild(div);
    });
}

// ============================================================================
// ⭐ RESEÑAS
// ============================================================================
function renderReviews(profile) {
    const container = document.getElementById("perfilResenas");
    if (!container) return;

    container.innerHTML = "";

    profile.reviews?.forEach(r => {
        const div = document.createElement("div");
        div.className = "review-item";
        div.innerHTML = `
            <h4>${r.name} – <span>${r.stars} ⭐</span></h4>
            <small>${r.date}</small>
            <p>${r.text}</p>
            ${r.verified ? `<span class="verified-tag">Verificado</span>` : ""}
        `;
        container.appendChild(div);
    });
}

// ============================================================================
// ❓ DUDAS
// ============================================================================
function renderDudas(profile) {
    const container = document.getElementById("perfilDudas");
    if (!container) return;

    container.innerHTML = "";

    profile.dudas?.forEach(d => {
        const div = document.createElement("div");
        div.className = "duda-item";
        div.innerHTML = `
            <strong>${d.question}</strong>
            <p>${d.answer ?? "En espera de respuesta..."}</p>
        `;
        container.appendChild(div);
    });
}

// ============================================================================
// 🔵 MODALIDADES ONLINE / PRESENCIAL
// ============================================================================
function renderModalityControls(profile) {
    const onlineBtn = document.getElementById("modoOnline");
    const presBtn = document.getElementById("modoPresencial");

    if (!profile.allowsOnline) {
        onlineBtn.classList.add("disabled");
    }
    if (!profile.allowsPresencial) {
        presBtn.classList.add("disabled");
    }

    onlineBtn.addEventListener("click", () => {
        if (!profile.allowsOnline) return;
        calendar.render("perfilCalendar", profile.proId, "online");
    });

    presBtn.addEventListener("click", () => {
        if (!profile.allowsPresencial) return;
        calendar.render("perfilCalendar", profile.proId, "presencial");
    });
}

// ============================================================================
// 🟢 AGENDAR CITA — SOLO CON SESIÓN
// ============================================================================
function initCitaButton(profile) {
    const btn = document.getElementById("btnAgendarCita");

    btn.addEventListener("click", () => {
        if (!window.getIsLoggedIn()) {
            showMessage("Inicia sesión", "Debes iniciar sesión para agendar una cita.");
            window.handleLoginClick();
            return;
        }

        showMessage(
            "Selecciona horario",
            "Elige una fecha y hora en el calendario.",
            "info"
        );
    });
}

// ============================================================================
// ⭐ AGREGAR RESEÑA — solo si tuvo cita + sesión
// ============================================================================
function initOpinionButton(profile) {
    const btn = document.getElementById("btnAgregarOpinion");

    btn.addEventListener("click", () => {

        if (!window.getIsLoggedIn()) {
            showMessage("Inicia sesión", "Debes iniciar sesión para dejar una reseña.");
            return window.handleLoginClick();
        }

        if (!apiMock.hasAppointment(profile.proId)) {
            showMessage(
                "No puedes opinar",
                "Solo puedes opinar si ya tuviste una cita con este especialista.",
                "warning"
            );
            return;
        }

        window.openModal("modalAgregarOpinion");
    });
}

// ============================================================================
// ❓ HACER PREGUNTA — solo con sesión
// ============================================================================
function initPreguntaButton(profile) {
    const btn = document.getElementById("btnHacerPregunta");

    btn.addEventListener("click", () => {

        if (!window.getIsLoggedIn()) {
            showMessage("Inicia sesión", "Debes iniciar sesión para enviar una pregunta.");
            return window.handleLoginClick();
        }

        window.openModal("modalAgregarDuda");
    });
}

// ============================================================================
// 🔙 BOTÓN VOLVER (SIN RECARGAR LA SPA)
// ============================================================================
function initBackButton() {
    const backBtn = document.getElementById("btnVolverBusqueda");

    backBtn.addEventListener("click", () => {
        history.back(); // 👉 EXACTO COMO LO QUERÍAS
    });
}
