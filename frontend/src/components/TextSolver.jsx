import React from 'react';
import katex from 'katex';

export default function TextSolver({ text, setText }) {
  // 수식 심볼 퀵 버튼 목록
  const symbols = [
    { label: '분수 a/b', symbol: '\\frac{a}{b}' },
    { label: '제곱 x²', symbol: 'x^2' },
    { label: '루트 √x', symbol: '\\sqrt{x}' },
    { label: '곱하기 ×', symbol: '\\times ' },
    { label: '나누기 ÷', symbol: '\\div ' },
    { label: '각도 도(°)', symbol: '^\\circ' },
    { label: '같지 않다 ≠', symbol: '\\neq ' }
  ];

  const insertSymbol = (sym) => {
    setText((prev) => prev + sym);
  };

  // KaTeX 라이브 렌더링 헬퍼
  const renderMathPreview = (str) => {
    if (!str.trim()) return <span className="text-slate-500 italic text-sm">입력한 수식과 풀이가 여기에 깔끔하게 미리보기 됩니다...</span>;

    try {
      // $$ 또는 $ 포함되어 있는지 처리
      const html = str.replace(/\$\$([\s\S]+?)\$\$/g, (_, eq) => {
        return katex.renderToString(eq, { displayMode: true, throwOnError: false });
      }).replace(/\$([\s\S]+?)\$/g, (_, eq) => {
        return katex.renderToString(eq, { displayMode: false, throwOnError: false });
      });

      return <div dangerouslySetInnerHTML={{ __html: html.replace(/\n/g, '<br/>') }} />;
    } catch (e) {
      return <span className="text-slate-300 whitespace-pre-wrap">{str}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 수학 기호 퀵 입력 툴바 */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <span>✨ 수식 기호 빠르게 넣기 (클릭)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {symbols.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => insertSymbol(item.symbol)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-mono font-semibold border border-slate-700/60 transition active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 텍스트 / 풀이 입력창 */}
      <div>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="풀이 과정과 정답을 입력해 주세요. (예: 가로 12cm * 세로 8cm = 96cm² 입니다. 따라서 넓이는 96입니다.)"
          className="w-full p-4 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 font-mono text-sm leading-relaxed"
        />
      </div>

      {/* 라이브 프리뷰 카드 */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          📖 실시간 수식 미리보기
        </div>
        <div className="text-slate-200 font-sans text-sm min-h-[40px] leading-relaxed">
          {renderMathPreview(text)}
        </div>
      </div>
    </div>
  );
}
