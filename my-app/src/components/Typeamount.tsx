import { useEffect, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { apiFetch } from '@/information/api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DataPoint {
  day: string;
  request_type: string;
  count: number;
}

const WeeklyRequestsChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [selectedRange, setSelectedRange] = useState('This week');
  const [customDate, setCustomDate] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomDateSelected, setIsCustomDateSelected] = useState(false);

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
    const currentDateString = currentDate.toISOString().split('T')[0];
  
    // Calculate start and end of the current week (Monday to Sunday)
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust if it's Sunday
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Sunday
  
    // Calculate start and end of the previous week (Monday to Sunday)
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
  
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.day);
      const itemDateString = itemDate.toISOString().split('T')[0];
  
      if (range === 'Today') {
        return itemDateString === currentDateString;
      }
  
      if (range === 'This Week') {
        // Check if date falls between Monday and Sunday of the current week
        return itemDate >= startOfWeek && itemDate <= endOfWeek;
      }
  
      if (range === 'Last Week') {
        // Check if date falls between Monday and Sunday of the previous week
        return itemDate >= startOfLastWeek && itemDate <= endOfLastWeek;
      }
  
      if (range === 'Custom Date' && customDate) {
        const selectedDate = new Date(customDate);
        return itemDateString === selectedDate.toISOString().split('T')[0];
      }
  
      return false;
    });
  
    setFilteredData(filtered);
  }, [data, customDate]);
  

  // Call fetchData on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Call filterData when selectedRange, data, or customDate changes
  useEffect(() => {
    if (selectedRange !== 'Custom Date' || (selectedRange === 'Custom Date' && customDate)) {
      filterData(selectedRange);
    }
  }, [data, selectedRange, customDate, filterData]);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    if (range === 'Custom Date') {
      setIsDropdownOpen(true); // Open dropdown when Custom Date is selected
    } else {
      setCustomDate(''); // Clear customDate when not Custom Date
      setIsDropdownOpen(false); // Close dropdown for other ranges
      filterData(range);
    }
  };
  
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDate(e.target.value);
    if (selectedRange === 'Custom Date') {
      filterData('Custom Date'); // Call filterData when custom date is selected
    }
  };

  // Prepare chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], // Monday to Friday
    datasets: [
      {
        label: 'Repair Request',
        data: [0, 0, 0, 0, 0],  // Initial empty data for Repair Requests
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'New Request',
        data: [0, 0, 0, 0, 0],  // Initial empty data for New Requests
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Update chart data based on filtered data
  filteredData.forEach((item: DataPoint) => {
    const dayIndex = (new Date(item.day).getDay() + 6) % 7; // Adjust so that Monday = 0, ..., Friday = 6
    if (item.request_type === 'Repair Request') {
      chartData.datasets[0].data[dayIndex]++;
    } else if (item.request_type === 'New Request') {
      chartData.datasets[1].data[dayIndex]++;
    }
  });

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6 relative">
      <div className="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <h5 className="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">Request Summary</h5>
      </div>

      <div id="column-chart" className="mb-4">
        <Bar data={chartData} />
      </div>

      <div className="flex justify-between items-center pt-5">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          id="dropdownDefaultButton"
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
                <a href="#" onClick={() => handleRangeChange('Today')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Today</a>
              </li>
              <li>
                <a href="#" onClick={() => handleRangeChange('This week')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">This week</a>
              </li>
              <li>
                <a href="#" onClick={() => handleRangeChange('Last week')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last week</a>
              </li>
              <li>
                <a href="#" onClick={() => handleRangeChange('Custom Date')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Custom Date</a>
              </li>
            </ul>
            {selectedRange === 'Custom Date' && (
              <input
                type="date"
                value={customDate || ''}
                onChange={handleCustomDateChange}
                className="mt-2 w-full text-sm border border-gray-300 rounded-lg"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyRequestsChart;
