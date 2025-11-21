// RUTA: /src/js/utils/uiUtils.js
// RESPONSABILIDAD: Contiene utilidades de Interfaz de Usuario (UI) globales.

// ===================================
// A. GESTIÓN DE MENSAJES (SweetAlert2)
// ===================================

/**
 * 📢 EXPORTADO: Muestra un mensaje de alerta usando SweetAlert2 (Swal).
 */
export function showMessage(title, text, icon = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            confirmButtonColor: '#3e8ecd',
        });
    } else {
        console.warn(`[showMessage Fallback] ${title}: ${text}`);
        alert(`${title}: ${text}`);
    }
}


// ===================================
// B. GESTIÓN DE MODALES
// ===================================

/**
 * 🎨 EXPORTADO: Abre un modal específico por su ID.
 */
export function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * 🎨 EXPORTADO: Cierra un modal específico por su ID.
 */
export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';

        const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
        // Solo restauramos el scroll si no quedan modales abiertos
        if (openModals.length === 0) {
            document.body.style.overflow = '';
        }
    }
}


// ===================================
// C. GESTIÓN DE LOGIN Y UI
// ===================================

/**
 * 🎨 EXPORTADO: Actualiza el texto y la funcionalidad de los botones (Desktop y Mobile).
 */
export function updateLoginButton() {
    // 🔐 USAMOS FUNCIONES GLOBALES (Expuestas en auth.js)
    const isLoggedIn = window.getIsLoggedIn ? window.getIsLoggedIn() : false;
    const userRole = window.getUserRole ? window.getUserRole() : 'Invitado';

    // ⭐ CORRECCIÓN: Usamos 'auth-btn' que es el ID que existe en tu HTML
    const btns = [
        { id: 'auth-btn', textSpanId: null }, // El texto está directamente en el botón
        { id: 'mobileLoginBtn', textSpanId: 'mobileLoginText' }
    ];

    const accountContainer = document.getElementById('account-container');

    btns.forEach(config => {
        const btn = document.getElementById(config.id);
        if (!btn) return;

        // Si textSpanId es null, el elemento objetivo es el propio botón (btn)
        const textSpan = (config.textSpanId && btn.querySelector(`#${config.textSpanId}`)) || btn;

        if (isLoggedIn) {
            // --- USUARIO LOGUEADO ---
            textSpan.innerHTML = `
        <i class="fa-solid fa-bone icon-spacing"></i>&nbsp&nbsp&nbsp
        Mi Cuenta &nbsp&nbsp&nbsp&nbsp&nbsp
        <span class="dropdown-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
                <path d="M3.293 7.293a1 1 0 0 1 1.414 0L12 14.586l7.293-7.293a1 1 0 1 1 1.414 1.414l-8 8a1 1 0 0 1-1.414 0l-8-8a1 1 0 0 1 0-1.414Z"></path>
            </svg>
        </span>
    `;

            // Al hacer clic, alternamos el menú de perfil
            btn.onclick = (e) => {
                e.preventDefault();
                if (window.handleLoginClick) {
                    window.handleLoginClick(e); // Llama a la lógica de auth.js (toggle del menú)
                }
            };
        } else {
            // --- USUARIO NO LOGUEADO ---
            textSpan.textContent = 'Iniciar Sesión';
            // Asegúrate de que el contenedor de perfil esté cerrado
            if (accountContainer) accountContainer.classList.remove('open');

            // Llama a handleLoginClick para abrir el modal
            btn.onclick = (e) => {
                e.preventDefault();
                if (window.handleLoginClick) window.handleLoginClick(e);
            };
        }
    });

    // ⭐ LISTENER DE LOGOUT
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && window.logout) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            window.logout(e); // Llama a la función de cierre de sesión
        };
    }
}


/**
 * EXPORTADO: Inicializa los listeners de UI globales (cerrar dropdown, modales, y ESC).
 */
export function initGlobalUI() {
    // 1. Cierre de dropdown de perfil y modales al hacer clic fuera (Blur)
    document.addEventListener('click', function (e) {
        const accountContainer = document.getElementById('account-container');
        const loginBtn = document.getElementById('auth-btn') || document.getElementById('mobileLoginBtn');

        // Lógica de cierre de Dropdown
        if (accountContainer && accountContainer.classList.contains('open')) {
            // Si el clic NO fue en el botón de login ni dentro del contenedor de perfil
            if (!loginBtn?.contains(e.target) && !accountContainer.contains(e.target)) {
                accountContainer.classList.remove('open'); // Cierra el menú
            }
        }

        // Lógica de cierre de Modal (Blur en el overlay)
        const target = e.target;
        if (target.classList.contains('modal-overlay') && window.closeModal) {
            // Asume que la clase 'modal-overlay' solo está en el fondo
            window.closeModal(target.id);
        }
    });

    // 2. Cierre de modales con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && window.closeModal) {
            // Busca el modal más alto que esté visible
            const visibleModals = document.querySelectorAll('.modal-overlay[style*="display: flex"]');
            if (visibleModals.length > 0) {
                const topModal = visibleModals[visibleModals.length - 1];
                window.closeModal(topModal.id);
            }
        }
    });
    console.log("Global UI Handlers inicializados.");
}