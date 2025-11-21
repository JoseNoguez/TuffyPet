// RUTA: /src/js/core/router.js
// RESPONSABILIDAD: Mapear la URL del navegador con la vista (HTML) y la lógica (JS) a cargar.

import { loadView } from '../utils/pageLoader.js'; 

// ====================================
// --- MAPA DE RUTAS (Centralizado) ---
// ====================================

const routes = {
    '': { html: '/src/views/global/landing.html', module: 'landing' },
    'home': { html: '/src/views/global/landing.html', module: 'landing' },

    // RUTAS PRINCIPALES DEL FLUJO
    'registro': { html: '/src/views/auth/registro.html', module: 'registro' },
    'busqueda': { html: '/src/views/search/search.html', module: 'busqueda' },
    
    // Ruta de Fallback (Error 404)
    '404': { html: '/src/views/global/404.html', module: null },
};


function getRoute() {
    let path = window.location.hash.slice(1); 
    
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    
    const routeSegment = path.split(/[\/?]/)[0];

    return routeSegment || '';
}


async function handleRoute() {
    const routeName = getRoute();
    
    const targetRoute = routes[routeName] || routes['404']; 

    console.log(`🗺️ Navegando a: /${routeName}`);

    const htmlPath = targetRoute.html;
    const moduleName = targetRoute.module; 

    await loadView(htmlPath, moduleName); 
}


export function initRouter() {
    // 1. Escuchar el evento 'hashchange' para la navegación
    window.addEventListener('hashchange', handleRoute);

    // 2. Ejecutar la función inmediatamente para cargar la vista inicial
    handleRoute(); 
}