import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function PresetSelector({ currentProblem, onSelectPreset }) {
  if (!currentProblem) return null;

  const presets = [
    {
      title: '🎯 완벽한 정답 풀이 (100점)',
      icon: CheckCircle,
      color: 'hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-400',
      text: `${currentProblem.explanation} 따라서 최종 정답은 ${currentProblem.standardAnswer}${currentProblem.unit || ''} 입니다.`
    },
    {
      title: '⚠️ 계산 과정 실수 풀이 (부분 점수)',
      icon: AlertTriangle,
      color: 'hover:border-amber-500 hover:bg-amber-500/10 text-amber-400',
      text: `식을 세워서 풀어보았습니다. ${currentProblem.category} 공식을 적용했으나 최종 계산 결과는 42 입니다.`
    },
    {
      title: '❌ 개념 미숙 풀이 (오답)',
      icon: XCircle,
      color: 'hover:border-rose-500 hover:bg-rose-500/10 text-rose-400',
      text: `잘 모르겠어요. 더하면 100 이 되는 것 같습니다.`
    }
  ];

  return (
    <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
      <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>AI 채점 피드백 빠른 체험하기 (클릭 시 풀이 자동 채우기)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {presets.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPreset(p.text)}
              className={`p-3 rounded-xl border border-slate-800 bg-slate-900/80 text-left transition flex items-start gap-2.5 group ${p.color}`}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-200 transition">
                  {p.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {p.text}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
