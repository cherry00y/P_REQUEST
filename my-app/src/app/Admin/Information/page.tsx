"use client";

import NavbarAdmin from "@/components/NavbarAdmin";
import { apiFetch } from "@/information/api";
import React, { useState, useEffect } from "react";

interface RequestData {
    docNumber: string;
    month: string
    status: string;
    subject: string;
    requesttype: string;
    date: string;
    requestor: string;
    acceptor: string;
}

interface StatusData {
    [status: string]: RequestData[];
}

interface MonthData {
    [month: string]: StatusData;
}

interface YearData {
    [year: string]: MonthData;
}

export default function Information() {
    const [data, setData] = useState<YearData>({});
    const [expandedYear, setExpandedYear] = useState<string | null>(null);
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);

        // Fetch data from API
        apiFetch('/Admin/information')
            .then((res) => res.json())
            .then((fetchedData) => {
                console.log(fetchedData); // Log to check API response
                setData(fetchedData);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const toggleYear = (year: string) => {
        setExpandedYear(expandedYear === year ? null : year);
        setExpandedMonth(null);
        setExpandedStatus(null);
    };

    const toggleMonth = (month: string) => {
        setExpandedMonth(expandedMonth === month ? null : month);
        setExpandedStatus(null);
    };

    const toggleStatus = (status: string) => {
        setExpandedStatus(expandedStatus === status ? null : status);
    };

    // Ensure hydration before rendering
    if (!isHydrated) {
        return null; // Add a spinner or loading indicator if needed
    }

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin />
            <main className="p-4 bg-white flex flex-col flex-1">
                <h2 className="text-2xl font-bold ml-20 mt-8">Information Accept</h2>
                <div className="flex justify-center items-center w-screen">
                    <div className="container rounded shadow-lg p-5 mt-5 border">
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right dark:text-gray-400">
                                <thead className="text-sm bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Year</th>
                                        <th scope="col" className="px-6 py-3">Month</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Doc Number</th>
                                        <th scope="col" className="px-6 py-3">Requester</th>
                                        <th scope="col" className="px-6 py-3">Subject</th>
                                        <th scope="col" className="px-6 py-3">Create Date</th>
                                        <th scope="col" className="px-6 py-3">Acceptor</th>
                                    </tr>
                                </thead>
                                <tbody className="border">
                                    {Object.keys(data).map((year) => (
                                        <React.Fragment key={year}>
                                            {/* Year Row */}
                                            <tr
                                                className={`cursor-pointer ${expandedYear === year ? 'border' : ''} bg-gray-200`}
                                                onClick={() => toggleYear(year)}
                                            >
                                                <td className="p-2 font-medium pl-5">{year}</td>
                                                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                                            </tr>

                                            {expandedYear === year &&
                                                Object.keys(data[year]).map((month) => (
                                                    <React.Fragment key={month}>
                                                        {/* Month Row */}
                                                        <tr
                                                            className={`cursor-pointer ml-4 ${expandedMonth === month ? 'border' : ''} bg-gray-100`}
                                                            onClick={() => toggleMonth(month)}
                                                        >
                                                            <td></td>
                                                            <td className="p-2 font-medium pl-10">{month}</td>
                                                            <td></td><td></td><td></td><td></td><td></td><td></td>
                                                        </tr>

                                                        {expandedMonth === month &&
                                                            Object.keys(data[year][month]).map((status) => (
                                                                <React.Fragment key={status}>
                                                                    {/* Status Row */}
                                                                    <tr
                                                                        className={`cursor-pointer ml-8 ${expandedStatus === status } bg-gray-50`}
                                                                        onClick={() => toggleStatus(status)}
                                                                    >
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td className="p-2 font-medium">{status}</td>
                                                                        <td></td><td></td><td></td><td></td><td></td>
                                                                    </tr>

                                                                    <tr className="border-b border-gray-300">
                                                                        <td colSpan={8} className="h-0"></td>
                                                                    </tr>

                                                                    {expandedStatus === status &&
                                                                        data[year][month][status].map((request, idx) => (
                                                                            <tr key={idx} className="bg-gray-100 ">
                                                                                <td className="p-2 text-red-600 pl-5">{year}</td>
                                                                                <td className="p-2 text-red-600 pl-10">{month}</td>
                                                                                <td className="p-2 text-red-600">{request.status}</td>
                                                                                <td className="p-2 text-red-600">{request.docNumber}</td>
                                                                                <td className="p-2 text-red-600">{request.requestor}</td>
                                                                                <td className="p-2 text-red-600">{request.subject}</td>
                                                                                <td className="p-2 text-red-600">{request.date}</td>
                                                                                <td className="p-2 text-red-600">{request.acceptor}</td>
                                                                            </tr>
                                                                        ))}
                                                                </React.Fragment>
                                                            ))}
                                                    </React.Fragment>
                                                ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
