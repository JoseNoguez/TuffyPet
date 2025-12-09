// RUTA: /src/js/core/main.js
// RESPONSABILIDAD: Inicializar la aplicación, configurar utilidades base y el flujo inicial.

import { initRouter } from './router.js';
import { checkAuthStatus, getIsLoggedIn, getUserRole, handleLoginClick, logout } from './auth.js';
import { setSystemCookie } from '../utils/coreUtils.js';
import { initAnchorScrollHandler } from '../utils/pageLoader.js';
import { 
    openModal, 
    closeModal, 
    initGlobalUI,
    updateLoginButton
} from '../utils/uiUtils.js';

function initializeApp() {
    console.log("🚀 TuffyVet SPA Inicializada en modo modular.");

    // 0. YA NO USAMOS startPageLoad (no existe para importar)
    // startPageLoad();

    // 1. EXPOSICIÓN GLOBAL DE FUNCIONES 
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.handleLoginClick = handleLoginClick;
    window.logout = logout;
    window.getIsLoggedIn = getIsLoggedIn;
    window.getUserRole = getUserRole;
    window.updateLoginButton = updateLoginButton;

    // 2. Inicialización de la UI Global 
    initGlobalUI();
    initAnchorScrollHandler();

    // 3. GESTIÓN DE UTILIDADES
    setSystemCookie();
    
    // 4. COMPROBAR AUTENTICACIÓN 
    checkAuthStatus();

    // 5. INICIALIZAR EL ROUTER
    initRouter();
}

// ⭐ CLAVE: Asegura que el DOM está cargado antes de inicializar la app.
document.addEventListener('DOMContentLoaded', initializeApp);
