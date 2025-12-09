import { apiMock } from "./apiMock.js";
import { showMessage } from "../utils/uiUtils.js";

// ================================
// VARIABLES DE CONTROL DEL WIZARD
// ================================
let currentStep = 1;
let proId = null;
let selectedDate = null;
let selectedTime = null;
let selectedMode = null; // online | presencial

// Para validar primera cita
let userId = "mockUser123"; // <-- MOCK hasta que tengas auth real


// =========================
// INICIALIZACIÓN DEL MODAL
// =========================
export function openAgendarCitaModal(data) {
    proId = data.proId;
    selectedDate = data.date;
    selectedTime = data.time;
    selectedMode = data.mode;

    document.getElementById("acSelectedDate").textContent = selectedDate;
    document.getElementById("acSelectedTime").textContent = selectedTime;
    document.getElementById("acSelectedMode").textContent =
        selectedMode === "online" ? "Consulta en Línea" : "Consulta Presencial";

    currentStep = 1;
    updateStepUI();

    document.getElementById("acModalOverlay").style.display = "flex";
}

export function closeAgendarCitaModal() {
    document.getElementById("acModalOverlay").style.display = "none";
}



// ===================================
// CAMBIOS DE PASO (SIGUIENTE/ATRÁS)
// ===================================
export function nextACStep() {
    if (!validateCurrentStep()) return;

    currentStep++;
    updateStepUI();
}

export function prevACStep() {
    currentStep--;
    updateStepUI();
}

function updateStepUI() {
    document.querySelectorAll(".ac-step").forEach(step => step.classList.remove("active"));
    document.querySelector(`#acStep${currentStep}`).classList.add("active");

    document.getElementById("acPrevBtn").style.display = currentStep === 1 ? "none" : "inline-block";
    document.getElementById("acNextBtn").style.display = currentStep === 4 ? "none" : "inline-block";
}



// ====================
// VALIDACIONES POR PASO
// ====================
function validateCurrentStep() {

    // PASO 2 — validar primera cita
    if (currentStep === 2) {
        const firstVisit = document.querySelector("input[name='acFirstVisit']:checked");

        if (!firstVisit) {
            showMessage("Información incompleta", "Debes seleccionar si es primera cita o no.", "warning");
            return false;
        }

        if (firstVisit.value === "si") {
            const already = apiMock.hasAppointmentWithDoctor(userId, proId);
            if (already) {
                showMessage("No válido", "Este usuario ya tuvo cita con este especialista. No puede marcarse como primera cita.", "error");
                return false;
            }
        }
    }

    // PASO 3 — validar dueño y mascota
    if (currentStep === 3) {
        const owner = document.getElementById("acOwnerName").value.trim();
        if (owner.length < 3) {
            showMessage("Falta información", "Debes ingresar el nombre del dueño.", "warning");
            return false;
        }
    }

    return true;
}



// ================================
// CONFIRMAR Y REGISTRAR CITA MOCK
// ================================
export function confirmAppointment() {
    apiMock.registerAppointment(proId, selectedDate, selectedTime, selectedMode, userId);

    showMessage(
        "Cita Confirmada",
        "Tu cita ha sido registrada exitosamente (MOCK).",
        "success"
    );

    closeAgendarCitaModal();
}
