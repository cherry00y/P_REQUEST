// api.ts
const BASE_URL = 'https://p-request-api.vercel.app';

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
    return fetch(`${BASE_URL}${endpoint}`, options);
};
