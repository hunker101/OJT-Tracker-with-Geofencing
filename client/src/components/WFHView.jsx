import React, { useState, useEffect } from 'react';
import { clockIn, clockOut } from '../services/api';

const WFHView = ({ site, todayLogs, refreshData }) => {
  const [loading, setLoading] = useState(false);

  const wfhLog = todayLogs.find(log => log.session === 'WFH');
  const isClockedIn = wfhLog && !wfhLog.clockOut;
  const isCompleted = wfhLog && wfhLog.clockOut;

  const handleStartWork = async () => {
    setLoading(true);
    try {
      await clockIn({
        siteId: site._id,
        workMode: 'wfh',
        session: 'WFH',
        method: 'manual',
      });
      refreshData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start work');
    }
    setLoading(false);
  };

  const handleEndWork = async () => {
    setLoading(true);
    try {
      await clockOut(wfhLog._id);
      refreshData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end work');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
      <div className="p-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-purple-800">🏠 Work From Home</h2>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
          Manual Tracking
        </span>
      </div>

      <div className="p-8 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">💻</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {isCompleted ? 'Work Completed for Today 🎉' : isClockedIn ? 'You are currently working' : 'Ready to start your shift?'}
        </h3>
        
        <p className="text-gray-500 mb-8 max-w-sm">
          WFH hours (Fri-Sun) require manual clock-in and clock-out. Ensure you complete your required hours.
        </p>

        {!isCompleted && (
            <button
            onClick={isClockedIn ? handleEndWork : handleStartWork}
            disabled={loading}
            className={`
                px-8 py-4 rounded-full font-bold text-lg text-white shadow-lg transition-all
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                ${isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
            `}
            >
            {loading ? 'Processing...' : isClockedIn ? '⏹ End Work' : '▶ Start Work'}
            </button>
        )}
      </div>
    </div>
  );
};

export default WFHView;
