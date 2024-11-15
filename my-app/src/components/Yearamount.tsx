"use client"
import { useEffect, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { apiFetch } from '@/information/api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DataPoint {
  day: string;  // This will now represent the month and year (e.g., '2024-01')
  request_type: string;
  count: number;
}

const YearlyRequestsChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [selectedRange, setSelectedRange] = useState('Last 12 months');
  const [customYear, setCustomYear] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const availableYears = ['2024', '2023', '2022'];  // Predefined years

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await apiFetch(`/Dashboard/typesummary`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to filter data based on the selected date range
  const filterData = useCallback((range: string) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.day);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth(); // 0 - 11 for months

      if (range === 'Last 12 months') {
        const diff = currentYear - itemYear;
        return diff < 1 || (diff === 1 && itemMonth >= currentDate.getMonth());
      }

      if (range === 'This Year') {
        return itemYear === currentYear;
      }

      if (range === 'Custom Year' && customYear) {
        return itemYear === parseInt(customYear);
      }

      return range !== 'Custom Year';
    });

    setFilteredData(filtered);
  }, [data, customYear]); // Depend on data and customYear

  // Call fetchData on component mount
  useEffect(() => {
    fetchData();
  }, []); // Empty array ensures fetchData is called once on mount

  // Call filterData when selectedRange or customYear changes
  useEffect(() => {
    if (selectedRange !== 'Custom Year' || (selectedRange === 'Custom Year' && customYear)) {
      filterData(selectedRange);
    }
  }, [selectedRange, customYear, filterData]); // Depend on selectedRange, customYear, and filterData

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    if (range === 'Custom Year') {
      setIsDropdownOpen(true); // Open dropdown immediately when Custom Year is selected
    } else {
      setCustomYear(null); // Clear customYear when not using Custom Year
      setIsDropdownOpen(false); // Close dropdown if another range is selected
      filterData(range); // Apply filter
    }
  };

  const handleCustomYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCustomYear(e.target.value);
    if (selectedRange === 'Custom Year') {
      filterData('Custom Year'); // Filter by the selected custom year
    }
  };

  // Prepare chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Months of the year
    datasets: [
      {
        label: 'Repair Request',
        data: new Array(12).fill(0),  // Initialize empty data for Repair Requests
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'New Request',
        data: new Array(12).fill(0),  // Initialize empty data for New Requests
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Update chart data based on filtered data
  filteredData.forEach((item: DataPoint) => {
    const itemDate = new Date(item.day);
    const monthIndex = itemDate.getMonth(); // 0-11 (Jan-Dec)
  
    if (item.request_type === 'Repair Request') {
      chartData.datasets[0].data[monthIndex] += item.count;
    } else if (item.request_type === 'New Request') {
      chartData.datasets[1].data[monthIndex] += item.count;
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-screen-xl w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6 relative">
        <div className="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">Request Summary</h5>
        </div>

        <div id="column-chart" className="mb-4" style={{ height: '200px' }}>
          <Bar data={chartData} />
        </div>

        <div className="flex justify-between items-center pt-5">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white"
            type="button"
          >
            {selectedRange}
            <svg className="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>

          {isDropdownOpen && (
            <div id="lastDaysdropdown" className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 max-h-[200px] overflow-y-auto">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                <li>
                  <a href="#" onClick={() => handleRangeChange('This Year')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">This Year</a>
                </li>
                <li>
                  <a href="#" onClick={() => handleRangeChange('Last 12 months')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last 12 months</a>
                </li>
                <li>
                  <a href="#" onClick={() => handleRangeChange('Custom Year')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Custom Year</a>
                </li>
              </ul>
              {selectedRange === 'Custom Year' && (
                <select
                  value={customYear || ''}
                  onChange={handleCustomYearChange}
                  className="w-full px-4 py-2 mt-2 border rounded-md"
                >
                  <option value="">Select Year</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearlyRequestsChart;
