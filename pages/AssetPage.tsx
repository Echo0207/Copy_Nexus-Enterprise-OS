
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Asset } from '../types';
import { assetService } from '../services/assetService';
import { MOCK_USERS } from '../services/mockData';
import { AssetList } from '../components/asset/AssetList';
import { AssignmentModal } from '../components/asset/AssignmentModal';
import { VisualAuditModal } from '../components/asset/VisualAuditModal';
import { LayoutDashboard, ScanLine, Calculator, Loader2 } from 'lucide-react';

export const AssetPage: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState<'ASSIGN' | 'RETURN'>('ASSIGN');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessingDepreciation, setIsProcessingDepreciation] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await assetService.getAssets();
    setAssets(data);
    setLoading(false);
  };

  const openAssign = (asset: Asset) => {
      setSelectedAsset(asset);
      setAssignType('ASSIGN');
      setShowAssignModal(true);
  };

  const openReturn = (asset: Asset) => {
      setSelectedAsset(asset);
      setAssignType('RETURN');
      setShowAssignModal(true);
  };

  const handleAssignmentSubmit = async (data: any) => {
      if (!selectedAsset || !user) return;
      
      if (assignType === 'ASSIGN') {
          await assetService.assignAsset(selectedAsset.id, data.userId, data.expectedReturn, user.id);
      } else {
          await assetService.returnAsset(selectedAsset.id, data.condition);
      }
      await loadData();
  };

  const handleDepreciation = async () => {
      if (!confirm('確定要執行本月資產折舊計算嗎？將會產生財務分錄。')) return;
      setIsProcessingDepreciation(true);
      try {
          const msg = await assetService.runDepreciation();
          alert(msg);
          await loadData();
      } catch (e) {
          alert('計算失敗');
      } finally {
          setIsProcessingDepreciation(false);
      }
  };

  if (!user) return null;
  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="h-full flex flex-col space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <LayoutDashboard className="text-orange-600" /> 資產管理中心
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    庫存總值: NT$ {new Intl.NumberFormat('zh-TW').format(assets.reduce((sum, a) => sum + a.current_value, 0))}
                </p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleDepreciation}
                    disabled={isProcessingDepreciation}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
                >
                    {isProcessingDepreciation ? <Loader2 className="animate-spin" size={16}/> : <Calculator size={16} />} 
                    執行折舊
                </button>
                <button 
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-md"
                >
                    <ScanLine size={16} /> AI 視覺盤點
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden">
            <AssetList 
                assets={assets} 
                users={MOCK_USERS} 
                onAssignClick={openAssign}
                onReturnClick={openReturn}
            />
        </div>

        <AssignmentModal 
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            type={assignType}
            asset={selectedAsset}
            users={MOCK_USERS}
            onSubmit={handleAssignmentSubmit}
        />

        <VisualAuditModal 
            isOpen={showScanner}
            onClose={() => setShowScanner(false)}
        />
    </div>
  );
};
