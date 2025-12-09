// RUTA: /src/js/modules/calendar-mini.js
import { apiMock } from "./apiMock.js";

function render(containerId, proId) {
    const box = document.getElementById(containerId);
    if (!box) return;

    const title = box.querySelector(".mini-month-title");
    const grid = box.querySelector(".calendar-mini-grid");
    const btnPrev = box.querySelector(".mini-prev-month");
    const btnNext = box.querySelector(".mini-next-month");

    let current = new Date();
    current.setDate(1);

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);

    const availability = apiMock.getAvailability(proId) || {};

    function draw() {
        grid.innerHTML = "";

        const y = current.getFullYear();
        const m = current.getMonth();

        title.textContent = current.toLocaleString("es-MX", {
            month: "long",
            year: "numeric"
        }).toUpperCase();

        const firstDay = new Date(y, m, 1).getDay();
        const lastDay = new Date(y, m + 1, 0).getDate();

        ["D", "L", "M", "M", "J", "V", "S"].forEach(d =>
            grid.innerHTML += `<div class="calendar-mini-dayname">${d}</div>`
        );

        for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

        for (let d = 1; d <= lastDay; d++) {
            const dateStr =
                `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

            const info = availability[dateStr];

            const cls =
                info?.presencial === "available" ? "green" :
                info?.presencial === "partial" ? "yellow" :
                "none";

            const el = document.createElement("div");
            el.className = `calendar-mini-day ${cls}`;
            el.textContent = d;

            el.addEventListener("click", () => {
                if (cls === "none") return;

                if (!window.getIsLoggedIn || !window.getIsLoggedIn()) {
                    Swal.fire({
                        icon: "info",
                        title: "Iniciar sesión",
                        text: "Debes iniciar sesión para agendar una cita.",
                        confirmButtonText: "Iniciar sesión",
                        showCancelButton: true,
                        confirmButtonColor: "#3e8ecd"
                    }).then(r => {
                        if (r.isConfirmed) {
                            window.__CITA_DATA__ = { proId, dateStr };
                            window.handleLoginClick();
                        }
                    });
                    return;
                }

                // ⭐ USAR FUNCIÓN GLOBAL
                window.openAgendarCita(dateStr, proId);
            });

            grid.appendChild(el);
        }
    }

    btnPrev.onclick = () => {
        const prev = new Date(current);
        prev.setMonth(prev.getMonth() - 1);

        const min = new Date();
        min.setDate(1);

        if (prev >= min) {
            current = prev;
            draw();
        }
    };

    btnNext.onclick = () => {
        const next = new Date(current);
        next.setMonth(next.getMonth() + 1);

        if (next <= maxDate) {
            current = next;
            draw();
        }
    };

    draw();
}

export const calendarMini = { render };
