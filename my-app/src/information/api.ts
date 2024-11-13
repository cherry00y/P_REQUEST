// api.ts ในโฟลเดอร์ my-app
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://p-request.onrender.com'; // ค่าเริ่มต้นหากไม่มีตัวแปร

export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
    return fetch(`${BASE_URL}${endpoint}`, options);
};
