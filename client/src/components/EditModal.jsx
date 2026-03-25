import React, { useState } from 'react';
import { updateAttendance } from '../services/api';
import { format } from 'date-fns';

const EditModal = ({ log, onClose, refreshData }) => {
  const [clockIn, setClockIn] = useState(log.clockIn ? log.clockIn.slice(0, 16) : '');
  const [clockOut, setClockOut] = useState(log.clockOut ? log.clockOut.slice(0, 16) : '');
  const [editReason, setEditReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editReason) return alert('Reason is required');

    setLoading(true);
    try {
      await updateAttendance(log._id, { clockIn, clockOut, editReason });
      refreshData();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Edit Time Record</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Session</label>
            <input type="text" value={log.session} disabled className="w-full bg-gray-100 border-gray-300 rounded-lg p-2.5 text-gray-500 cursor-not-allowed font-medium" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Time In</label>
            <input 
              type="datetime-local" 
              value={clockIn} 
              onChange={e => setClockIn(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Time Out</label>
            <input 
              type="datetime-local" 
              value={clockOut} 
              onChange={e => setClockOut(e.target.value)}
              className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Edit <span className="text-red-500">*</span></label>
            <textarea 
              value={editReason} 
              onChange={e => setEditReason(e.target.value)}
              required
              placeholder="e.g. Forgot to clock out, Holiday, etc."
              className="w-full border-gray-300 rounded-lg p-2.5 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className={`px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-wait' : ''}`}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
