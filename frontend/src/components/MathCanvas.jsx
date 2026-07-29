import React, { useState, useRef, useEffect } from 'react';
import { Eraser, RotateCcw, Trash2, Send, Sparkles, MessageSquare, HelpCircle } from 'lucide-react';
import TextSolver from './TextSolver';

export default function MathCanvas({ problem, onSubmit, evaluating }) {
  const [inputMode, setInputMode] = useState('both'); // 'both' | 'canvasOnly' | 'textOnly'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(4);
  const [history, setHistory] = useState([]);
  const [hasContent, setHasContent] = useState(false);

  const [solutionText, setSolutionText] = useState('');

  useEffect(() => {
    initCanvas();
  }, [problem]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    saveState();
    setHasContent(false);
  };

  const drawGrid = (ctx, w, h) => {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const step = 30;

    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    setHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const newHist = [...history];
    newHist.pop();
    const lastState = newHist[newHist.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setHistory(newHist);
  };

  const handleClear = () => {
    initCanvas();
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleCombinedSubmit = () => {
    const canvas = canvasRef.current;
    let dataUrl = null;
    if (canvas && hasContent) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    }

    if (!dataUrl && !solutionText.trim()) {
      alert('손글씨를 그리거나 텍스트 설명 중 하나 이상을 입력해 주세요!');
      return;
    }

    onSubmit({
      submissionType: dataUrl ? 'canvas' : 'text',
      solutionText: solutionText.trim(),
      canvasImage: dataUrl
    });
  };

  const colors = ['#ffffff', '#38bdf8', '#f472b6', '#facc15', '#4ade80'];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
      {/* 📌 구체적인 AI 출제 문제 지문 카드 */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 space-y-2 shadow-inner">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
              Q
            </span>
            <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
              {problem.category || '수학 문제'}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {problem.grade}학년
          </span>
        </div>

        <h3 className="text-lg font-black text-white">{problem.title}</h3>
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-wrap">
          {problem.question}
        </p>

        {problem.hints && problem.hints.length > 0 && (
          <p className="text-xs text-amber-300/90 flex items-center gap-1.5 pt-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>힌트: {problem.hints[0]}</span>
          </p>
        )}
      </div>

      {/* 문제 직접 사진 등록 시 출력 */}
      {problem.problemImage && (
        <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30">
          <p className="text-xs text-purple-300 font-bold mb-2 flex items-center gap-1">
            📷 업로드된 문제 사진 (Gemini AI 시각 자율 채점)
          </p>
          <img
            src={problem.problemImage}
            alt="문제 사진"
            className="max-h-64 rounded-xl border border-slate-800 object-contain mx-auto shadow-md"
          />
        </div>
      )}

      {/* 풀이 방식 선택 탭 */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setInputMode('both')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              inputMode === 'both' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ 손글씨 + 텍스트 동시 입력 (추천)
          </button>
          <button
            onClick={() => setInputMode('canvasOnly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              inputMode === 'canvasOnly' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ✍️ 손글씨만 사용
          </button>
          <button
            onClick={() => setInputMode('textOnly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              inputMode === 'textOnly' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⌨️ 텍스트만 사용
          </button>
        </div>
      </div>

      {/* 손글씨 캔버스 영역 */}
      {(inputMode === 'both' || inputMode === 'canvasOnly') && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-lg transition transform ${color === c ? 'scale-125 ring-2 ring-indigo-400' : 'opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900 border border-slate-800">
                {[2, 4, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => setLineWidth(w)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${lineWidth === w ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {w === 2 ? 'S' : w === 4 ? 'M' : 'L'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 되돌리기
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition flex items-center gap-1 border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" /> 새로 쓰기
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner bg-slate-950">
            <canvas
              ref={canvasRef}
              width={800}
              height={380}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-auto cursor-crosshair touch-none block"
            />
            {!hasContent && (
              <div className="absolute bottom-3 right-3 text-xs text-slate-500 pointer-events-none bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                ✍️ 마우스/터치로 위 지문의 풀이과정을 그려보세요!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 텍스트/수식 설명 입력란 */}
      {(inputMode === 'both' || inputMode === 'textOnly') && (
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>⌨️ 텍스트/수식 설명 입력 (선택)</span>
          </label>
          <textarea
            rows={3}
            placeholder="추가적인 답안이나 수식 풀이 과정을 텍스트로 적어보세요. (예: 20 × 31 = 620개입니다)"
            value={solutionText}
            onChange={(e) => setSolutionText(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm leading-relaxed"
          />
        </div>
      )}

      {/* 제출 버튼 */}
      <div className="pt-2">
        <button
          onClick={handleCombinedSubmit}
          disabled={evaluating}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-black text-base shadow-2xl shadow-indigo-500/30 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {evaluating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Gemini AI가 정밀 정오답 채점 중입니다...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 animate-bounce" />
              <span>✨ AI 채점 및 친절한 피드백 받기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
