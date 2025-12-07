
import React, { useState } from 'react';
import { Objective, KeyResult, PerformanceCycle } from '../../types';
import { perfService } from '../../services/perfService';
import { Target, RefreshCw, Plus, ChevronDown, ChevronRight, BarChart2, Link } from 'lucide-react';

interface OKRManagerProps {
  cycle: PerformanceCycle;
  objectives: Objective[];
  onRefresh: () => void;
}

export const OKRManager: React.FC<OKRManagerProps> = ({ cycle, objectives, onRefresh }) => {
  const [expandedObjs, setExpandedObjs] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedObjs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSync = async (krId: string) => {
    setIsSyncing(krId);
    try {
        await perfService.syncKeyResultProgress(krId);
        onRefresh();
    } catch (e) {
        console.error(e);
        alert('同步失敗，請檢查專案連結設定');
    } finally {
        setIsSyncing(null);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Target className="text-red-500" /> 我的目標 (My OKRs)
            </h2>
            <div className="text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                考核週期: <span className="font-bold text-slate-800">{cycle.title}</span>
            </div>
        </div>

        <div className="grid gap-4">
            {objectives.map(obj => (
                <div key={obj.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Objective Header */}
                    <div 
                        className="p-4 flex items-center gap-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => toggleExpand(obj.id)}
                    >
                        <button className="text-slate-400">
                            {expandedObjs[obj.id] ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                        </button>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-slate-800 text-lg">{obj.title}</h3>
                                <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    權重 {obj.weight}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-1000 ${
                                        obj.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                    }`} 
                                    style={{ width: `${obj.progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="font-bold text-2xl text-slate-700 min-w-[3rem] text-right">
                            {obj.progress}%
                        </div>
                    </div>

                    {/* Key Results List */}
                    {expandedObjs[obj.id] && (
                        <div className="p-4 space-y-4 border-t border-slate-100 bg-white animate-fade-in">
                            {obj.key_results.map(kr => (
                                <div key={kr.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <BarChart2 size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-slate-700">{kr.title}</span>
                                            {kr.linked_project_id && (
                                                <span className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                                    <Link size={10} /> Auto-Sync
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span>Start: {kr.start_val}</span>
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-500" 
                                                    style={{ width: `${Math.min(100, Math.max(0, ((kr.current_val - kr.start_val) / (kr.target_val - kr.start_val)) * 100))}%` }}
                                                ></div>
                                            </div>
                                            <span>Target: {kr.target_val} {kr.metric_type === 'PERCENTAGE' ? '%' : ''}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="font-mono font-bold text-lg text-slate-700">
                                            {kr.current_val}
                                        </div>
                                        {kr.linked_project_id && (
                                            <button 
                                                onClick={() => handleSync(kr.id)}
                                                disabled={isSyncing === kr.id}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                                                title="從專案同步進度"
                                            >
                                                <RefreshCw size={16} className={isSyncing === kr.id ? 'animate-spin' : ''} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors flex justify-center items-center gap-2 text-sm font-medium">
                                <Plus size={16} /> 新增關鍵結果 (KR)
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm">
            <Plus size={16} /> 設定新目標 (Objective)
        </button>
    </div>
  );
};
