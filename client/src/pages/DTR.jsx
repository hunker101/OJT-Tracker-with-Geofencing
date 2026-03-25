import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fetchDTR } from '../services/api';

const DTR = () => {
  const [dtrData, setDtrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchDTR();
        setDtrData(res);
      } catch (err) {
        console.error("Failed to load DTR", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const exportCSV = () => {
    if (!dtrData) return;
    
    const headers = ['Date', 'Mode', 'AM In', 'AM Out', 'PM In', 'PM Out', 'Daily Hrs', 'Total Hrs'];
    const rows = dtrData.dtr.map(day => [
      day.date,
      day.isHoliday ? 'HOLIDAY' : day.mode || '-',
      day.amIn ? format(new Date(day.amIn), 'HH:mm') : '-',
      day.amOut ? format(new Date(day.amOut), 'HH:mm') : '-',
      day.pmIn ? format(new Date(day.pmIn), 'HH:mm') : '-',
      day.pmOut ? format(new Date(day.pmOut), 'HH:mm') : '-',
      day.dailyMinutes ? (day.dailyMinutes / 60).toFixed(2) : '0',
      day.runningTotalMinutes ? (day.runningTotalMinutes / 60).toFixed(2) : '0'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DTR_Export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading DTR Data...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Daily Time Record</h1>
            <p className="text-gray-500 font-medium mt-1">Total Rendered: {dtrData?.totalHours || 0} / {dtrData?.requiredHours} hrs</p>
        </div>
        <button 
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">Date</th>
                <th scope="col" className="px-6 py-4">Mode</th>
                <th scope="col" className="px-6 py-4">AM In</th>
                <th scope="col" className="px-6 py-4">AM Out</th>
                <th scope="col" className="px-6 py-4">PM / WFH In</th>
                <th scope="col" className="px-6 py-4">PM / WFH Out</th>
                <th scope="col" className="px-6 py-4">Daily Hrs</th>
                <th scope="col" className="px-6 py-4 font-bold text-gray-800">Total Hrs</th>
              </tr>
            </thead>
            <tbody>
              {dtrData?.dtr.map((day, idx) => (
                <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 ${day.isHoliday ? 'bg-orange-50/50' : ''}`}>
                  <td className="px-6 py-4 font-semibold text-gray-800">{format(new Date(day.date), 'MMM dd (EEE)')}</td>
                  <td className="px-6 py-4">
                      {day.isHoliday ? <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold">HOLIDAY</span> : 
                       day.mode === 'onsite' ? <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">On-Site</span> :
                       day.mode === 'wfh' ? <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold">WFH</span> : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.amIn ? format(new Date(day.amIn), 'h:mm a') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.amOut ? format(new Date(day.amOut), 'h:mm a') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.pmIn ? format(new Date(day.pmIn), 'h:mm a') : day.wfhIn ? format(new Date(day.wfhIn), 'h:mm a') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.pmOut ? format(new Date(day.pmOut), 'h:mm a') : day.wfhOut ? format(new Date(day.wfhOut), 'h:mm a') : '-'}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{day.dailyMinutes ? (day.dailyMinutes / 60).toFixed(2) : '-'}</td>
                  <td className="px-6 py-4 font-black text-gray-800">{day.runningTotalMinutes ? (day.runningTotalMinutes / 60).toFixed(2) : '-'}</td>
                </tr>
              ))}
              {(!dtrData || dtrData.dtr.length === 0) && (
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DTR;
