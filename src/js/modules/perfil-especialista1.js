// RUTA: /src/js/modules/perfil-especialista.js 

// ====================================================================
// --- DATOS MOCK Y VARIABLES GLOBALES (Privadas al módulo) ---
// ====================================================================

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
let selectedTime = null;
let calendarDates = {}; 
let currentReviewRating = 0; 

// --- MOCK DE DATA (Se usa como fallback) ---
const MOCK_SPECIALIST_DATA = { 
    type: 'specialist', 
    perfilTipo: 'especialista', 
    proId: 'p789j23k', 
    name: 'Dr. Alejandro Guzmán', 
    nombre: 'Dr. Alejandro Guzmán (Mock)', 
    specialty: 'Médico Veterinario', 
    subSpecialty: 'Nutrición y Control de Peso', 
    address: 'Av. Coyoacán 123, Del Valle Norte, CDMX', 
    cedula: '10293847', 
    rating: 4.8, 
    reviewCount: 282, 
    profilePicUrl: 'https://i.pravatar.cc/150?u=alejandro_guzman_vet', 
    noveties: '¡Promoción de desparasitación al 50% con consulta general, válida hasta fin de mes!',
    gallery: [
        { type: 'image', url: 'https://picsum.photos/id/237/400/300', caption: 'Nuestro equipo en acción.' },
        { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'Video sobre prevención de parásitos.', thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
        { type: 'image', url: 'https://picsum.photos/id/1025/400/300', caption: 'Sala de espera cómoda.' },
        { type: 'image', url: 'https://picsum.photos/id/1018/400/300', caption: 'Nueva máquina de ultrasonido.' },
    ],
    reviews: [
        { name: 'Sofía L.', initials: 'SL', date: '2025-11-10', stars: 5, text: 'Excelente atención, el Dr. Guzmán fue muy claro y amable con mi perrito. La visita a domicilio fue un plus!', clinic: 'Sede Principal TuffyPet', verified: true, specialistResponse: { date: '2025-11-12', text: 'Gracias Sofía! Me alegra que tu mascota esté mejor. Es un gusto atenderles.'} },
        { name: 'Ricardo P.', initials: 'RP', date: '2025-10-25', stars: 4, text: 'Buena experiencia. Tardó un poco en la cita, pero el diagnóstico fue acertado. Recomiendo el Hospital Sur.', clinic: 'Hospital Sur GDL', verified: true, specialistResponse: null },
        { name: 'Anónimo', initials: 'AN', date: '2025-09-15', stars: 5, text: '¡El mejor veterinario de la ciudad! Muy profesional y atento.', clinic: 'Sede Principal TuffyPet', verified: false, specialistResponse: null },
    ],
    services: [
        { name: 'Consulta General', price: 500, details: 'Revisión completa de mascota.' },
        { name: 'Vacunación', price: 350, details: 'Aplicación de vacuna séxtuple o antirrábica.' },
        { name: 'Consulta en línea', price: 300, details: 'Asesoría vía videollamada.' }
    ],
    experience: ['Jefe de Clínica Veterinaria UNAM (2010 - 2015)', 'Especialidad en Cirugía (2015 - 2017)', 'Práctica Privada TuffyPet (2017 - Actual)'],
    consultorios: [
        { name: 'Sede Principal TuffyPet', address: 'Av. Coyoacán 123, Del Valle Norte, CDMX', phone: '55 1234 5678' },
        { name: 'Hospital Sur GDL', address: 'Calle Falsa 456, Col. Jardín, GDL', phone: '33 9876 5432' },
    ],
    dudas: [
        { question: 'Mi perro no quiere comer, ¿qué hago?', answer: 'Podría ser un problema dental o gastrointestinal. Recomiendo una revisión presencial.' },
        { question: '¿Vacunas para gatos de interior?', answer: 'Aunque sea de interior, es fundamental la vacuna triple felina. Agenda para una valoración.' }
    ]
};

// ====================================================================
// --- UTILIDADES Y CONSTRUCTORES DE ELEMENTOS (Privadas) ---
// ====================================================================

function formatTime(hour) {
    var h = hour % 12 || 12;
    var ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`; 
}

function createTimeSlot(time, isUnavailable) {
    var slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.textContent = formatTime(time);

    if (isUnavailable) {
        slot.classList.add('unavailable');
        slot.title = "No disponible";
    } else {
        slot.onclick = () => selectTimeSlot(slot, formatTime(time)); 
    }
    return slot;
}

function renderStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const isSelected = i <= rating;
        const color = isSelected ? '#fcc419' : '#e0e0e0';
        starsHtml += `<i class="fa-solid fa-star" style="color: ${color};"></i>`;
    }
    return `<div class="review-stars">${starsHtml}</div>`;
}

function getAvailability(date, profileIndex) { 
    var day = date.getDate();
    var weekDay = date.getDay(); 

    if (profileIndex === 0) { 
        if (weekDay === 0) return 'unavailable'; 
        if (day % 4 === 0) return 'unavailable';
        if (day % 5 === 0) return 'partially-available';
        return 'available';
    } 
    return 'available';
}

function renderCalendar(containerId, dateToShow, profileIndex) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (containerId.includes('calendar-widget-')) {
        calendarDates[containerId] = dateToShow.getTime();
    }
    container.innerHTML = '';

    var currentMonth = dateToShow.getMonth();
    var currentYear = dateToShow.getFullYear();
    var today = new Date();
    var todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    var monthYearString = dateToShow.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    var calendarNav = document.createElement('div');
    calendarNav.className = 'calendar-nav';

    const isFirstMonth = containerId === 'calendar-widget-0';
    
    if (isFirstMonth) {
        // Usa window.navigateThreeMonths para que el onclick del HTML funcione.
        calendarNav.innerHTML = `
            <button class="prev-month" onclick="window.navigateThreeMonths(${dateToShow.getTime()}, -1, ${profileIndex})" title="Mes anterior">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span>${monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1)}</span>
            <button class="next-month" onclick="window.navigateThreeMonths(${dateToShow.getTime()}, 1, ${profileIndex})" title="Mes siguiente">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        `;
    } else {
        calendarNav.innerHTML = `<span>${monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1)}</span>`;
    }
    
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
        var emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-date-wrapper';
        calendarGrid.appendChild(emptyDay);
    }

    for (var day = 1; day <= daysInMonth; day++) {
        var date = new Date(currentYear, currentMonth, day);
        var dateString = date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });

        var dayWrapper = document.createElement('div');
        dayWrapper.className = 'calendar-date-wrapper';
        
        var dayElement = document.createElement('span');
        dayElement.textContent = day;
        dayElement.className = 'calendar-date';

        var isToday = todayNoTime.getTime() === new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        var isPast = date < todayNoTime;
        var availability = getAvailability(date, profileIndex);

        if (isToday) { dayElement.classList.add('today'); }
        if (isPast) { dayElement.classList.add('unavailable', 'past'); }

        if (!isPast && availability !== 'unavailable') {
            dayElement.classList.add(availability);
            dayElement.onclick = (function(d, a) {
                return function() {
                    const profile = window.profileData || MOCK_SPECIALIST_DATA; 
                    window.openScheduleModal(`${profile.nombre || profile.name} - ${d}`, a); 
                };
            })(dateString, availability);
        } else if (!isPast) {
             dayElement.classList.add('unavailable');
             dayElement.onclick = () => window.showMessage('No Disponible', 'El doctor no atiende este día.', 'info');
        }

        dayWrapper.appendChild(dayElement);
        calendarGrid.appendChild(dayWrapper);
    }

    container.appendChild(calendarGrid);
}

function renderThreeMonths(startDate, profileIndex) {
    const container = document.getElementById('three-month-calendar-container');
    if (!container) return;
    container.innerHTML = ''; 

    for (let i = 0; i < 3; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);

        const monthContainer = document.createElement('div');
        monthContainer.className = 'calendar-widget';
        monthContainer.id = `calendar-widget-${i}`;
        container.appendChild(monthContainer);

        renderCalendar(monthContainer.id, date, profileIndex); 
    }
    calendarDates['three-month-start'] = startDate.getTime();
}

/**
 * Función para la navegación del calendario (expuesta a window).
 */
function navigateThreeMonths(dateTimestamp, monthOffset, profileIndex) {
    var newDate = new Date(dateTimestamp);
    newDate.setMonth(newDate.getMonth() + monthOffset);
    renderThreeMonths(newDate, profileIndex); 
}

function renderSpecialistCalendar() {
    const start = calendarDates['three-month-start'] ? new Date(calendarDates['three-month-start']) : new Date();
    renderThreeMonths(start, 0); 
}

// ====================================================================
// --- LÓGICA DE MODAL Y EVENTOS (Expuestas) ---
// ====================================================================

/**
 * Abre el modal de agendamiento.
 */
function openScheduleModal(nameString, availabilityClass) {
    if (typeof window.getIsLoggedIn === 'function' && !window.getIsLoggedIn()) {
        window.showMessage('Acceso denegado', 'Debes iniciar sesión para agendar una cita.', 'error');
        return;
    }

    document.getElementById('scheduleModalDate').textContent = nameString;
    var slotsContainer = document.getElementById('timeSlotsContainer');
    if (!slotsContainer) return;
    slotsContainer.innerHTML = '';
    selectedTime = null;
    document.getElementById('selectedTimeDisplay').textContent = '—';

    var allTimes = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    var unavailableHours = [13, 19]; 
    var amSlots = allTimes.filter(h => h < 12);
    var pmSlots = allTimes.filter(h => h >= 12);

    [
        { title: 'Mañana (AM)', hours: amSlots }, 
        { title: 'Tarde (PM)', hours: pmSlots }
    ].forEach((section, index) => {
        var sectionElement = document.createElement('div');
        sectionElement.className = 'time-section';
        sectionElement.innerHTML = `<h3>${section.title}</h3><div class="time-slots-container" id="timeSlots${index}"></div>`;
        var container = sectionElement.querySelector(`#timeSlots${index}`);
        section.hours.forEach(hour => {
            var isUnavailable = unavailableHours.includes(hour);
            container.appendChild(createTimeSlot(hour, isUnavailable)); 
        });
        slotsContainer.appendChild(sectionElement);
    });

    window.openModal('scheduleModal'); 
}

/**
 * Maneja la selección de un slot de tiempo.
 */
function selectTimeSlot(element, time) {
    if (element.classList.contains('unavailable')) return;

    document.querySelectorAll('#timeSlotsContainer .time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    element.classList.add('selected');
    selectedTime = time;
    document.getElementById('selectedTimeDisplay').textContent = time;
}

/**
 * Confirma la reserva de la cita.
 */
function confirmSchedule() {
    if (typeof window.getIsLoggedIn === 'function' && !window.getIsLoggedIn()) {
        window.showMessage('Acceso denegado', 'Debes iniciar sesión para confirmar una cita.', 'error');
        window.closeModal('scheduleModal'); 
        return;
    }

    if (!selectedTime) {
        window.showMessage('Atención', 'Por favor, selecciona una hora para tu cita.', 'warning');
        return;
    }

    window.showMessage('¡Cita Confirmada! 🎉', `Su cita fue confirmada a las **${selectedTime}** horas.`, 'success');
    window.closeModal('scheduleModal'); 
}

/**
 * Prepara las estrellas para el rating en el modal de opinión.
 */
function setupReviewRating() {
    const starsContainer = document.getElementById('reviewRatingStars');
    if (!starsContainer) return;

    starsContainer.querySelectorAll('.fa-star').forEach(star => {
        star.removeEventListener('click', starClickHandler);
        star.addEventListener('click', starClickHandler);
    });
}

function starClickHandler(e) {
    const starsContainer = document.getElementById('reviewRatingStars');
    const rating = parseInt(e.target.dataset.rating);
    currentReviewRating = rating;
    starsContainer.querySelectorAll('.fa-star').forEach(s => {
        s.classList.remove('selected');
        if (parseInt(s.dataset.rating) <= rating) {
            s.classList.add('selected');
        }
    });
}

/**
 * Envía la opinión del paciente.
 */
function submitReview() {
    if (typeof window.getIsLoggedIn === 'function' && !window.getIsLoggedIn()) {
        window.showMessage('Acceso denegado', 'Debes iniciar sesión para dejar una opinión.', 'error');
        window.closeModal('addReviewModal'); 
        return;
    }
    
    const comment = document.getElementById('reviewComment').value.trim();
    if (currentReviewRating === 0) {
        window.showMessage('Error', 'Por favor, selecciona una valoración con las estrellas.', 'warning');
        return;
    }
    if (comment.length < 10) {
        window.showMessage('Error', 'Tu comentario es demasiado corto. Mínimo 10 caracteres.', 'warning');
        return;
    }

    window.showMessage(
        '¡Opinión enviada! 🎉', 
        `Gracias por tu valoración de **${currentReviewRating}/5** y tu comentario. Será publicada tras la revisión.`, 
        'success'
    );

    document.getElementById('reviewComment').value = '';
    currentReviewRating = 0;
    document.querySelectorAll('#reviewRatingStars .fa-star').forEach(s => s.classList.remove('selected'));
    window.closeModal('addReviewModal');
}

/**
 * Envía una pregunta al especialista.
 */
function submitQuestion() {
    if (typeof window.getIsLoggedIn === 'function' && !window.getIsLoggedIn()) {
        window.showMessage('Acceso denegado', 'Debes iniciar sesión para agregar una duda.', 'error');
        window.closeModal('addQuestionModal'); 
        return;
    }
    
    const question = document.getElementById('questionText').value.trim();
    if (question.length < 15) {
        window.showMessage('Error', 'La pregunta debe ser más detallada (mínimo 15 caracteres).', 'warning');
        return;
    }

    const profile = window.profileData || MOCK_SPECIALIST_DATA;
    window.showMessage(
        '¡Duda enviada! 📬', 
        `Tu pregunta ha sido enviada al Dr. ${profile.nombre || profile.name}. Te notificaremos cuando responda.`, 
        'success'
    );

    document.getElementById('questionText').value = '';
    window.closeModal('addQuestionModal');
}

/**
 * Maneja el cambio de pestaña de consultorio.
 */
function handleClinicTabChange(tabElement) {
    const tabIndex = tabElement.dataset.index;
    document.querySelectorAll('#consultorio-tabs .clinic-tab-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.clinic-content-item').forEach(content => content.classList.remove('active'));
    
    tabElement.classList.add('active');
    document.getElementById(`consultorio-content-${tabIndex}`).classList.add('active');
}

/**
 * Maneja el cambio de la pestaña principal con animación.
 */
function handleTabChange(e) {
    const tabElement = e.target.closest('.pro-tab-item');
    if (!tabElement) return;

    const tabsContainer = tabElement.closest('.pro-tabs-nav');
    const contentContainer = tabsContainer.closest('.pro-tabs-nav-wrapper').nextElementSibling;
    if (!tabsContainer || !contentContainer || !contentContainer.classList.contains('pro-tabs-content')) return;

    const tabId = tabElement.dataset.tab;
    
    // 1. Remover 'active' y animar salida
    tabsContainer.querySelectorAll('.pro-tab-item').forEach(item => item.classList.remove('active'));
    contentContainer.querySelectorAll('.pro-tab-content').forEach(content => {
        if (content.classList.contains('active')) {
            content.style.opacity = 0;
            setTimeout(() => content.classList.remove('active'), 300); 
        }
    });
    
    // 2. Añadir 'active' al nuevo contenido después del retraso
    tabElement.classList.add('active');
    const targetContent = contentContainer.querySelector(`#tab-content-${tabId}`);
    if (targetContent) {
            setTimeout(() => {
                targetContent.classList.add('active');
                targetContent.style.opacity = 1; 
            }, 30);
    }
}


/**
 * Muestra la imagen o el video en un modal.
 */
function openMediaModal(type, url, caption, thumbnailUrl) {
    const modal = document.getElementById('genericMediaModal');
    if (!modal || typeof window.openModal !== 'function') {
        window.showMessage('Error', 'No se pudo abrir el modal de media.', 'error');
        return;
    }
    
    const content = modal.querySelector('.modal-content');
    if (!content) return;

    let mediaHtml = `<button class="modal-close" onclick="window.closeModal('genericMediaModal')">&times;</button><h2 style="margin-bottom: 1rem;">${caption}</h2>`;
    
    if (type === 'video') {
        const embedUrl = url.includes('embed') ? url : `https://www.youtube.com/embed/${url.split('v=')[1]}`;
        
        mediaHtml += `
            <div style="aspect-ratio: 16/9; width: 100%; max-width: 800px; margin: 0 auto;">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="${embedUrl}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else {
        mediaHtml += `<img src="${url}" alt="${caption}" style="max-width: 100%; height: auto; display: block; border-radius: 8px;">`;
    }
    
    content.innerHTML = mediaHtml;

    window.openModal('genericMediaModal');
}


// ====================================================================
// --- FUNCIONES DE RENDERIZADO GENERAL (HTML Builders) ---
// ====================================================================

function renderGallery(galleryItems) {
    if (!galleryItems || galleryItems.length === 0) {
        return '<p>El especialista aún no ha subido contenido multimedia.</p>';
    }

    return `<div class="gallery-grid">
        ${galleryItems.map(item => {
            let mediaHtml = '';
            let mediaClass = '';
            const onclickArgs = `'${item.type}', '${item.url}', '${item.caption.replace(/'/g, "\\'")}', '${item.thumbnailUrl || ''}'`;

            if (item.type === 'image') {
                mediaHtml = `<img src="${item.url}" alt="${item.caption}" loading="lazy">`;
                mediaClass = 'gallery-image';
            } else if (item.type === 'video') {
                mediaHtml = `
                    <div class="video-overlay">
                        <img src="${item.thumbnailUrl || 'placeholder-video.jpg'}" alt="Video: ${item.caption}" loading="lazy">
                        <i class="fa-solid fa-play play-icon"></i>
                    </div>
                `;
                mediaClass = 'gallery-video';
            }

            return `
                <div class="gallery-item ${mediaClass}" onclick="window.openMediaModal(${onclickArgs})">
                    ${mediaHtml}
                    <p class="gallery-caption">${item.caption}</p>
                </div>
            `;
        }).join('')}
    </div>`;
}

function renderReviews(reviews, profileData) {
    if (!reviews || reviews.length === 0) return '<p>Aún no hay opiniones de pacientes. ¡Sé el primero en opinar!</p>';
    
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
            <div class="review-info-line">
                <i class="fa-solid fa-calendar-alt"></i> Publicada el ${new Date(r.date).toLocaleDateString('es-ES')}
                <span style="margin: 0 5px;">|</span>
                <i class="fa-solid fa-location-dot"></i> ${r.clinic}
            </div>
            ${r.specialistResponse ? `
                <div class="specialist-response">
                    <img src="${profileData.profilePicUrl}" alt="Avatar Dr." class="profile-pic">
                    <div class="specialist-response-content">
                        <strong>Respuesta del Dr. ${profileData.nombre || profileData.name}:</strong>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${r.specialistResponse.text}</p>
                        <span style="font-size: 0.8rem; color: var(--gris-piedra);">El ${new Date(r.specialistResponse.date).toLocaleDateString('es-ES')}</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderConsultorios(consultorios, profileData) {
    return `<div class="clinic-card" style="padding: 1.5rem;">
        <p style="color: var(--gris-piedra);">El Dr. ${profileData.nombre || profileData.name} atiende en estas ubicaciones:</p>
        <div class="clinic-tabs" id="consultorio-tabs" style="border-bottom: none;">
            ${consultorios.map((c, i) => `<div class="clinic-tab-item ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="window.handleClinicTabChange(this)">${c.name}</div>`).join('')}
        </div>
        ${consultorios.map((c, i) => `
            <div class="clinic-content-item ${i === 0 ? 'active' : ''}" id="consultorio-content-${i}" style="border-top: var(--borde-default); padding-top: 15px;">
                <p><strong><i class="fa-solid fa-map-marker-alt" style="margin-right: 5px;"></i> Dirección:</strong> ${c.address}</p>
                <p><strong><i class="fa-solid fa-phone" style="margin-right: 5px;"></i> Teléfono:</strong> <a href="tel:${c.phone}">${c.phone}</a></p>
                <button style="border: none; background: #eee; padding: 8px 15px; border-radius: var(--radio-sm); margin-top: 10px; cursor: pointer;" onclick="window.showMessage('Mapa', 'Abriendo Google Maps para ${c.address}')">
                    <i class="fa-solid fa-map"></i> Ver en mapa
                </button>
            </div>
        `).join('')}
    </div>`;
}

function renderDudas(dudas, profileData) {
    return dudas.map(d => `
        <div class="question-item">
            <div class="question-header">
                <div class="question-meta">
                    <span class="user-avatar">??</span>
                    <span style="font-weight: 600;">Duda de Paciente</span>
                </div>
            </div>
            <p class="question-text"><strong>Pregunta:</strong> ${d.question}</p>
            
            <div class="specialist-response">
                <img src="${profileData.profilePicUrl}" alt="Avatar Dr." class="profile-pic">
                <div class="specialist-response-content">
                    <strong>Respuesta del Dr. ${profileData.nombre || profileData.name}:</strong>
                    <p style="margin: 5px 0 0 0; font-size: 0.9rem;">${d.answer}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function renderServiciosPrecios(services) {
    return services.map(s => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px dashed #eee;">
            <div>
                <p style="font-weight: 600; margin: 0;">${s.name}</p>
                <p style="font-size: 0.9rem; color: var(--verde-check); margin: 0;">$${s.price.toLocaleString()} MXN</p>
                <a href="#" style="font-size: 0.8rem;" onclick="window.showMessage('Detalles del Servicio', '${s.details}', 'info'); return false;">Detalles</a>
            </div>
            <button class="btn-primary" style="padding: 8px 15px; width: auto; margin-top: 0; background: var(--verde-check);" onclick="document.getElementById('calendario').scrollIntoView({ behavior: 'smooth' })">
                Agendar cita
            </button>
        </div>
    `).join('');
}


// ====================================================================
// --- FUNCIÓN DE INICIALIZACIÓN REQUERIDA POR PAGE LOADER ---
// ====================================================================

/**
 * Función de inicialización del módulo de perfil.
 * @param {object} componentData - Datos del especialista cargados por pageLoader.
 */
function init(componentData) {
    const data = componentData && (componentData.perfilTipo === 'especialista' || componentData.type === 'specialist') ? componentData : MOCK_SPECIALIST_DATA; 
             
    // 💥 CORRECCIÓN DE VALIDACIÓN: Usamos el ID del contenedor principal del HTML
    const mainContainer = document.getElementById('specialist-body'); 
    
    if (!mainContainer) {
        console.error("❌ No se pudo inicializar el perfil: El contenedor principal 'specialist-body' no existe en el HTML.");
        if (window.goBackToSearch) window.goBackToSearch(); 
        return;
    }
    
    window.profileData = data; 

    // Rellenar Info Principal
    document.getElementById('pro-name').textContent = data.nombre || data.name;
    document.getElementById('pro-specialty').textContent = data.specialty;
    document.getElementById('pro-sub-specialty').textContent = data.subSpecialty;
    document.getElementById('pro-profile-pic').src = data.profilePicUrl || 'placeholder.jpg';
    document.getElementById('pro-cedula').textContent = data.cedula || 'N/D';
    document.getElementById('pro-address').textContent = data.address || 'N/D'; 

    // Rellenar Stats y Rating
    const ratingValue = data.calificacion || data.rating || 0;
    const reviewCount = data.reviewCount || 0;
    document.getElementById('pro-rating-badge').innerHTML = `${renderStars(ratingValue)} <span style="font-weight: 600;">${ratingValue.toFixed(1)}/5</span> (${reviewCount} opiniones)`;
    document.getElementById('pro-reviews-count-header').textContent = reviewCount;
    
    // Rellenar Sidebar (Servicios)
    const serviceSelect = document.getElementById('service-select-specialist');
    serviceSelect.innerHTML = data.services.map(s => `<option>${s.name} ($${s.price})</option>`).join('');
    
    // Pestañas (Inyectar estructura y contenido)
    const tabsNav = document.getElementById('pro-tabs-specialist');
    const tabsData = [
        { id: 'novedades', title: 'Novedades', icon: 'fa-bullhorn' },
        { id: 'experiencia', title: 'Experiencia', icon: 'fa-briefcase' },
        { id: 'consultorios', title: 'Consultorios', icon: 'fa-location-dot' },
        { id: 'galeria', title: 'Galería', icon: 'fa-image' },
        { id: 'servicios-precios', title: 'Servicios y Precios', icon: 'fa-tags' },
        { id: 'dudas', title: 'Dudas', icon: 'fa-question' },
        { id: 'opiniones', title: `Opiniones`, icon: 'fa-comments' },
    ];

    tabsNav.innerHTML = tabsData.map((t, i) => 
        `<button class="pro-tab-item ${i === 0 ? 'active' : ''}" data-tab="${t.id}"><i class="fa-solid ${t.icon}"></i> ${t.title}</button>`
    ).join('');

    document.querySelector('#tab-content-novedades .noveties-text').textContent = data.noveties || 'No hay novedades disponibles.';
    document.getElementById('experience-container-specialist').innerHTML = `
        <h3>Trayectoria Profesional</h3>
        <ul class="experience-list" style="padding-left: 20px;">${data.experience.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('')}</ul>
    `;
    document.getElementById('galeria-container-specialist').innerHTML = renderGallery(data.gallery);
    document.getElementById('consultorios-container-specialist').innerHTML = renderConsultorios(data.consultorios, data);
    document.getElementById('consultorios-count').textContent = data.consultorios.length;
    document.getElementById('servicios-precios-container-specialist').innerHTML = renderServiciosPrecios(data.services);
    document.getElementById('dudas-container-specialist').innerHTML = renderDudas(data.dudas, data);
    document.getElementById('reviews-container-specialist').innerHTML = renderReviews(data.reviews, data);
    
    // Añadir Event Listeners
    tabsNav.addEventListener('click', handleTabChange);

    const initialTab = document.querySelector('.pro-tab-item[data-tab="novedades"]');
    if(initialTab) {
        initialTab.click(); 
    } else {
         document.getElementById('tab-content-novedades').classList.add('active'); 
    }
    
    // Inicializar el calendario de 3 meses y el sistema de rating
    renderSpecialistCalendar();
    setupReviewRating();

    // Exportar funciones que se llaman desde el HTML (onclick)
    window.navigateThreeMonths = navigateThreeMonths;
    window.handleClinicTabChange = handleClinicTabChange; 
    window.openScheduleModal = openScheduleModal;
    window.confirmSchedule = confirmSchedule;
    window.submitReview = submitReview;
    window.submitQuestion = submitQuestion;
    window.selectTimeSlot = selectTimeSlot; 
    window.openMediaModal = openMediaModal;
}

// ====================================================================
// --- LÍNEA CLAVE PARA QUE FUNCIONE CON EL CARGADOR DE PÁGINA ---
// ====================================================================
export { init };