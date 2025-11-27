// RUTA: /src/js/modules/busqueda.js 
// RESPONSABILIDAD: Módulo principal de la página de búsqueda.

// ====================================================================
// 🔐 --- IMPORTS DE AUTH y UI UTILS ---
// ====================================================================
import { 
    getIsLoggedIn, 
    getUserRole,
    secureFetch,
    ROLES, 
    handleLoginClick, 
    logout,
    checkAuthStatus, 
} from '../core/auth.js'; 

import { updateLoginButton, initGlobalUI, openModal, closeModal } from '../utils/uiUtils.js'; 
import { loadHtmlFragment, loadComponentView } from '../utils/pageLoader.js';


// ====================================================================
// --- FUNCIONES DE UTILIDAD Y LIMPIEZA DE TEXTO ---
// ====================================================================

/**
 * Normaliza el texto: remueve acentos, diacríticos y convierte a minúsculas.
 * @param {string} text - El texto a limpiar.
 * @returns {string} El texto normalizado.
 */
function normalizeText(text) {
    if (!text) return '';
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/**
 * Obtiene el valor de un parámetro de la URL.
 * @param {string} name - Nombre del parámetro.
 * @returns {string} El valor del parámetro o cadena vacía.
 */
function getUrlParameter(name) {
    const urlString = window.location.search + window.location.hash;
    const nameRegex = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + nameRegex + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(urlString);
    
    if (!results || !results[2]) return '';
    
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Inicializa los campos de búsqueda y filtros al cargar la página.
 */
function initializeSearchFromUrl() {
    
    const generalQuery = getUrlParameter('q');
    let queryUsedInSelect = false; 

    const filtersToInit = [
        { paramName: 'q', elementId: 'tipoFiltro' },
        { paramName: 'ubicacion', elementId: 'ubicacionFiltro' }
    ];

    filtersToInit.forEach(({ paramName, elementId }) => {
        const rawParamValue = getUrlParameter(paramName);
        
        if (rawParamValue) {
            const selectElement = document.getElementById(elementId);
            const normalizedValue = normalizeText(rawParamValue); 
            
            if (selectElement) {
                let matchFound = false;
                selectElement.value = normalizedValue; 
                
                if (selectElement.value !== normalizedValue) {
                    const prefix = normalizedValue.substring(0, 3);
                    if (prefix.length >= 3) {
                        for (let i = 0; i < selectElement.options.length; i++) {
                            const optionValue = selectElement.options[i].value; 
                            if (optionValue.startsWith(prefix)) {
                                selectElement.value = optionValue; 
                                matchFound = true;
                                break;
                            }
                        }
                    }
                }
                
                const mobileElement = document.getElementById(elementId + 'Mobile');
                if (mobileElement) {
                    mobileElement.value = selectElement.value;
                }

                if (paramName === 'q' || paramName === 'ubicacion') {
                    queryUsedInSelect = true; 
                }
            }
        }
    });

    if (generalQuery) {
        const searchInput = document.getElementById('searchInput');
        const normalizedQuery = normalizeText(generalQuery);

        const tipoFiltro = document.getElementById('tipoFiltro');
        if (tipoFiltro && tipoFiltro.value === '') { 
            for (let i = 0; i < tipoFiltro.options.length; i++) {
                const optionValue = tipoFiltro.options[i].value;
                const prefix = normalizedQuery.substring(0, 3);

                if (optionValue.startsWith(prefix) && prefix.length >= 3) {
                    tipoFiltro.value = optionValue;
                    const tipoFiltroMobile = document.getElementById('tipoFiltroMobile');
                    if(tipoFiltroMobile) tipoFiltroMobile.value = optionValue;
                    queryUsedInSelect = true; 
                    break;
                }
            }
        }

        if (!queryUsedInSelect) {
             if (searchInput) {
                 searchInput.value = generalQuery; 
             }
        }
    }
    
    filtrar();
}


// ====================================================================
// --- VARIABLES GLOBALES DE UI Y FILTROS ---
// ====================================================================
var loginBtn;
var loginText;
var loginIcon;
var accountDropdown;
var mobileLoginBtn;
var mobileLoginText;
var selectedDate = null;
var selectedTime = null;
var selectedDayAvailability = null;
var cardsContainer; 
var mapContainer; // ⭐ NUEVA REFERENCIA
var allCards = [];
var cardTemplateHtml = '';
var WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

var filterIds = ['tipoFiltro', 'ubicacionFiltro', 'mascotaFiltro', 'calificacionFiltro', 'disponibilidadFiltro'];

// ====================================
// 🧪 DATOS DE SIMULACIÓN DE API
// ====================================
var ALL_API_DATA = [
    { nombre: "El Refugio de Miau y Guau", tipo: "Veterinario", ubicacion: "CDMX", mascota: "Ambos", calificacion: 4.8, disponible: true, imagen: "pro-card-1.jpg", perfilTipo: "especialista" },
    { nombre: "Paseos Felices de Alex", tipo: "Paseador", ubicacion: "Jalisco", mascota: "Perro", calificacion: 4.5, disponible: true, imagen: "pro-card-2.jpg", perfilTipo: "especialista" },
    { nombre: "Guardería Patitas", tipo: "Guardería", ubicacion: "Nuevo León", mascota: "Perro", calificacion: 4.1, disponible: false, imagen: "pro-card-3.jpg", perfilTipo: "especialista" },
    { nombre: "Hotel Mascotas VIP", tipo: "Hospital", ubicacion: "CDMX", mascota: "Ambos", calificacion: 5.0, disponible: true, imagen: "pro-card-4.jpg", perfilTipo: "especialista" },
    { nombre: "Clínica Pet Lovers", tipo: "Clínica", ubicacion: "Puebla", mascota: "Ambos", calificacion: 4.6, disponible: true, imagen: "pro-card-5.jpg", perfilTipo: "clinica" },
    { nombre: "Estética Canina Flash", tipo: "Estética", ubicacion: "Querétaro", mascota: "Perro", calificacion: 4.3, disponible: true, imagen: "pro-card-6.jpg", perfilTipo: "especialista" },
    { nombre: "Adiestramiento K9", tipo: "Adiestrador", ubicacion: "Estado de México", mascota: "Perro", calificacion: 4.9, disponible: true, imagen: "pro-card-7.jpg", perfilTipo: "especialista" },
];

function openPromoModal(promoText) {
    var promoModalText = document.getElementById('promoModalText');
    if (promoModalText) promoModalText.textContent = promoText;
    openModal('promoModal');
}

// ====================================
// LÓGICA DE FILTROS Y BÚSQUEDA
// ====================================

function fillFilterOptions() {
    var getOptionValue = (text) => normalizeText(text);

    var tipos = [...new Set(ALL_API_DATA.map(data => data.tipo))].sort();
    var ubicaciones = [...new Set(ALL_API_DATA.map(data => data.ubicacion))].sort();
    var mascotas = ["Perro", "Gato", "Ambos"];
    var calificaciones = ["5", "4.5", "4"];

    var filterSets = [
        { ids: ['tipoFiltro', 'tipoFiltroMobile'], options: tipos, default: '🔍 Servicio' },
        { ids: ['ubicacionFiltro', 'ubicacionFiltroMobile'], options: ubicaciones, default: '📍 Ubicación' },
        { ids: ['mascotaFiltro', 'mascotaFiltroMobile'], options: mascotas, default: '🔍 Mascota' },
        { ids: ['calificacionFiltro', 'calificacionFiltroMobile'], options: calificaciones, default: '⭐ Calificación' },
    ];

    filterSets.forEach(set => {
        set.ids.forEach(selectId => {
            var select = document.getElementById(selectId);
            if (!select) return;

            select.innerHTML = `<option value="">${set.default}</option>`;

            set.options.forEach(optionValue => {
                var option = document.createElement('option');
                option.value = getOptionValue(optionValue);
                option.textContent = optionValue;
                select.appendChild(option);
            });
        });
    });

    document.querySelectorAll('.filter-select').forEach(select => {
        select.removeEventListener('change', sincronizarFiltrosYFiltrar);
        select.addEventListener('change', sincronizarFiltrosYFiltrar);
    });
}

function sincronizarFiltros(changedElement) {
    if (!changedElement || !changedElement.id) return;

    var changedId = changedElement.id;
    var targetId = null;

    for (var filterId of filterIds) {
        var baseId = filterId.replace('Filtro', '');
        if (changedId === baseId + 'Filtro') { 
            targetId = baseId + 'FiltroMobile';
            break;
        } else if (changedId === baseId + 'FiltroMobile') { 
            targetId = baseId + 'Filtro';
            break;
        }
    }

    if (targetId) {
        var targetElement = document.getElementById(targetId);
        if (targetElement && targetElement.value !== changedElement.value) {
            targetElement.value = changedElement.value;
        }
    }
}


function sincronizarFiltrosYFiltrar(e) {
    if (e && e.target) {
        sincronizarFiltros(e.target);
    }
    filtrar();
}

export function buscar() {
    filtrar();
}

export function filtrar() {
    if (!window.allCards || window.allCards.length === 0) return;

    var rawBusqueda = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
    var busqueda = normalizeText(rawBusqueda);

    var tipo = document.getElementById('tipoFiltro') ? document.getElementById('tipoFiltro').value : '';
    var ubicacion = document.getElementById('ubicacionFiltro') ? document.getElementById('ubicacionFiltro').value : '';
    var mascota = document.getElementById('mascotaFiltro') ? document.getElementById('mascotaFiltro').value : '';
    var calificacion = document.getElementById('calificacionFiltro') ? parseFloat(document.getElementById('calificacionFiltro').value || 0) : 0;
    var disponibilidad = document.getElementById('disponibilidadFiltro') ? document.getElementById('disponibilidadFiltro').value === 'true' : false;

    var resultsFound = false;
    var visibleCount = 0;

    window.allCards.forEach(card => {
        var dataTipo = normalizeText(card.getAttribute('data-tipo'));
        var dataUbicacion = normalizeText(card.getAttribute('data-ubicacion'));
        var dataMascota = normalizeText(card.getAttribute('data-mascota'));
        var dataCalificacion = parseFloat(card.getAttribute('data-calificacion')) || 0;
        var dataDisponible = card.getAttribute('data-disponible') === 'true';

        var cardText = normalizeText(card.textContent);

        var matchBusqueda = busqueda === '' || cardText.includes(busqueda);
        if (busqueda !== '' && busqueda.length >= 3) {
            matchBusqueda = matchBusqueda || cardText.startsWith(busqueda);
        }
        
        var matchTipo = tipo === '' || dataTipo === tipo;
        var matchUbicacion = ubicacion === '' || dataUbicacion === ubicacion;
        var matchMascota = mascota === '' || dataMascota === mascota || dataMascota === 'ambos';
        var matchCalificacion = calificacion === 0 || dataCalificacion >= calificacion;
        var matchDisponibilidad = !disponibilidad || dataDisponible;

        if (matchBusqueda && matchTipo && matchUbicacion && matchMascota && matchCalificacion && matchDisponibilidad) {
            card.style.display = 'flex';
            resultsFound = true;
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    var counterElement = document.getElementById('resultCount');
    if (counterElement) {
        counterElement.textContent = `Mostrando ${visibleCount} resultados`;
    }

    var noResultsEl = document.getElementById('noResultsMessage');
    if (!noResultsEl && cardsContainer) {
        noResultsEl = document.createElement('p');
        noResultsEl.id = 'noResultsMessage';
        noResultsEl.className = 'no-results';
        noResultsEl.textContent = 'No se encontraron resultados para su búsqueda.';
        noResultsEl.style = 'grid-column: 1 / -1; text-align: center; margin: 50px 0; font-size: 1.2rem; color: #777;';
        cardsContainer.appendChild(noResultsEl);
    }
    if (noResultsEl) {
        noResultsEl.style.display = resultsFound ? 'none' : 'block';
    }
}


// ====================================
// 🚀 LÓGICA DE CARGA DINÁMICA DE CARDS Y NAVEGACIÓN
// ====================================

/**
 * Muestra u oculta el contenedor del mapa interactivo.
 * @param {boolean} show - true para mostrar el mapa, false para ocultarlo.
 */
function toggleMapVisibility(show) {
    if (mapContainer && cardsContainer) {
        cardsContainer.classList.toggle('full-width-grid', !show);
        mapContainer.style.display = show ? 'block' : 'none'; 
        console.log(`🗺️ Mapa: ${show ? 'Visible' : 'Oculto'}. Cards: ${show ? 'Grid normal' : 'Full width'}.`);
    }
}


/**
 * Navega a la vista de perfil del profesional/clínica.
 * @param {string} perfilTipo - 'especialista' o 'clinica'.
 * @param {number} index - Índice del profesional en ALL_API_DATA.
 */
export async function navigateToProfile(perfilTipo, index) { 
    if (!cardsContainer) {
        console.error("❌ cardsContainer no está inicializado. No se puede navegar.");
        return;
    }
    
    // 1. Ocultar el mapa y maximizar el contenedor de tarjetas
    toggleMapVisibility(false); 
    
    const profileData = ALL_API_DATA[index];
    console.log(`➡️ Navegando al perfil: ${profileData.nombre} (Tipo: ${perfilTipo}, Index: ${index})`);
    
    let htmlPath, moduleName, cssPath;
    
    if (perfilTipo === 'clinica') {
        htmlPath = '/src/views/global/perfil-clinica.html';
        moduleName = 'perfilClinica'; 
        cssPath = '/src/css/perfil-clinica.css'; 
    } else {
        htmlPath = '/src/views/global/perfil-especialista.html';
        moduleName = 'perfil-especialista'; 
        cssPath = '/src/css/perfil-especialista.css'; 
    }

    // ⭐ CLAVE: Pasamos el índice como el último argumento para la función init del módulo cargado
    await loadComponentView(htmlPath, moduleName, cssPath, cardsContainer, index); 
    
    console.log(`✅ Perfil ${profileData.nombre} cargado en cardsContainer.`);
}

/**
 * Función para regresar a la vista de resultados de búsqueda.
 */
export function goBackToSearch() {
    console.log("⬅️ Regresando a resultados de búsqueda...");
    
    cargarTodasLasCards(); 
    
    window.scrollTo(0, 0); 
}


async function loadCardTemplate() {
    if (cardTemplateHtml) return;

    const templatePath = '/src/views/cards/busqueda/card-template.html';
    const stylePath = '/src/css/busqueda.css'; 

    try {
        cardTemplateHtml = await loadHtmlFragment(templatePath, stylePath); 
        console.log(`✅ Plantilla de tarjeta cargada usando PageLoader: ${templatePath}`);
    } catch (error) {
        console.error("❌ Error al cargar la plantilla de la tarjeta:", error);
        cardTemplateHtml = '<div class="card" style="grid-column: 1 / -1; background-color: #ffeaea; border: 1px solid red; padding: 10px;">Error: No se pudo cargar el diseño de la tarjeta.</div>';
    }
}

function createCardHtml(data, index) {
    if (!cardTemplateHtml || cardTemplateHtml.includes('Error: No se pudo cargar el diseño')) return cardTemplateHtml;

    var calificacionFixed = data.calificacion.toFixed(1);
    var disponibleClass = data.disponible ? 'card-available' : 'card-unavailable';
    var disponibleIcon = data.disponible ? 'check_circle' : 'cancel';
    var disponibleTexto = data.disponible ? 'Disponible' : 'No disponible';
    var uniqueIndex = index + 1;
    const perfilTipo = data.perfilTipo || 'especialista';
    
    const clickHandler = `window.navigateToProfile('${perfilTipo}', ${index})`; 

    var html = cardTemplateHtml
        .replace(/\$\$TIPO\$\$/g, data.tipo)
        .replace(/\$\$UBICACION\$\$/g, data.ubicacion)
        .replace(/\$\$MASCOTA\$\$/g, data.mascota)
        .replace(/\$\$CALIFICACION\$\$/g, data.calificacion)
        .replace(/\$\$CALIFICACION_FIXED\$\$/g, calificacionFixed)
        .replace(/\$\$DISPONIBLE\$\$/g, data.disponible)
        .replace(/\$\$IMAGEN\$\$/g, data.imagen || 'placeholder.jpg')
        .replace(/\$\$NOMBRE\$\$/g, data.nombre)
        .replace(/\$\$INDEX\$\$/g, uniqueIndex)
        .replace(/\$\$DATA_TIPO\$\$/g, normalizeText(data.tipo))
        .replace(/\$\$DATA_UBICACION\$\$/g, normalizeText(data.ubicacion))
        .replace(/\$\$DATA_MASCOTA\$\$/g, normalizeText(data.mascota))
        .replace(/\$\$DISPONIBLE_CLASS\$\$/g, disponibleClass)
        .replace(/\$\$DISPONIBLE_ICON\$\$/g, disponibleIcon)
        .replace(/\$\$DISPONIBLE_TEXTO\$\$/g, disponibleTexto)
        .replace(/\$\$PERFIL_TIPO\$\$/g, perfilTipo); 

    const regex = /class="(.*?)spa-profile-trigger(.*?)"/g;
    html = html.replace(regex, (match, p1, p2) => {
        if (!match.includes('onclick=')) {
            return `class="${p1}spa-profile-trigger${p2}" onclick="${clickHandler}; return false;"`;
        }
        return match;
    });

    html = html.replace(
        '<h4>Servicios Destacados</h4>',
        `<h4 style="cursor:pointer;" onclick="${clickHandler}; return false;">Servicios Destacados</h4>`
    );

    return html;
}

async function cargarCards(results) {
    await loadCardTemplate();

    fillFilterOptions(); 

    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = ''; 

    // 2. Mostrar el mapa (y restaurar el grid de cards)
    toggleMapVisibility(true); // ⭐ Mostrar mapa

    var existingCounter = document.getElementById('resultCount');
    if (existingCounter) existingCounter.remove();

    var cardsHTML = '';
    var today = new Date();

    if (results.length > 0) {
        results.forEach((data, index) => {
            cardsHTML += createCardHtml(data, index);
        });

        cardsContainer.innerHTML = cardsHTML;

        if (!existingCounter) {
             existingCounter = document.createElement('span');
             existingCounter.id = 'resultCount';
             existingCounter.style = 'grid-column: 1 / -1; margin-bottom: 10px; font-weight: 600;';
        }
        cardsContainer.prepend(existingCounter);

        window.allCards = Array.from(cardsContainer.getElementsByClassName('card'));

        window.allCards.forEach((_, index) => {
             if (cardTemplateHtml && !cardTemplateHtml.includes('Error: No se pudo cargar el diseño')) {
                 var uniqueId = index + 1;
                 renderCalendar(`calendarWidget${uniqueId}`, today, index);
             }
        });
        
        initializeSearchFromUrl(); 
        
    } else {
        cardsContainer.innerHTML = '<p class="no-results" style="grid-column: 1 / -1; text-align: center; margin: 50px 0; font-size: 1.2rem; color: #777;">No se encontraron resultados al cargar los datos iniciales.</p>';
        window.allCards = [];
    }
}

async function cargarTodasLasCards() {
    await cargarCards(ALL_API_DATA);
}


// ====================================
// 📅 LÓGICA DE CALENDARIO Y DISPONIBILIDAD
// ====================================

function formatTime(hour) {
    var h = hour % 12 || 12;
    var ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`;
}

function createTimeSlot(time, isUnavailable, availabilityClass) {
    var slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.textContent = formatTime(time);

    if (isUnavailable) {
        slot.classList.add('unavailable');
        slot.title = "No disponible";
    } else {
        slot.onclick = () => selectTimeSlot(slot, formatTime(time));
        if (availabilityClass === 'available') {
            slot.classList.add('green-day');
        } else if (availabilityClass === 'partially-available') {
            slot.classList.add('yellow-day');
        }
    }
    return slot;
}

function openScheduleModal(nameString, availabilityClass) {
    selectedDayAvailability = availabilityClass;
    document.getElementById('scheduleModalDate').textContent = nameString;
    var slotsContainer = document.getElementById('timeSlotsContainer');
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';

    var allTimes = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    var unavailableHours = [13, 19];

    var amSlots = allTimes.filter(h => h < 12);
    var pmSlots = allTimes.filter(h => h >= 12);

    var amSection = document.createElement('div');
    amSection.className = 'time-section';
    amSection.innerHTML = `<h3>Mañana (AM)</h3><div class="time-slots-container" id="amSlots"></div>`;
    var amContainer = amSection.querySelector('#amSlots');
    amSlots.forEach(hour => {
        var isUnavailable = unavailableHours.includes(hour);
        amContainer.appendChild(createTimeSlot(hour, isUnavailable, availabilityClass));
    });
    slotsContainer.appendChild(amSection);

    var pmSection = document.createElement('div');
    pmSection.className = 'time-section';
    pmSection.innerHTML = `<h3>Tarde (PM)</h3><div class="time-slots-container" id="pmSlots"></div>`;
    var pmContainer = pmSection.querySelector('#pmSlots');
    pmSlots.forEach(hour => {
        var isUnavailable = unavailableHours.includes(hour);
        pmContainer.appendChild(createTimeSlot(hour, isUnavailable, availabilityClass));
    });
    slotsContainer.appendChild(pmSection);

    openModal('scheduleModal');
}

function selectTimeSlot(element, time) {
    if (element.classList.contains('unavailable')) return;

    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
        slot.classList.remove('green-day', 'yellow-day');
    });

    element.classList.add('selected');
    selectedTime = time;

    if (selectedDayAvailability === 'available') {
        element.classList.add('green-day');
    } else if (selectedDayAvailability === 'partially-available') {
        element.classList.add('yellow-day');
    }
}

/**
 * Confirma la cita y verifica la autenticación.
 */
export function confirmSchedule() {
    if (!selectedTime) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor, selecciona una hora para tu cita.', confirmButtonColor: '#3e8ecd' });
        return;
    }

    if (!getIsLoggedIn()) { 
        Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'Debes iniciar sesión para confirmar una cita.', confirmButtonColor: '#d2042d' }).then(() => {
            if(window.closeModal) window.closeModal('scheduleModal'); 
            if(window.toggleLogin) window.toggleLogin(false);
        });
        return;
    }

    Swal.fire({ icon: 'success', title: '¡Cita Confirmada! 🎉', html: `Su cita fue confirmada a las **${selectedTime}** horas.`, confirmButtonText: 'Aceptar', confirmButtonColor: '#4CAF50' });
    closeModal('scheduleModal');
}

function getAvailability(date, cardIndex) {
    var day = date.getDate();
    var weekDay = date.getDay();

    switch (cardIndex % 3) {
        case 0:
            if (weekDay === 0) return 'unavailable';
            if (day % 4 === 0) return 'unavailable';
            if (day % 5 === 0) return 'partially-available';
            return 'available';
        case 1:
            if (weekDay === 6 || weekDay === 0) return 'unavailable';
            if (day % 2 === 0) return 'available';
            if (day > 25) return 'unavailable';
            return 'partially-available';
        case 2:
            if (weekDay === 5 && day < 15) return 'unavailable';
            return 'available';
        default:
            return 'available';
    }
}

function renderCalendar(containerId, dateToShow, cardIndex) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    var currentMonth = dateToShow.getMonth();
    var currentYear = dateToShow.getFullYear();
    var today = new Date();

    var monthYearString = dateToShow.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    var calendarNav = document.createElement('div');
    calendarNav.className = 'calendar-nav';
    calendarNav.innerHTML = `
        <button class="prev-month" onclick="window.changeMonth('${containerId}', ${dateToShow.getTime()}, -1, ${cardIndex})">
            <i class="material-icons">chevron_left</i>
        </button>
        <span>${monthYearString}</span>
        <button class="next-month" onclick="window.changeMonth('${containerId}', ${dateToShow.getTime()}, 1, ${cardIndex})">
            <i class="material-icons">chevron_right</i>
        </button>
    `;
    container.appendChild(calendarNav);

    var dayNames = document.createElement('div');
    dayNames.className = 'calendar-container';
    WEEK_DAYS.forEach(day => {
        var dayName = document.createElement('span');
        dayName.className = 'calendar-day-name';
        dayName.textContent = day;
        dayNames.appendChild(dayName);
    });
    container.appendChild(dayNames);

    var calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-container';

    var firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (var i = 0; i < firstDayOfMonth; i++) {
        var emptyDay = document.createElement('span');
        emptyDay.className = 'calendar-date';
        calendarGrid.appendChild(emptyDay);
    }

    for (var day = 1; day <= daysInMonth; day++) {
        var date = new Date(currentYear, currentMonth, day);
        var dateString = date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });

        var dayElement = document.createElement('span');
        dayElement.textContent = day;
        dayElement.className = 'calendar-date';

        var isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        var isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var availability = getAvailability(date, cardIndex);

        if (isToday) { dayElement.classList.add('today'); }
        if (isPast) { dayElement.classList.add('past'); }

        if (!isPast) {
            dayElement.classList.add(availability);
            dayElement.onclick = () => {
                var cardName = ALL_API_DATA[cardIndex].nombre;
                openScheduleModal(`${cardName} - ${dateString}`, availability);
            };
        } else {
            dayElement.classList.add('unavailable');
        }

        calendarGrid.appendChild(dayElement);
    }

    container.appendChild(calendarGrid);
}

export function changeMonth(containerId, dateTimestamp, monthOffset, cardIndex) {
    var newDate = new Date(dateTimestamp);
    newDate.setMonth(newDate.getMonth() + monthOffset);
    renderCalendar(containerId, newDate, cardIndex);
}


// ====================================
// 🚀 INICIALIZACIÓN DEL MÓDULO (export function init)
// ====================================

export async function init() {
    console.log("Módulo busqueda iniciado. Inicializando DOM y datos...");

    // 1. Inicializar referencias al DOM 
    cardsContainer = document.getElementById('cardsContainer'); 
    mapContainer = document.querySelector('.map'); // ⭐ REFERENCIA AL MAPA

    // 2. Cargar datos, plantilla, y renderizar cards
    await cargarTodasLasCards(); 

    // 3. EXPOSICIÓN GLOBAL DE FUNCIONES
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openPromoModal = openPromoModal;
    
    // Funciones de Auth
    window.toggleLogin = handleLoginClick; 
    window.logout = logout;
    window.checkAuthStatus = checkAuthStatus; 
    window.updateLoginButton = updateLoginButton; 
    
    // Funciones del Calendario
    window.changeMonth = changeMonth;
    window.confirmSchedule = confirmSchedule; 
    
    // Funciones de Búsqueda y Navegación
    window.buscar = buscar;
    window.filtrar = filtrar; 
    window.navigateToProfile = navigateToProfile;
    window.goBackToSearch = goBackToSearch;
}