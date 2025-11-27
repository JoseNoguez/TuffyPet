// RUTA: /src/js/utils/pageLoader.js
// RESPONSABILIDAD: Controlar el ciclo de vida de la carga de vistas (HTML + JS + CSS) en la SPA.

import { Error_Solicitud } from './coreUtils.js';

const TARGET_SELECTOR = '#app-root'; 
const moduleCache = {}; 
let currentModule = null; 

// ===================================
// A. CONTROL DE SPINNER
// ===================================

export function startPageLoad() {
    const loader = document.getElementById('page-loader');
    if (loader) { loader.style.display = 'flex'; }
}

export function stopPageLoad() {
    const loader = document.getElementById('page-loader');
    if (loader) { loader.style.display = 'none'; }
}

// ===================================
// B. GESTIÓN DEL MÓDULO (Ejecución de JS) y CSS
// ===================================

function unloadPreviousModule() {
    if (currentModule && typeof currentModule.cleanup === 'function') {
        currentModule.cleanup();
        console.log("🧹 Módulo anterior limpiado.");
    }
    currentModule = null;
}

/**
 * Inyecta dinámicamente un archivo CSS si aún no ha sido cargado.
 * @param {string} cssPath - Ruta al archivo CSS.
 */
function loadCss(cssPath) {
    if (!cssPath) return;

    // Verificar si ya se cargó el CSS para evitar duplicados
    const existingLink = document.querySelector(`link[href="${cssPath}"]`);
    if (existingLink) {
        console.log(`💬 CSS ya cargado: ${cssPath}`);
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);
    console.log(`🎨 CSS inyectado: ${cssPath}`);
}


async function executeModule(moduleName) {
    if (moduleCache[moduleName]) {
        currentModule = moduleCache[moduleName];
    } else {
        try {
            // ⭐ CORRECCIÓN DE RUTA ABSOLUTA PARA CARGA DINÁMICA DE MÓDULOS
            const modulePath = `/src/js/modules/${moduleName}.js`; 
            
            const module = await import(modulePath);
            moduleCache[moduleName] = module;
            currentModule = module;
        } catch (error) {
            console.error(`❌ Fallo al cargar el módulo ${moduleName}.js:`, error);
            Error_Solicitud(`Error al cargar la lógica de la vista: ${moduleName}.`);
            return;
        }
    }
    
    if (currentModule && typeof currentModule.init === 'function') {
        currentModule.init(); 
        console.log(`✨ Módulo ${moduleName} inicializado.`);
    } else {
        console.warn(`Módulo ${moduleName} cargado, pero no tiene una función 'init()'.`);
    }
}


// ===================================
// C. FUNCIÓN PRINCIPAL DE RENDERING
// ===================================

export async function loadView(htmlPath, moduleName, cssPath) { // ⭐ Nuevo parámetro cssPath opcional
    unloadPreviousModule();
    startPageLoad();

    try {
        // 0. Cargar CSS si existe
        loadCss(cssPath);

        // 1. Cargar e Inyectar HTML
        const response = await fetch(htmlPath);
        if (!response.ok) { throw new Error(`No se encontró el archivo HTML: ${htmlPath}`); }
        const htmlContent = await response.text();

        const targetElement = document.querySelector(TARGET_SELECTOR);
        if (targetElement) {
            targetElement.innerHTML = htmlContent;
            window.scrollTo(0, 0); 
            console.log(`✅ Vista inyectada: ${htmlPath}`);
        } else {
            throw new Error(`Contenedor principal '${TARGET_SELECTOR}' no encontrado.`);
        }

        // 2. Ejecutar Lógica JS
        if (moduleName) {
            await executeModule(moduleName);
        }

    } catch (error) {
        console.error("❌ Fallo en el proceso de carga de vista:", error);
        Error_Solicitud(`No se pudo cargar la vista. ${error.message}`);
    } finally {
        stopPageLoad();
    }
}

// ===================================
// D. MANEJADOR DE ANCLAJES INTERNOS
// ===================================

function handleAnchorClick(e) {
    const target = e.target.closest('a');
    if (!target) return;

    const href = target.getAttribute('href');

    if (href && href.startsWith('#') && !href.startsWith('#/') && href.length > 1) {
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            e.preventDefault(); 
            targetElement.scrollIntoView({ behavior: 'smooth' });
            console.log(`⚓ Navegación ancla interna a #${targetId}.`);
            
            const menu = document.querySelector('.menu');
            const hamburger = document.querySelector('.hamburger');
            if (menu && menu.classList.contains('open')) {
                menu.classList.remove('open');
                if (hamburger) hamburger.classList.remove('active');
            }
        }
    }
}

export function initAnchorScrollHandler() {
    document.addEventListener('click', handleAnchorClick);
    console.log("⚓ Manejador de anclajes internos inicializado.");
}

// ===================================
// E. FUNCIÓN PARA CARGAR VISTAS COMO MODAL
// ===================================

export async function loadModalView(htmlPath, moduleName, targetElement, cssPath) { // ⭐ Nuevo parámetro cssPath opcional
    startPageLoad(); 
    try {
        // 0. Cargar CSS si existe
        loadCss(cssPath);

        const response = await fetch(htmlPath);
        if (!response.ok) throw new Error(`No se encontró ${htmlPath}`);

        const htmlContent = await response.text();
        targetElement.innerHTML = htmlContent;

        // 2. Ejecutar Lógica JS del Modal
        if (moduleName) {
            let modalModule;
            if (moduleCache[moduleName]) {
                modalModule = moduleCache[moduleName];
            } else {
                // ⭐ CORRECCIÓN DE RUTA ABSOLUTA APLICADA TAMBIÉN AQUÍ
                const modulePath = `/src/js/modules/${moduleName}.js`; 
                modalModule = await import(modulePath);
                moduleCache[moduleName] = modalModule; 
            }

            if (typeof modalModule.init === 'function') {
                modalModule.init(); 
            } else {
                console.log(`✨ Módulo de modal ${moduleName} cargado. Asumiendo inicialización implícita.`);
            }
        }

        console.log(`✅ Modal ${moduleName} cargado correctamente.`);
    } catch (error) {
        console.error('❌ Error al cargar modal:', error);
        Error_Solicitud(`No se pudo cargar el modal. ${error.message}`);
    } finally {
        stopPageLoad(); 
    }
}

// ===================================
// F. FUNCIÓN PARA CARGAR FRAGMENTOS HTML (Template Loader)
// ===================================

/**
 * 📥 Carga y devuelve el contenido HTML, e inyecta CSS si se proporciona.
 * Diseñado para cargar plantillas y fragmentos de UI (como tarjetas o componentes).
 * @param {string} htmlPath - Ruta al archivo HTML del fragmento.
 * @param {string} [cssPath] - Ruta opcional al archivo CSS asociado.
 * @returns {Promise<string>} Promesa que resuelve al contenido HTML como cadena.
 */
export async function loadHtmlFragment(htmlPath, cssPath) { // ⭐ Esta es la función base
    
    try {
        // 1. Cargar CSS (no necesita await, es asíncrono)
        loadCss(cssPath); 

        // 2. Cargar HTML
        const response = await fetch(htmlPath);
        if (!response.ok) {
            throw new Error(`No se encontró el fragmento HTML: ${htmlPath}`);
        }
        const htmlContent = await response.text();
        console.log(`✅ Fragmento HTML cargado: ${htmlPath}`);
        return htmlContent;

    } catch (error) {
        console.error('❌ Error al cargar el fragmento HTML:', error);
        throw error; 
    }
}

// ===================================
// G. ⭐ NUEVA FUNCIÓN: CARGAR VISTA COMO COMPONENTE (Perfiles)
// ===================================

/**
 * 🧱 Carga un componente/vista completo (HTML + JS + CSS) y lo inyecta 
 * en un contenedor de destino específico sin afectar el módulo principal (busqueda.js).
 * * @param {string} htmlPath - Ruta al archivo HTML del componente.
 * @param {string} moduleName - Nombre del módulo JS (ej: 'perfilEspecialista').
 * @param {string} cssPath - Ruta al archivo CSS.
 * @param {HTMLElement} targetElement - El elemento del DOM donde inyectar el HTML (ej: cardsContainer).
 */
// Modifica la definición de la función:
export async function loadComponentView(htmlPath, moduleName, cssPath, targetElement, initData) { // ⭐ Agrega initData
    if (!targetElement) {
        console.error("❌ loadComponentView: targetElement es nulo.");
        Error_Solicitud("Error interno: Contenedor de destino no definido.");
        return;
    }

    startPageLoad();
    // No limpiar aquí, ya que el router es el que carga las vistas principales. 
    // Solo si estás seguro de que el componente reemplaza todo el contenido del contenedor principal. 
    // Para el perfil, es correcto:
    targetElement.innerHTML = ''; 

    try {
        // ... (Cargar HTML y CSS) ...
        const htmlContent = await loadHtmlFragment(htmlPath, cssPath);
        targetElement.innerHTML = htmlContent;
        window.scrollTo(0, 0); 
        console.log(`✅ Componente de vista inyectado en ${targetElement.id || targetElement.tagName}: ${htmlPath}`);

        // 2. Ejecutar Lógica JS
        let componentModule;
        // ... (Lógica para importar y cachear el módulo) ...
        if (moduleCache[moduleName]) {
            componentModule = moduleCache[moduleName];
        } else {
            const modulePath = `/src/js/modules/${moduleName}.js`; 
            componentModule = await import(modulePath);
            moduleCache[moduleName] = componentModule;
        }


        if (componentModule && typeof componentModule.init === 'function') {
            // ⭐ CAMBIO CLAVE: Pasar initData (que será el 'index') a la función init()
            componentModule.init(initData); 
            console.log(`✨ Lógica de componente ${moduleName} inicializada con datos.`);
        } else {
             console.warn(`Módulo de componente ${moduleName} cargado, pero no tiene una función 'init(data)'.`);
        }

    } catch (error) {
        // ... (Manejo de errores) ...
    } finally {
        stopPageLoad();
    }
}