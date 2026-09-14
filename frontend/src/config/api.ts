/* API configuration */
export const API_BASE_URL = 'http://localhost:8000';

export const ROUTES = {
  cooperative: {
    register: `${API_BASE_URL}/cooperative/register`,
    login: `${API_BASE_URL}/cooperative/login`,
  },
  worker: {
    register: `${API_BASE_URL}/worker/register`,
    login: `${API_BASE_URL}/worker/login`,
    profile: (id: string) => `${API_BASE_URL}/worker/${id}`,
    ongoingServices: (id: string) => `${API_BASE_URL}/api/service-requests/worker/${id}/ongoing`,
    previousServices: (id: string) => `${API_BASE_URL}/api/service-requests/worker/${id}/previous`,
  },
  customer: {
    register: `${API_BASE_URL}/customer/register`,
    login: `${API_BASE_URL}/customer/login`,
  },
  service: `${API_BASE_URL}/service`,
  serviceRequests: `${API_BASE_URL}/api/service-requests`,
  health: `${API_BASE_URL}/health`,
} as const;
