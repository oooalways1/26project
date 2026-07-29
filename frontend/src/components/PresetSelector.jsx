import React, { useState } from 'react';
import { BookOpen, Sparkles, Wand2, CheckCircle2 } from 'lucide-react';
import { generateAiProblem } from '../services/api';

export default function PresetSelector({
  selectedGrade,
  setSelectedGrade,
  problems,
  selectedProblem,
  setSelectedProblem,
  loading,
  onProblemGenerated
}) {
  const grades = [1, 2, 3, 4, 5, 6];
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
      alert(err.message || 'AI 문제 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* 학년 선택 바 및 Gemini AI 문제 생성 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">대한민국 초등 수학 교육과정 선택</h3>
            <p className="text-[11px] text-slate-400">학년을 선택하면 교육과정에 맞는 AI 문제 세트가 제공됩니다.</p>
          </div>
        </div>

        {/* 🎲 Gemini AI 교육과정 맞춤 문제 실시간 자율 생성 버튼 */}
        <button
          onClick={handleGenerateAiProblem}
          disabled={generating}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{selectedGrade}학년 교육과정 문제 출제 중...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>🎲 Gemini AI {selectedGrade}학년 맞춤 새로운 문제 생성</span>
            </>
          )}
        </button>
      </div>

      {/* 학년 선택 탭 (1~6학년) */}
      <div className="grid grid-cols-6 gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800/80">
        {grades.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g)}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center ${
              selectedGrade === g
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {g}학년
          </button>
        ))}
      </div>

      {/* 선택한 학년에 해당하는 문제 리스트 칩 */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {selectedGrade}학년 맞춤 문제 목록 (클릭하여 풀기)
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs text-slate-500">문제 목록을 불러오는 중...</div>
        ) : problems.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-950 text-center text-xs text-slate-500 border border-slate-800">
            등록된 문제가 없습니다. 위 **[🎲 Gemini AI {selectedGrade}학년 맞춤 새로운 문제 생성]** 버튼을 눌러보세요!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {problems.map((p) => {
              const isSelected = selectedProblem && selectedProblem.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProblem(p)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span>{p.title}</span>
                  {p.isAiGenerated && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px]">
                      AI생성
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
