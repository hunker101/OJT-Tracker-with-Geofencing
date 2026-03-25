import React from 'react';

const ProgressBar = ({ totalHours, requiredHours }) => {
  const percentage = Math.min((totalHours / requiredHours) * 100, 100).toFixed(1);
  const remaining = Math.max(requiredHours - totalHours, 0).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Hours Rendered</h3>
          <div className="text-3xl font-black text-gray-800 border-b-2 border-transparent hover:border-blue-500 cursor-pointer transition-all duration-300">
            {totalHours} <span className="text-lg text-gray-500 font-medium tracking-normal">/ {requiredHours} hrs</span>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Remaining</h3>
          <div className="text-xl font-bold text-orange-500">
            {remaining} hrs left
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden group">
        <div 
          className="bg-gradient-to-r from-blue-400 to-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out group-hover:from-blue-500 group-hover:to-indigo-700" 
          style={{ width: `${percentage}%` }}
        ></div>
        <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 -ml-16 hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
      </div>
      
      <div className="mt-3 flex justify-between text-sm">
        <span className="text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-md">{percentage}% Complete</span>
        <span className="text-gray-500 italic">Target: 486 hrs</span>
      </div>
    </div>
  );
};

export default ProgressBar;
