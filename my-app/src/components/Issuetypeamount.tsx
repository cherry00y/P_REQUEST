import { useEffect, useState, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { apiFetch } from '@/information/api';

// Register Chart.js components
ChartJS.register(ArcElement, Title, Tooltip, Legend);

interface DataPoint {
  Month: any;
  Year: any;
  day: string | number | Date;
  issuetype_name: string;
  RequestCount: number;
}

const IssueTypeamount: React.FC = () => {
    const [data, setData] = useState<DataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // Current month (1-12)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await apiFetch(`/Dashboard/issuetypesummary`);
        const result = await response.json();
        console.log(result); // Inspect the response
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    useEffect(() => {
        fetchData();
      }, []); // เปลี่ยนจากการพึ่งพาค่า 'data'
      
      const filterData = useCallback(() => {
        const filtered = data
          .filter((item) => {
            const itemYear = item.Year; // Check the year from fetched data
            const itemMonth = item.Month; // Check the month from fetched data
            return itemYear === parseInt(selectedYear) && itemMonth === selectedMonth;
          })
          .sort((a, b) => b.RequestCount - a.RequestCount) // Sort data by request count
          .slice(0, 3); // Take only top 3 entries
    
        setFilteredData(filtered);
      }, [data, selectedYear, selectedMonth]);
    
      useEffect(() => {
        filterData(); // Filter data after selecting year or month
      }, [selectedYear, selectedMonth, data, filterData]); 
      
    // Prepare chart data
    const chartData = {
      labels: filteredData.map(item => item.issuetype_name || 'No Data'),
      datasets: [
        {
          data: filteredData.map(item => item.RequestCount || 0),
          backgroundColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)'],
          borderWidth: 1,
        },
      ],
    };

    // Chart options to adjust the pie size
    const options = {
      responsive: true, // Make the chart responsive
      maintainAspectRatio: false, // Allow resizing
      plugins: {
        legend: {
          position: 'top' as const, // Valid position for legend: 'top', 'bottom', 'left', 'right', 'center', or 'chartArea'
        },
      },
      // Custom size for the chart (you can adjust the width and height)
      elements: {
        arc: {
          borderWidth: 2, // Adjust border width of the arcs
        },
      },
    };

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6 relative">
        <div className="flex justify-between items-start w-full">
            <div className="flex-col items-center">
            <div className="flex items-center mb-1">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white me-1">Request Summary</h5>
                <svg
                className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
                >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z"/>
                </svg>
            </div>
            </div>

            <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center text-blue-700 dark:text-blue-600 font-medium hover:underline"
            >
            {selectedMonth} / {selectedYear}
            <svg className="w-3 h-3 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
            </svg>
            </button>

            {isDropdownOpen && (
            <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 max-h-[200px] overflow-y-auto">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                {Array.from({ length: 12 }, (_, i) => (
                    <li key={i}>
                    <a
                        href="#"
                        onClick={() => setSelectedMonth(i + 1)}
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </a>
                    </li>
                ))}
                </ul>

                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li>
                    <a
                    href="#"
                    onClick={() => setSelectedYear('2024')}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                    2024
                    </a>
                </li>
                <li>
                    <a
                    href="#"
                    onClick={() => setSelectedYear('2023')}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                    2023
                    </a>
                </li>
                </ul>
            </div>
            )}
        </div>

        <div id="pie-chart" className="mb-4" style={{ height: '200px' }}>
            <Pie data={chartData} options={options} />
        </div>
    </div>
  );
};

export default IssueTypeamount;
