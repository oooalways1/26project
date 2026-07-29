import React, { useState, useRef, useEffect } from 'react';
import { Eraser, RotateCcw, Trash2, Send, Sparkles, AlertCircle } from 'lucide-react';
import TextSolver from './TextSolver';

export default function MathCanvas({ problem, onSubmit, evaluating }) {
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'text'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(4);
  const [history, setHistory] = useState([]);
  const [hasContent, setHasContent] = useState(false);

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

  const handleCanvasSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSubmit({
      submissionType: 'canvas',
      solutionText: '',
      canvasImage: dataUrl
    });
  };

  const colors = ['#ffffff', '#38bdf8', '#f472b6', '#facc15', '#4ade80'];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
      {/* 문제 헤더 & 첨부 이미지 렌더링 */}
      <div className="space-y-3 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {problem.category || '단원 평가'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">{problem.grade}학년</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'canvas' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ✍️ 손글씨 캔버스
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'text' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ⌨️ 텍스트/수식 입력
            </button>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{problem.title}</h2>
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{problem.question}</p>

        {/* 문제 직접 업로드 사진이 있는 경우 표시 */}
        {problem.problemImage && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-purple-500/30">
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
      </div>

      {activeTab === 'canvas' ? (
        <div className="space-y-4">
          {/* 상단 툴바 & 제출 버튼 1 */}
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

          {/* 캔버스 화면 */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner bg-slate-950">
            <canvas
              ref={canvasRef}
              width={800}
              height={420}
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
                ✍️ 마우스/터치로 수식과 풀이과정을 자유롭게 그려보세요!
              </div>
            )}
          </div>

          {/* 하단 큼직한 AI 채점 및 피드백 받기 버튼 (시각성 최우선) */}
          <div className="pt-2">
            <button
              onClick={handleCanvasSubmit}
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
      ) : (
        <TextSolver
          onSubmit={(solText) =>
            onSubmit({
              submissionType: 'text',
              solutionText: solText,
              canvasImage: null
            })
          }
          evaluating={evaluating}
        />
      )}
    </div>
  );
}
