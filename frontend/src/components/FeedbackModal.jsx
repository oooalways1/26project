import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  Check,
  X,
  Zap,
  Info
} from 'lucide-react';

export default function FeedbackModal({
  isOpen,
  isScanning,
  submission,
  onClose,
  onTryRecommended
}) {
  if (!isOpen) return null;

  useEffect(() => {
    if (!isScanning && submission && submission.isCorrect) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isScanning, submission]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">

        {/* 1. AI 스캐닝 로딩 스크린 */}
        {isScanning ? (
          <div className="p-12 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
            <div className="animate-scanline"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-white">Gemini AI 채점 엔진이 풀이 과정을 정밀 분석 중...</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                수식 도출 단계, 덧셈/뺄셈 계산 정확도, 문제 풀이 논리를 다각도로 검증하고 있습니다.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        ) : submission ? (
          /* 2. 채점 결과 & 피드백 리포트 */
          <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">

            {/* 사용 엔진 표시 배지 */}
            <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">채점 엔진 정보:</span>
              {(submission.engineUsed || '').includes('Gemini') ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Gemini 2.0 Flash AI 채점 완료
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Fallback Engine 채점 완료
                </span>
              )}
            </div>

            {/* Fallback으로 빠졌을 때 사유 알림 상자 */}
            {!(submission.engineUsed || '').includes('Gemini') && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>💡 Fallback 채점 엔진으로 수행된 이유:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {submission.apiErrorLog || '등록된 Gemini API Key가 구글 AI 스튜디오 규격과 달라 인증 예외가 발생했습니다. 서비스 중단을 막기 위해 기본 가이드 엔진으로 전환되었습니다.'}
                </p>
                <div className="text-[10px] text-amber-400 pt-1">
                  🔑 <strong>해결 방법</strong>: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold hover:text-white">aistudio.google.com</a>에서 무료 Gemini API Key(형식: AIzaSy...)를 발급받아 backend/.env 파일의 GEMINI_API_KEY= 에 적어주시면 즉시 Gemini AI로 전환됩니다!
                </div>
              </div>
            )}

            {/* 헤더 점수 카운트 */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    submission.isCorrect
                      ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
                      : 'bg-rose-500/20 border-2 border-rose-500 text-rose-400 shadow-rose-500/20'
                  }`}
                >
                  {submission.isCorrect ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        submission.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {submission.isCorrect ? '정답 완료 🎉' : '보완 필요 💡'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {submission.problemTitle} 채점 결과
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-white">{submission.score}</span>
                <span className="text-sm text-slate-400 font-bold"> / 100점</span>
              </div>
            </div>

            {/* 칭찬 및 동기부여 카드 */}
            {submission.praise && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-start gap-3">
                <Award className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">AI 튜터 칭찬 노트</h4>
                  <p className="text-sm font-medium text-slate-200 mt-1">{submission.praise}</p>
                </div>
              </div>
            )}

            {/* 풀이 단계별 디버깅 분석 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔍 단계별 풀이 분석 (Step-by-Step Breakdown)</span>
              </h4>
              <div className="space-y-2">
                {submission.stepAnalysis && submission.stepAnalysis.map((st, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                      st.status === 'pass'
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-rose-950/30 border-rose-500/30'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                        st.status === 'pass'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {st.status === 'pass' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          Step {st.step}. {st.text}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            st.status === 'pass'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          {st.status === 'pass' ? '통과' : '오류 점검'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{st.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 총평 피드백 */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                💡 AI 총평 및 종합 피드백
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">{submission.feedback}</p>
              {submission.errorConcept && (
                <div className="mt-2 text-xs font-semibold text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>점검 필요한 핵심 개념: {submission.errorConcept}</span>
                </div>
              )}
            </div>

            {/* AI 추천 연습 문제 */}
            {submission.recommendedProblem && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>추천 연습 문제</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {submission.recommendedProblem.title} ({submission.recommendedProblem.category})
                  </div>
                </div>
                <button
                  onClick={() => onTryRecommended(submission.recommendedProblem)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 shrink-0"
                >
                  <span>바로 도전하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 하단 닫기 */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
              >
                닫기 및 문제 목록으로 이동
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
