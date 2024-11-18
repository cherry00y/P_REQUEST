"use client";
import NavbarAdmin from "@/components/NavbarAdmin";
import { apiFetch } from "@/information/api";
import { useEffect, useState } from "react";

interface CompleatedtData {
    request_id: string;
    requester: string;
    subject: string; 
    datecompleted: string;
    request_type: string;
    status: string;
}

export default function InformCompleted() {

    const [request, setRequest] = useState<CompleatedtData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        apiFetch('/Admin/InformCompleteNew')
        .then(response => response.json())
        .then((data) => {
            console.log('API response:', data);
            setRequest(data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setError('Error fetching data');
            setLoading(false);
        });
    }, []);

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    }

    const filteredRequests = request.filter(request =>
        request.request_id.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;


    return(
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin/>
            <main className="p-4 bg-white flex flex-col flex-1">
                <h2  className="text-2xl font-bold ml-20 mt-8">NewRequest Completed Information</h2>
                <form onSubmit={handleSearch} className="max-w-md ml-20 mt-6">
                    <label htmlFor="default-search" className="mb- text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                        </div>
                        <input 
                            type="search"
                            id="default-search"
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search to fine information..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Search
                        </button>
                    </div>
                </form>
                <div className="flex justify-center items-center w-screen">
                    <div className="container rounded shadow-lg p-5 mt-5 border">
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Doc No.</th>
                                        <th scope="col" className="px-6 py-3">Subject</th>
                                        <th scope="col" className="px-6 py-3">DateCompleted</th>
                                        <th scope="col" className="px-6 py-3">Requester</th>
                                        <th scope="col" className="px-6 py-3">Type</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map((request) => (
                                        <tr key={request.request_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="px-6 py-4">{request.request_id}</td>
                                            <td className="px-6 py-4">{request.subject}</td>
                                            <td className="px-6 py-4">{request.datecompleted}</td>
                                            <td className="px-6 py-4">{request.requester}</td>
                                            <td className="px-6 py-4">{request.request_type}</td>
                                            <td className="px-6 py-4">
                                                <a 
                                                    className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
                                                    href={`/Admin/Information/alldetailinformation/repairrequest/detail?request_id=${request.request_id}`}
                                                    >
                                                    <span className="relative px-4 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                                        {request.status}
                                                    </span>    
                                                </a>
                                            </td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center">No data available</td>
                                        </tr>
                                    )}
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}