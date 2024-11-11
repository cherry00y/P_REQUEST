"use client";
import NavbarUser from "@/components/NavbarUser";
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/information/api";
import Swal from "sweetalert2";

interface LineProcess{
    lineprocess_id: number;
    lineprocess_name: string;
}

interface JobType{
    jobtype_id: number;
    jobtype_name: string;
}

export default function RequestNew(){
    const [lineProcess, setLineProcess] = useState<LineProcess[]>([]);
    const [jobType, setJobType] = useState<JobType[]>([]);
    const [loading, setLoading] = useState(true);

    const lineProcessSelectRef = useRef<HTMLSelectElement | null>(null);
    const stationInputRef = useRef<HTMLInputElement | null>(null);
    const jobTypeSelectRef = useRef<HTMLSelectElement | null>(null);
    const subjectInputRef = useRef<HTMLInputElement | null>(null);
    const causeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const detailTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        // Fetch data from API
        Promise.all([
            apiFetch('/jobtype').then(response => response.json()),
            apiFetch('/lineprocess').then(response => response.json())
        ])
        .then(([jobtypes, lineprocesses]) => {
            setJobType(jobtypes);
            setLineProcess(lineprocesses);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (): Promise<void> => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found.');
            alert("No token found. Please log in.");
            window.location.href = "/Login"; // Redirect to login page
            return;
        }

        const userId = Cookies.get('userId') || '';
        const data = new FormData();  // FormData instead of JSON for handling files

        data.append('user_id', userId);
        data.append('request_type', 'New Request');
        data.append('lineprocess', lineProcessSelectRef.current?.value ?? '');
        data.append('station', stationInputRef.current?.value ?? '');
        data.append('job_type', jobTypeSelectRef.current?.value ?? '');
        data.append('subject', subjectInputRef.current?.value ?? '');
        data.append('cause', causeTextareaRef.current?.value ?? '');
        data.append('detail', detailTextareaRef.current?.value ?? '');

        const fileInput = document.getElementById('file_input') as HTMLInputElement | null;
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            data.append('image', fileInput.files[0]);  // Append only one file
        }


        try {
            const response = await apiFetch('/request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: data,
            });

            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title:'Unauthorized',
                    text: 'You are not authorized to perform this action. Please login.',
                    timer: 2000,
                    confirmButtonText: 'OK'
                  });
                window.location.href = "/Login"; // Redirect to login page
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('Success:', result);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text:'Your request was successful!',
                timer: 2000
              });
            window.location.href = '/User'
        } catch (error) {
            console.error('Error:', (error as Error).message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred. Please try again.',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarUser />
            <main className="p-4 bg-white flex flex-col flex-1">
                <h2 className="text-3xl font-bold ml-16 mt-3">New Request</h2>
                <div className="flex justify-center items-center w-screen">
                    <div className="container rounded shadow-lg p-5 mt-5 border">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mt-3">
                                <label htmlFor="lineProcess" className="block mb-2 text-sm font-medium">
                                    Line Process
                                    <select
                                        className="mt-2 bg-gray-50 border border-gray-300 text-gray-400 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        id="lineProcess"
                                        ref={lineProcessSelectRef}
                                    >
                                        <option value="" disabled>Select Line Process</option>
                                        {lineProcess.map((lineProcess) => (
                                            <option key={lineProcess.lineprocess_id} value={lineProcess.lineprocess_id}>
                                                {lineProcess.lineprocess_name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="mt-3">
                                <label htmlFor="station" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Station</label>
                                <input
                                    type="text"
                                    id="station"
                                    ref={stationInputRef}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Enter your station"
                                    required
                                />
                            </div>
                        </div>
                        <hr/>
                        {/*dropdown jobtype*/}
                        <div className="mt-4">
                            <label htmlFor="jobType" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">JobType
                                <select
                                    id="jobType"
                                    ref={jobTypeSelectRef}
                                    className="mt-3 bg-gray-50 border border-gray-300 text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    <option value="" disabled>Select a JobType</option>
                                    {jobType.map((jobtypes) => (
                                        <option key={jobtypes.jobtype_id} value={jobtypes.jobtype_id}>
                                            {jobtypes.jobtype_name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <hr/>
                        <div className="mt-3">
                            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                ref={subjectInputRef}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter your request subject"
                                required
                            />
                        </div>
                        <div className="mt-3">
                            <label htmlFor="cause" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">สาเหตุ(cause)</label>
                            <textarea id="cause" ref={causeTextareaRef} rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your cause here..."></textarea>
                        </div>
                        <div className="mt-3">
                            <label htmlFor="detail" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">รายละเอียด(detail)</label>
                            <textarea id="detail" ref={detailTextareaRef} rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your details here..."></textarea>
                        </div>
                        <div className="mt-3">
                            <label htmlFor="file_input" className="block mb-2 text-sm font-medium">Upload Image</label>
                            <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50" id="file_input" type="file" name="image" />
                        </div>
                        <div className="flex items-center justify-center mt-4">
                            <button onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Submit</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
