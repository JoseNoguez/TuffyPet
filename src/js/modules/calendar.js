// RUTA: src/js/modules/calendar.js
// =============================================================
// 📅 CALENDARIO PROFESIONAL TUFFYPET (Mensual + 3 Meses)
// Con disponibilidad mock, navegación, colores y selección de día.
// =============================================================

import { apiMock } from "./apiMock.js";
import { openModal } from "../utils/uiUtils.js";

let currentMonthOffset = 0; // 0 = mes actual, 1 = siguiente, etc.
let selectedDateGlobal = null;

// =============================================================
// GENERA UN MES COMPLETO
// =============================================================
function generateMonthGrid(year, month, availabilityMap, proId) {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    let days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let d = 1; d <= lastDay; d++) {
        const dateString = formatDate(year, month, d);
        days.push({
            day: d,
            date: dateString,
            availability: availabilityMap[dateString] || { online: "none", presencial: "none" }
        });
    }

    return days;
}

// =============================================================
// FORMATEAR FECHA YYYY-MM-DD
// =============================================================
function formatDate(year, month, day) {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

// =============================================================
// CLASE CSS SEGÚN DISPONIBILIDAD
// =============================================================
function getAvailabilityClass(av) {
    const values = [av.online, av.presencial];

    if (values.includes("available")) return "day-high";
    if (values.includes("partial")) return "day-mid";

    return "day-none";
}

// =============================================================
// RENDER PRINCIPAL DEL CALENDARIO
// =============================================================
export const calendar = {
    render(containerId, proId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const now = new Date();
        const displayMonth = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);

        const year = displayMonth.getFullYear();
        const month = displayMonth.getMonth();

        const availability = apiMock.getAvailability(proId);
        const days = generateMonthGrid(year, month, availability, proId);

        container.innerHTML = `
            <div class="calendar-header-pro">
                <button class="cal-nav prev-month" 
                    ${currentMonthOffset === 0 ? "disabled" : ""}>
                    ‹
                </button>

                <h3>${displayMonth.toLocaleString("es-MX", { month: "long" })} ${year}</h3>

                <button class="cal-nav next-month" 
                    ${currentMonthOffset === 2 ? "disabled" : ""}>
                    ›
                </button>
            </div>

            <div class="calendar-weekdays">
                <span>Dom</span><span>Lun</span><span>Mar</span>
                <span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
            </div>

            <div class="calendar-grid-pro">
                ${days
                    .map(day => {
                        if (!day) return `<div class="empty-day"></div>`;
                        const cls = getAvailabilityClass(day.availability);
                        return `
                            <div class="day ${cls}" data-date="${day.date}">
                                ${day.day}
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        `;

        // LISTENERS
        container.querySelector(".prev-month")?.addEventListener("click", () => {
            if (currentMonthOffset > 0) {
                currentMonthOffset--;
                this.render(containerId, proId);
            }
        });

        container.querySelector(".next-month")?.addEventListener("click", () => {
            if (currentMonthOffset < 2) {
                currentMonthOffset++;
                this.render(containerId, proId);
            }
        });

        container.querySelectorAll(".day-high, .day-mid").forEach(dayEl => {
            dayEl.addEventListener("click", () => {
                selectedDateGlobal = dayEl.dataset.date;
                window.openTimeSlots(proId, selectedDateGlobal);
            });
        });
    }
};

// =============================================================
// SLOT SELECTION (horarios)
// =============================================================
window.openTimeSlots = function(proId, dateString) {
    const modalBody = document.getElementById("timeSlotsContent");
    if (!modalBody) return;

    const availability = apiMock.getAvailability(proId)[dateString];

    modalBody.innerHTML = `
        <h3>Selecciona modalidad – ${dateString}</h3>

        <div class="mode-choice">
            ${availability.online !== "none" ? `<button class="mode-btn" data-mode="online">Online</button>` : ""}
            ${availability.presencial !== "none" ? `<button class="mode-btn" data-mode="presencial">Presencial</button>` : ""}
        </div>
    `;

    modalBody.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const mode = btn.dataset.mode;
            loadTimeSlots(proId, dateString, mode);
        });
    });

    openModal("timeSlotsModal");
};

// =============================================================
// CARGAR HORARIOS MODO → ONLINE / PRESENCIAL
// =============================================================
function loadTimeSlots(proId, dateString, mode) {
    const modalBody = document.getElementById("timeSlotsContent");
    if (!modalBody) return;

    const slots = apiMock.getTimeSlots(proId, dateString, mode);

    modalBody.innerHTML = `
        <h3>${dateString} – ${mode.toUpperCase()}</h3>
        <div class="slots-list">
            ${slots
                .map(s => `
                <div class="slot-item ${!s.available ? "disabled" : ""}" 
                     data-time="${s.time}" 
                     data-mode="${mode}">
                    ${s.time}
                </div>
            `)
                .join("")}
        </div>
    `;

    modalBody.querySelectorAll(".slot-item").forEach(item => {
        if (!item.classList.contains("disabled")) {
            item.addEventListener("click", () => {
                const time = item.dataset.time;

                window.openAppointmentForm({
                    proId,
                    date: dateString,
                    time,
                    mode
                });
            });
        }
    });
}

export function getSelectedDate() {
    return selectedDateGlobal;
}
