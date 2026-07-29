import React, { useState } from 'react';
import { School, User, GraduationCap, Sparkles, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [school, setSchool] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickSchools = ['서울초등학교', '빛가람초등학교', '중앙초등학교', '해돋이초등학교'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!school.trim()) {
      setError('초등학교 이름을 입력해 주세요.');
      return;
    }
    if (!name.trim()) {
      setError('학생 이름을 입력해 주세요.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onLoginSuccess(school.trim(), name.trim(), grade);
    } catch (err) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTeacherDashboard = () => {
    const pwd = prompt('🔒 교사 대시보드 접속 비밀번호를 입력하세요.');
    if (pwd === '0000') {
      window.open('http://localhost:5000/admin?password=0000', '_blank');
    } else if (pwd !== null) {
      alert('❌ 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0b0f19]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4 animate-spin" /> 초등 수학 AI 채점 & 맞춤 피드백
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            수학 탐험가 <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">로그인</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            문제풀이를 올리면 AI가 풀이과정을 보고 정오답과 친절한 피드백을 알려줍니다!
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                <School className="w-4 h-4 inline mr-1 text-indigo-400" /> 초등학교 이름
              </label>
              <input
                type="text"
                placeholder="예: 서울초등학교"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition text-sm"
                required
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickSchools.map((sch) => (
                  <button
                    key={sch}
                    type="button"
                    onClick={() => setSchool(sch)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-indigo-300 border border-slate-700/50 transition"
                  >
                    +{sch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                <User className="w-4 h-4 inline mr-1 text-purple-400" /> 학생 이름
              </label>
              <input
                type="text"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 inline mr-1 text-cyan-400" /> 학년 선택
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition flex flex-col items-center justify-center border ${
                      grade === g
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30 scale-105'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span>{g}</span>
                    <span className="text-[10px] font-normal opacity-80">학년</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <span>로그인 중...</span>
              ) : (
                <>
                  <span>수학 탐험 시작하기</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Gemini AI 멀티모달 채점</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 백엔드 이력 DB 저장</span>
            </p>
          </div>
        </div>

        {/* 교사 대시보드 바로가기 버튼 */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleOpenTeacherDashboard}
            className="w-full py-3.5 px-4 rounded-2xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg hover:scale-102"
          >
            <Lock className="w-4 h-4 text-pink-400" />
            <span>👩‍🏫 MathAI 교사 통합 대시보드 보기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
