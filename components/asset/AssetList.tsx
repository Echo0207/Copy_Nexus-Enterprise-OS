
import React, { useState } from 'react';
import { Asset, AssetAssignment, User } from '../../types';
import { Search, Filter, Monitor, Box, Key, AlertCircle, User as UserIcon, Calendar, DollarSign, RefreshCw, MoreHorizontal } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  users: Record<string, User>;
  onAssignClick: (asset: Asset) => void;
  onReturnClick: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, users, onAssignClick, onReturnClick }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter(asset => {
      const matchType = filterType === 'all' || asset.type === filterType;
      const matchSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.tag_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
  });

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'IN_STOCK': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">庫存中</span>;
          case 'ASSIGNED': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">已領用</span>;
          case 'REPAIR': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">維修中</span>;
          case 'LOST': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">遺失</span>;
          default: return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">{status}</span>;
      }
  };

  const getTypeIcon = (type: string) => {
      switch(type) {
          case 'HARDWARE': return <Monitor size={18} className="text-slate-600"/>;
          case 'SOFTWARE': return <Box size={18} className="text-blue-600"/>;
          case 'LICENSE': return <Key size={18} className="text-purple-600"/>;
          default: return <Box size={18}/>;
      }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="搜尋資產編號或名稱..." 
                        className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 p-2 outline-none"
                    >
                        <option value="all">所有類型</option>
                        <option value="HARDWARE">硬體 (Hardware)</option>
                        <option value="LICENSE">授權 (License)</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                        <th className="px-6 py-3">資產編號 (Tag ID)</th>
                        <th className="px-6 py-3">名稱</th>
                        <th className="px-6 py-3">狀態</th>
                        <th className="px-6 py-3">保管人</th>
                        <th className="px-6 py-3 text-right">現值 (NTD)</th>
                        <th className="px-6 py-3 text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredAssets.map(asset => {
                        const assignee = asset.assigned_to_user_id ? users[asset.assigned_to_user_id] : null;
                        
                        return (
                            <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-600 font-medium">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(asset.type)}
                                        {asset.tag_id}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{asset.name}</div>
                                    <div className="text-xs text-slate-400">{asset.location_id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(asset.status)}
                                </td>
                                <td className="px-6 py-4">
                                    {assignee ? (
                                        <div className="flex items-center gap-2">
                                            <img src={assignee.avatar} className="w-6 h-6 rounded-full border border-slate-200" />
                                            <span className="text-slate-700">{assignee.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-slate-600">
                                    {new Intl.NumberFormat('zh-TW').format(asset.current_value)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {asset.status === 'IN_STOCK' && (
                                        <button 
                                            onClick={() => onAssignClick(asset)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
                                        >
                                            領用
                                        </button>
                                    )}
                                    {asset.status === 'ASSIGNED' && (
                                        <button 
                                            onClick={() => onReturnClick(asset)}
                                            className="text-orange-600 hover:text-orange-800 text-xs font-bold bg-orange-50 px-3 py-1.5 rounded hover:bg-orange-100 transition-colors"
                                        >
                                            歸還
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};
