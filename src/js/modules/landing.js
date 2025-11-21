// ====================================================================
// 🏡 --- landing.js: LÓGICA DE LA PÁGINA PRINCIPAL (LANDING PAGE) ---
// ====================================================================

// Importamos funciones del núcleo de autenticación necesarias en la Landing
import {
    handleLoginClick, // Usado para conectar el botón de login/logout
    checkAuthStatus,  // Usado para actualizar el estado del botón al cargar
    getIsLoggedIn,    // NECESARIO para la lógica directa del botón de la landing
    logout            // Expuesto globalmente
} from '../core/auth.js'; 

// Importamos funciones de UI globales (de uiUtils.js)
import {
    updateLoginButton,
    initGlobalUI,
    openModal, // Asegúrate de importar estas para exponerlas globalmente
    closeModal  // Asegúrate de importar estas para exponerlas globalmente
} from '../utils/uiUtils.js'; 

// Nota: Swal no se importa, ya que se asume que está cargado globalmente en index.html.


// ====================================================================
// UTILIDADES INTERNAS PARA CARRUSELES (NECESARIO PARA EL CLEANUP)
// ====================================================================

/**
 * Configura un carrusel y devuelve los handlers necesarios para su limpieza.
 * @param {string} carouselSelector Selector del contenedor del carrusel.
 * @param {string} trackSelector Selector del track de ítems.
 * @param {string} itemSelector Selector de cada ítem.
 * @param {number} intervalTime Tiempo de intervalo para el autoplay.
 * @returns {object | null} Objeto con referencias y handlers para cleanup.
 */
function setupCarousel(carouselSelector, trackSelector, itemSelector, intervalTime = 4500) {
    const carousel = document.querySelector(carouselSelector);
    if (!carousel) return null;

    const track = carousel.querySelector(trackSelector);
    const items = track.querySelectorAll(itemSelector);
    if (items.length === 0) return null;

    const prevBtn = carousel.querySelector('.car-nav.prev') || carousel.querySelector('.pet-nav.prev');
    const nextBtn = carousel.querySelector('.car-nav.next') || carousel.querySelector('.pet-nav.next');

    let currentSlide = 0;
    let itemsPerView = 3;
    let itemWidth = 0;
    let autoplayInterval;

    function updateCarouselMetrics() {
        if (window.innerWidth <= 600) {
            itemsPerView = 1;
            itemWidth = 0;
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            stopAutoplay();
        } else {
            if (window.innerWidth <= 992) {
                itemsPerView = carouselSelector === '.carousel' ? 2 : 3;
            } else {
                itemsPerView = carouselSelector === '.carousel' ? 3 : 4;
            }

            const currentItems = track.querySelectorAll(itemSelector);
            if (currentItems.length > 0) {
                const style = window.getComputedStyle(track);
                const gapMatch = style.gap ? style.gap.match(/([\d\.]+)(rem|px)/i) : null;
                const gap = gapMatch ? parseFloat(gapMatch[1]) * (gapMatch[2] === 'rem' ? 16 : 1) : 0;
                itemWidth = currentItems[0].offsetWidth + gap;
            }

            if (prevBtn) prevBtn.style.display = 'grid';
            if (nextBtn) nextBtn.style.display = 'grid';
            updateCarouselPosition();
            startAutoplay();
        }
    }

    function updateCarouselPosition() {
        if (itemWidth === 0) return;

        const totalItems = track.querySelectorAll(itemSelector).length;
        const maxScroll = Math.max(0, totalItems - itemsPerView);

        currentSlide = Math.max(0, Math.min(currentSlide, maxScroll));
        const offset = -currentSlide * itemWidth;
        track.style.transform = `translateX(${offset}px)`;

        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) nextBtn.disabled = currentSlide >= maxScroll;
    }

    function nextSlide() {
        const totalItems = track.querySelectorAll(itemSelector).length;
        const maxScroll = totalItems - itemsPerView;
        currentSlide = currentSlide < maxScroll ? currentSlide + 1 : 0;
        updateCarouselPosition();
    }

    function startAutoplay() {
        const totalItems = track.querySelectorAll(itemSelector).length;
        if (itemWidth > 0 && totalItems > itemsPerView && !autoplayInterval) {
            autoplayInterval = setInterval(nextSlide, intervalTime);
        }
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
    
    // Handlers con nombre para poder removerlos
    const handleMouseEnter = stopAutoplay;
    const handleMouseLeave = startAutoplay;
    const handleNextClick = () => {
        stopAutoplay();
        nextSlide();
        setTimeout(startAutoplay, intervalTime * 0.2);
    };
    const handlePrevClick = () => {
        stopAutoplay();
        currentSlide = Math.max(0, currentSlide - 1);
        updateCarouselPosition();
        setTimeout(startAutoplay, intervalTime * 0.5);
    };

    // Agregar Listeners
    carousel.addEventListener('mouseenter', handleMouseEnter);
    carousel.addEventListener('mouseleave', handleMouseLeave);
    if (nextBtn) nextBtn.addEventListener('click', handleNextClick);
    if (prevBtn) prevBtn.addEventListener('click', handlePrevClick);
    
    const resizeHandler = updateCarouselMetrics;
    window.addEventListener('resize', resizeHandler);
    
    // Inicializar
    updateCarouselMetrics();
    startAutoplay();
    
    return { 
        carousel, prevBtn, nextBtn, // Referencias DOM
        resizeHandler, 
        stopAutoplay, 
        handleMouseEnter, handleMouseLeave,
        handleNextClick, handlePrevClick
    };
}


// ====================================================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ====================================================================
export function init() {
    console.log("🔥 Ejecutando lógica de src/js/modules/landing.js (Inicializando)...");
    
    

    // -------------------------------
    // 📌 REFERENCIAS DE ELEMENTOS DOM
    // -------------------------------
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    const navLinks = document.querySelectorAll('.menu a');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('q');
    const citySelect = document.getElementById('city');
    const serviceButtons = document.querySelectorAll('.svc');
    const searchButton = document.getElementById('btn-search');
    const toTopButton = document.querySelector('.to-top');
    const sections = document.querySelectorAll('section');
    
    let observer; // Referencia al IntersectionObserver
    let loginButton; // Referencia al botón de login
    // ⭐ AÑADIDO: Referencia al botón de logout
    let logoutButton; 
    
    // ===============================
    // 🔐 BOTÓN DE LOGIN/LOGOUT (AUTENTICACIÓN) - Setup
    // ===============================
    
    // Usamos Promise.resolve().then() para garantizar que el DOM inyectado esté listo.
    Promise.resolve().then(() => {
        loginButton = document.getElementById('auth-btn');
        // ⭐ AÑADIDO: Obtener el botón de logout
        logoutButton = document.getElementById('logout-btn');
        
        // --- 1. CONFIGURACIÓN DEL BOTÓN LOGIN/MI CUENTA (#auth-btn) ---
        if (loginButton) {
            console.log("✅ Botón de Login 'auth-btn' encontrado en Landing.js. Asignando handler...");
            
            // Asignar el Listener DE FORMA SEGURA 
            loginButton.onclick = (e) => {
                e.preventDefault();
                console.log("✅ Click en Login de Landing detectado. Llamando a handleLoginClick central.");
                // Usamos la función expuesta globalmente, que es el 'handleLoginClick' importado.
                window.handleLoginClick(e); 
            };
            
            // Actualizar estado visual
            checkAuthStatus(); // Esto llama internamente a window.updateLoginButton()
            
        } else {
            console.warn("⚠️ Advertencia: 'auth-btn' no encontrado en Landing.js.");
        }

        // --- 2. CONFIGURACIÓN DEL BOTÓN LOGOUT (#logout-btn) ---
        if (logoutButton) {
            console.log("✅ Botón de Logout encontrado. Asignando handler...");
            
            // Handler con nombre para poder removerlo fácilmente en cleanup
            const handleLogoutClick = (e) => {
                e.preventDefault();
                console.log("🚪 Click en Logout detectado. Llamando a la función central 'logout'.");
                // Llama a la función 'logout' que ya está expuesta globalmente.
                if (window.logout) {
                    window.logout();
                }
            };
            
            logoutButton.addEventListener('click', handleLogoutClick);
            // Almacenamos la referencia para el cleanup
            logoutButton.handleLogoutClick = handleLogoutClick;
        }

        // ⭐ EXPOSICIÓN GLOBAL DE FUNCIONES (para uso en HTML/Modales)
        // (Asegúrate de importar openModal y closeModal)
        window.openModal = openModal;
        window.closeModal = closeModal;
        window.handleLoginClick = handleLoginClick; // toggleLogin
        window.logout = logout; 
        window.updateLoginButton = updateLoginButton; 
        window.getIsLoggedIn = getIsLoggedIn; 
        
        // Inicializar listeners de UI globales (cierre de dropdown, ESC, etc.)
        initGlobalUI();
    });
    
    
    // ===============================
    // 🍔 MENÚ HAMBURGUESA Y NAVEGACIÓN - Listeners
    // ===============================

    function toggleMenu() {
        if (!menu || !hamburger) return;
        menu.classList.toggle('open');
        hamburger.classList.toggle('active');
    }
    
    function closeMenuOnLinkClick() {
        if (window.innerWidth <= 992 && menu?.classList.contains('open')) {
            toggleMenu();
        }
    }
    
    const toggleMenuWrapper = (e) => { // Wrapper para la remoción segura
        e.stopPropagation();
        toggleMenu();
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMenuWrapper);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenuOnLinkClick);
    });

    // ===============================
    // 📊 LÓGICA DE TABS (Nosotros) - Listeners
    // ===============================
    
    function handleTabClick(e) {
        const button = e.currentTarget;
        const targetPanelId = button.dataset.tab;
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) targetPanel.classList.add('active');
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });

    // ===============================
    // 🐾 CARRUSELES AUTOMÁTICOS - Setup
    // ===============================
    
    const carousel1Handlers = setupCarousel('.carousel', '.track', '.card-op', 4000);
    const carousel2Handlers = setupCarousel('.pet-carousel', '.pet-track', '.pet', 5000);


    // ===============================
    // ⬆️ BOTÓN “IR ARRIBA” - Listeners
    // ===============================

    function toggleToTopButton() {
        if (window.scrollY > 300) {
            toTopButton?.classList.add('show');
        } else {
            toTopButton?.classList.remove('show');
        }
    }
    
    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    toTopButton?.addEventListener('click', handleScrollToTop);

    const scrollHandler = toggleToTopButton;
    window.addEventListener('scroll', scrollHandler);

    // ===============================
    // 👁️ ANIMACIONES AL HACER SCROLL - Setup
    // ===============================

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (!section.classList.contains('hero')) observer.observe(section);
        else section.classList.add('visible');
    });

    // ===============================
    // 🔍 BUSCADOR Y FILTROS - Listeners
    // ===============================

    function saveSearchFilters(serviceTerm, cityValue) {
        const params = new URLSearchParams();
        if (serviceTerm.trim() !== '') params.append('q', serviceTerm.trim());
        if (cityValue.trim() !== '') params.append('ubicacion', cityValue.trim());
        window.location.hash = `/busqueda?${params.toString()}`;
    }

    function handleManualSearch(e) {
        e.preventDefault();
        const searchTerm = searchInput?.value.trim() || '';
        const selectedCity = citySelect?.value || '';

        if (searchTerm === '' && selectedCity === '') {
            // Nota: Se asume que Swal está disponible globalmente
            Swal.fire({
                icon: 'warning',
                title: '¡Criterios de Búsqueda!',
                text: 'Debes ingresar una especialidad/nombre o seleccionar una ciudad.',
                confirmButtonColor: '#ffc107'
            });
            return;
        }
        saveSearchFilters(searchTerm, selectedCity);
    }
    
    function handleServiceClick(e) {
        e.preventDefault();
        const serviceType = e.currentTarget.getAttribute('data-service');
        const cityToSearch = citySelect ? citySelect.value : '';
        saveSearchFilters(serviceType, cityToSearch);
    }
    
    const searchHandler = handleManualSearch;
    searchButton?.addEventListener('click', searchHandler);

    serviceButtons.forEach(button => {
        button.addEventListener('click', handleServiceClick);
    });

    console.log("✅ Lógica de Landing Page inicializada correctamente.");
    
    // ====================================================================
    // FUNCIÓN DE LIMPIEZA (CLEANUP)
    // ====================================================================

    /**
     * Función que remueve todos los event listeners y detiene procesos periódicos.
     * Esto es crucial al navegar a otra página dentro de la aplicación SPA.
     */
    const cleanup = () => {
        console.log("🧹 Ejecutando cleanup de src/js/modules/landing.js...");
        
        // 1. Limpieza de Autenticación
        if (loginButton) {
            loginButton.onclick = null; // Elimina el handler de login
        }
        // ⭐ AÑADIDO: Limpieza del botón de Logout
        if (logoutButton && logoutButton.handleLogoutClick) {
            logoutButton.removeEventListener('click', logoutButton.handleLogoutClick);
        }
        
        // 2. Limpieza de Menú y Navegación
        if (hamburger) {
            hamburger.removeEventListener('click', toggleMenuWrapper);
        }
        navLinks.forEach(link => {
            link.removeEventListener('click', closeMenuOnLinkClick);
        });

        // 3. Limpieza de Tabs
        tabButtons.forEach(button => {
            button.removeEventListener('click', handleTabClick);
        });
        
        // 4. Limpieza de Carruseles
        [carousel1Handlers, carousel2Handlers].forEach(handlers => {
            if (handlers) {
                handlers.stopAutoplay();
                
                // Remover eventos de Mouse
                handlers.carousel.removeEventListener('mouseenter', handlers.handleMouseEnter);
                handlers.carousel.removeEventListener('mouseleave', handlers.handleMouseLeave);

                // Remover eventos de Navegación
                if (handlers.nextBtn) handlers.nextBtn.removeEventListener('click', handlers.handleNextClick);
                if (handlers.prevBtn) handlers.prevBtn.removeEventListener('click', handlers.handlePrevClick);
                
                // Remover evento de redimensionamiento
                window.removeEventListener('resize', handlers.resizeHandler);
            }
        });

        // 5. Limpieza de Botón "Ir Arriba"
        toTopButton?.removeEventListener('click', handleScrollToTop);
        window.removeEventListener('scroll', scrollHandler);

        // 6. Limpieza de Animaciones por Scroll
        observer?.disconnect();
        
        // 7. Limpieza de Buscador y Filtros
        searchButton?.removeEventListener('click', searchHandler);
        serviceButtons.forEach(button => {
            button.removeEventListener('click', handleServiceClick);
        });

        // 8. Limpieza de Funciones Globales (Opcional, pero seguro)
        // Mantener funciones globales expuestas (handleLoginClick, openModal, etc.)
        
        console.log("✅ Cleanup de Landing Page completado.");
    };
    
    // Retornamos la función de limpieza
    return cleanup;
}