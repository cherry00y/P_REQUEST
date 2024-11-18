"use client"
import Link from "next/link";

export default function NavbarWorker() {

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    window.location.href = "/";
  };


    return (
      <nav className="bg-red-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
      <Link href="/Woker" className="text-3xl text-white font-bold" aria-label="Home Page">
        RICOH
      </Link>
      <div className="flex">
          <ul className="menu menu-horizontal px-1 flex space-x-4">
            <li>
              <details className="relative">
                <summary className="cursor-pointer text-white font-bold">Request</summary>
                <ul className="absolute left-0 bg-base-100 rounded-md mt-2 p-2 w-48">
                  <li>
                    <Link href="/Worker/RepairRequest" className="block px-4 py-2 hover:bg-slate-50">Repair Request</Link>
                  </li>
                  <li>
                    <Link href="/Worker/NewRequest" className="block px-4 py-2 hover:bg-gray-200">New Request</Link>
                  </li>
                </ul>
              </details>
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
  