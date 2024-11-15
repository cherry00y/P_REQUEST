"use client";
import NavbarAdmin from "@/components/NavbarAdmin";
import { apiFetch } from "@/information/api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from "sweetalert2";


interface DetailNewRequest {
    request_id: string;
    requestor: string;
    date: string;
    jobtype: string;
    subject: string;
    lineprocess: string;
    station: string;
    cause: string;
    detail: string;
    //image: string | null; // Add image property
    newrequest_id: string;
}

export default function DetailRequest(){

    const [detailnewrequest, setDetailNewRequest] = useState<DetailNewRequest | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [duedateVisible, setDuedateVisible] = useState(false);

    const toggleDuedate = () => {
        setDuedateVisible(!duedateVisible); // เมื่อกดเปลี่ยนค่าการแสดงผล
      };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const request_id = queryParams.get('request_id')?.split('-')[1];

        if(request_id){
            apiFetch(`/Admin/detailnewrequest/${request_id}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.length > 0){
                    setDetailNewRequest(data[0]);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        } else{
            console.error('No request ID found in the URL')
        }
    }, []);

    const handleReject = async (request_id: string) => {
        const numericId = request_id.split('-')[1];
        if (!request_id) return;

        try {
            const response = await apiFetch(`/Admin/reject/${numericId}`, {
                method: 'DELETE',
            });

            if (response.ok) {

                const responseData = await response.text(); // หรือ .json() ขึ้นอยู่กับสิ่งที่เซิร์ฟเวอร์ตอบกลับ
                console.log('Server response:', responseData);
                Swal.fire({
                    icon: "success",
                    title: "Request successfully rejected",
                    showConfirmButton: false,
                    timer: 1500
                  }).then(() => {
                    window.location.href = '/RequestList';
                  });
            } else {
                console.error('Failed to reject request:', response.statusText);
                Swal.fire({
                    icon: "success",
                    title: "Error rejecting request",
                    showConfirmButton: false,
                    timer: 1500
                  });
            }
        } catch (err) {
            console.error('Error rejecting request:', err);
            alert('Error rejecting request');
        }
    }; 

    const handleAccept = async (request_id: string) => {
        const numericId = request_id.split('-')[1];
        if (!request_id) return;

        const today = new Date();
        const isToday = selectedDate?.toDateString() === today.toDateString();

        const data: any = {
            duedate: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
        };

        if (!isToday) {
            Swal.fire({
                title: 'Select Status for the Delay',
                input: 'radio',
                inputOptions: {
                    'Waiting for goods': 'Waiting for goods',
                    'Out of stock': 'Out of stock',
                },
                inputValidator: (value) => {
                    if (!value) {
                        return 'You need to select a status!';
                    }
                },
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                cancelButtonColor: '#d33',
                confirmButtonColor: '#3085d6',
            }).then((result) => {
                if (result.isConfirmed) {
                    const selectedStatus = result.value;
                    data.status = selectedStatus;

                    // Proceed with the accept request
                    performAcceptRequest(numericId, data);
                }
            });
        } else {
            data.status = 'Accept';
            performAcceptRequest(numericId, data);
        }
    };

    const performAcceptRequest = async (numericId: string, data: any) => {
        try {
            const token = localStorage.getItem('token');
            const responseAccept = await apiFetch(`/Admin/acceptrequest/${numericId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (responseAccept.ok) {
                const responseData = await responseAccept.text();
                const newrequestId = detailnewrequest?.newrequest_id;
                console.log('Server response:', responseData);

                Swal.fire({ 
                    title: 'Request successfully accepted',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                     window.location.href = `/Admin/RequestList/DetailNew/Cost?newrequest_id=${newrequestId}`;
                })
            } else {
                console.error('Failed to accept request:', responseAccept.statusText);
                Swal.fire({
                    icon: "error",
                    title: "An error occurred in accepting",
                    text: "Please,try again",
                    cancelButtonText: 'OK',
                    showConfirmButton: false,
                    timer: 2500
                  });
            }
        } catch (err) {
            console.error('Error accepting request:', err);
            alert('Error accepting request');
        }
    };

    return(
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin/>
            <main className="p-4 bg-white flex flex-col flex-1">
                <a href="/Admin/RequestList">
                    <svg className="ml-12 w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                    </svg>
                </a> 
                <h2 className="text-2xl font-bold ml-20 mt-3">Detail List Request</h2>
                <div className="flex justify-center items-center w-screen">
                    <div className="container rounded shadow-lg p-5 mt-5 border">
                        <h3 className="font-bold text-xl">Create Information</h3>
                        <div className="grid grid-cols-12 gap-4 mt-4">
                            {detailnewrequest && (
                                <>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Doc No.</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{detailnewrequest.request_id}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Requestor</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{detailnewrequest.requestor}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Date</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{detailnewrequest.date}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">JobType</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{detailnewrequest.jobtype}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Subject</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{detailnewrequest.subject}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">LineProcess</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{detailnewrequest.lineprocess}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Station</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{detailnewrequest.station}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Cause</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{detailnewrequest.cause}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Detail</div>
                                <div 
                                    className="col-span-10 p-3 text-lg font-medium text-black" 
                                    style={{ whiteSpace: "pre-wrap" }}
                                    >
                                    {detailnewrequest.detail}
                                </div>
                                {/*
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Detail Image</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">
                                    {detailnewrequest.image ? (
                                        <Image 
                                        src={detailnewrequest.image} // ใช้ URL ที่ส่งมาจาก API โดยตรง
                                        alt="Request Image" 
                                        width={200} 
                                        height={256} 
                                        className="w-full h-auto" 
                                     />
                                    ) : (
                                        <p>No image available</p>
                                    )}
                                </div>
                                */}
                                </>
                            )}
                            
                        </div>
                        <hr className="mt-5"/>
                        {/* Conditionally show the Duedate section */}
                        {duedateVisible && (
                        <div className="mt-6">
                            <h3 className="font-bold text-xl">Duedate</h3>
                            <div className="grid grid-cols-12 gap-4 mt-4">
                            <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">DueDate</div>
                            <div className="col-span-10 p-3 bg-white">
                                <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => setSelectedDate(date)}
                                inline
                                />
                            </div>
                            </div>
                        </div>
                        )}
                        <div className="flex items-center justify-center mt-6 gap-4">
                        {detailnewrequest && (
                                <button
                                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                                    onClick={() => handleReject(detailnewrequest.request_id)}
                                >
                                    Reject
                                </button>
                            )}
                            <button 
                                className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                                onClick={toggleDuedate}
                                >
                                Duedate
                            </button>

                            <button 
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                onClick={() => {
                                    if (detailnewrequest) {
                                        handleAccept(detailnewrequest.request_id);
                                    } else {
                                        alert('Details not available. Please try again later.');
                                    }
                                }}
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

