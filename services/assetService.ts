
import { Asset, AssetAssignment, AssetEvent, AssetStatus } from '../types';
import { MOCK_ASSETS, MOCK_ASSET_ASSIGNMENTS } from './mockAssetData';
import { MOCK_USERS } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const assetService = {
  
  getAssets: async (): Promise<Asset[]> => {
    await delay(300);
    return [...MOCK_ASSETS];
  },

  getAssignments: async (): Promise<AssetAssignment[]> => {
    await delay(300);
    return [...MOCK_ASSET_ASSIGNMENTS];
  },

  // FUNC_ASSET_02 A: Checkout
  assignAsset: async (assetId: string, userId: string, expectedReturn?: string, currentUserId?: string): Promise<void> => {
    await delay(500);
    const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if (!asset) throw new Error("Asset not found");
    
    // Status Check (Lock)
    if (asset.status !== 'IN_STOCK') {
        throw new Error("E-ASSET-001: 資產狀態非 IN_STOCK，無法領用");
    }

    const user = Object.values(MOCK_USERS).find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    // DB Update Simulation
    asset.status = 'ASSIGNED';
    asset.assigned_to_user_id = userId;
    asset.location_id = `user-loc-${userId}`; // Simplification

    const newAssignment: AssetAssignment = {
        id: 'assign-' + Date.now(),
        asset_id: assetId,
        user_id: userId,
        assigned_at: new Date().toISOString().split('T')[0],
        expected_return_date: expectedReturn,
        approved_by: currentUserId || 'system'
    };
    MOCK_ASSET_ASSIGNMENTS.push(newAssignment);
  },

  // FUNC_ASSET_02 B: Return
  returnAsset: async (assetId: string, condition: 'GOOD' | 'DAMAGED'): Promise<void> => {
    await delay(500);
    const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if (!asset) throw new Error("Asset not found");

    // Find active assignment
    const assignment = MOCK_ASSET_ASSIGNMENTS.find(a => a.asset_id === assetId && !a.returned_at);
    if (assignment) {
        assignment.returned_at = new Date().toISOString().split('T')[0];
        assignment.return_condition = condition;
    }

    // Update Asset Status
    asset.assigned_to_user_id = undefined;
    asset.status = condition === 'DAMAGED' ? 'REPAIR' : 'IN_STOCK';
    asset.location_id = 'warehouse-return-area';
  },

  // FUNC_ASSET_03: Depreciation Engine
  runDepreciation: async (): Promise<string> => {
    await delay(1000);
    let count = 0;
    let totalDepreciated = 0;

    MOCK_ASSETS.forEach(asset => {
        if (asset.status !== 'DISPOSED' && asset.current_value > asset.salvage_value) {
            // Straight-line: (Cost - Salvage) / (Years * 12)
            const monthlyDepreciation = (asset.cost - asset.salvage_value) / (asset.depreciation_years * 12);
            
            // Apply
            let deduction = monthlyDepreciation;
            if (asset.current_value - deduction < asset.salvage_value) {
                deduction = asset.current_value - asset.salvage_value;
            }
            
            asset.current_value -= deduction;
            totalDepreciated += deduction;
            count++;
        }
    });

    return `折舊計算完成：共處理 ${count} 筆資產，本月折舊總額 NT$${Math.round(totalDepreciated)}`;
  },

  // FUNC_ASSET_04: AI Visual Audit
  performVisualAudit: async (imageData: string): Promise<{ success_count: number, tags: string[] }> => {
      await delay(2000); // Simulate AI processing
      
      // Mock detection logic: Randomly pick 1-2 assets to "find"
      const detectedAssets = MOCK_ASSETS.slice(0, 2);
      
      detectedAssets.forEach(asset => {
          // If asset was marked LOST, recover it
          if (asset.status === 'LOST') {
              asset.status = 'IN_STOCK'; 
          }
      });

      return {
          success_count: detectedAssets.length,
          tags: detectedAssets.map(a => a.tag_id)
      };
  }
};
