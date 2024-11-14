"use client";

import { useEffect, useState } from 'react';
import NavbarAdmin from '@/components/NavbarAdmin';
import Image from 'next/image';
import ChartComponent from '@/components/Requestamount';
import { apiFetch } from '@/information/api';
import WeeklyRequestsChart from '@/components/Typeamount';
import YearlyRequestsChart from '@/components/Yearamount';

export default function Dashbord() {
  useEffect(() => {
    // Load flowbite only on the client side
    import('flowbite');
  }, []);

  return (
    <div className='flex flex-col min-h-screen'>
      <NavbarAdmin />
      <main className="flex-1 p-4 bg-slate-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
          {/* Top section with two chart components */}
          <div className="bg-white p-4 shadow-lg rounded-lg">
            <ChartComponent />
          </div>
          <div className="bg-white p-4 shadow-lg rounded-lg">
            <WeeklyRequestsChart />
          </div>
        </div>
        <div className="container mx-auto mt-8 px-4">
          {/* Bottom section with a large component */}
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <YearlyRequestsChart />
          </div>
        </div>
      </main>
    </div>
  );
}
