// RUTA: src/js/modules/apiMock.js
// ============================================================================
// 🚀 API MOCK COMPLETO TUFFYPET — AHORA CON DISPONIBILIDAD ONLINE + PRESENCIAL
// ============================================================================

// ============================================================
// BASE DE DATOS
// ============================================================

const DB = {

    specialists: {
        "p789j23k": {
            proId: "p789j23k",
            tipo: "especialista",
            perfilTipo: "especialista",

            name: "Dr. Alejandro Guzmán",
            specialty: "Médico Veterinario — Nutrición",
            rating: 4.8,
            reviewCount: 282,
            profilePicUrl: "https://i.pravatar.cc/150?u=alejandro_guzman",

            address: "Av. Coyoacán 123, Del Valle Norte, CDMX",

            allowsOnline: true,
            allowsPresencial: true,

            mascotas: ["Perro", "Gato"],

            costos: [
                { id: 1, label: "$500 MXN (Consulta General)", price: 500 },
                { id: 2, label: "$800 MXN (Vacunación)", price: 800 }
            ],

            servicios: [
                { id: 10, name: "Vacunación" },
                { id: 11, name: "Odontología" },
                { id: 12, name: "Estética" },
                { id: 13, name: "Urgencias 24/7" },
            ],

            promo: { active: true, text: "20% de descuento en tu primera consulta" }
        }
    },

    clinics: {
        "c101a202": {
            proId: "c101a202",
            tipo: "clinica",
            perfilTipo: "clinica",

            name: "Clínica Pet Lovers",
            specialty: "Clínica General y Servicios",
            rating: 4.6,
            reviewCount: 150,
            profilePicUrl: "https://picsum.photos/id/433/200/200",

            address: "Av. Insurgentes 550, CDMX",

            allowsOnline: false,
            allowsPresencial: true,

            mascotas: ["Perro"],

            costos: [
                { id: 1, label: "$550 MXN (Consulta General)", price: 550 },
                { id: 2, label: "$900 MXN (Radiografía)", price: 900 }
            ],

            servicios: [
                { id: 12, name: "Estética" },
                { id: 14, name: "Farmacia" }
            ],

            promo: { active: false, text: null }
        }
    }
};

// ============================================================
// HELPERS
// ============================================================

function normalize(val) {
    if (!val) return "";
    return String(val).toLowerCase();
}

// ============================================================
// NUEVO SISTEMA DE DISPONIBILIDAD DUAL
// ============================================================
// → presencial: available | partial | none
// → online:     available | partial | none
// → ambos:      cuando ambos === "available"
// ============================================================

function generateDualAvailability() {
    const availability = {};

    const start = new Date();
    start.setDate(1);

    for (let i = 0; i < 90; i++) {

        const d = new Date();
        d.setDate(d.getDate() + i);

        const key = d.toISOString().split("T")[0];

        const mod = d.getDate() % 4;

        let presencial = "none";
        let online = "none";

        switch (mod) {
            case 0:
                presencial = "available";
                online = "none";
                break;
            case 1:
                presencial = "none";
                online = "available";
                break;
            case 2:
                presencial = "available";
                online = "available"; // AMBOS
                break;
            default:
                presencial = "partial";
                online = "partial";
                break;
        }

        availability[key] = { presencial, online };
    }

    return availability;
}

// ============================================================
// API MOCK EXPORTADO
// ============================================================

export const apiMock = {

    // PERFIL
    getProfile(id) {
        return DB.specialists[id] || DB.clinics[id] || null;
    },

    getAllProfiles() {
        return [
            ...Object.values(DB.specialists),
            ...Object.values(DB.clinics)
        ];
    },

    // DISPONIBILIDAD NUEVA (PRESENCIAL + ONLINE)
    getAvailability(proId) {
        return generateDualAvailability();
    },

    // BUSCADOR GENERAL
    searchProfiles(filters) {
        const {
            text = "",
            tipo = "",
            ubicacion = "",
            mascota = "",
            calificacion = "",
            disponibilidad = ""
        } = filters;

        let results = this.getAllProfiles();

        // Texto
        if (text.trim() !== "") {
            const term = normalize(text);
            results = results.filter(p =>
                normalize(p.name).includes(term) ||
                normalize(p.address).includes(term) ||
                normalize(p.specialty).includes(term)
            );
        }

        if (tipo)
            results = results.filter(p => p.tipo === tipo);

        if (ubicacion)
            results = results.filter(p =>
                normalize(p.address).includes(normalize(ubicacion))
            );

        if (mascota)
            results = results.filter(p => p.mascotas?.includes(mascota));

        if (calificacion) {
            const min = parseFloat(calificacion);
            results = results.filter(p => p.rating >= min);
        }

        if (disponibilidad === "true") {
            // Aquí podríamos filtrar perfiles sin días disponibles
            results = results.filter(() => true);
        }

        return results;
    },

    // SELECTS
    getServiceTypes() {
        return [...new Set(this.getAllProfiles().map(p => p.tipo))];
    },

    getLocations() {
        return [...new Set(
            this.getAllProfiles().map(p =>
                p.address.split(",")[1]?.trim() || p.address
            )
        )];
    },

    getPetTypes() {
        return ["Perro", "Gato", "Ave", "Conejo"];
    },

    getRatings() {
        return ["5.0", "4.5", "4.0", "3.5"];
    }
};
