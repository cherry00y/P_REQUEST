"use client";
import Cookies from 'js-cookie';
import NavbarWorker from "@/components/NavbarWorker";
import { apiFetch } from "@/information/api";
import React, { useEffect, useRef, useState } from "react";
import Swal from 'sweetalert2';

interface TypeScrewdriver {
    typesd_id: string;
    name: string;
}

export default function Implement() {
    const [typeScrewdriver, setTypeScrewdriver] = useState<TypeScrewdriver[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [selectDoc, setSelectDoc] = useState(false);
    const [documentDetail, setDocumentDetail] = useState('');
    const [loading, setLoading] = useState(true);
    const [implementStart, setImplementStart] = useState<string | null>(null);
    const [implementEnd, setImplementEnd] = useState<string | null>(null);


    const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const causeRef = useRef<HTMLTextAreaElement | null>(null);
    const solutionRef = useRef<HTMLTextAreaElement | null>(null);
    const typeScrewdriverSelectRef = useRef<HTMLSelectElement | null>(null);
    const torqueRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);
    const serialnoInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await apiFetch('/Operator/TypeScrewdriver');
                const data = await response.json();
                console.log('API response:', data);
                setTypeScrewdriver(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTypeChange = (value: string) => {
        setTypes(prevTypes =>
            prevTypes.includes(value)
                ? prevTypes.filter(type => type !== value)
                : [...prevTypes, value]
        );
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectDoc(event.target.checked);
    };

    const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentDetail(event.target.value);
    };

    const handleSubmit = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const request_id = queryParams.get('request_id') || '';
        
        if (!request_id) {
            alert('No request ID found.');
            return;
        }

        const numericId = request_id.split('-')[1];
        const token = localStorage.getItem('token');

        if (!token) {
            alert('No token found. Please login.');
            window.location.href = '/Login';
            return;
        }

        const getFormattedTimeForDatabase = (timeString: string): string => {
            const date = new Date();
            const [hours, minutes] = timeString.split(':');
        
            // ตั้งชั่วโมงและนาทีจาก timeString
            date.setHours(Number(hours), Number(minutes), 0, 0);
        
            // ปรับเวลาเป็น Time Zone ประเทศไทย (UTC+7)
            const utcTimestamp = date.getTime();
            const thaiTime = new Date(utcTimestamp + (7 * 60 * 60 * 1000));
        
            // คืนค่าเฉพาะเวลาในฟอร์แมต HH:mm:ss
            return thaiTime.toTimeString().split(' ')[0];
        };
        
        // การใช้งาน
        const implementStartDateTime = implementStart ? getFormattedTimeForDatabase(implementStart) : null;
        const implementEndDateTime = implementEnd ? getFormattedTimeForDatabase(implementEnd) : null;
        

        const data = {
            cause: causeRef.current?.value ?? '',
            solution: solutionRef.current?.value ?? '',
            torque_label: torqueRefs.current[0]?.value ?? '',
            torque_check1: torqueRefs.current[1]?.value ?? '',
            torque_check2: torqueRefs.current[2]?.value ?? '',
            torque_check3: torqueRefs.current[3]?.value ?? '',
            typesd: typeScrewdriverSelectRef.current?.value ?? '',
            speed: types.includes('High-Speed') ? 'High-Speed' : 'Low-Speed',
            serial_no: serialnoInputRef.current?.value ?? '',
            has_document: selectDoc,
            numberdoc: documentDetail,
            comment: commentTextareaRef.current?.value ?? '',
            implement_start: implementStartDateTime,
            implement_end: implementEndDateTime,
            request_id: numericId,
        };

        try {
            const response = await apiFetch('/Operator/Implement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Repair details submitted successfully!',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    resetForm();
                window.location.href = `/Worker/RepairRequest`;
                })
            } else {
                console.error('Failed to submit repair details.');
            }
        } catch (error) {
            console.error('Error submitting repair details:', error);
        }
    };

    const resetForm = () => {
        setTypes([]);
        setSelectDoc(false);
        setDocumentDetail('');
        commentTextareaRef.current && (commentTextareaRef.current.value = '');
        causeRef.current && (causeRef.current.value = '');
        solutionRef.current && (solutionRef.current.value = '');
        serialnoInputRef.current && (serialnoInputRef.current.value = '');
        torqueRefs.current.forEach(ref => ref && (ref.value = ''));
    };

    if (loading) {
        return <div>Loading...</div>; // Optional loading state
    }

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarWorker />
            <main className="p-4 bg-white flex flex-col flex-1">
                <h2 className="text-3xl font-bold ml-16 mt-3">Details of Repair</h2>
                <div className="flex justify-center items-center w-screen">
                    <div className="container rounded shadow-lg p-5 mt-5 border">
                        <div>
                            <label htmlFor="cause" className="block mb-2 text-lg font-bold text-gray-900">Cause ( สาเหตุของปัญหา )</label>
                            <textarea 
                                id="cause" 
                                ref={causeRef}
                                rows={3} 
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="Write your cause here...">
                            </textarea>
                        </div>
                        <hr className="mt-3"/>

                        <div className="mt-4">
                            <label htmlFor="solution" className="block mb-2 text-lg font-bold text-gray-900">Solution ( วิธีแก้ไข | มาตรการรับมือ )</label>
                            <textarea 
                                id="solution" 
                                ref={solutionRef}
                                rows={3} 
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="Write your solution here...">
                            </textarea>
                        </div>
                        <hr className="mt-3"/>

                        <h3 className="text-lg font-bold mt-4">กรณีปรับค่าทอร์ก</h3>
                        <form className="grid grid-cols-4 gap-4">
                            {['Torque value at the sign..', 'Checkable value 1st', 'Checkable value 2nd', 'Checkable value 3rd'].map((placeholder, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { torqueRefs.current[index] = el; }}
                                    type="text"
                                    placeholder={placeholder}
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                            ))}
                        </form>
                        <hr className="mt-3"/>

                        <h3 className="text-lg font-bold mt-4">กรณีเปลี่ยน Screwdriver</h3>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="mt-3">
                            <label htmlFor="lineProcess" className="block mb-2 text-sm font-medium">
                                Type Screwdriver
                                <select
                                className="mt-2 bg-gray-50 border border-gray-300 text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                id="lineProcess"
                                ref={typeScrewdriverSelectRef}
                                >
                                <option value="" disabled >Select Type Screwdriver</option>
                                {typeScrewdriver.map((typeScrewdiver) => (
                                    <option key={typeScrewdiver.typesd_id} value={typeScrewdiver.typesd_id}>
                                    {typeScrewdiver.name}
                                    </option>
                                ))}
                                </select>
                            </label>
                            </div>


                            <div className="mt-3">
                                <label htmlFor="serialno" className="block mb-2 text-sm font-medium text-gray-900">Serial No.</label>
                                <input
                                    type="text"
                                    id="serialno"
                                    ref={serialnoInputRef}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="Enter your serial no."
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="flex items-center mb-4">
                                <input 
                                    id="high-speed-checkbox" 
                                    type="checkbox" 
                                    value="High-Speed"
                                    checked={types.includes('High-Speed')}
                                    onChange={() => handleTypeChange('High-Speed')}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="high-speed-checkbox" className="ml-2 text-sm font-medium text-gray-900">High-Speed</label>
                            </div>
                            <div className="flex items-center mb-4">
                                <input 
                                    id="low-speed-checkbox" 
                                    type="checkbox" 
                                    value="Low-Speed"
                                    checked={types.includes('Low-Speed')}
                                    onChange={() => handleTypeChange('Low-Speed')}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="low-speed-checkbox" className="ml-2 text-sm font-medium text-gray-900">Low-Speed</label>
                            </div>
                        </div>
                        <hr className='mt-3'/>


                        <div className="mt-3 flex items-center">
                            <input 
                                id="has-document" 
                                type="checkbox" 
                                checked={selectDoc} 
                                onChange={handleCheckboxChange} 
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="has-document" className="ml-2 text-sm font-medium text-gray-900">Have Document</label>
                        </div>
                        <div className="text-red-600 text-sm">
                            <p>*ถ้ามีเอกสารที่ต้องติดตาม โปรดคลิกปุ่มข้างบน ถ้าไม่มีเอกสารที่ต้องติดตาม ข้ามไปกรอกข้อมูลส่วนถัดไป</p>
                        </div>
                        
                        {selectDoc && (
                            <div className="mt-3">
                                <input 
                                    type="text" 
                                    value={documentDetail} 
                                    onChange={handleDocumentChange} 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="Enter document number"
                                    required
                                />
                            </div>
                        )}

                        <div className="mt-3">
                            <label htmlFor="comment" className="block mb-2 text-lg font-bold text-gray-900">Comment ( ข้อคิดเห็น )</label>
                            <textarea 
                                id="comment" 
                                ref={commentTextareaRef}
                                rows={3} 
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="Write your comment here...">
                            </textarea>
                        </div>

                        <form className="max-w-[8rem] mx-auto flex justify-start space-x-4 mt-3">
                            <div className="flex flex-col">
                                <label htmlFor="start_time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Time:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                                        </svg>
                                    </div>
                                    <input
                                        type="time"
                                        id="start_time"
                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        min="08:00"
                                        max="18:00"
                                        value={implementStart || ''}
                                        onChange={(e) => setImplementStart(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="end_time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End Time:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clip-rule="evenodd"/>
                                        </svg>
                                    </div>
                                    <input
                                        type="time"
                                        id="end_time"
                                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        min="08:00"
                                        max="18:00"
                                        value={implementEnd || ''}
                                        onChange={(e) => setImplementEnd(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                        <button 
                            onClick={handleSubmit} 
                            className="mt-4 w-full p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
