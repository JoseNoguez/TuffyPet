// RUTA: /src/js/utils/config.js
// RESPONSABILIDAD: Definir constantes, endpoints de API, y roles.

// Endpoints de API (simulados)
export const API_ENDPOINTS = {
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    REGISTER: '/api/v1/auth/register',
    // ... otros
};

// Roles para el control de acceso
export const ROLES = {
    ADMIN: 'Admin',
    USUARIO: 'Usuario',
};

// Credenciales de prueba
export const SIMULATED_CREDENTIALS = {
    USERNAME: 'test',
    PASSWORD: '123',
    ROLE: ROLES.ADMIN,
    DELAY_MS: 1000,
};

// Claves de localStorage
export const TOKEN_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    ROLE: 'userRole',
};