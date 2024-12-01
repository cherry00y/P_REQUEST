"use client";

import { useEffect } from 'react';
import NavbarAdmin from '@/components/NavbarAdmin';
import ChartComponent from '@/components/Requestamount';
import WeeklyRequestsChart from '@/components/Typeamount';
import YearlyRequestsChart from '@/components/Yearamount';
import IssueTypeamount from '@/components/Issuetypeamount';

export default function Dashboard() {
  useEffect(() => {
    // Load flowbite only on the client side
    import('flowbite');
  }, []);

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <NavbarAdmin />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Top section with two chart components */}
          <div className="bg-white p-6 shadow-xl rounded-lg">
            <ChartComponent />
          </div>
          {/** <div className="bg-white p-6 shadow-xl rounded-lg">
            <WeeklyRequestsChart />
          </div>*/}
          <div className="bg-white p-6 shadow-xl rounded-lg">
            <IssueTypeamount />
          </div>
        </div>
        <div className="container mx-auto mt-12 px-4">
          {/* Bottom section with a large component */}
          <div className="bg-white p-8 shadow-xl rounded-lg">
            <YearlyRequestsChart />
          </div>
        </div>
      </main>
    </div>
  );
}
