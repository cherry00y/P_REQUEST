/*"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/information/api";
import Swal from 'sweetalert2'; // Import SweetAlert

function Login() {
    const [email, setEmail] = useState<string>('');
    const [employeeCode, setEmployeeCode] = useState<string>('');
    const [err, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
    
        try {
            const response = await apiFetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, employee_code: employeeCode }),
            });
    
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }
    
            const data = await response.json();
            console.log('Response Data:', data);
    
            const { token, user } = data;
    
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Show SweetAlert upon successful login
            await Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'Welcome, ' + user.firstname + '!',
                timer: 1500,
                showConfirmButton: false
            });
    
            // Redirect based on user role
            if (user.position_name === 'Staff') {
                router.push('/User');
            } else if (['Senior Staff', 'Supervisor', 'Manager'].includes(user.position_name)) {
                router.push('/Admin');
            } else if (['Senior Staff', 'Technician'].includes(user.position_name)) {
                router.push('/Worker');
            } else {
                console.error('Unknown role:', user.position_name);
                setError('Unknown role');
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error('Error:', err.message);
                setError(err.message || 'An error occurred.');
            } else {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className='flex flex-col min-h-screen'>
            <main className="flex flex-col justify-center items-center flex-1 p-4 bg-white">
                <div className="container max-w-2xl w-full rounded border shadow-lg p-5 text-center">
                    <h2 className="p-2 font-bold text-red-600 text-3xl">RICOH</h2>
                    <p className="font-bold text-md mt-3">Login to Account</p>
                    <p className="text-sm">Please enter your email and password to continue</p>
                    <form onSubmit={handleLogin} className="w-full max-w-2xl mt-4">
                        <div className="mb-6">
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-start">Email address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="name@th.ricoh.com"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="employeeCode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-start">Password</label>
                            <input
                                type="password"
                                id="employeeCode"
                                value={employeeCode}
                                onChange={(e) => setEmployeeCode(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="•••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                    </form>
                    {err && <p className="text-red-600 mt-3">{err}</p>}
                </div>
            </main>
        </div>
    );
}

export default Login;
*/