import React, { useState, useEffect } from 'react';
import { format, isWeekend } from 'date-fns';
import { fetchSites, fetchAttendance, fetchDTR } from '../services/api';
import OnSiteView from '../components/OnSiteView';
import WFHView from '../components/WFHView';
import ProgressBar from '../components/ProgressBar';
import EditModal from '../components/EditModal';

const Dashboard = () => {
  const [site, setSite] = useState(null);
  const [logs, setLogs] = useState([]);
  const [dtrData, setDtrData] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine today's mode based on day of week (Fri-Sun = WFH)
  const isWfhDay = isWeekend(new Date()) || new Date().getDay() === 5; 

  const loadData = async () => {
    try {
      const [sitesRes, logsRes, dtrRes] = await Promise.all([
        fetchSites(),
        fetchAttendance(),
        fetchDTR()
      ]);
      if (sitesRes.length > 0) setSite(sitesRes[0]);
      setLogs(logsRes);
      setDtrData(dtrRes);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter(log => log.clockIn && format(new Date(log.clockIn), 'yyyy-MM-dd') === today);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">OJT Tracker</h1>
        <p className="text-gray-500 font-medium mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} • {isWfhDay ? 'WFH Schedule' : 'On-Site Schedule'}
        </p>
      </header>

      {dtrData && (
        <ProgressBar totalHours={parseFloat(dtrData.totalHours)} requiredHours={dtrData.requiredHours} />
      )}

      {isWfhDay ? (
        <WFHView site={site} todayLogs={todayLogs} refreshData={loadData} />
      ) : (
        <OnSiteView site={site} />
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-8">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
           <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {logs.slice(0, 10).map(log => (
            <div key={log._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition-colors gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{format(new Date(log.clockIn), 'MMM d')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${log.session === 'WFH' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {log.session}
                    </span>
                    {log.edited && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">Edited</span>}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {format(new Date(log.clockIn), 'h:mm a')} — {log.clockOut ? format(new Date(log.clockOut), 'h:mm a') : 'Active'}
                  {log.durationMinutes > 0 && <span className="text-gray-400 ml-2">({(log.durationMinutes / 60).toFixed(1)}h)</span>}
                </div>
              </div>
              <button 
                onClick={() => setEditingLog(log)}
                className="text-sm text-blue-600 font-semibold hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors self-start sm:self-auto"
              >
                Edit Time
              </button>
            </div>
          ))}
          {logs.length === 0 && <div className="p-8 text-center text-gray-500">No activity logs yet.</div>}
        </div>
      </div>

      {editingLog && (
        <EditModal log={editingLog} onClose={() => setEditingLog(null)} refreshData={loadData} />
      )}
    </div>
  );
};

export default Dashboard;
