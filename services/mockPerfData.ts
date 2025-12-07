
import { PerformanceCycle, Objective, ReviewSession } from '../types';

export const MOCK_PERF_CYCLE: PerformanceCycle = {
  id: 'cycle-2025-q1',
  title: '2025 Q1 績效考核',
  start_date: '2025-01-01',
  end_date: '2025-03-31',
  status: 'OPEN' // Change to REVIEWING to test reviews
};

export const MOCK_OBJECTIVES: Objective[] = [
  // Alice's OKRs
  {
    id: 'obj-1',
    user_id: 'uuid-001', // Alice
    cycle_id: 'cycle-2025-q1',
    title: '提升 HR 流程自動化程度',
    weight: 40,
    progress: 30,
    key_results: [
      { id: 'kr-1-1', objective_id: 'obj-1', title: '導入新版 HRM 系統並完成 3 個模組上線', metric_type: 'PERCENTAGE', start_val: 0, target_val: 100, current_val: 30, linked_project_id: 'proj-001' },
      { id: 'kr-1-2', objective_id: 'obj-1', title: '員工滿意度提升至 4.5 分', metric_type: 'NUMBER', start_val: 3.8, target_val: 4.5, current_val: 4.0 }
    ]
  },
  {
    id: 'obj-2',
    user_id: 'uuid-001',
    cycle_id: 'cycle-2025-q1',
    title: '優化人才招募漏斗',
    weight: 30,
    progress: 50,
    key_results: [
      { id: 'kr-2-1', objective_id: 'obj-2', title: '縮短平均面試流程至 14 天', metric_type: 'NUMBER', start_val: 21, target_val: 14, current_val: 18 }
    ]
  },
  // Bob's OKRs
  {
    id: 'obj-3',
    user_id: 'uuid-002', // Bob
    cycle_id: 'cycle-2025-q1',
    title: '強化系統穩定性與效能',
    weight: 50,
    progress: 70,
    key_results: [
      { id: 'kr-3-1', objective_id: 'obj-3', title: 'API 回應時間 < 100ms', metric_type: 'NUMBER', start_val: 250, target_val: 100, current_val: 150 },
      { id: 'kr-3-2', objective_id: 'obj-3', title: '完成官網重構專案', metric_type: 'PERCENTAGE', start_val: 0, target_val: 100, current_val: 45, linked_project_id: 'proj-001' }
    ]
  }
];

export const MOCK_REVIEW_SESSIONS: ReviewSession[] = [
  // Alice evaluating Bob (Manager Review)
  {
    id: 'rev-001',
    cycle_id: 'cycle-2025-q1',
    target_user_id: 'uuid-002', // Bob
    reviewer_user_id: 'uuid-001', // Alice
    type: 'MANAGER',
    status: 'PENDING',
    answers: []
  },
  // Bob Self Review
  {
    id: 'rev-002',
    cycle_id: 'cycle-2025-q1',
    target_user_id: 'uuid-002',
    reviewer_user_id: 'uuid-002',
    type: 'SELF',
    status: 'PENDING',
    answers: []
  },
  // Alice Self Review
  {
    id: 'rev-003',
    cycle_id: 'cycle-2025-q1',
    target_user_id: 'uuid-001',
    reviewer_user_id: 'uuid-001',
    type: 'SELF',
    status: 'PENDING',
    answers: []
  }
];
