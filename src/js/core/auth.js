// RUTA: /src/js/core/auth.js
// RESPONSABILIDAD: Gestión central de JWT, refresco de tokens, y peticiones seguras (SIMULACIÓN en loginUser).

// ⭐ Importamos utilidades necesarias
import { API_ENDPOINTS } from '../utils/config.js';
import { updateLoginButton } from '../utils/uiUtils.js'; // Necesaria para sincronizar la UI
import { loadModalView } from '../utils/pageLoader.js';

// ====================================
// --- VARIABLES GLOBALES DE SESIÓN ---
// ====================================

const TOKEN_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    ROLE: 'userRole',
};

// Roles para el control de acceso
export const ROLES = {
    ADMIN: 'Admin',
    USUARIO: 'Usuario',
};

// SIMULACIÓN: Credenciales de prueba
const SIMULATED_USERNAME = 'test';
const SIMULATED_PASSWORD = '123';
const MOCK_ADMIN_ROLE = ROLES.ADMIN;
const SIMULATION_DELAY_MS = 1000;

// Estado global reactivo
let isLoggedIn = !!localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
let userRole = localStorage.getItem(TOKEN_KEYS.ROLE) || ROLES.USUARIO;

// Estado para saber si la vista HTML del modal ya se inyectó
let loginModalHtmlLoaded = false;


// ====================================
// --- FUNCIONES DE ESTADO Y UTILIDAD ---
// ====================================

export const getIsLoggedIn = () => isLoggedIn;
export const getUserRole = () => userRole;

/**
 * 💾 Guarda tokens y rol en localStorage
 * 🔑 Añade la clase 'logged-in' al contenedor.
 */
export function setAuthData(accessToken, refreshToken, role) {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(TOKEN_KEYS.ROLE, role);
    isLoggedIn = true;
    userRole = role;

    // --- Sincronización de UI para LOGIN ---
    const container = document.getElementById('account-container');
    container?.classList.add('logged-in'); 
    // ---------------------------------------

    if (typeof updateLoginButton === 'function') updateLoginButton();
}

/**
 * 🗑️ Limpia la sesión (Logout)
 * 🔑 Remueve las clases 'logged-in' y 'open' del contenedor.
 */
export function clearAuthData() {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.ROLE);
    isLoggedIn = false;
    userRole = ROLES.USUARIO;

    // --- Sincronización de UI para LOGOUT ---
    const container = document.getElementById('account-container');
    container?.classList.remove('logged-in'); 
    container?.classList.remove('open');     
    // ---------------------------------------

    if (typeof updateLoginButton === 'function') updateLoginButton();
}

/**
 * 🔄 Refresca el token de acceso (REAL, no se modifica)
 */
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
        clearAuthData();
        return false;
    }

    try {
        const response = await fetch(API_ENDPOINTS.REFRESH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            setAuthData(data.JwtToken, data.RefreshToken, data.Role || userRole);
            return true;
        } else {
            throw new Error(`Fallo en la renovación del token: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error al refrescar el token:', error);
        clearAuthData();
        return false;
    }
}

/**
 * 🛡️ Fetch seguro con reintento si el token expira (REAL, no se modifica)
 */
export async function secureFetch(url, options = {}, isRetry = false) {
    let accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);

    if (!accessToken) {
        if (isRetry) throw new Error('No hay token para reintentar.');
        // Si no hay token, simplemente realiza la petición normal (ej: para endpoints públicos)
        return fetch(url, options);
    }

    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${accessToken}`;

    const response = await fetch(url, options);

    if (response.status === 401 && !isRetry) {
        const refreshSuccessful = await refreshAccessToken();

        if (refreshSuccessful) {
            console.log('🔄 Token refrescado, reintentando...');
            return secureFetch(url, { ...options }, true);
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sesión expirada',
                    text: 'Por favor, vuelve a iniciar sesión.',
                    confirmButtonColor: '#3e8ecd',
                });
            }
            throw new Error('Sesión expirada. Refresh fallido.');
        }
    }

    return response;
}

// ====================================
// --- FUNCIÓN DE LOGIN PRINCIPAL (SIMULADA) ---
// ====================================

/**
 * 🔑 Intenta iniciar sesión y gestiona la respuesta de tokens.
 */
export function loginUser(username, password, requestedRole) {
    // Retorna una promesa para simular el comportamiento asíncrono de un fetch
    return new Promise((resolve) => {

        console.log(`[AUTH.JS] SIMULACIÓN: Intentando login para: ${username}...`);

        // Simulación de latencia de red
        setTimeout(() => {
            try {
                if (username === SIMULATED_USERNAME && password === SIMULATED_PASSWORD) {
                    // --- CAMINO DE ÉXITO: Credenciales de prueba OK (test/123) ---
                    console.log(`[AUTH.JS] SIMULACIÓN: Login exitoso. Usuario: ${username}, Rol: ${MOCK_ADMIN_ROLE}`);

                    // 1. Generar datos de mock
                    const mockAccessToken = `mock_access_${MOCK_ADMIN_ROLE}_${Date.now()}`;
                    const mockRefreshToken = `mock_refresh_${MOCK_ADMIN_ROLE}_${Date.now()}`;

                    // 2. Establecer los datos de autenticación (esto actualiza isLoggedIn y userRole)
                    setAuthData(mockAccessToken, mockRefreshToken, MOCK_ADMIN_ROLE);

                    // 3. Cerrar el modal
                    if (typeof window.closeModal === 'function') {
                        window.closeModal('loginModal');
                    }

                    // 4. Mostrar mensaje de éxito
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Bienvenido (SIMULADO)!',
                            text: `Has iniciado sesión como ${MOCK_ADMIN_ROLE}.`,
                            confirmButtonColor: '#3e8ecd'
                        });
                    }
                    resolve(true); // Indica que el login fue exitoso

                } else {
                    // --- CAMINO DE FALLO: Credenciales incorrectas ---
                    console.error('[AUTH.JS] SIMULACIÓN: Login fallido: Credenciales incorrectas.');
                    
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Credenciales Incorrectas (Simulación)',
                            text: 'El login simulado falló. Use usuario: "test" y contraseña: "123".',
                            confirmButtonColor: '#d90429'
                        });
                    }
                    resolve(false); // Indica que el login falló
                }

            } catch (error) {
                console.error('[AUTH.JS] Error durante la simulación de login:', error);
                // Manejar error inesperado
                resolve(false);
            }
        }, SIMULATION_DELAY_MS);
    });
}


// ====================================
// --- INTERFAZ DE LOGIN UNIVERSAL ---
// ====================================

/**
 * 🚀 Abre el modal de login O MUESTRA DROPDOWN DE PERFIL.
 * @param {Event} e - Evento de clic para prevenir comportamiento por defecto.
 */
export async function handleLoginClick(e) {
    if (e) e.preventDefault();

    // Referencia al contenedor padre
    const accountContainer = document.getElementById('account-container'); 

    // ⭐ CRÍTICO: Chequea el estado global
    if (isLoggedIn) {
        // --- USUARIO LOGUEADO: Activa el comportamiento de perfil (TOGGLE del dropdown) ---
        console.log("✅ Usuario logueado. Alternando dropdown.");

        // Aplica/Remueve la clase 'open' en el contenedor padre.
        accountContainer?.classList.toggle('open'); 

    } else {
        // --- USUARIO NO LOGUEADO: Abre el modal ---
        console.log("👤 Usuario NO logueado. Abriendo modal de login.");

        const modalWrapper = document.getElementById('loginModal');
        const modalContent = document.getElementById('loginModalContent');

        if (!modalWrapper || !modalContent) {
            console.error("❌ Modal base (loginModal/loginModalContent) no encontrado en index.html");
            return;
        }

        // 1. Si la vista HTML nunca se ha cargado, inyectarla y ejecutar su JS.
        if (!loginModalHtmlLoaded) {
            try {
                // 'login' coincide con src/js/modules/login.js
                await loadModalView('/src/views/auth/login.html', 'login', modalContent);
                loginModalHtmlLoaded = true;
            } catch (err) {
                console.error("❌ Error al cargar login modal:", err);
                return;
            }
        }

        // 2. Mostrar el modal (usando la función global 'openModal')
        if (typeof window.openModal === 'function') {
            window.openModal('loginModal');
        } else {
            // Fallback
            modalWrapper.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
}

/**
 * 🚪 Cierra el modal de login (globalmente expuesto)
 */
export function closeLoginModal() {
    // Usamos la función global 'closeModal'
    if (typeof window.closeModal === 'function') {
        window.closeModal('loginModal');
    } else {
        const modalWrapper = document.getElementById('loginModal');
        if (modalWrapper) {
            modalWrapper.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}


/**
 * 🚪 Logout manual
 */
export function logout() {
    clearAuthData();
    // La remoción de clases 'logged-in' y 'open' se hace en clearAuthData()

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Sesión cerrada',
            text: 'Has cerrado sesión correctamente.',
            confirmButtonColor: '#3e8ecd',
        });
    }
}

/**
 * 🧠 Chequea estado de sesión al iniciar la app
 * ⭐ IMPORTANTE: Esta función llama a updateLoginButton para sincronizar la UI.
 */
export function checkAuthStatus() {
    // Sincroniza el estado inicial de 'logged-in' al cargar la página.
    const container = document.getElementById('account-container');
    if (isLoggedIn) {
        container?.classList.add('logged-in'); 
    } else {
        container?.classList.remove('logged-in');
    }

    if (typeof updateLoginButton === 'function') updateLoginButton();
}

// ====================================
// 🔌 EXPOSICIÓN GLOBAL DE FUNCIONES CRÍTICAS (CRÍTICO para que uiUtils funcione)
// ====================================

// Deben ser expuestas a 'window' para que otros módulos (como uiUtils.js) puedan usarlas
// sin importación directa (porque uiUtils.js está en otra rama de la estructura de módulos).

window.handleLoginClick = handleLoginClick; 
window.logout = logout; 
window.getIsLoggedIn = getIsLoggedIn;
window.getUserRole = getUserRole;

// ====================================
// 🚀 INICIALIZACIÓN AUTOMÁTICA
// ====================================

// ⭐ LÍNEA CRUCIAL: Esto asegura que el botón se actualice inmediatamente al cargar el módulo.
checkAuthStatus();