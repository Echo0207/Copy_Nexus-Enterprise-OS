
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { perfService } from '../services/perfService';
import { PerformanceCycle, Objective } from '../types';
import { OKRManager } from '../components/perf/OKRManager';
import { ReviewCenter } from '../components/perf/ReviewCenter';
import { Target, Award, ListChecks, Loader2 } from 'lucide-react';

type Tab = 'okr' | 'review';

export const PerformancePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('okr');
  const [cycle, setCycle] = useState<PerformanceCycle | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const c = await perfService.getActiveCycle();
        const objs = await perfService.getObjectives(user.id, c.id);
        setCycle(c);
        setObjectives(objs);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!user || !cycle) return <div>Load Error</div>;

  return (
    <div className="h-full flex flex-col">
        {/* Header Tabs */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-1 mb-6">
            <div className="flex space-x-1">
                <button 
                    onClick={() => setActiveTab('okr')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === 'okr' ? 'bg-white text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                    <Target size={18} /> 目標管理 (OKR)
                </button>
                <button 
                    onClick={() => setActiveTab('review')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === 'review' ? 'bg-white text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                >
                    <Award size={18} /> 績效評核 (Review)
                </button>
            </div>
            <div className="text-xs text-slate-500 pb-2">
                當前週期：<span className="font-bold text-slate-700">{cycle.title}</span> ({cycle.status})
            </div>
        </div>

        <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
            {activeTab === 'okr' && (
                <OKRManager cycle={cycle} objectives={objectives} onRefresh={loadData} />
            )}
            
            {activeTab === 'review' && (
                <ReviewCenter userId={user.id} cycleId={cycle.id} />
            )}
        </div>
    </div>
  );
};
