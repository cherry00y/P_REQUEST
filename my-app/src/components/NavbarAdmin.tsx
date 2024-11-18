"use client"
import Link from "next/link";

export default function NavbarAdmin() {

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    window.location.href = "/";
  };

    return (
      <nav className="bg-red-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
        <Link href="/Admin" className="text-3xl text-white font-bold" aria-label="Home Page">
          RICOH
        </Link>
        <div className="flex">
          <ul className="menu menu-horizontal px-1 flex space-x-4">
            <li>
              <Link href='/Admin/RequestList' className="text-white hover:text-white font-bold">Request</Link>
            </li>
            <li>
              <details className="relative">
                <summary className="cursor-pointer text-white font-bold ">Information</summary>
                <ul className="absolute left-0 bg-base-100 rounded-md mt-2 p-2 w-48 z-50">
                  <li>
                    <Link href="/Admin/Information" className="block px-4 py-2 hover:bg-gray-50">Pending Information</Link>
                  </li>
                  <li>
                    <Link href="/Admin/Information/Informcompleted" className="block px-4 py-2 hover:bg-gray-50">Cost RepairRequest</Link>
                  </li>
                  <li>
                    <Link href="/Admin/Information/alldetailinformation/repairrequest" className="block px-4 py-2 hover:bg-gray-50">Completed Information</Link>
                  </li>
                </ul>
              </details>
          </li>
            <li>
              <Link href='/Admin/dashboard' className="text-white hover:text-white font-bold">Dashboard</Link>
            </li>
            <li>
              <a className="text-white hover:text-white font-bold" onClick={handleLogout}>Log out</a>
            </li>
          </ul>
        </div>
      </div>
      </nav>
    );
  }
  