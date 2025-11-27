// RUTA: /src/js/modules/perfil-especialista.js 
// RESPONSABILIDAD: Módulo principal de la vista de perfil de especialista.

// ====================================================================
// --- DATOS MOCK, VARIABLES GLOBALES Y UTILIDADES ---
// ====================================================================

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
let selectedTime = null;
let calendarDates = {}; 
let currentReviewRating = 0; 
let currentProfileIndex = 0; // Para usar en las funciones de calendario

// --- MOCK DE DATA ---
const MOCK_SPECIALIST_DATA = { 
    type: 'specialist', proId: 'p789j23k', name: 'Dr. Alejandro Guzmán', specialty: 'Médico Veterinario', 
    subSpecialty: 'Nutrición y Control de Peso', address: 'Av. Coyoacán 123, Del Valle Norte, CDMX', 
    cedula: '10293847', rating: 4.8, reviewCount: 282, 
    profilePicUrl: 'https://i.pravatar.cc/150?u=alejandro_guzman_vet', 
    noveties: '¡Promoción de desparasitación al 50% con consulta general, válida hasta fin de mes!',
    reviews: [
        { name: 'Sofía L.', initials: 'SL', date: '2025-11-10', stars: 5, text: 'Excelente atención, el Dr. Guzmán fue muy claro y amable con mi perrito. La visita a domicilio fue un plus!', clinic: 'Sede Principal TuffyPet', verified: true },
        { name: 'Ricardo P.', initials: 'RP', date: '2025-10-25', stars: 4, text: 'Buena experiencia. Tardó un poco en la cita, pero el diagnóstico fue acertado. Recomiendo el Hospital Sur.', clinic: 'Hospital Sur GDL', verified: true },
    ],
    services: [
        { name: 'Consulta General', price: 500, details: 'Revisión completa de mascota.', duration: 30 },
        { name: 'Vacunación', price: 350, details: 'Aplicación de vacuna séxtuple o antirrábica.', duration: 20 },
    ],
    experience: ['Jefe de Clínica Veterinaria UNAM (2010 - 2015)', 'Especialidad en Cirugía (2015 - 2017)', 'Práctica Privada TuffyPet (2017 - Actual)'],
    consultorios: [
        { name: 'Sede Principal TuffyPet', address: 'Av. Coyoacán 123, Del Valle Norte, CDMX', phone: '55 1234 5678' },
        { name: 'Hospital Sur GDL', address: 'Calle Falsa 456, Col. Jardín, GDL', phone: '33 9876 5432' },
    ],
    dudas: [
        { question: 'Mi perro no quiere comer, ¿qué hago?', answer: 'Podría ser un problema dental o gastrointestinal. Recomiendo una revisión presencial.' },
    ]
};

// --- FUNCIONES DE UTILS GLOBALES ---
window.showMessage = (title, text, icon = 'info') => {
    if (typeof Swal !== 'undefined') {
        Swal.fire({ icon, title, text, confirmButtonColor: '#3e8ecd' });
    } else {
        console.warn(`[SweetAlert Mock] ${title}: ${text}`);
        alert(`${title}: ${text}`);
    }
};
window.openModal = (id) => {
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.classList.add('active');
    setTimeout(() => modal.querySelector('.modal-content').style.opacity = 1, 10);
};
window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if(!modal) return;
    modal.querySelector('.modal-content').style.opacity = 0;
    setTimeout(() => modal.classList.remove('active'), 300);
};


// --- LÓGICA DE CALENDARIO (Implementación para evitar errores) ---

/**
 * Lógica de disponibilidad simplificada.
 * @param {Date} date 
 * @param {number} profileIndex 
 * @returns {'available'|'unavailable'|'partially-available'}
 */
function getAvailability(date, profileIndex) { 
    const day = date.getDay();
    // Ejemplo simple: No disponible domingos o si el día es par.
    if (day === 0) return 'unavailable'; 
    if (date.getDate() % 2 === 0) return 'partially-available';
    return 'available'; 
}

function renderCalendarMonth(container, dateToShow, profileIndex) {
    const currentMonth = dateToShow.getMonth();
    const currentYear = dateToShow.getFullYear();
    const today = new Date();
    
    const monthName = dateToShow.toLocaleDateString('es-ES', { month: 'short' });
    
    const monthContainer = document.createElement('div');
    monthContainer.className = 'month-container';
    
    monthContainer.innerHTML = `<h4 class="month-title">${monthName} ${currentYear}</h4>`;
    
    // Días de la semana
    const dayNames = document.createElement('div');
    dayNames.className = 'calendar-container day-names-row';
    WEEK_DAYS.forEach(day => {
        dayNames.innerHTML += `<span>${day}</span>`;
    });
    monthContainer.appendChild(dayNames);

    // Días del mes
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-container day-grid';

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarGrid.innerHTML += `<span class="calendar-date empty"></span>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const availability = getAvailability(date, profileIndex);
        
        let classes = 'calendar-date';
        if (isToday) classes += ' today';
        if (isPast || availability === 'unavailable') classes += ' unavailable';
        if (!isPast && availability === 'available') classes += ' available';
        if (!isPast && availability === 'partially-available') classes += ' partially-available';

        let onclickHandler = '';
        if (!isPast && availability !== 'unavailable') {
            onclickHandler = `onclick="window.showMessage('Cita Seleccionada', 'Día: ${dateString}', 'info')"`;
        }

        calendarGrid.innerHTML += `<span class="${classes}" ${onclickHandler}>${day}</span>`;
    }

    monthContainer.appendChild(calendarGrid);
    container.appendChild(monthContainer);
}

window.renderThreeMonths = (startDate, profileIndex) => {
    const container = document.getElementById('three-month-calendar-container');
    if (!container) return;

    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(3, 1fr)';
    container.style.gap = '15px';

    const date1 = new Date(startDate);
    const date2 = new Date(startDate);
    date2.setMonth(date2.getMonth() + 1);
    const date3 = new Date(startDate);
    date3.setMonth(date3.getMonth() + 2);

    renderCalendarMonth(container, date1, profileIndex);
    renderCalendarMonth(container, date2, profileIndex);
    renderCalendarMonth(container, date3, profileIndex);

    calendarDates['three-month-start'] = startDate.getTime();
};

window.navigateThreeMonths = (dateTimestamp, monthOffset, profileIndex) => {
    const newDate = new Date(dateTimestamp);
    newDate.setMonth(newDate.getMonth() + monthOffset);
    window.renderThreeMonths(newDate, profileIndex);
};

window.renderSpecialistCalendar = () => {
    const today = new Date();
    window.renderThreeMonths(today, currentProfileIndex);

    const calendarNav = document.createElement('div');
    calendarNav.className = 'calendar-navigation';
    calendarNav.innerHTML = `
        <button class="btn btn-secondary btn-sm" onclick="window.navigateThreeMonths(calendarDates['three-month-start'], -1, currentProfileIndex)">
            <i class="fa-solid fa-chevron-left"></i> Anterior
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.navigateThreeMonths(calendarDates['three-month-start'], 1, currentProfileIndex)">
            Siguiente <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;
    document.getElementById('three-month-calendar-container').before(calendarNav);
};


// --- LÓGICA DE TABS ---
window.changeTab = (tabId) => {
    document.querySelectorAll('.pro-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    
    const contentElement = document.getElementById(`tab-content-${tabId}`);
    const linkElement = document.getElementById(`tab-link-${tabId}`);
    
    if(contentElement) contentElement.classList.add('active');
    if(linkElement) linkElement.classList.add('active');
};


// ====================================================================
// --- FUNCIONES DE RENDERIZADO PRINCIPAL ---
// ====================================================================

function renderStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const isSelected = i <= rating;
        const color = isSelected ? '#fcc419' : '#e0e0e0';
        starsHtml += `<i class="fa-solid fa-star" style="color: ${color};"></i>`;
    }
    return `<div class="review-stars">${starsHtml}</div>`;
}

function renderReviews(reviews) {
    if (!reviews || reviews.length === 0) return '<p>Aún no hay opiniones de pacientes.</p>';
    
    return reviews.map(r => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-meta">
                    <span class="user-avatar">${r.initials}</span>
                    <div style="line-height: 1.2;">
                        <span class="reviewer-name" style="font-weight: 600; display: block;">${r.name}</span>
                        ${r.verified ? `<span class="verified-badge"><i class="fa-solid fa-check"></i> CITA VERIFICADA</span>` : `<span style="font-size: 0.8rem; color: #aaa;">Opinión anónima</span>`}
                    </div>
                </div>
                <div class="rating-and-stars" style="text-align: right; margin-top: 5px;">
                    ${renderStars(r.stars)}
                </div>
            </div>
            <p class="review-text">${r.text}</p>
        </div>
    `).join('');
}

function renderServices(services) {
    if (!services || services.length === 0) return '<p>El especialista no ha listado sus servicios aún.</p>';

    return services.map(s => `
        <div class="service-item">
            <div class="service-details">
                <span class="service-name">${s.name}</span>
                <span class="service-description">${s.details}</span>
            </div>
            <span class="service-price">$${s.price.toLocaleString('es-MX')} MXN</span>
        </div>
    `).join('');
}

function buildSidebarCalendar(data) {
    // Estructura del calendario del sidebar
    return `
        <div class="booking-header">Agendar Cita Presencial</div>
        <div class="booking-content">
            <p style="font-weight: 500; color: var(--azul-petroleo);">Selecciona el día disponible:</p>
            <div class="three-month-calendar-container" id="three-month-calendar-container"></div>
            
            <div class="form-section" style="margin-top: 1.5rem;">
                <label for="clinic-address-sidebar"><i class="fa-solid fa-location-dot"></i> Dirección:</label>
                <select class="form-select" id="clinic-address-sidebar">
                   ${data.consultorios.map(c => `<option>${c.name} - ${c.address}</option>`).join('')}
                </select>
            </div>
            <div class="form-section" style="margin-top: 1rem;">
                <label for="service-select-specialist"><i class="fa-solid fa-tags"></i> Servicio:</label>
                <select class="form-select" id="service-select-specialist">
                   ${data.services.map(s => `<option>${s.name} ($${s.price})</option>`).join('')}
                </select>
            </div>
            <button class="btn-confirm-schedule btn-green" onclick="window.showMessage('Agendar Cita', 'Función de agendar pendiente de implementar.', 'info')">
                Reservar Cita
            </button>
        </div>
    `;
}

// ====================================================================
// --- FUNCIÓN PRINCIPAL EXPORTADA (LA CORRECCIÓN) ---
// ====================================================================

/**
 * Inicializa el perfil del especialista.
 * @param {number} profileIndex - El índice del profesional seleccionado de la búsqueda.
 */
export function init(profileIndex = 0) { // ⭐ CORRECCIÓN CLAVE: Renombrado a 'init'
    currentProfileIndex = profileIndex;
    const data = MOCK_SPECIALIST_DATA; // Usamos MOCK_DATA, el índice es solo referencial.
    
    console.log(`✅ Módulo perfil-especialista.js iniciado. Índice recibido: ${profileIndex}.`);

    // 1. Inyectar Encabezado y Resumen
    const headerHtml = `
        <div class="profile-image-container">
            <img src="${data.profilePicUrl}" alt="Foto de Perfil" class="profile-pic">
        </div>
        <div class="profile-details">
            <div class="name-badge-row">
                <h1>${data.name}</h1>
                <i class="fa-solid fa-circle-check verified-icon" style="color: var(--verde-check);"></i>
            </div>
            <p class="specialty-title">${data.specialty}</p>
            <p class="specialty-title">${data.subSpecialty}</p>
            <p class="summary-line">
                <i class="fa-solid fa-location-dot"></i> 
                <span>${data.address}</span>
            </p>
            <div class="rating-balls">
                ${renderStars(data.rating)}
                <span style="font-weight: 600; color: var(--azul-petroleo);">${data.rating.toFixed(1)}/5 (${data.reviewCount} opiniones)</span>
            </div>
            <p class="summary-line" style="margin-top: 5px;">
                <i class="fa-solid fa-user-tag"></i> No. de cédula: <span>${data.cedula}</span>
            </p>
            <div class="action-buttons-row">
                <button class="btn btn-primary" onclick="document.getElementById('calendario').scrollIntoView({ behavior: 'smooth' })">
                    <i class="fa-solid fa-calendar-alt"></i> Pedir cita
                </button>
            </div>
        </div>
    `;
    const resumenEl = document.getElementById('resumen');
    if (resumenEl) resumenEl.innerHTML = headerHtml;

    // Comentado por si 'breadcrumb-specialist-name' no existe en el HTML padre.
    // const breadcrumbEl = document.getElementById('breadcrumb-specialist-name');
    // if (breadcrumbEl) breadcrumbEl.textContent = data.name;

    // 2. Inyectar Tabs
    const tabs = [
        { id: 'novedades', title: 'Novedades' },
        { id: 'experiencia', title: 'Experiencia' },
        { id: 'consultorios', title: 'Consultorios', countId: 'consultorios-count' },
        { id: 'servicios-precios', title: 'Servicios y Precios' },
        { id: 'dudas', title: 'Dudas' },
        { id: 'opiniones', title: 'Opiniones' },
    ];

    const tabsContainer = document.getElementById('pro-tabs-specialist');
    if (tabsContainer) {
        tabsContainer.innerHTML = tabs.map((tab, index) => `
            <a href="#" class="tab-link ${index === 0 ? 'active' : ''}" id="tab-link-${tab.id}" 
               onclick="window.changeTab('${tab.id}'); return false;">
                ${tab.title}
            </a>
        `).join('');
    }

    // 3. Inyectar Contenido de Tabs
    const novetiesTextEl = document.querySelector('.noveties-text');
    if (novetiesTextEl) novetiesTextEl.textContent = data.noveties;

    const experienceContainerEl = document.getElementById('experience-container-specialist');
    if (experienceContainerEl) {
        experienceContainerEl.innerHTML = data.experience.map(item => `
            <div class="timeline-item"><i class="fa-solid fa-graduation-cap"></i><p>${item}</p></div>`).join('');
    }

    const serviciosContainerEl = document.getElementById('servicios-precios-container-specialist');
    if (serviciosContainerEl) serviciosContainerEl.innerHTML = renderServices(data.services);

    const reviewsContainerEl = document.getElementById('reviews-container-specialist');
    if (reviewsContainerEl) reviewsContainerEl.innerHTML = renderReviews(data.reviews);
    
    const ratingHeaderEl = document.getElementById('pro-rating-header');
    if (ratingHeaderEl) ratingHeaderEl.innerHTML = `${data.rating.toFixed(1)}/5 (<span id="pro-reviews-count-header">${data.reviewCount}</span> opiniones)`;
    
    // Consultorios
    const consultoriosCountEl = document.getElementById('consultorios-count');
    if (consultoriosCountEl) consultoriosCountEl.textContent = data.consultorios.length;

    const consultoriosContainerEl = document.getElementById('consultorios-container-specialist');
    if (consultoriosContainerEl) {
        consultoriosContainerEl.innerHTML = data.consultorios.map(c => `
            <div class="consultorio-card"><h4>${c.name}</h4><p>${c.address}</p></div>`).join('');
    }
    
    // Dudas
    const dudasContainerEl = document.getElementById('dudas-container-specialist');
    if (dudasContainerEl) {
        dudasContainerEl.innerHTML = data.dudas.map(d => `
            <div class="duda-item"><strong>P:</strong> ${d.question}<br><strong>R:</strong> ${d.answer}</div>`).join('');
    }


    // 4. Inyectar Calendario (Sidebar) e Inicializar
    const calendarioEl = document.getElementById('calendario');
    if (calendarioEl) {
        calendarioEl.innerHTML = buildSidebarCalendar(data);
        window.renderSpecialistCalendar(); 
    }

   
}