"use client";
import Cookies from 'js-cookie';
import NavbarUser from "@/components/NavbarUser";
import { useState,useEffect, useRef } from "react";
import { apiFetch } from '@/information/api';
import Swal from 'sweetalert2';

interface LineProcess{
  lineprocess_id: number;
  lineprocess_name: string;
}

interface IssueType{
  issuetype_id: number;
  issuetype_name: string;
}

interface Rank{
  rank_id: number;
  description: string;
}

export default function RequestRepair() {
  const [selectedRank, setSelectedRank] = useState<number | null>(null);  // Use number to store rank ID
  const [lineProcess, setLineProcess] = useState<LineProcess[]>([]);
  const [issueType, setIssueType] = useState<IssueType[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<string>("");
  const [selectLineStop, setLineStop] = useState(false);
  const [loading, setLoading] = useState(true);

  const stationInputRef = useRef<HTMLInputElement | null>(null);
  const lineProcessSelectRef = useRef<HTMLSelectElement | null>(null);
  const issueTypeSelectRef = useRef<HTMLSelectElement | null>(null);
  const problemTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const otherIssueInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    Promise.all([
      apiFetch('/Requester/issuetype').then(response => response.json()),
      apiFetch('/Requester/lineprocess').then(response => response.json()),
      apiFetch('/Requester/rank').then(response => response.json())
    ])
    .then(([issuetypes, lineprocesses, ranks]) => {
      setIssueType(issuetypes);
      setLineProcess(lineprocesses);
      setRanks(ranks);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  }, []);

  const handleRankChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRank(Number(event.target.value));  // Store the rank ID
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLineStop(event.target.checked);
  };


  const handleIssueTypeChange = (value: string) => {
    setSelectedIssueType(value); // อัปเดต state
    if (value !== "อื่นๆ") {
      if (otherIssueInputRef.current) {
        otherIssueInputRef.current.value = ""; // ล้างค่า input ถ้าไม่ใช่ "อื่นๆ"
      }
    }
  };
  

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');



    if (!token) {
      console.error('No token found.');
      alert("No token found. Please login.");
      window.location.href = "/Login"; // Redirect to login page
      return;
    }
    

    const data = {
      request_type: 'Repair Request',
      rank: selectedRank,
      lineprocess: lineProcessSelectRef.current?.value ?? '',
      station: stationInputRef.current?.value ?? '',
      subjectrr:
        selectedIssueType === "อื่นๆ"
          ? otherIssueInputRef.current?.value ?? ''
          : selectedIssueType, // ใช้ค่า "อื่นๆ" ถ้ามี
      linestop: selectLineStop,
      problem: problemTextareaRef.current?.value ?? ''
    };
    

    try {
      const response = await apiFetch('/Requester/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        Swal.fire({
          icon: 'error',
          title:'Unauthorized',
          text: 'You are not authorized to perform this action. Please login.',
          timer: 2000,
          confirmButtonText: 'OK'
        });
        window.location.href = "/Login"; // Redirect to login page
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text:'Your request was successful!',
        timer: 2000
      }).then(() => {
        window.location.href = '/User'
        return
      })
      
    } catch (error) {
      console.error('Error:', (error as Error).message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className='flex flex-col min-h-screen'>
      <NavbarUser />
      <main className="p-4 bg-white flex flex-col flex-1">
        <h2 className="text-3xl font-bold ml-16 mt-3">Repair (ใบแจ้งซ่อม)</h2>
        <div className="flex justify-center items-center w-screen">
          <div className="container rounded shadow-lg p-5 mt-5 border">
          {ranks.map((rank) => (
              <div key={rank.rank_id}>
                <label className="flex items-center text-md">
                  <input
                    type="radio"
                    name="rank"
                    value={rank.rank_id}
                    checked={selectedRank === rank.rank_id}
                    onChange={handleRankChange}
                    className="mr-2"
                  />
                  {rank.description}
                </label>
              </div>
            ))}
              <hr className="mt-3" />
              <div className="grid grid-cols-2 gap-4">
                <div className="mt-3">
                  <label htmlFor="lineProcess" className="block mb-2 text-sm font-medium">
                    Line Process
                    <select
                      className="mt-2 bg-gray-50 border border-gray-300 text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      id="lineProcess"
                      ref={lineProcessSelectRef}
                    >
                      <option value="" disabled>Select Line Process</option>
                      {lineProcess.map((lineProcess) => (
                        <option key={lineProcess.lineprocess_id} value={lineProcess.lineprocess_id}>
                          {lineProcess.lineprocess_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3">
                  <label htmlFor="station" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Station</label>
                  <input
                    type="text"
                    id="station"
                    ref={stationInputRef}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter your station"
                    required
                  />
                </div>
              </div>
              <hr/>
            {/*dropdown issuetype */}
            <select
              id="issueType"
              ref={issueTypeSelectRef}
              value={selectedIssueType} // ใช้ state แทน ref
              onChange={(e) => handleIssueTypeChange(e.target.value)}
              className="mt-3 bg-gray-50 border border-gray-300 text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="" disabled>
                Select an IssueType
              </option>
              {issueType.map((issue) => (
                <option key={issue.issuetype_id} value={issue.issuetype_name}>
                  {issue.issuetype_name}
                </option>
              ))}
            </select>

            {selectedIssueType === "อื่นๆ" && (
              <div className="mt-3">
                <label
                  htmlFor="otherIssue"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Please specify the issue
                </label>
                <input
                  type="text"
                  id="otherIssue"
                  ref={otherIssueInputRef}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Enter your issue here"
                />
              </div>
            )}

              <hr/>
              
            <div className="flex items-center mb-4 mt-3">
                <input
                  id="line-stop-checkbox"
                  type="checkbox"
                  checked={selectLineStop}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="line-stop-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Line Stop
                </label>
            </div>
            <div className="text-red-600 text-sm">
              <p>*ถ้าเกิด linestop โปรดคลิกปุ่มข้างบน ถ้าไม่เกิด linestop ข้ามไปกรอกข้อมูลส่วนถัดไป</p>
            </div>
            <div className="mt-3">
              <label htmlFor="problem" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ลักษณะ/อาการเบื้องต้นของปัญหา</label>
              <textarea 
                  id="problem" 
                  ref={problemTextareaRef} 
                  rows={4} 
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  placeholder="Write your thoughts here...">
              </textarea>
            </div>
            <div className="flex justify-center">
              <button onClick={handleSubmit} className="px-20 mt-5 py-2 text-white bg-blue-500 rounded">
                Save
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}