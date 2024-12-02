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
              <Link href="/Worker/RepairRequest" className="text-white hover:text-white font-bold">Information</Link>
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
  