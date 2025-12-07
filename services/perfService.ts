
import { PerformanceCycle, Objective, ReviewSession, ReviewAnswer, KeyResult } from '../types';
import { MOCK_PERF_CYCLE, MOCK_OBJECTIVES, MOCK_REVIEW_SESSIONS } from './mockPerfData';
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_WEEKLY_REPORTS } from './mockProjectData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const perfService = {
  
  getActiveCycle: async (): Promise<PerformanceCycle> => {
    await delay(300);
    return MOCK_PERF_CYCLE;
  },

  getObjectives: async (userId: string, cycleId: string): Promise<Objective[]> => {
    await delay(400);
    return MOCK_OBJECTIVES.filter(o => o.user_id === userId && o.cycle_id === cycleId);
  },

  // FUNC_PERF_01: Create/Update OKR
  saveObjective: async (obj: Objective): Promise<Objective> => {
    await delay(500);
    // Validation: Weight check logic would go here
    const existingIdx = MOCK_OBJECTIVES.findIndex(o => o.id === obj.id);
    
    // Recalculate progress based on KRs
    if (obj.key_results.length > 0) {
        const totalProgress = obj.key_results.reduce((acc, kr) => {
            const range = Math.abs(kr.target_val - kr.start_val);
            const done = Math.abs(kr.current_val - kr.start_val);
            const percent = range === 0 ? 0 : Math.min(100, Math.round((done / range) * 100));
            return acc + percent;
        }, 0);
        obj.progress = Math.round(totalProgress / obj.key_results.length);
    }

    if (existingIdx >= 0) {
        MOCK_OBJECTIVES[existingIdx] = obj;
    } else {
        MOCK_OBJECTIVES.push(obj);
    }
    return obj;
  },

  // FUNC_PERF_02: Auto-Sync
  syncKeyResultProgress: async (krId: string): Promise<{updated: boolean, newVal: number}> => {
    await delay(800);
    // Find the KR
    let targetKR: KeyResult | null = null;
    let targetObj: Objective | null = null;

    for (const obj of MOCK_OBJECTIVES) {
        const kr = obj.key_results.find(k => k.id === krId);
        if (kr) {
            targetKR = kr;
            targetObj = obj;
            break;
        }
    }

    if (!targetKR || !targetKR.linked_project_id || !targetObj) {
        throw new Error("Link not found");
    }

    // Fetch Project Data
    const project = MOCK_PROJECTS.find(p => p.id === targetKR!.linked_project_id);
    if (!project) throw new Error("Project not found");

    // Logic: Use project progress % as KR value
    // (Or could calculate based on Tasks done/total)
    const newVal = project.progress;
    
    targetKR.current_val = newVal;
    
    // Trigger Objective Recalc
    await perfService.saveObjective(targetObj);

    return { updated: true, newVal };
  },

  // FUNC_PERF_03: Reviews
  getReviewSessions: async (reviewerId: string, cycleId: string): Promise<ReviewSession[]> => {
    await delay(400);
    return MOCK_REVIEW_SESSIONS.filter(s => s.reviewer_user_id === reviewerId && s.cycle_id === cycleId);
  },

  submitReview: async (sessionId: string, answers: ReviewAnswer[]): Promise<void> => {
    await delay(600);
    const session = MOCK_REVIEW_SESSIONS.find(s => s.id === sessionId);
    if (session) {
        session.answers = answers;
        session.status = 'SUBMITTED';
        // Simple Average Score Calc
        const total = answers.reduce((acc, a) => acc + a.rating, 0);
        session.score = parseFloat((total / answers.length).toFixed(1));
    }
  },

  // FUNC_PERF_04: AI Writer
  generateAIReview: async (targetUserId: string, cycleId: string): Promise<string> => {
    await delay(2000); // Simulate generation
    
    // 1. Context Gathering (Mock)
    const userTasks = MOCK_TASKS.filter(t => t.assignee_id === targetUserId && t.status === 'Done');
    const totalTasks = userTasks.length;
    const taskTitles = userTasks.map(t => `「${t.title}」`).join('、');
    
    // 2. Prompt Simulation
    if (totalTasks === 0) {
        return "該員工在此週期內系統紀錄的完成任務較少，建議補充線下工作產出。";
    }

    return `基於系統數據分析，該員工在 ${cycleId} 週期表現優異：
    
1. **專案執行力**：共完成了 ${totalTasks} 項任務，包括 ${taskTitles.slice(0, 30)}...等關鍵工作。
2. **協作表現**：在專案討論中回應迅速，且多次準時交付成果。
3. **改進建議**：建議未來可挑戰更高複雜度的架構設計任務，並加強跨部門溝通的主動性。`;
  }
};
