import NavbarAdmin from "@/components/NavbarAdmin";
import Link from "next/link";

export default function AllInformationrepairrequest() {

    return(
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin/>
            <main className="p-4 bg-white flex flex-col flex-1">
                <h2 className="text-2xl font-bold ml-20 mt-3">Completed Information</h2>
                <div className="flex justify-center items-center w-screen">
                    <div className="container rounded shadow-lg p-5 mt-5 border">
                        <h3 className="font-bold text-xl">Request details</h3>
                        <div className="grid grid-cols-12 gap-4 mt-4">
                            {(
                                <>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Doc No.</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Requester</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Date</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <hr className="col-span-12 my-4 border-gray-300"/>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Rank</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">JobType</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">LineProcess</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Station</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Line Stop</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-blue-600 text-lg font-medium text-white">Detail</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                </>
                            )}
                        </div>
                        <hr className="col-span-12 my-4 border-gray-300"/>
                        <h3 className="container rouded shadow-lg p-5 mt-5 border">Repair details</h3>
                        <div className="grid grid-cols-12 gap-4 mt-4">
                            {(
                                <>
                                    <div className="col-span-2 p-3 border bg-yellow-600 text-lg font-medium text-white">Cause</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-yellow-600 text-lg font-medium text-white">Solution</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-yellow-600 text-lg font-medium text-white">กรณีปรับค่าทอร์ก</div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                        <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                        <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                        <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    </div>
                                    <div className="col-span-2 p-3 border bg-yellow-600 text-lg font-medium text-white">กรณีเปลี่ยน Screwdriver</div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                        <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                        <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    </div>
                                    <div className="col-span-2 p-3 border bg-yellow-600 text-lg font-medium text-white">Comment</div>
                                    <div className="col-span-10 p-3 text-lg font-medium text-black"></div>
                                    <div className="col-span-2 p-3 border bg-yellow-600 text-lg font-medium text-white">Cost</div>
                                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                <th scope="col" className="px-6 py-3">
                                                    List
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Category
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    Price
                                                </th>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        Apple MacBook Pro
                                                    </th>
                                                    <td className="px-6 py-4">
                                                        Silver
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        Laptop
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        $2999
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="flex flex-row justify-start items-center mt-5">
                                            <div className="ml-20">
                                                <span className="text-lg font-bold">Total Amount: </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}