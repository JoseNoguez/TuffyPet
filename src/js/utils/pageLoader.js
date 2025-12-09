// RUTA: /src/js/utils/pageLoader.js
// CONTROL DE VISTAS DE LA SPA (HTML + JS + CSS)

import { Error_Solicitud } from './coreUtils.js';

const TARGET_SELECTOR = '#app-root';
const moduleCache = {};
let currentModule = null;

/* ============================================================
   A. SPINNER
============================================================ */

function startPageLoad() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.style.display = 'flex';
}

function stopPageLoad() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.style.display = 'none';
}

/* ============================================================
   B. LIMPIAR MÓDULO ANTERIOR
============================================================ */

function unloadPreviousModule() {
    if (currentModule && typeof currentModule.cleanup === "function") {
        currentModule.cleanup();
        console.log("🧹 Módulo anterior limpiado.");
    }
    currentModule = null;
}

/* ============================================================
   C. CARGAR CSS (previene duplicados)
============================================================ */

function loadCss(cssPath) {
    if (!cssPath) return;

    const exists = document.querySelector(`link[href="${cssPath}"]`);
    if (exists) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;

    document.head.appendChild(link);
    console.log(`🎨 CSS cargado: ${cssPath}`);
}

/* ============================================================
   D. IMPORTACIÓN DE MÓDULOS
============================================================ */

async function executeModule(moduleName, initData = null) {
    if (!moduleName) return;

    if (!moduleCache[moduleName]) {
        try {
            const modulePath = `/src/js/modules/${moduleName}.js`;
            const imported = await import(modulePath);
            moduleCache[moduleName] = imported;
        } catch (err) {
            console.error(`❌ No se pudo importar ${moduleName}.js`, err);
            Error_Solicitud(`Error al cargar la lógica de ${moduleName}`);
            return;
        }
    }

    currentModule = moduleCache[moduleName];

    if (currentModule?.init) {
        currentModule.init(initData);
        console.log(`✨ Módulo ${moduleName} inicializado.`);
    } else {
        console.warn(`⚠️ Módulo ${moduleName} no tiene init().`);
    }
}

/* ============================================================
   E. CARGAR UNA VISTA COMPLETA (RUTAS PRINCIPALES)
============================================================ */

async function loadView(htmlPath, moduleName = null, cssPath = null) {
    unloadPreviousModule();
    startPageLoad();

    try {
        loadCss(cssPath);

        const resp = await fetch(htmlPath);
        if (!resp.ok) throw new Error(`No se encontró ${htmlPath}`);

        const html = await resp.text();
        const root = document.querySelector(TARGET_SELECTOR);
        if (!root) throw new Error(`No existe el contenedor ${TARGET_SELECTOR}`);

        root.innerHTML = html;
        window.scrollTo(0, 0);

        console.log(`✅ Vista cargada: ${htmlPath}`);

        await executeModule(moduleName);

    } catch (err) {
        console.error("❌ Error en loadView:", err);
        Error_Solicitud(err.message);
    } finally {
        stopPageLoad();
    }
}

/* ============================================================
   F. CARGAR VISTA COMO MODAL
============================================================ */

async function loadModalView(htmlPath, moduleName, targetElement, cssPath = null, initData = null) {
    if (!targetElement) {
        console.error("❌ targetElement (global-modal-container) no existe");
        return;
    }

    startPageLoad();

    try {
        loadCss(cssPath);

        const resp = await fetch(htmlPath);
        if (!resp.ok) throw new Error(`No se encontró ${htmlPath}`);

        const html = await resp.text();
        targetElement.innerHTML = html;

        await executeModule(moduleName, initData);

        console.log(`🎉 Modal cargado: ${htmlPath}`);

    } catch (err) {
        console.error("❌ Error modal:", err);
        Error_Solicitud(err.message);
    } finally {
        stopPageLoad();
    }
}

/* ============================================================
   G. FRAGMENTS (templates como cards)
============================================================ */

async function loadHtmlFragment(htmlPath, cssPath = null) {
    try {
        loadCss(cssPath);

        const resp = await fetch(htmlPath);
        if (!resp.ok) throw new Error(`Archivo no encontrado: ${htmlPath}`);

        const html = await resp.text();
        console.log(`📄 Fragmento cargado: ${htmlPath}`);

        return html;
    } catch (err) {
        console.error("❌ Error en loadHtmlFragment:", err);
        throw err;
    }
}

/* ============================================================
   H. CARGAR COMPONENTE DENTRO DE OTRA VISTA
============================================================ */

async function loadComponentView(htmlPath, moduleName, cssPath, targetElement, initData = null) {
    if (!targetElement) {
        Error_Solicitud("Contenedor de componente no encontrado");
        return;
    }

    startPageLoad();
    targetElement.innerHTML = "";

    try {
        const html = await loadHtmlFragment(htmlPath, cssPath);
        targetElement.innerHTML = html;
        window.scrollTo(0, 0);

        await executeModule(moduleName, initData);

        console.log(`🧩 Componente cargado: ${moduleName}`);

    } catch (err) {
        console.error("❌ Error loadComponentView:", err);
        Error_Solicitud(err.message);
    } finally {
        stopPageLoad();
    }
}

/* ============================================================
   I. SCROLL A SECCIONES INTERNAS (ANCLAS)
============================================================ */

function initAnchorScrollHandler() {
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#") || href.startsWith("#/")) return;

        const section = document.querySelector(href);
        if (section) {
            e.preventDefault();
            section.scrollIntoView({ behavior: "smooth" });
        }
    });

    console.log("⚓ Scroll interno activado.");
}

/* ============================================================
   ⭐ EXPONER PARA USO GLOBAL
============================================================ */

window.loadView = loadView;
window.loadModalView = loadModalView;   // 🔥 SOLUCIÓN PARA TU ERROR
window.loadComponentView = loadComponentView;
window.loadHtmlFragment = loadHtmlFragment;

/* ============================================================
   EXPORTS FINALES
============================================================ */

export {
    startPageLoad,
    stopPageLoad,
    loadView,
    loadModalView,
    loadHtmlFragment,
    loadComponentView,
    loadCss,
    initAnchorScrollHandler
};
