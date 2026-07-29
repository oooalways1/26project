import React, { useState, useEffect } from 'react';
import { fetchSubmissions } from '../services/api';
import {
  History,
  CheckCircle2,
  XCircle,
  BarChart2,
  BookOpen,
  Filter,
  Calendar,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function HistoryDashboard({ student }) {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'wrong' | 'correct'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student && student.id) {
      loadHistory();
    }
  }, [student]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchSubmissions(student.id);
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = submissions.filter((sub) => {
    if (filter === 'wrong') return !sub.isCorrect;
    if (filter === 'correct') return sub.isCorrect;
    return true;
  });

  const total = submissions.length;
  const correctCount = submissions.filter((s) => s.isCorrect).length;
  const wrongCount = total - correctCount;
  const accuracyRate = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 통계 요약 카드 3종 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">전체 제출 문제</div>
            <div className="text-2xl font-black text-white mt-0.5">{total} <span className="text-sm font-normal text-slate-500">개</span></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">평균 정답률</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{accuracyRate}% <span className="text-xs font-normal text-slate-400">({correctCount}개 맞춤)</span></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">복습 필요 (오답노트)</div>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{wrongCount} <span className="text-sm font-normal text-slate-500">개</span></div>
          </div>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <span>학습 이력 및 오답 보완 히스토리</span>
        </h3>
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            전체 ({total})
          </button>
          <button
            onClick={() => setFilter('wrong')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'wrong' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            오답만 보기 ({wrongCount})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            정답 ({correctCount})
          </button>
        </div>
      </div>

      {/* 제출 이력 목록 */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">이력을 불러오는 중...</div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
          제출된 기록이 없습니다. 문제를 정성껏 풀어 백엔드 AI 피드백을 받아보세요!
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition bg-slate-900/90 ${
                item.isCorrect ? 'border-slate-800 hover:border-emerald-500/50' : 'border-rose-500/30 hover:border-rose-500/70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      item.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {item.isCorrect ? 'O' : 'X'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400">[{item.category}]</span>
                      <span className="text-xs text-slate-400">{item.grade}학년</span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-0.5">{item.problemTitle}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span
                    className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                      item.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {item.score}점
                  </span>
                </div>
              </div>

              {/* 풀이 내용 및 AI 총평 */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    제출한 풀이 내용 ({item.submissionType === 'canvas' ? '손글씨 캔버스' : '텍스트 수식'})
                  </div>
                  {item.canvasImage ? (
                    <img src={item.canvasImage} alt="손글씨 풀이" className="max-h-24 object-contain rounded border border-slate-800" />
                  ) : (
                    <p className="text-slate-300 font-mono whitespace-pre-wrap">{item.userSolutionText || '풀이 미작성'}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                    AI 피드백 요약
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.feedback}</p>
                  {item.errorConcept && (
                    <div className="mt-1.5 text-rose-400 font-medium">⚠️ 주의: {item.errorConcept}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
