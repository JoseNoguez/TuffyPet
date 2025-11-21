// RUTA: /src/js/modules/login.js
// RESPONSABILIDAD: Manejar la interacción del formulario de inicio de sesión y botones de acceso.

// ⭐ CRÍTICO: Asegúrate de que esta ruta sea correcta: '../core/auth.js'
import { loginUser, ROLES } from '../core/auth.js'; 

// ===================================
// --- FUNCIONES DE UTILIDAD DE UI ---
// ===================================

const FORM_ID = 'login-form';
const MESSAGE_ID = 'login-message-container';

/**
 * Muestra el formulario de login (Email/Contraseña).
 * NO toca la visibilidad de NINGÚN botón.
 */
function showLoginForm(role) {
    const form = document.getElementById(FORM_ID);
    const message = document.getElementById(MESSAGE_ID);
    
    // Mostrar el formulario
    if (form) form.style.display = 'flex';
    // Asegurarse de que el mensaje de carga esté oculto
    if (message) message.style.display = 'none';
    
    // Enfocar el primer campo del formulario
    const usernameInput = document.getElementById('username-input');
    if (usernameInput) usernameInput.focus();
    
    console.log(`Modo de formulario activado para: ${role}.`);
}

/**
 * Oculta el formulario de login.
 * NO toca la visibilidad de NINGÚN botón.
 */
function hideLoginForm() {
    const form = document.getElementById(FORM_ID);
    const message = document.getElementById(MESSAGE_ID);
    
    // Ocultar el formulario
    if (form) form.style.display = 'none';
    // Asegurarse de que el mensaje de carga esté oculto
    if (message) message.style.display = 'none'; 
    
    console.log("Formulario de Login Oculto.");
}

/**
 * Oculta el formulario y muestra el mensaje de carga/spinner.
 */
function showLoadingState(isSocial) {
    const form = document.getElementById(FORM_ID);
    const message = document.getElementById(MESSAGE_ID);

    if (form) form.style.display = 'none';
    
    // Mostrar el contenedor de carga centrado
    if (message) {
        message.style.display = 'flex'; 
        const loadingText = message.querySelector('p');
        // Texto de carga dinámico
        if (loadingText) {
            loadingText.textContent = isSocial 
                ? 'Redireccionando a login social...' 
                : 'Iniciando sesión...';
        }
    }
}


// ===================================
// --- INICIALIZACIÓN DEL MÓDULO ---
// ===================================

export function init() {
    const loginForm = document.getElementById(FORM_ID);
    const btnGoogle = document.querySelector('.btn-google');
    const btnApple = document.querySelector('.btn-apple');
    const btnTuffy = document.getElementById('btn-tuffy');
    const btnSpecialist = document.getElementById('btn-specialist');
    
    // 1. Estado Inicial: Aseguramos que el formulario esté oculto al cargar.
    hideLoginForm(); 
    
    if (!loginForm) {
        console.error("❌ Formulario de login no encontrado.");
        return;
    }

    // 2. Manejar el click en los botones de Rol para MOSTRAR el formulario (Email/Pass)
    
    // Botón TuffyPet
    if(btnTuffy) {
        btnTuffy.addEventListener('click', (e) => {
             e.preventDefault(); 
             showLoginForm(ROLES.USUARIO); // Muestra el formulario
        });
    }

    // Botón Especialista
    if(btnSpecialist) {
        btnSpecialist.addEventListener('click', (e) => {
             e.preventDefault(); 
             showLoginForm(ROLES.ESPECIALISTA); // Muestra el formulario
        });
    }

    // 3. Manejar el click en los botones Sociales (OCULTAN el formulario si estaba visible)
    
    const handleSocialLogin = (e, provider) => {
        e.preventDefault();
        
        // 1. Ocultamos el formulario (regla clave)
        hideLoginForm(); 
        
        // 2. Simulamos el estado de carga (redirección)
        showLoadingState(true);
        
        // 3. Mostramos un mensaje de simulación.
        if(window.showMessage) window.showMessage('Redirección', `Iniciando sesión con ${provider}...`, 'info');
        
        // Simular la redirección o espera antes de volver al estado inicial 
        setTimeout(() => {
            hideLoginForm(); // Ocultar el estado de carga
        }, 3000); 
    };

    if (btnGoogle) {
        btnGoogle.addEventListener('click', (e) => handleSocialLogin(e, 'Google'));
    }
    if (btnApple) {
        btnApple.addEventListener('click', (e) => handleSocialLogin(e, 'Apple'));
    }


    // 4. Manejar el envío del formulario (Login Action)
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 

        const usernameInput = document.getElementById('username-input');
        const passwordInput = document.getElementById('password-input');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // Determinar el rol: Asumimos TuffyPet si el formulario está abierto.
        // Si el login de Especialista necesita un rol distinto, la lógica de la API debería manejarlo.
        const currentRole = ROLES.USUARIO; 
        
        showLoadingState(false);
        
        try {
            const success = await loginUser(username, password, currentRole); 

            if (success) {
                // Éxito: (Redirección o cierre de modal)
            } else {
                // Falla: volvemos a mostrar el formulario
                showLoginForm(currentRole); 
                if(window.showMessage) window.showMessage('Error', 'Credenciales inválidas.', 'error');
            }

        } catch (error) {
            console.error('Error durante el proceso de login:', error);
            showLoginForm(currentRole);
            if(window.showMessage) window.showMessage('Error de Conexión', 'Fallo al intentar conectar con el servidor.', 'error');
        }
    });
}