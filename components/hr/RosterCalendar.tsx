
import React, { useState, useEffect } from 'react';
import { User, WorkShift, RosterEntry } from '../../types';
import { hrService } from '../../services/hrService';
import { ChevronLeft, ChevronRight, Lock, Save, Loader2 } from 'lucide-react';

interface RosterCalendarProps {
  users: Record<string, User>;
}

export const RosterCalendar: React.FC<RosterCalendarProps> = ({ users }) => {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date()); // View state

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [s, r] = await Promise.all([hrService.getShifts(), hrService.getRoster()]);
    setShifts(s);
    setRoster(r);
    setLoading(false);
  };

  // Helper to get week days
  const getDaysInView = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDaysInView();

  const handleShiftChange = (userId: string, dateStr: string, shiftId: string) => {
    const existing = roster.find(r => r.user_id === userId && r.date === dateStr);
    if (existing && existing.is_locked) return;

    // Optimistic Update
    const newEntry: RosterEntry = {
      id: existing ? existing.id : `new-${Date.now()}`,
      user_id: userId,
      date: dateStr,
      shift_id: shiftId,
      is_locked: false
    };

    const newRoster = roster.filter(r => !(r.user_id === userId && r.date === dateStr));
    setRoster([...newRoster, newEntry]);
  };

  const handleSave = async () => {
    setLoading(true);
    await hrService.updateRoster(roster);
    setLoading(false);
    alert('排班表已儲存');
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1">
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate()-7); setCurrentDate(d); }} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={16}/></button>
            <span className="px-3 text-sm font-bold text-slate-700 w-32 text-center">
              {days[0].toLocaleDateString()}
            </span>
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate()+7); setCurrentDate(d); }} className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={16}/></button>
          </div>
          <div className="flex gap-2">
            {shifts.map(s => (
              <div key={s.id} className="flex items-center gap-1 text-xs bg-white border border-slate-200 px-2 py-1 rounded">
                <div className="w-3 h-3 rounded-full" style={{background: s.color}}></div>
                {s.name}
              </div>
            ))}
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
        >
          <Save size={16}/> 儲存發布
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-3 border-b border-r border-slate-200 bg-slate-50 w-48 sticky left-0 z-10 text-left text-slate-500 font-medium">員工</th>
              {days.map(d => (
                <th key={d.toISOString()} className="p-3 border-b border-slate-200 bg-slate-50 text-center min-w-[100px]">
                  <div className="text-slate-800 font-bold">{d.getDate()}</div>
                  <div className="text-xs text-slate-400">{d.toLocaleDateString('en-US', {weekday: 'short'})}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(users).map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-3 border-r border-b border-slate-100 sticky left-0 bg-white font-medium text-slate-700 flex items-center gap-2">
                  <img src={user.avatar} className="w-6 h-6 rounded-full"/>
                  {user.name}
                </td>
                {days.map(d => {
                  const dateStr = d.toISOString().split('T')[0];
                  const entry = roster.find(r => r.user_id === user.id && r.date === dateStr);
                  const currentShift = shifts.find(s => s.id === entry?.shift_id) || shifts.find(s => s.code === 'D'); // Default Day
                  const isLocked = entry?.is_locked;

                  return (
                    <td key={dateStr} className="p-2 border-b border-slate-100 text-center relative">
                      {isLocked ? (
                        <div className="flex items-center justify-center gap-1 text-slate-400 bg-slate-50 py-1 rounded opacity-70 cursor-not-allowed">
                          <Lock size={12}/> {currentShift?.name}
                        </div>
                      ) : (
                        <select 
                          value={currentShift?.id}
                          onChange={(e) => handleShiftChange(user.id, dateStr, e.target.value)}
                          className="w-full text-xs font-bold text-center py-1 rounded appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                          style={{
                            backgroundColor: `${currentShift?.color}20`,
                            color: currentShift?.color
                          }}
                        >
                          {shifts.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
