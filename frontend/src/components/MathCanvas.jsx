import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, Trash2, Edit3, Palette, ShieldAlert } from 'lucide-react';

export default function MathCanvas({ onCanvasChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(4);
  const [mode, setMode] = useState('pen'); // 'pen' | 'eraser'
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 고해상도 DPI 대응
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // 격자 배경 그리기
    drawGrid(ctx, rect.width, rect.height);
    saveHistory();
  }, []);

  const drawGrid = (ctx, width, height) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;

    const gridSize = 24;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);

    if (mode === 'eraser') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
      notifyParent();
    }
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (history.length >= 10) {
      setHistory((prev) => [...prev.slice(1), canvas.toDataURL()]);
    } else {
      setHistory((prev) => [...prev, canvas.toDataURL()]);
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // 현재 상태 제거
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
      notifyParent();
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, rect.width, rect.height);
    saveHistory();
    if (onCanvasChange) onCanvasChange(null);
  };

  const notifyParent = () => {
    if (onCanvasChange && canvasRef.current) {
      onCanvasChange(canvasRef.current.toDataURL('image/png'));
    }
  };

  const colors = [
    { name: '화이트', val: '#ffffff' },
    { name: '네온 시안', val: '#38bdf8' },
    { name: '네온 핑크', val: '#f472b6' },
    { name: '네온 노랑', val: '#facc15' },
    { name: '네온 그린', val: '#4ade80' }
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* 툴바 (펜/지우개, 색상, 굵기, 실행취소, 초기화) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2">
          {/* 펜 / 지우개 모드 */}
          <button
            type="button"
            onClick={() => setMode('pen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'pen'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> 펜
          </button>
          <button
            type="button"
            onClick={() => setMode('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'eraser'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" /> 지우개
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          {/* 색상 선택 */}
          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button
                key={c.val}
                type="button"
                onClick={() => {
                  setColor(c.val);
                  setMode('pen');
                }}
                className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 ${
                  color === c.val && mode === 'pen' ? 'border-white scale-110 ring-2 ring-indigo-500/50' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.val }}
                title={c.name}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          {/* 굵기 조절 */}
          <div className="flex items-center gap-1">
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setLineWidth(w)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                  lineWidth === w
                    ? 'bg-slate-700 text-white border border-slate-500'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {w === 2 ? 'S' : w === 4 ? 'M' : 'L'}
              </button>
            ))}
          </div>
        </div>

        {/* 액션 버튼 (Undo, Clear) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={history.length <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 되돌리기
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> 새로 쓰기
          </button>
        </div>
      </div>

      {/* 캔버스 드로잉 영역 */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner group">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[320px] touch-none cursor-crosshair block"
        />
        <div className="absolute bottom-3 right-3 pointer-events-none px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-[11px] text-slate-400 border border-slate-800">
          ✍️ 마우스/터치로 수식과 풀이과정을 자유롭게 그려보세요!
        </div>
      </div>
    </div>
  );
}
