import React, { useState } from 'react';
import { BookOpen, Sparkles, Wand2, CheckCircle2, Layers } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState('3. 곱셈과 나눗셈');

  const gradeCategories = {
    1: ['1. 100까지의 수', '2. 덧셈과 뺄셈', '3. 여러 가지 모양'],
    2: ['1. 세 자리 수', '2. 곱셈구구', '3. 길이 재기'],
    3: ['1. 덧셈과 뺄셈', '2. 평면도형', '3. 분수와 소수'],
    4: ['1. 큰 수', '2. 각도', '3. 곱셈과 나눗셈', '4. 분수의 덧셈과 뺄셈', '5. 삼각형', '6. 소수의 덧셈과 뺄셈'],
    5: ['1. 혼합 계산', '2. 약수와 배수', '3. 약분과 통분', '4. 다각형 넓이'],
    6: ['1. 분수의 나눗셈', '2. 각기둥과 각뿔', '3. 비와 비율', '4. 원의 넓이']
  };

  const categories = gradeCategories[selectedGrade] || gradeCategories[4];

  const handleCategorySelect = async (cat) => {
    setActiveCategory(cat);

    // 해당 단원의 문제가 이미 있는지 확인
    const existing = problems.find((p) => (p.category || '').includes(cat.split('. ')[1] || cat));
    if (existing) {
      setSelectedProblem(existing);
      return;
    }

    // 없으면 AI가 구체적인 문제 즉시 자율 출제!
    setGenerating(true);
    try {
      const newProblem = await generateAiProblem(selectedGrade, cat);
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

  const handleGenerateNewInCat = async () => {
    setGenerating(true);
    try {
      const newProblem = await generateAiProblem(selectedGrade, activeCategory);
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
      {/* 단원 선택 안내 & AI 즉시 출제 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>{selectedGrade}학년 단원 선택 (클릭 시 AI 즉시 문제 출제)</span>
            </h3>
            <p className="text-xs text-slate-400">원하는 단원을 누르면 AI 에이전트가 구체적인 문장제 문제를 출제합니다.</p>
          </div>
        </div>

        <button
          onClick={handleGenerateNewInCat}
          disabled={generating}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AI 실생활 문제 출제 중...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>🎲 [{activeCategory.split('. ')[1] || activeCategory}] 다른 AI 문제 출제</span>
            </>
          )}
        </button>
      </div>

      {/* 4학년 단원 칩 선택 목록 */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400 scale-102'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <span>{cat}</span>
              {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
