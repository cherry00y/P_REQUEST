import { useEffect, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { apiFetch } from '@/information/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DataPoint {
  day: string;
  count: number;
}

interface ChartProps {
  data: DataPoint[];
}

const ChartComponent: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [selectedRange, setSelectedRange] = useState('Last 7 days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [isDateInputVisible, setIsDateInputVisible] = useState(false); // Track visibility of the date input field

  const fetchData = async () => {
    try {
      const response = await apiFetch(`/Dashboard/requestsummary`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterData = useCallback((range: string) => {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
  
    // คำนวณวันแรกของสัปดาห์ (อาทิตย์นี้)
    const dayOfWeek = currentDate.getDay(); // วันที่ในสัปดาห์ (0 = Sunday, 1 = Monday, ...)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek); // กำหนดให้เป็นวันอาทิตย์ที่ผ่านมาหรือวันนี้
  
    // คำนวณวันจันทร์ถึงศุกร์ในสัปดาห์นี้
    const startOfWeekMonday = new Date(startOfWeek);
    startOfWeekMonday.setDate(startOfWeek.getDate() + 1); // วันจันทร์
    const endOfWeekFriday = new Date(startOfWeek);
    endOfWeekFriday.setDate(startOfWeek.getDate() + 5); // วันศุกร์
  
    // คำนวณวันอาทิตย์ถึงเสาร์ในสัปดาห์ที่แล้ว
    const startOfLastWeekSunday = new Date(startOfWeek);
    startOfLastWeekSunday.setDate(startOfWeek.getDate() - 7); // วันอาทิตย์ที่แล้ว
    const endOfLastWeekSaturday = new Date(startOfWeek);
    endOfLastWeekSaturday.setDate(startOfWeek.getDate() - 2); // วันเสาร์ที่แล้ว
  
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.day);
      const itemDateString = itemDate.toISOString().split('T')[0];
  
      if (range === 'Today') {
        return itemDateString === currentDateString;
      }
  
      if (range === 'This week') {
        // เช็คว่าเป็นวันที่ระหว่างวันจันทร์ถึงศุกร์ของสัปดาห์นี้
        return itemDate >= startOfWeekMonday && itemDate <= endOfWeekFriday;
      }
  
      if (range === 'Last 7 days') {
        // เช็คว่าเป็นวันที่ระหว่างวันอาทิตย์ถึงเสาร์ของสัปดาห์ที่แล้ว
        return itemDate >= startOfLastWeekSunday && itemDate <= endOfLastWeekSaturday;
      }
  
      if (range === 'Custom Date' && customDate) {
        return itemDateString === customDate;
      }
  
      return range !== 'Custom Date';
    });
  
    setFilteredData(filtered);
  }, [data, customDate]);

  useEffect(() => {
    if (selectedRange !== 'Custom Date' || (selectedRange === 'Custom Date' && customDate)) {
      filterData(selectedRange);
    }
  }, [filterData, selectedRange, customDate]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    if (range === 'Custom Date') {
      setIsDropdownOpen(false); // Close dropdown when selecting Custom Date
      setIsDateInputVisible(true); // Show date input
    } else {
      setCustomDate('');
      setIsDropdownOpen(false); // Close dropdown if range is not Custom Date
      setIsDateInputVisible(false); // Hide date input
      filterData(range);
    }
  };
  
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDate(e.target.value);
    if (selectedRange === 'Custom Date') {
      filterData('Custom Date');
    }
    setIsDropdownOpen(true);
  };

  const chartData = {
    labels: filteredData.map(item => item.day),
    datasets: [
      {
        label: 'Request Count',
        data: filteredData.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

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

        {isDropdownOpen && !isDateInputVisible && (
          <div id="lastDaysdropdown" className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 max-h-[200px] overflow-y-auto">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
              <li>
                <a href="#" onClick={() => handleRangeChange('Today')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Today</a>
              </li>
              <li>
                <a href="#" onClick={() => handleRangeChange('This week')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last 7 days</a>
              </li>
              <li>
                <a href="#" onClick={() => handleRangeChange('Last week')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Last Month</a>
              </li>
              <li>
                <a href="#" onClick={() => handleRangeChange('Custom Date')} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Custom Date</a>
              </li>
            </ul>
          </div>
        )}

        {isDateInputVisible && (
          <input
            type="date"
            value={customDate}
            onChange={handleCustomDateChange}
            className="w-full px-4 py-2 mt-2 border rounded-md dark:bg-gray-800 dark:text-white"
            autoFocus
          />
        )}
      </div>
    </div>
  );
};

export default ChartComponent;
