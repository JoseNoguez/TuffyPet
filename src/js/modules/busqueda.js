// RUTA: /src/js/modules/busqueda.js
import { apiMock } from "./apiMock.js";
import { loadHtmlFragment, loadComponentView } from "../utils/pageLoader.js";
import { calendarMini } from "./calendar-mini.js";

const CARD_TEMPLATE_PATH = "/src/views/cards/busqueda/card-template.html";
let cardsContainer = null;

const searchState = {
    text: "",
    tipo: "",
    ubicacion: "",
    mascota: "",
    calificacion: "",
    disponibilidad: "",
};

export function init() {
    cardsContainer = document.getElementById("cardsContainer");
    setupHeaderAuthButtons();
    setupFilters();
    loadProfiles();
}

/* ------------------------------ FILTROS ------------------------------ */
function setupFilters() {
    const map = {
        text: ["searchInput"],
        tipo: ["tipoFiltro", "tipoFiltroMobile"],
        ubicacion: ["ubicacionFiltro", "ubicacionFiltroMobile"],
        mascota: ["mascotaFiltro", "mascotaFiltroMobile"],
        calificacion: ["calificacionFiltro", "calificacionFiltroMobile"],
        disponibilidad: ["disponibilidadFiltro", "disponibilidadFiltroMobile"]
    };

    for (const [key, ids] of Object.entries(map)) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", e => updateFilter(key, e.target.value));
                el.addEventListener("change", e => updateFilter(key, e.target.value));
            }
        });
    }

    fillSelect("tipoFiltro", apiMock.getServiceTypes());
    fillSelect("tipoFiltroMobile", apiMock.getServiceTypes());

    fillSelect("ubicacionFiltro", apiMock.getLocations());
    fillSelect("ubicacionFiltroMobile", apiMock.getLocations());

    fillSelect("mascotaFiltro", apiMock.getPetTypes());
    fillSelect("mascotaFiltroMobile", apiMock.getPetTypes());

    fillSelect("calificacionFiltro", apiMock.getRatings());
    fillSelect("calificacionFiltroMobile", apiMock.getRatings());
}

function fillSelect(id, data) {
    const el = document.getElementById(id);
    if (!el) return;

    const placeholder = el.querySelector("option")?.textContent || "Selecciona";

    el.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(v => el.innerHTML += `<option value="${v}">${v}</option>`);
}

function updateFilter(key, value) {
    searchState[key] = value;
    loadProfiles();
}

/* ------------------------------ CARGA CARDS ------------------------------ */
async function loadProfiles() {
    const list = apiMock.searchProfiles(searchState);
    const template = await loadHtmlFragment(CARD_TEMPLATE_PATH);

    cardsContainer.innerHTML = "";

    let index = 0;
    for (const p of list) {
        const html = buildCardHtml(template, p, index);
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html.trim();

        const card = wrapper.querySelector(".card");

        card.addEventListener("click", e => handleCardClick(e, p));

        const miniId = `calendarMiniContainer${index}`;
        setTimeout(() => calendarMini.render(miniId, p.proId), 20);

        cardsContainer.appendChild(card);
        index++;
    }
}

/* ------------------------------ CARD BUILDER ------------------------------ */
function buildCardHtml(template, p, index) {

    const badgePresencial = p.allowsPresencial
        ? `<span class="badge presencial">Presencial</span>`
        : "";

    const badgeOnline = p.allowsOnline
        ? `<span class="badge online">Online</span>`
        : "";

    const costosOptions = p.costos
        ?.map(c => `<option value="${c.price}">${c.label}</option>`)
        .join("") || "";

    const serviciosBadges = p.servicios
        ?.map(s => `<span class="service-badge">${s.name}</span>`)
        .join("") || "";

    const promoButtonHtml = p?.promo?.active
        ? `
        <button class="promo-btn" onclick="openPromoModal('${p.promo.text}'); event.stopPropagation();">
            ¡Promoción! <i class="material-icons">local_offer</i>
        </button>`
        : "";

    return template
        .replaceAll("$$PRO_ID$$", p.proId)
        .replaceAll("$$TIPO$$", p.tipo)
        .replaceAll("$$SPECIALTY$$", p.specialty ?? "")
        .replaceAll("$$UBICACION$$", p.address)
        .replaceAll("$$MASCOTA$$", p.mascotas?.join(",") || "perro")
        .replaceAll("$$CALIFICACION_FIXED$$", p.rating.toFixed(1))
        .replaceAll("$$PERFIL_TIPO$$", p.tipo)
        .replaceAll("$$NOMBRE$$", p.name)
        .replaceAll("$$INDEX$$", index)
        .replaceAll("$$IMAGEN$$", p.profilePicUrl)
        .replaceAll("$$REVIEW_COUNT$$", p.reviewCount)
        .replaceAll("$$BADGE_PRESENCIAL$$", badgePresencial)
        .replaceAll("$$BADGE_ONLINE$$", badgeOnline)
        .replaceAll("$$COSTOS_OPTIONS$$", costosOptions)
        .replaceAll("$$COSTO_MINIMO$$", p.costos?.[0]?.price || 0)
        .replaceAll("$$SERVICIOS_BADGES$$", serviciosBadges)
        .replaceAll("$$SERVICIOS_IDS$$", p.servicios?.map(s => s.id).join(",") || "")
        .replaceAll("$$PROMO_BUTTON_HTML$$", promoButtonHtml);
}

/* ------------------------------ CLICK PERFIL ------------------------------ */
function handleCardClick(e, profile) {
    if (e.target.closest(".calendar-mini")) return;
    if (e.target.closest(".promo-btn")) return;

    const trigger = e.target.closest(".open-profile");
    if (!trigger) return;

    openSpecialistProfile(profile.proId);
}

function openSpecialistProfile(proId) {
    const container = document.getElementById("cardsContainer");
    container.innerHTML = ""; // Limpia cards

    loadComponentView(
        "/src/views/perfil/perfil-especialista.html",
        "perfil-especialista",
        "/src/styles/perfil-especialista.css",
        container,
        { proId }
    );
}

/* ------------------------------ BOTÓN VOLVER ------------------------------ */
window.returnToSearch = function () {
    cardsContainer.innerHTML = `
        <span id="resultCount" class="result-loading">Cargando resultados...</span>
    `;
    loadProfiles();
    window.scrollTo({ top: 0, behavior: "smooth" });
};

/* ------------------------------ LOGIN ------------------------------ */
function setupHeaderAuthButtons() {
    setTimeout(() => {
        window.updateLoginButton?.();
    }, 150);
}
