// src/app/core/api/api.config.ts
export const API_CONFIG = {
  baseUrl: '/api', // usa proxy.conf.json
  endpoints: {
    auth: {
      login: '/auth/login',
    },
    pagos: '/pagos',
    puestos: '/puestos',
    socios: '/socios',
    conceptos: '/conceptos',
    deudas: '/deudas',
    socioPuesto: '/socio-puesto',
  },
} as const;

// helper opcional para armar URLs
export const apiUrl = (path: string) => `${API_CONFIG.baseUrl}${path}`;
