// RUTA: /src/js/modules/registro.js (VERSIÓN INDEPENDIENTE)

// Ya no necesitas importar loadView

// Función que maneja la carga del formulario
function handleLoadRegistration(rol) {
    let htmlPath = '';

    switch (rol) {
        case 'cliente':
            // Redirige a la página HTML del formulario
            htmlPath = '/src/views/cards/registro/cliente.html';
            break;
        case 'especialista':
            htmlPath = '/src/views/cards/registro/especialista.html';
            break;
        case 'clinica':
            htmlPath = '/src/views/cards/registro/clinica.html';
            break;
        default:
            console.error('❌ Rol de registro no reconocido:', rol);
            return;
    }

    // ⭐ CLAVE: Redireccionar la ventana completa, no cargar la vista SPA
    window.location.href = htmlPath;
}

/**
 * 🚀 Función de inicialización del módulo.
 */
export function init() {
    console.log('✅ Módulo de registro independiente inicializado. Agregando listeners...');
    
    const roleCards = document.querySelectorAll('.role-card[data-role]');

    roleCards.forEach(card => {
        const rol = card.getAttribute('data-role'); 
        
        if (rol) {
            card.addEventListener('click', (e) => {
                e.preventDefault(); 
                handleLoadRegistration(rol); // Llama a la nueva función de redirección
            });
            console.log(`- Listener agregado a tarjeta para rol: ${rol}`);
        }
    });
}

// ⭐ CLAVE: Autoejecutar la inicialización si no hay un main.js que lo haga
document.addEventListener('DOMContentLoaded', init); 

// No necesitas la función 'cleanup' si no es parte de un SPA.