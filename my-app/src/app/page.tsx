import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="container mx-auto p-4 text-center">
            <h1 className="text-4xl font-bold mb-10">ระบบ Request Equipment</h1>
            <div className="flex justify-around">
                <div>
                    <Image src="/staff.jpeg" alt="Staff" width={300} height={256} className="max-w-sm rounded-lg" />
                    <Link href="/Login/user">
                        <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 mt-7 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">สำหรับ Staff</button>
                    </Link>
                </div>
                <div>
                    <Image src="/worker.jpeg" alt="Worker" width={300} height={256} className="max-w-sm rounded-lg" />
                    <Link href="/Login/worker">
                        <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 mt-7 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">สำหรับ Worker</button>
                    </Link>
                </div>
                <div>
                    <Image src="/admin.jpeg" alt="Admin" width={300} height={256} className="max-w-sm rounded-lg" />
                    <Link href="/Login/admin">
                        <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 mt-7 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">สำหรับ Admin</button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}
