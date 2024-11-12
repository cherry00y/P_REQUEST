// api.ts
const BASE_URL = 'https://p-request.onrender.com';

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
    return fetch(`${BASE_URL}${endpoint}`, options);
};
