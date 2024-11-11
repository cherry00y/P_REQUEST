"use client";

import { useEffect, useState } from 'react';
import NavbarAdmin from '@/components/NavbarAdmin';
import Image from 'next/image';
import ChartComponent from '@/components/Requestamount';
import 'flowbite';
import { apiFetch } from '@/information/api';
import WeeklyRequestsChart from '@/components/Typeamount';
import YearlyRequestsChart from '@/components/Yearamount';
import IssueTypeamount from '@/components/IssueTypeamount';

export default function Dashbord() {
  const [isClient, setIsClient] = useState(false);

  // Ensure that the component runs on the client side only
  useEffect(() => {
    setIsClient(true);  // Mark the component as mounted in the client
  }, []);

  if (!isClient) {
    return null;  // Render nothing until mounted in the client
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <NavbarAdmin />
      <main className="flex-1 p-4 bg-slate-100">
        <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {/* Top section with three components */}
          <ChartComponent />
          <WeeklyRequestsChart />
          <IssueTypeamount />
        </div>
        <div className="">
          {/* Bottom section with a large component */}
          <YearlyRequestsChart />
        </div>
      </main>
    </div>
  );
}
