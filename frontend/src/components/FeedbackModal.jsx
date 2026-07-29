import React from 'react';
import { CheckCircle2, XCircle, Award, Sparkles, RefreshCw, BookOpen, AlertTriangle } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, evaluation }) {
  if (!isOpen || !evaluation) return null;

  const isCorrect = evaluation.isCorrect;
  const score = evaluation.score ?? (isCorrect ? 100 : 30);
  const steps = evaluation.stepAnalysis || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
        {/* 상단 결과 배너 */}
        <div className={`p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isCorrect
            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30'
            : 'bg-gradient-to-r from-rose-500/20 to-pink-500/10 border border-rose-500/30'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
              isCorrect ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                  isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {isCorrect ? '🎉 정답입니다!' : '👏 아쉬워요! 풀이 검토가 필요합니다'}
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {isCorrect ? '완벽한 풀이 과정입니다!' : '풀이 과정을 다시 한번 점검해 볼까요?'}
              </h3>
            </div>
          </div>

          <div className="text-center sm:text-right bg-slate-950/60 px-4 py-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI 평가 점수</div>
            <div className={`text-3xl font-black ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {score} <span class="text-sm font-normal text-slate-500">점</span>
            </div>
          </div>
        </div>

        {/* 엔진 사용 뱃지 및 API 상태 */}
        <div className="flex items-center justify-between text-xs px-2 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>채점 엔진: </span>
            <span className="font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
              {evaluation.engineUsed || 'Gemini AI'}
            </span>
          </div>
          {evaluation.createdAt && (
            <span className="text-[11px] text-slate-500">
              {new Date(evaluation.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* 단계별 풀이 과정 분석 */}
        {steps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" /> AI 단계별 풀이과정 정밀 디버깅
            </h4>
            <div className="space-y-2">
              {steps.map((st, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    st.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {st.step || idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{st.text}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {st.status === 'pass' ? '통과' : '검토필요'}
                      </span>
                    </div>
                    {st.note && <p className="text-xs text-slate-400">{st.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 칭찬 & 피드백 가이드 */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Award className="w-4 h-4" /> AI 튜터의 따뜻한 한마디
            </h5>
            <p className="text-sm font-semibold text-white">{evaluation.praise || '최선을 다해 문제를 풀었군요!'}</p>
          </div>
          {evaluation.feedback && (
            <div className="pt-2 border-t border-slate-900">
              <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">피드백 & 해설 가이드</h5>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{evaluation.feedback}</p>
            </div>
          )}
        </div>

        {/* 하단 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition"
        >
          확인했습니다 ➔
        </button>
      </div>
    </div>
  );
}
