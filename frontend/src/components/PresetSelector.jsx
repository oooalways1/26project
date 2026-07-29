import React, { useState } from 'react';
import { BookOpen, Sparkles, Wand2, CheckCircle2 } from 'lucide-react';
import { generateAiProblem } from '../services/api';

export default function PresetSelector({
  selectedGrade,
  problems,
  selectedProblem,
  setSelectedProblem,
  loading,
  onProblemGenerated
}) {
  const [generating, setGenerating] = useState(false);

  const handleGenerateAiProblem = async () => {
    setGenerating(true);
    try {
      const newProblem = await generateAiProblem(selectedGrade);
      if (onProblemGenerated) {
        await onProblemGenerated(newProblem);
      }
      setSelectedProblem(newProblem);
    } catch (err) {
      alert(err.message || 'AI 문제 출제 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* 본인 학년 자동 고정 헤더 & AI 문제 출제 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black text-lg">
            {selectedGrade}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>{selectedGrade}학년 맞춤 수학 문제 모음</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
                교육과정 자동적용
              </span>
            </h3>
            <p className="text-xs text-slate-400">로그인한 학년({selectedGrade}학년)의 교육과정에 맞춘 핵심 문제입니다.</p>
          </div>
        </div>

        {/* 🎲 다른 AI 문제 새로 가져오기 버튼 */}
        <button
          onClick={handleGenerateAiProblem}
          disabled={generating}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{selectedGrade}학년 AI 새로운 문제 출제 중...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>🎲 다른 AI {selectedGrade}학년 문제 출제받기</span>
            </>
          )}
        </button>
      </div>

      {/* 문제 리스트 칩 (본인 학년 전용) */}
      <div className="space-y-2 pt-1 border-t border-slate-800/80">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {selectedGrade}학년 풀이 문제 선택 (클릭 시 이동)
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs text-slate-500">문제 목록을 불러오는 중...</div>
        ) : problems.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-950 text-center text-xs text-slate-500 border border-slate-800">
            등록된 문제가 없습니다. 위 **[🎲 다른 AI {selectedGrade}학년 문제 출제받기]** 버튼을 눌러보세요!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {problems.map((p) => {
              const isSelected = selectedProblem && selectedProblem.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProblem(p)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-[10px] opacity-70">[{p.category || `${selectedGrade}학년`}]</span>
                  <span>{p.title}</span>
                  {p.isAiGenerated && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px]">
                      AI출제
                    </span>
                  )}
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
