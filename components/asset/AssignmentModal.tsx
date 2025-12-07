
import React, { useState } from 'react';
import { Asset, User } from '../../types';
import { X, CheckCircle, User as UserIcon, Calendar, AlertTriangle } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ASSIGN' | 'RETURN';
  asset: Asset | null;
  users: Record<string, User>;
  onSubmit: (data: any) => Promise<void>;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, type, asset, users, onSubmit }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnCondition, setReturnCondition] = useState<'GOOD' | 'DAMAGED'>('GOOD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
          if (type === 'ASSIGN') {
              if (!selectedUser) return alert('請選擇保管人');
              await onSubmit({ userId: selectedUser, expectedReturn: returnDate });
          } else {
              await onSubmit({ condition: returnCondition });
          }
          onClose();
      } catch (e) {
          console.error(e);
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className={`${type === 'ASSIGN' ? 'bg-blue-600' : 'bg-orange-600'} text-white px-6 py-4 flex justify-between items-center`}>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    {type === 'ASSIGN' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {type === 'ASSIGN' ? '資產領用 (Check-out)' : '資產歸還 (Check-in)'}
                </h3>
                <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">資產資訊</p>
                    <p className="font-bold text-slate-800 text-lg">{asset.name}</p>
                    <p className="text-sm text-slate-500 font-mono mt-1">{asset.tag_id}</p>
                </div>

                {type === 'ASSIGN' && (
                    <>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">保管人</label>
                            <select 
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">請選擇員工...</option>
                                {Object.values(users).map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.department.name})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">預計歸還日 (選填)</label>
                            <input 
                                type="date" 
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </>
                )}

                {type === 'RETURN' && (
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">歸還狀態檢查</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-all ${returnCondition === 'GOOD' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" className="hidden" checked={returnCondition === 'GOOD'} onChange={() => setReturnCondition('GOOD')} />
                                <span className="font-bold block">良好 (Good)</span>
                                <span className="text-xs">功能正常，無損壞</span>
                            </label>
                            <label className={`border-2 rounded-lg p-4 cursor-pointer text-center transition-all ${returnCondition === 'DAMAGED' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" className="hidden" checked={returnCondition === 'DAMAGED'} onChange={() => setReturnCondition('DAMAGED')} />
                                <span className="font-bold block">損壞 (Damaged)</span>
                                <span className="text-xs">需維修或報廢</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium">取消</button>
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${type === 'ASSIGN' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                    {isSubmitting ? '處理中...' : '確認送出'}
                </button>
            </div>
        </div>
    </div>
  );
};
