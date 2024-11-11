// api.ts
const BASE_URL = 'https://kaizen-request.vercel.app/api';

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
    return fetch(`${BASE_URL}${endpoint}`, options);
};
