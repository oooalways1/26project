import React from 'react';
import { School, User, Star, BookOpen, History, LogOut, Calculator, Lock } from 'lucide-react';

export default function Navbar({ student, activeTab, setActiveTab, onLogout }) {
  if (!student) return null;

  const handleOpenTeacherDashboard = () => {
    const pwd = prompt('🔒 교사 대시보드 접속 비밀번호를 입력하세요.');
    if (pwd === '0000') {
      window.open('http://localhost:5000/admin?password=0000', '_blank');
    } else if (pwd !== null) {
      alert('❌ 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* 서비스 로고 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent tracking-tight">
              MathAI Tutor
            </span>
            <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              초등 AI 수학 피드백
            </span>
          </div>
        </div>

        {/* 메인 탭 네비게이션 */}
        <nav className="flex items-center gap-1 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('solve')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'solve'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>문제 풀기 & 평가</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>오답노트</span>
          </button>

          {/* 교사 대시보드 바로가기 */}
          <button
            onClick={handleOpenTeacherDashboard}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-500/30 shadow-md"
          >
            <Lock className="w-4 h-4 text-pink-400" />
            <span>👩‍🏫 교사 대시보드</span>
          </button>
        </nav>

        {/* 우측 학생 정보 & 포인트 & 로그아웃 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{student.stars || 0} Star</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-xs text-slate-200">
            <span className="font-semibold text-indigo-400 flex items-center gap-1">
              <School className="w-3.5 h-3.5" />
              {student.school}
            </span>
            <span className="text-slate-500">|</span>
            <span className="font-bold text-white flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-purple-400" />
              {student.name} ({student.grade}학년)
            </span>
          </div>

          <button
            onClick={onLogout}
            title="로그아웃"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700/60 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
