// RUTA: /src/js/utils/pageLoader.js
// RESPONSABILIDAD: Controlar el ciclo de vida de la carga de vistas (HTML + JS) en la SPA.

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
// B. GESTIÓN DEL MÓDULO (Ejecución de JS)
// ===================================

function unloadPreviousModule() {
    if (currentModule && typeof currentModule.cleanup === 'function') {
        currentModule.cleanup();
        console.log("🧹 Módulo anterior limpiado.");
    }
    currentModule = null;
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

export async function loadView(htmlPath, moduleName) {
    unloadPreviousModule();
    startPageLoad();

    try {
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

export async function loadModalView(htmlPath, moduleName, targetElement) {
    startPageLoad(); 
    try {
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