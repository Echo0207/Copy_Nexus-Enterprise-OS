
import { Asset, AssetAssignment } from '../types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'asset-001',
    tag_id: 'AS-2025-001',
    name: 'MacBook Pro 16" (M3 Max)',
    type: 'HARDWARE',
    status: 'ASSIGNED',
    location_id: 'room-101',
    purchase_date: '2025-01-01',
    cost: 120000,
    salvage_value: 10000,
    depreciation_years: 3,
    current_value: 110000,
    assigned_to_user_id: 'uuid-002' // Bob
  },
  {
    id: 'asset-002',
    tag_id: 'AS-2025-002',
    name: 'Dell UltraSharp 27" 4K',
    type: 'HARDWARE',
    status: 'IN_STOCK',
    location_id: 'room-store-a',
    purchase_date: '2025-01-15',
    cost: 20000,
    salvage_value: 2000,
    depreciation_years: 3,
    current_value: 19500
  },
  {
    id: 'asset-003',
    tag_id: 'SW-2025-001',
    name: 'JetBrains All Products Pack',
    type: 'LICENSE',
    status: 'ASSIGNED',
    location_id: 'digital',
    purchase_date: '2025-02-01',
    cost: 8000,
    salvage_value: 0,
    depreciation_years: 1,
    current_value: 7500,
    assigned_to_user_id: 'uuid-002' // Bob
  }
];

export const MOCK_ASSET_ASSIGNMENTS: AssetAssignment[] = [
  {
    id: 'assign-001',
    asset_id: 'asset-001',
    user_id: 'uuid-002', // Bob
    assigned_at: '2025-01-05',
    expected_return_date: '2027-01-05',
    approved_by: 'uuid-001' // Alice
  },
  {
    id: 'assign-002',
    asset_id: 'asset-003',
    user_id: 'uuid-002',
    assigned_at: '2025-02-01',
    approved_by: 'uuid-000' // Admin
  }
];
