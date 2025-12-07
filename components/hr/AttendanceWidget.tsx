
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord } from '../../types';
import { hrService } from '../../services/hrService';
import { Clock, MapPin, CheckCircle, LogIn, LogOut, Loader2 } from 'lucide-react';

interface AttendanceWidgetProps {
  user: User;
}

export const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({ user }) => {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    loadStatus();
    return () => clearInterval(timer);
  }, []);

  const loadStatus = async () => {
    const today = new Date().toISOString().split('T')[0];
    const log = await hrService.getAttendanceLogs(user.id, today);
    setRecord(log);
  };

  const handlePunch = async () => {
    setLoading(true);
    try {
      const updated = await hrService.punchClock(user.id);
      setRecord(updated);
    } catch (e) {
      alert("打卡失敗");
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = !!record?.check_in;
  const isCheckedOut = !!record?.check_out;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          <span className="font-mono text-lg font-bold">{time.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={12} /> 台北總部 (Office)
        </div>
      </div>
      
      <div className="p-6 flex flex-col items-center">
        <div className="mb-4 text-center">
          <p className="text-sm text-slate-500 mb-1">{new Date().toLocaleDateString()}</p>
          <h3 className="text-xl font-bold text-slate-800">
            {isCheckedOut ? '今日工作已結束' : isCheckedIn ? '工作中 (Working)' : '準備上班'}
          </h3>
        </div>

        <button
          onClick={handlePunch}
          disabled={loading || isCheckedOut}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all transform hover:scale-105 shadow-xl ${
            isCheckedOut 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-4 border-slate-200'
              : isCheckedIn 
                ? 'bg-orange-500 hover:bg-orange-600 text-white border-4 border-orange-200' 
                : 'bg-blue-600 hover:bg-blue-700 text-white border-4 border-blue-200'
          }`}
        >
          {loading ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isCheckedOut ? (
            <>
              <CheckCircle size={32} className="mb-1" />
              <span className="text-xs font-bold">Good Job</span>
            </>
          ) : isCheckedIn ? (
            <>
              <LogOut size={32} className="mb-1" />
              <span className="text-sm font-bold">下班打卡</span>
            </>
          ) : (
            <>
              <LogIn size={32} className="mb-1" />
              <span className="text-sm font-bold">上班打卡</span>
            </>
          )}
        </button>

        {/* Status Log */}
        <div className="w-full mt-6 space-y-2 border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">上班時間</span>
            <span className={`font-mono font-medium ${record?.check_in ? 'text-slate-800' : 'text-slate-300'}`}>
              {record?.check_in ? new Date(record.check_in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">下班時間</span>
            <span className={`font-mono font-medium ${record?.check_out ? 'text-slate-800' : 'text-slate-300'}`}>
              {record?.check_out ? new Date(record.check_out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
