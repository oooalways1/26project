import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function TeacherDashboard() {
  const handleOpen = () => {
    window.open('http://localhost:5000/admin', '_blank');
  };

  return (
    <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 my-8">
      <h3 className="text-xl font-bold text-white">👩‍🏫 MathAI 교사 통합 대시보드가 준비되었습니다</h3>
      <p className="text-xs text-slate-400">
        백엔드가 직접 서빙하는 전용 교사 모니터링 페이지로 이동하여 전체 학생 수, 채점 이력, Gemini API 상태를 확인하세요.
      </p>
      <button
        onClick={handleOpen}
        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
      >
        <ExternalLink className="w-4 h-4" />
        <span>교사 대시보드 (http://localhost:5000/admin) 바로 열기</span>
      </button>
    </div>
  );
}
