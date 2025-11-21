// RUTA: /src/js/utils/coreUtils.js
// RESPONSABILIDAD: Proveer funciones de utilidad genérica (Cookies, Fechas, Helpers).

/**
 * Configura la cookie de datos del sistema (ej: SYTEMDATA) con el estado inicial.
 */
export function setSystemCookie() {
    // SysData es la estructura de datos que tu aplicación requiere para iniciar la sesión.
    let SysData = { TK: '', TOut: 30, ST: new Date() }; 
    setCookie('SYTEMDATA', JSON.stringify(SysData), 1);
}

// ----------------------
// GESTIÓN DE COOKIES
// ----------------------

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// ----------------------
// GESTIÓN DE FECHAS
// ----------------------

export function dateDiffInMinutes(startTime, endTime) {
    // Calcula la diferencia en milisegundos y la convierte a minutos redondeados.
    let difference = endTime.getTime() - startTime.getTime();
    let resultInMinutes = Math.round(difference / 60000);
    return resultInMinutes;
}

// ===================================
// UTILIDADES DE ALERTAS (SweetAlert)
// ===================================

/**
 * Muestra una alerta de error/advertencia usando SweetAlert2.
 */
export function Error_Solicitud(sRespuesta = 'Error Solicitud') {
    // Asegúrate de que Swal esté cargado (se incluye en index.html)
    if (typeof Swal === 'undefined') {
        // Usar console.error en lugar de alert
        console.error("SweetAlert (Swal) no está cargado. Mensaje de error:", sRespuesta);
        return;
    }
    Swal.fire({
        html:`<div style="font-family:'Open Sans';">${sRespuesta}</div>`,
        icon:'warning',
        customClass:{ confirmButton:'botonPopMensaje' }
    });
}

/**
 * Muestra una alerta de éxito usando SweetAlert2.
 */
export function showSuccess(sRespuesta = 'Se ha realizado correctamente la solicitud'){
    if (typeof Swal === 'undefined') {
        console.error("SweetAlert (Swal) no está cargado. Mensaje de éxito:", sRespuesta);
        return;
    };
    Swal.fire({
        html:`<div style="font-family:'Open Sans';">${sRespuesta}</div>`,
        confirmButtonColor: "#ED684C",
        icon:'success',
    });
}