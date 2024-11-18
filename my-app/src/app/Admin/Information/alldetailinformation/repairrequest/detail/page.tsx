"use client"
import NavbarAdmin from "@/components/NavbarAdmin";
import { apiFetch } from "@/information/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DataDetailAllRequestRepair {
    request_id: string;
    requester: string;
    date: string;
    rank: string;
    subject: string;
    lineprocess: string;
    station: string;
    linestop: string;
    detail: string;
    sup_ke: string;
    cause: string;
    solution: string;
    comment: string;
    operator: string;
    torquelabel: string;
    torquecheck1: string;
    torquecheck2: string;
    torquecheck3: string;
    typescrewdriver: string;
    speed: string;
    serialno: string;
    list: string[],
    quantity: string[],
    pricearray: string[],
    totalcost: string
}

export default function AllInformationrepairrequest() {

    const [alldetail, setAllDetail] = useState<DataDetailAllRequestRepair | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const request_id = queryParams.get('request_id')?.split('-')[1];

        if (request_id) {
            apiFetch(`/Admin/AllDetailRepairRequest/${request_id}`)
            .then(response => response.json())
            .then(data => {
                if(data.length > 0 ){
                    const detail = data[0];
                    // ตรวจสอบความยาวของ array
                    if (detail.list?.length !== detail.quantity?.length || 
                        detail.list?.length !== detail.pricearray?.length) {
                        console.error('Mismatch in array lengths for cost data');
                    }
            
                    setAllDetail(data[0]); 
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        } else {
            console.error('No request ID found in URL')
        }
    }, []);

    return(
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin/>
            <main className="p-4 bg-white flex flex-col flex-1">
                <h2 className="text-2xl font-bold ml-20 mt-3">Completed Information</h2>
                <div className="flex justify-center items-center w-screen">
                    <div className="container rounded shadow-lg p-5 mt-5 border">
                        <h3 className="font-bold text-xl">Request details</h3>
                        <div className="grid grid-cols-12 gap-4 mt-4">
                            <>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Doc No.</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.request_id}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Requester</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.requester}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Date</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.date}</div>
                                <hr className="col-span-12 my-4 border-gray-300"/>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Rank</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.rank}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">JobType</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.subject}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">LineProcess</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.lineprocess}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Station</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.station}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Line Stop</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.linestop}</div>
                                <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Detail</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.detail}</div>
                            </>
                        </div>
                        <hr className="col-span-12 my-4 border-gray-300"/>
                        <div className="flex flex-row justify-center items-center space-x-4">
                            <div className="p-3 border bg-blue-300 text-lg font-medium text-black">{alldetail?.requester}</div>
                            <div className="p-3 border bg-yellow-100 text-lg font-medium text-black">{alldetail?.sup_ke}</div>
                        </div>

                        <hr className="col-span-12 my-4 border-gray-300"/>
                        <h3 className="font-bold text-xl">Repair details</h3>
                        <div className="grid grid-cols-12 gap-4 mt-4">
                            <>
                                <div className="col-span-2 p-3 border bg-yellow-400 text-lg font-medium text-white">Cause</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.cause}</div>
                                <div className="col-span-2 p-3 border bg-yellow-400 text-lg font-medium text-white">Solution</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.solution}</div>
                                <div className="col-span-2 p-3 border bg-yellow-400 text-lg font-medium text-white">กรณีปรับค่าทอร์ก</div>
                                <div className="col-span-3 p-3 text-lg font-medium text-black">ค่าทอร์กป้าย: {alldetail?.torquelabel} Nm.</div>
                                <div className="col-span-2 p-3 text-lg font-medium text-black">ค่าที่เช็คได้1: {alldetail?.torquecheck1} Nm.</div>
                                <div className="col-span-2 p-3 text-lg font-medium text-black">ค่าที่เช็คได้2: {alldetail?.torquecheck2} Nm.</div>
                                <div className="col-span-3 p-3 text-lg font-medium text-black">ค่าที่เช็คได้3: {alldetail?.torquecheck3} Nm.</div>
                                <div className="col-span-2 p-3 border bg-yellow-400 text-lg font-medium text-white">กรณีเปลี่ยน Screwdriver</div>
                                <div className="col-span-3 p-3 text-lg font-medium text-black">{alldetail?.typescrewdriver}</div>
                                <div className="col-span-2 p-3 text-lg font-medium text-black">{alldetail?.speed}</div>
                                <div className="col-span-5 p-3 text-lg font-medium text-black">Serial No.{alldetail?.serialno}</div>
                                <div className="col-span-2 p-3 border bg-yellow-400 text-lg font-medium text-white">Comment</div>
                                <div className="col-span-10 p-3 text-lg font-medium text-black">{alldetail?.detail}</div>
                                <div className="col-span-2 p-3 border bg-yellow-400 text-lg font-medium text-white">Cost</div>
                                <div className="col-span-10 p-3">
                                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg border bg-white">
                                        <table className="col-span-10 w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3">List</th>
                                                    <th scope="col" className="px-6 py-3">Quantity</th>
                                                    <th scope="col" className="px-6 py-3">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alldetail?.list.map((item, index) => (
                                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                            {item}
                                                        </th>
                                                        <td className="px-6 py-4">{alldetail.quantity[index]}</td>
                                                        <td className="px-6 py-4">{alldetail.pricearray[index]}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="flex justify-start items-center p-5">
                                            <span className="text-lg font-bold">Total Amount: {alldetail?.totalcost}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        </div>

                        <hr className="col-span-12 my-4 border-gray-300"/>
                        <div className="flex flex-col justify-center items-center">
                            <div className="p-3 border bg-blue-300 text-lg font-medium text-black">{alldetail?.operator}</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
