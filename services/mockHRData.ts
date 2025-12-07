
import { WorkShift, RosterEntry, AttendanceRecord } from '../types';

export const MOCK_SHIFTS: WorkShift[] = [
  { id: 'shift-d', name: '常日班', code: 'D', start_time: '09:00', end_time: '18:00', color: '#3b82f6' }, // Blue
  { id: 'shift-n', name: '大夜班', code: 'N', start_time: '23:00', end_time: '08:00', color: '#8b5cf6' }, // Purple
  { id: 'shift-off', name: '休假', code: 'OFF', start_time: '', end_time: '', color: '#e2e8f0' } // Slate
];

// Generate Roster for current month for all mock users
const generateMockRoster = () => {
  const roster: RosterEntry[] = [];
  const users = ['uuid-001', 'uuid-002'];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  users.forEach(userId => {
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(dateStr).getDay();
      
      let shiftId = 'shift-d';
      if (dayOfWeek === 0 || dayOfWeek === 6) shiftId = 'shift-off'; // Weekend

      roster.push({
        id: `ros-${userId}-${dateStr}`,
        date: dateStr,
        user_id: userId,
        shift_id: shiftId,
        is_locked: d < today.getDate() // Lock past dates
      });
    }
  });
  return roster;
};

export const MOCK_ROSTER: RosterEntry[] = generateMockRoster();

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  // Sample data for yesterday
  {
    id: 'att-001',
    user_id: 'uuid-002', // Bob
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    check_in: new Date(Date.now() - 86400000).toISOString().split('T')[0] + 'T08:55:00',
    check_out: new Date(Date.now() - 86400000).toISOString().split('T')[0] + 'T18:05:00',
    status: 'NORMAL',
    work_hours: 9
  }
];
