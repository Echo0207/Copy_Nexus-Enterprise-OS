
import React, { useState, useEffect } from 'react';
import { ReviewSession, ReviewAnswer } from '../../types';
import { perfService } from '../../services/perfService';
import { Sparkles, Save, Send, User, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { MOCK_USERS } from '../../services/mockData';

interface ReviewCenterProps {
  userId: string;
  cycleId: string;
}

export const ReviewCenter: React.FC<ReviewCenterProps> = ({ userId, cycleId }) => {
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Form State
  const [answers, setAnswers] = useState<ReviewAnswer[]>([]);
  const [activeComment, setActiveComment] = useState('');

  useEffect(() => {
    perfService.getReviewSessions(userId, cycleId).then(setSessions);
  }, [userId, cycleId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const targetUser = activeSession ? Object.values(MOCK_USERS).find(u => u.id === activeSession.target_user_id) : null;

  const handleStartReview = (session: ReviewSession) => {
      setActiveSessionId(session.id);
      // Mock questions init
      setAnswers([
          { id: 'q1', question_text: '整體工作表現與產出品質', rating: 0, comment: '' },
          { id: 'q2', question_text: '團隊合作與溝通能力', rating: 0, comment: '' },
          { id: 'q3', question_text: '問題解決與創新能力', rating: 0, comment: '' },
      ]);
  };

  const handleRatingChange = (idx: number, rating: number) => {
      const newAns = [...answers];
      newAns[idx].rating = rating;
      setAnswers(newAns);
  };

  const handleAIHelp = async () => {
      if (!activeSession) return;
      setIsGeneratingAI(true);
      try {
          const draft = await perfService.generateAIReview(activeSession.target_user_id, activeSession.cycle_id);
          setActiveComment(draft);
      } catch (e) {
          alert("AI 生成失敗");
      } finally {
          setIsGeneratingAI(false);
      }
  };

  const handleSubmit = async () => {
      if (!activeSession) return;
      // Merge active comment into answers (Mock: put it in the first question for simplicity)
      const finalAnswers = [...answers];
      finalAnswers[0].comment = activeComment; 
      
      await perfService.submitReview(activeSession.id, finalAnswers);
      setActiveSessionId(null);
      
      // Refresh list
      perfService.getReviewSessions(userId, cycleId).then(setSessions);
  };

  if (activeSession) {
      return (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in max-w-4xl mx-auto">
              {/* Review Header */}
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <img src={targetUser?.avatar} className="w-12 h-12 rounded-full border-2 border-white/20" />
                      <div>
                          <h3 className="text-xl font-bold">{targetUser?.name}</h3>
                          <p className="text-blue-200 text-sm">
                              {activeSession.type === 'SELF' ? '自評 (Self Review)' : activeSession.type === 'MANAGER' ? '主管評核 (Manager Review)' : '同儕互評 (Peer Review)'}
                          </p>
                      </div>
                  </div>
                  <button onClick={() => setActiveSessionId(null)} className="text-slate-400 hover:text-white">取消</button>
              </div>

              <div className="p-8">
                  {answers.map((q, idx) => (
                      <div key={q.id} className="mb-8 border-b border-slate-100 pb-6 last:border-0">
                          <p className="font-bold text-slate-800 mb-4 text-lg">{idx + 1}. {q.question_text}</p>
                          <div className="flex gap-2 mb-4">
                              {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    onClick={() => handleRatingChange(idx, star)}
                                    className={`w-10 h-10 rounded-full font-bold text-lg transition-all ${
                                        q.rating >= star 
                                        ? 'bg-blue-600 text-white shadow-md scale-110' 
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                                  >
                                      {star}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ))}

                  <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                          <label className="font-bold text-slate-700">綜合評語 (Comments)</label>
                          <button 
                            onClick={handleAIHelp}
                            disabled={isGeneratingAI}
                            className="text-purple-600 text-sm font-bold flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50"
                          >
                              {isGeneratingAI ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />}
                              AI 評語助手
                          </button>
                      </div>
                      <textarea 
                        className="w-full border border-slate-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                        rows={6}
                        placeholder="請輸入具體的優點與改進建議..."
                        value={activeComment}
                        onChange={(e) => setActiveComment(e.target.value)}
                      ></textarea>
                  </div>

                  <div className="flex justify-end pt-4">
                      <button 
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1"
                      >
                          <Send size={18} /> 提交評核
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(session => {
            const target = Object.values(MOCK_USERS).find(u => u.id === session.target_user_id);
            const isCompleted = session.status === 'SUBMITTED';

            return (
                <div key={session.id} className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${isCompleted ? 'border-slate-200 opacity-70' : 'border-blue-100 hover:shadow-md hover:border-blue-300'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            session.type === 'SELF' ? 'bg-indigo-100 text-indigo-700' :
                            session.type === 'MANAGER' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'
                        }`}>
                            {session.type}
                        </span>
                        {isCompleted && <CheckCircle size={18} className="text-green-500" />}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <img src={target?.avatar} className="w-12 h-12 rounded-full border border-slate-200" />
                        <div>
                            <div className="font-bold text-slate-800">{target?.name}</div>
                            <div className="text-xs text-slate-500">{target?.department.name}</div>
                        </div>
                    </div>

                    <button 
                        disabled={isCompleted}
                        onClick={() => handleStartReview(session)}
                        className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                            isCompleted 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                    >
                        {isCompleted ? '已完成' : <>開始評核 <ChevronRight size={14}/></>}
                    </button>
                </div>
            );
        })}
        {sessions.length === 0 && (
            <div className="col-span-3 text-center py-10 text-slate-400">
                目前沒有待辦的評核事項
            </div>
        )}
    </div>
  );
};
