// RUTA: /src/js/utils/uiUtils.js
// ============================================================================
// UTILIDADES GLOBALES DE UI — TUFFYPET
// ============================================================================

// ===================================
// A. MENSAJES (SweetAlert2)
// ===================================
export function showMessage(title, text, icon = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon,
            title,
            text,
            confirmButtonColor: '#3e8ecd',
        });
    } else {
        alert(`${title}: ${text}`);
    }
}

// ===================================
// B. GESTIÓN DE MODALES GENERALES
// ===================================
export function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("modal-overlay");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("modal-overlay");

        const openModals = document.querySelectorAll('.modal-overlay[style*="display: flex"]');
        if (openModals.length === 0) {
            document.body.style.overflow = "";
        }
    }
}

// ⭐ Exponer global
window.openModal = openModal;
window.closeModal = closeModal;


// =====================================================
// C. ⭐ MODAL DE PROMOCIONES
// =====================================================
window.openPromoModal = function (text = "") {
    if (!text.trim()) return;

    const modal = document.getElementById("promoModal");
    const content = document.getElementById("promoModalContent");

    if (!modal || !content) {
        console.error("❌ promoModal o promoModalContent no existen en el DOM");
        return;
    }

    content.innerHTML = `
        <h2 class="promo-title">🎉 Promoción Disponible</h2>
        <p class="promo-text">${text}</p>
        <button class="btn-promo-close" onclick="closePromoModal()">Entendido</button>
    `;

    openModal("promoModal");
};

window.closePromoModal = () => closeModal("promoModal");


// =====================================================
// D. LOGIN UI
// =====================================================
export function updateLoginButton() {
    const isLoggedIn = window.getIsLoggedIn?.() ?? false;

    const configs = [
        { id: "auth-btn", textSpanId: null },
        { id: "mobileLoginBtn", textSpanId: "mobileLoginText" }
    ];

    const accountContainer = document.getElementById("account-container");

    configs.forEach(cfg => {
        const btn = document.getElementById(cfg.id);
        if (!btn) return;

        const textEl = cfg.textSpanId ? btn.querySelector(`#${cfg.textSpanId}`) : btn;

        if (isLoggedIn) {
            textEl.innerHTML = `
                <i class="fa-solid fa-bone icon-spacing"></i>&nbsp;
                Mi Cuenta
                <span class="dropdown-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                        <path d="M3.2 7.3a1 1 0 011.4 0L12 14.6l7.4-7.3a1 1 0 111.4 1.4l-8 8a1 1 0 01-1.4 0l-8-8a1 1 0 010-1.4z"/>
                    </svg>
                </span>
            `;
            btn.onclick = (e) => {
                e.preventDefault();
                window.handleLoginClick?.(e);
            };
        } else {
            textEl.textContent = "Iniciar Sesión";
            accountContainer?.classList.remove("open");
            btn.onclick = (e) => {
                e.preventDefault();
                window.handleLoginClick?.(e);
            };
        }
    });

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            window.logout?.();
        };
    }
}


// =====================================================
// E. UI GLOBAL (Cerrar modales, esc, click fuera)
// =====================================================
export function initGlobalUI() {
    document.addEventListener("click", (e) => {
        const accountContainer = document.getElementById("account-container");
        const loginBtn = document.getElementById("auth-btn");

        if (accountContainer?.classList.contains("open")) {
            if (!loginBtn?.contains(e.target) && !accountContainer.contains(e.target)) {
                accountContainer.classList.remove("open");
            }
        }

        if (e.target.classList.contains("modal-overlay")) {
            closeModal(e.target.id);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modals = document.querySelectorAll('.modal-overlay[style*="display: flex"]');
            if (modals.length > 0) {
                const top = modals[modals.length - 1];
                closeModal(top.id);
            }
        }
    });

    updateLoginButton();

    console.log("🌐 UI global inicializada.");
}


// =====================================================
// F. ⭐ MODAL DE AGENDAR CITA (USADO POR calendar-mini.js)
// =====================================================
window.openAgendarCita = function (dateStr, proId) {
    const modal = document.getElementById("agendarCitaModal");
    if (!modal) {
        console.error("❌ No existe #agendarCitaModal");
        return;
    }

    const dateLabel = document.getElementById("scheduleModalDate");
    if (dateLabel) dateLabel.textContent = dateStr;

    window.__CITA_DATA__ = { dateStr, proId };

    openModal("agendarCitaModal");
};

// FIN DEL ARCHIVO
