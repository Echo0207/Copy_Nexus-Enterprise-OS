
import React, { useState } from 'react';
import { Camera, RefreshCw, CheckCircle, X } from 'lucide-react';
import { assetService } from '../../services/assetService';

interface VisualAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisualAuditModal: React.FC<VisualAuditModalProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{count: number, tags: string[]} | null>(null);

  if (!isOpen) return null;

  const handleScan = async () => {
      setIsScanning(true);
      try {
          // Simulate taking a photo and sending to backend
          const res = await assetService.performVisualAudit('mock-base64-image');
          setResult({ count: res.success_count, tags: res.tags });
      } catch (e) {
          alert("掃描失敗");
      } finally {
          setIsScanning(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[80] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-black rounded-2xl overflow-hidden relative border border-slate-700 shadow-2xl">
            {/* Camera Viewfinder Simulation */}
            <div className="aspect-[3/4] bg-slate-800 relative flex items-center justify-center">
                {!result ? (
                    <>
                        <Camera className="text-slate-600 w-24 h-24 opacity-50" />
                        <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-xl flex items-center justify-center">
                            <div className="w-full h-0.5 bg-red-500/50 absolute top-1/2 animate-pulse"></div>
                        </div>
                        <p className="absolute bottom-8 text-white/80 text-sm bg-black/50 px-4 py-1 rounded-full">
                            將資產 QR Code 置於框內
                        </p>
                    </>
                ) : (
                    <div className="bg-green-500/10 absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm">
                        <CheckCircle size={64} className="text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">盤點成功</h3>
                        <p className="text-green-300">已識別 {result.count} 項資產</p>
                        <div className="mt-4 space-y-1">
                            {result.tags.map(tag => (
                                <div key={tag} className="bg-black/50 text-white px-3 py-1 rounded font-mono text-xs">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-slate-900 p-6 flex justify-between items-center">
                <button 
                    onClick={onClose}
                    className="p-3 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"
                >
                    <X size={24} />
                </button>
                
                {!result ? (
                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/10 hover:bg-white/30 transition-all active:scale-95"
                    >
                        {isScanning && <RefreshCw className="animate-spin text-white" />}
                    </button>
                ) : (
                    <button 
                        onClick={() => setResult(null)}
                        className="px-6 py-3 bg-blue-600 rounded-full text-white font-bold hover:bg-blue-700 transition-colors"
                    >
                        繼續掃描
                    </button>
                )}

                <div className="w-12"></div> {/* Spacer */}
            </div>
        </div>
    </div>
  );
};
