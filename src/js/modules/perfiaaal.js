// SPA loader integration: export init for pageLoader
export function init() {
    // Detectamos si estamos en el perfil del especialista (body id)
    if (document.getElementById('specialist-body')) {
        window.renderCalendarSpecialist = () => {
            window.renderCalendar('calendar-container-specialist', calendarDates['calendar-container-specialist'] ? new Date(calendarDates['calendar-container-specialist']) : new Date(), 0);
        };
        const data = MOCK_SPECIALIST_DATA;
        if (!data || data.type !== 'specialist') return;
        document.getElementById('pro-name').textContent = data.name;
        document.getElementById('pro-specialty').textContent = data.specialty;
        document.getElementById('pro-sub-specialty').textContent = data.subSpecialty;
        document.getElementById('pro-profile-pic').src = data.profilePicUrl;
        document.getElementById('pro-cedula').textContent = data.cedula;
        document.getElementById('pro-address').textContent = data.address;
        document.getElementById('pro-rating-badge').innerHTML = `${window.renderStars(data.rating)} ${data.rating.toFixed(1)}/5`;
        document.getElementById('pro-reviews-count').textContent = data.reviewCount;
        document.getElementById('pro-experience').textContent = data.yearsExperience;
        document.getElementById('pro-patients').textContent = data.patientsAttended.toLocaleString();
        document.getElementById('clinic-address-sidebar').textContent = data.address;
        const serviceSelect = document.getElementById('service-select-specialist');
        serviceSelect.innerHTML = data.services.map(s => `<option>${s}</option>`).join('');
        document.getElementById('tab-content-novedades').innerHTML = `<p class="noveties-text">${data.noveties}</p>`;
        document.getElementById('reviews-container-specialist').innerHTML = window.renderReviews(data.reviews);
        document.getElementById('opiniones-count-specialist').textContent = data.reviewCount;
        document.getElementById('tab-content-experiencia').innerHTML = `
            <h3>Trayectoria Profesional</h3>
            <ul class="experience-list">${data.experience.map(e => `<li>${e}</li>`).join('')}</ul>
        `;
        document.getElementById('tab-content-servicios').innerHTML = `
            <h3>Servicios Ofrecidos</h3>
            <ul class="service-list">${data.services.map(s => `<li>${s}</li>`).join('')}</ul>
        `;
        document.getElementById('pro-tabs-specialist').addEventListener('click', window.handleTabChange);
        document.querySelector('.pro-tab-item[data-tab="novedades"]').click();
        window.renderCalendarSpecialist();
    }
    // Clínica
    if (document.getElementById('clinic-body')) {
        window.renderCalendarClinic = () => {
            window.renderCalendar('calendar-container-clinic', calendarDates['calendar-container-clinic'] ? new Date(calendarDates['calendar-container-clinic']) : new Date(), 1);
        };
        const data = MOCK_CLINIC_DATA;
        if (!data || data.type !== 'clinic') return;
        document.getElementById('clinic-name').textContent = data.name;
        document.getElementById('clinic-slogan').textContent = data.slogan;
        document.getElementById('clinic-profile-pic').src = data.profilePicUrl;
        document.getElementById('clinic-address').textContent = data.address;
        document.getElementById('clinic-rating-badge').innerHTML = `${window.renderStars(data.rating)} ${data.rating.toFixed(1)}/5`;
        document.getElementById('clinic-reviews-count').textContent = data.reviewCount;
        document.getElementById('clinic-address-sidebar-clinic').textContent = data.address;
        const serviceSelect = document.getElementById('service-select-clinic');
        serviceSelect.innerHTML = data.services.map(s => `<option>${s}</option>`).join('');
        document.getElementById('tab-content-novedades').innerHTML = `<p class="noveties-text">${data.noveties}</p>`;
        document.getElementById('reviews-container-clinic').innerHTML = window.renderReviews(data.reviews);
        document.getElementById('opiniones-count-clinic').textContent = data.reviewCount;
        const specialistList = document.getElementById('specialist-list-container');
        specialistList.innerHTML = data.specialists.map(s => `
            <li>
                <img class="specialist-avatar" src="${s.profilePicUrl}" alt="${s.name}">
                <div class="specialist-info">
                    <h4>${s.name}</h4>
                    <p>${s.specialty}</p>
                </div>
                <button class="btn-view-profile" onclick="renderSpecialistProfileModal(MOCK_SPECIALIST_DATA)">
                    <i class="fa-solid fa-user-circle"></i> Ver Perfil
                </button>
            </li>
        `).join('');
        document.getElementById('tab-content-servicios').innerHTML = `
            <h3>Servicios de la Clínica</h3>
            <ul class="service-list">${data.services.map(s => `<li>${s}</li>`).join('')}</ul>
        `;
        document.getElementById('pro-tabs-clinic').addEventListener('click', window.handleTabChange);
        document.querySelector('.pro-tab-item[data-tab="novedades"]').click();
        window.renderCalendarClinic();
    }
}
// RUTA SUGERIDA: /src/js/modules/perfils.js
// Contiene Mocks, Utilidades y Lógica de Calendario/Modales

// --- SIMULACIÓN DE MÓDULOS CORE Y UTILS ---
const ROLES = { ADMIN: 'Admin', USUARIO: 'Usuario' };
const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
let selectedTime = null;
let selectedDayAvailability = null;
let calendarDates = {}; // Almacena el mes actual por calendario

// Funciones expuestas globalmente (Mock/Utilities)
// Usamos window.getIsLoggedIn/getUserRole para compatibilidad con main.js/auth.js
window.getIsLoggedIn = () => ({ isLoggedIn: true, userRole: 'Admin' }).isLoggedIn; 
window.getUserRole = () => ({ isLoggedIn: true, userRole: 'Admin' }).userRole;
window.showMessage = (title, text, icon = 'info') => {
    if (typeof Swal !== 'undefined') {
        Swal.fire({ icon, title, text, confirmButtonColor: '#3e8ecd' });
    } else {
        console.warn(`[SweetAlert Mock] ${title}: ${text}`);
        alert(`${title}: ${text}`);
    }
};
window.Error_Solicitud = (text) => window.showMessage('Error de Solicitud', text, 'warning');
window.openModal = (id) => document.getElementById(id).classList.add('active');
window.closeModal = (id) => document.getElementById(id).classList.remove('active');

// ====================================
// --- MOCK DE DATOS DE API (DOBLE PERFIL) ---
// ====================================

const MOCK_SPECIALIST_DATA = {
    type: 'specialist',
    proId: 'p789j23k',
    name: 'Dr. Alejandro Guzmán',
    specialty: 'Médico Veterinario',
    subSpecialty: 'Nutrición y Control de Peso',
    address: 'Av. Coyoacán 123, Del Valle Norte, CDMX',
    cedula: '10293847',
    yearsExperience: 15,
    patientsAttended: 15000,
    rating: 4.8, 
    reviewCount: 282,
    profilePicUrl: 'https://i.pravatar.cc/150?u=alejandro_guzman_vet', 
    noveties: '¡Promoción de desparasitación al 50% con consulta general, válida hasta fin de mes!',
    reviews: [
        { name: 'Sofía L.', date: '2025-11-10', stars: 5, text: 'Excelente atención, el Dr. Guzmán fue muy claro y amable con mi perrito.' },
        { name: 'Ricardo P.', date: '2025-10-25', stars: 4, text: 'Buena experiencia. Tardó un poco en la cita, pero el diagnóstico fue acertado.' },
    ],
    services: ['Consulta General', 'Vacunación', 'Consulta en línea'],
    experience: ['Jefe de Clínica Veterinaria UNAM (2010 - 2015)', 'Especialidad en Cirugía (2015 - 2017)', 'Práctica Privada TuffyPet (2017 - Actual)'],
};

const MOCK_CLINIC_DATA = {
    type: 'clinic',
    clinicId: 'c123x45y',
    name: 'Clínica TuffyPet Lovers Central',
    slogan: 'Cuidado integral y amor para tu mejor amigo.',
    address: 'Calle Falsa 123, Col. Roma Norte, CDMX',
    rating: 4.5,
    reviewCount: 500,
    profilePicUrl: 'https://picsum.photos/100/100?random=1',
    noveties: '¡Nueva sala de rehabilitación acuática disponible! Agenda tu cita con 20% de descuento en terapias.',
    reviews: [
        { name: 'Ana M.', date: '2025-11-05', stars: 5, text: 'Las instalaciones son impecables y el personal de recepción muy atento.' },
        { name: 'Carlos S.', date: '2025-09-18', stars: 4, text: 'Tienen todos los equipos necesarios. Un poco caro, pero vale la pena.' },
        { name: 'Javier G.', date: '2025-08-01', stars: 5, text: 'El mejor lugar para emergencias, salvaron a mi gato en la madrugada.' },
    ],
    specialists: [
        MOCK_SPECIALIST_DATA,
        { proId: 'p987k65l', name: 'Dra. Laura Flores', specialty: 'Dermatología Veterinaria', profilePicUrl: 'https://i.pravatar.cc/150?u=laura_flores_vet' },
        { proId: 'p111a22b', name: 'Dr. Jorge Nájera', specialty: 'Cirugía General y Ortopedia', profilePicUrl: 'https://i.pravatar.cc/150?u=jorge_najera_vet' },
    ],
    services: ['Hospitalización', 'Rayos X y Ultrasonido', 'Estética Canina', 'Guardería'],
};

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
        if (availabilityClass === 'available') {
            slot.classList.add('green-day');
        } else if (availabilityClass === 'partially-available') {
            slot.classList.add('yellow-day');
        }
        slot.onclick = () => selectTimeSlot(slot, formatTime(time), availabilityClass);
    }
    return slot;
}

window.openScheduleModal = (nameString, availabilityClass) => {
    selectedDayAvailability = availabilityClass;
    document.getElementById('scheduleModalDate').textContent = nameString;
    var slotsContainer = document.getElementById('timeSlotsContainer');
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';
    selectedTime = null;

    var allTimes = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    var unavailableHours = [13, 19];

    var amSlots = allTimes.filter(h => h < 12);
    var pmSlots = allTimes.filter(h => h >= 12);

    // Renderizar AM
    var amSection = document.createElement('div');
    amSection.className = 'time-section';
    amSection.innerHTML = `<h3>Mañana (AM)</h3><div class="time-slots-container" id="amSlots"></div>`;
    var amContainer = amSection.querySelector('#amSlots');
    amSlots.forEach(hour => {
        var isUnavailable = unavailableHours.includes(hour);
        amContainer.appendChild(createTimeSlot(hour, isUnavailable, availabilityClass));
    });
    slotsContainer.appendChild(amSection);

    // Renderizar PM
    var pmSection = document.createElement('div');
    pmSection.className = 'time-section';
    pmSection.innerHTML = `<h3>Tarde (PM)</h3><div class="time-slots-container" id="pmSlots"></div>`;
    var pmContainer = pmSection.querySelector('#pmSlots');
    pmSlots.forEach(hour => {
        var isUnavailable = unavailableHours.includes(hour);
        pmContainer.appendChild(createTimeSlot(hour, isUnavailable, availabilityClass));
    });
    slotsContainer.appendChild(pmSection);

    window.openModal('scheduleModal');
}

function selectTimeSlot(element, time, availabilityClass) {
    if (element.classList.contains('unavailable')) return;

    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    element.classList.add('selected');
    selectedTime = time;
}

window.confirmSchedule = () => {
    if (!selectedTime) {
        window.showMessage('Atención', 'Por favor, selecciona una hora para tu cita.', 'warning');
        return;
    }

    // Usamos window.getIsLoggedIn() para verificar sesión
    if (!window.getIsLoggedIn()) { 
        window.showMessage('Acceso denegado', 'Debes iniciar sesión para confirmar una cita.', 'error');
        window.closeModal('scheduleModal'); 
        return;
    }

    window.showMessage('¡Cita Confirmada! 🎉', `Su cita fue confirmada a las **${selectedTime}** horas.`, 'success');
    window.closeModal('scheduleModal');
}

/**
 * Función de disponibilidad simulada.
 */
function getAvailability(date, profileIndex) {
    var day = date.getDate();
    var weekDay = date.getDay(); // 0 (Domingo) a 6 (Sábado)

    // Lógica para el Especialista (Index 0)
    if (profileIndex === 0) {
        if (weekDay === 0) return 'unavailable';
        if (day % 4 === 0) return 'unavailable';
        if (day % 5 === 0) return 'partially-available';
        return 'available';
    } 
    
    // Lógica para la Clínica (Index 1)
    else if (profileIndex === 1) {
        if (weekDay === 6 || weekDay === 0) return 'partially-available';
        if (day % 3 === 0) return 'unavailable';
        return 'available';
    }
    
    return 'available';
}

window.renderCalendar = (containerId, dateToShow, profileIndex) => {
    var container = document.getElementById(containerId);
    if (!container) return;

    calendarDates[containerId] = dateToShow.getTime();
    container.innerHTML = '';

    var currentMonth = dateToShow.getMonth();
    var currentYear = dateToShow.getFullYear();
    var today = new Date();

    var monthYearString = dateToShow.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    var calendarNav = document.createElement('div');
    calendarNav.className = 'calendar-nav';
    calendarNav.innerHTML = `
        <button class="prev-month" onclick="window.changeMonth('${containerId}', ${dateToShow.getTime()}, -1, ${profileIndex})">
            <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span>${monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1)}</span>
        <button class="next-month" onclick="window.changeMonth('${containerId}', ${dateToShow.getTime()}, 1, ${profileIndex})">
            <i class="fa-solid fa-chevron-right"></i>
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

    // Días vacíos de inicio de mes
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
        var availability = getAvailability(date, profileIndex);

        if (isToday) { dayElement.classList.add('today'); }
        if (isPast) { dayElement.classList.add('past'); }

        if (!isPast && availability !== 'unavailable') {
            dayElement.classList.add(availability);
            dayElement.onclick = (function(d, a, pI) {
                return function() {
                    const profile = pI === 0 ? MOCK_SPECIALIST_DATA : MOCK_CLINIC_DATA;
                    window.openScheduleModal(`${profile.name} - ${d}`, a);
                };
            })(dateString, availability, profileIndex);
        } else {
            dayElement.classList.add('unavailable');
        }

        calendarGrid.appendChild(dayElement);
    }

    container.appendChild(calendarGrid);
}

window.changeMonth = (containerId, dateTimestamp, monthOffset, profileIndex) => {
    var newDate = new Date(dateTimestamp);
    newDate.setMonth(newDate.getMonth() + monthOffset);
    window.renderCalendar(containerId, newDate, profileIndex);
}

// ====================================
// --- FUNCIONES DE RENDERIZADO GENERAL ---
// ====================================

/**
 * Genera el HTML de las estrellas de opinión.
 */
window.renderStars = (rating) => {
    let starsHtml = '';
    // Basado en la instrucción anterior, el máximo es 5 balones/estrellas.
    for (let i = 1; i <= 5; i++) {
        const opacity = (i <= rating) ? 1 : 0.3; // Relleno si está dentro del rating
        starsHtml += `<i class="fa-solid fa-star" style="opacity: ${opacity};"></i>`;
    }
    return `<div class="review-stars">${starsHtml}</div>`;
}

/**
 * Genera el HTML de la lista de opiniones.
 */
window.renderReviews = (reviews) => {
    if (!reviews || reviews.length === 0) return '<p>Aún no hay opiniones de pacientes.</p>';
    
    return reviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <span class="reviewer-name">${r.name}</span>
                ${window.renderStars(r.stars)}
            </div>
            <p class="review-text">${r.text}</p>
            <span class="review-date">Opinión del ${new Date(r.date).toLocaleDateString('es-ES')}</span>
        </div>
    `).join('');
}

/**
 * Maneja el cambio de pestañas.
 */
window.handleTabChange = (e) => {
    const tabElement = e.target.closest('.pro-tab-item');
    if (!tabElement) return;

    const tabsContainer = tabElement.closest('.pro-tabs-nav');
    const contentContainer = tabsContainer.nextElementSibling;
    if (!tabsContainer || !contentContainer || !contentContainer.classList.contains('pro-tabs-content')) return;

    const tabId = tabElement.dataset.tab;
    
    // 1. Remover 'active'
    tabsContainer.querySelectorAll('.pro-tab-item').forEach(item => item.classList.remove('active'));
    contentContainer.querySelectorAll('.pro-tab-content').forEach(content => content.classList.remove('active'));

    // 2. Añadir 'active'
    tabElement.classList.add('active');
    const targetContent = contentContainer.querySelector(`#tab-content-${tabId}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// ====================================
// --- MODAL DE ESPECIALISTA (PARA CLÍNICA) ---
// ====================================

window.renderSpecialistProfileModal = (data) => {
    // Reutilizamos parte de la estructura del perfil de especialista para el modal
    const modalContent = document.getElementById('specialistModalContent');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <h2>Perfil Detallado</h2>
        <div class="pro-info-block specialist-modal-profile">
            <div class="pro-header">
                <img 
                    class="pro-profile-image" 
                    src="${data.profilePicUrl}" 
                    alt="Foto de Perfil"
                >
                <div class="pro-name-container">
                    <h1 class="pro-name">${data.name}</h1>
                    <p class="pro-specialty">${data.specialty}</p>
                    <p class="pro-specialty">${data.subSpecialty}</p>
                    <div class="pro-rating-badge">
                        ${window.renderStars(data.rating)} ${data.rating.toFixed(1)}/5
                    </div>
                </div>
            </div>
            
            <p style="margin-top:1rem; color: var(--color-text-muted);">
                El **Dr. ${data.name.split(' ')[1]}** cuenta con **${data.yearsExperience} años** de experiencia. 
                Aquí se mostraría una biografía completa.
            </p>

            <button class="btn btn-primary" style="margin-top:1rem; width: 100%;" onclick="window.closeModal('specialistModal'); window.showMessage('Cita', 'Redirigiendo a la agenda del Dr. ${data.name.split(' ')[1]}')">
                <i class="fa-solid fa-calendar-alt"></i> Agendar Cita
            </button>
            <button class="btn btn-primary-outline" style="margin-top:0.5rem; width: 100%;" onclick="window.closeModal('specialistModal')">
                Cerrar
            </button>
        </div>
    `;

    window.openModal('specialistModal');
}

// ====================================
// --- LÓGICA DE INICIALIZACIÓN DEL PERFIL (MIGRADA DEL HTML) ---
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Detectamos si estamos en el perfil del especialista (body id)
    if (document.getElementById('specialist-body')) {
        
        // Función de Inicialización del Calendario (profileIndex 0)
        // La hacemos global para que los botones de navegación del calendario la puedan usar.
        window.renderCalendarSpecialist = () => {
            // Utilizamos window.renderCalendar porque es global ahora
            window.renderCalendar('calendar-container-specialist', calendarDates['calendar-container-specialist'] ? new Date(calendarDates['calendar-container-specialist']) : new Date(), 0);
        };

        const data = MOCK_SPECIALIST_DATA;
        if (!data || data.type !== 'specialist') return;

        // Rellenar Info Principal
        document.getElementById('pro-name').textContent = data.name;
        document.getElementById('pro-specialty').textContent = data.specialty;
        document.getElementById('pro-sub-specialty').textContent = data.subSpecialty;
        document.getElementById('pro-profile-pic').src = data.profilePicUrl;
        document.getElementById('pro-cedula').textContent = data.cedula;
        document.getElementById('pro-address').textContent = data.address;
        
        // Rellenar Stats
        // Utilizamos window.renderStars y data.rating.toFixed(1)
        document.getElementById('pro-rating-badge').innerHTML = `${window.renderStars(data.rating)} ${data.rating.toFixed(1)}/5`;
        document.getElementById('pro-reviews-count').textContent = data.reviewCount;
        document.getElementById('pro-experience').textContent = data.yearsExperience;
        document.getElementById('pro-patients').textContent = data.patientsAttended.toLocaleString();

        // Rellenar Sidebar
        document.getElementById('clinic-address-sidebar').textContent = data.address;
        const serviceSelect = document.getElementById('service-select-specialist');
        serviceSelect.innerHTML = data.services.map(s => `<option>${s}</option>`).join('');

        // Pestañas
        document.getElementById('tab-content-novedades').innerHTML = `<p class="noveties-text">${data.noveties}</p>`;
        // Utilizamos window.renderReviews
        document.getElementById('reviews-container-specialist').innerHTML = window.renderReviews(data.reviews);
        document.getElementById('opiniones-count-specialist').textContent = data.reviewCount;
        document.getElementById('tab-content-experiencia').innerHTML = `
            <h3>Trayectoria Profesional</h3>
            <ul class="experience-list">${data.experience.map(e => `<li>${e}</li>`).join('')}</ul>
        `;
        document.getElementById('tab-content-servicios').innerHTML = `
            <h3>Servicios Ofrecidos</h3>
            <ul class="service-list">${data.services.map(s => `<li>${s}</li>`).join('')}</ul>
        `;
        
        // Inicializar Listeners y Calendario
        // Usamos window.handleTabChange
        document.getElementById('pro-tabs-specialist').addEventListener('click', window.handleTabChange);
        document.querySelector('.pro-tab-item[data-tab="novedades"]').click();
        window.renderCalendarSpecialist();
    }
});