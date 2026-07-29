import React, { useState } from 'react';
import { X, Upload, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadProblem } from '../services/api';

export default function ProblemUploadModal({ isOpen, onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState(4);
  const [category, setCategory] = useState('자유 문제');
  const [questionText, setQuestionText] = useState('');
  const [problemImage, setProblemImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('이미지 파일 크기는 10MB 이하만 지원됩니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProblemImage(event.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('문제 제목을 입력해 주세요.');
      return;
    }
    if (!questionText.trim() && !problemImage) {
      setError('문제 사진을 올리거나 문제 풀이 내용을 입력해 주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await uploadProblem({
        title: title.trim(),
        grade: Number(grade),
        category: category.trim() || '직접 업로드 문제',
        questionText: questionText.trim() || '아래 이미지/풀이를 확인하세요.',
        problemImage: problemImage || null,
        standardAnswer: 'AI 자동추론',
        explanation: 'Gemini AI가 문제를 자율 해석하여 채점합니다.'
      });

      alert('🎉 문제 등록이 완료되었습니다!');
      setTitle('');
      setCategory('자유 문제');
      setQuestionText('');
      setProblemImage(null);

      if (onUploaded) {
        await onUploaded();
      }
      onClose();
    } catch (err) {
      setError(err.message || '문제 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center text-lg font-bold">
            ⊕
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">커스텀 문제 직접 등록 / 사진 업로드</h2>
            <p className="text-xs text-slate-400">문제 사진이나 지문을 올리면 AI가 알아서 자율 채점합니다.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              문제 제목 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 4학년 1단원 1번 문제"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">대상 학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-white focus:outline-none focus:border-purple-500 text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g} className="bg-slate-900 text-white">
                    {g}학년
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">단원 / 카테고리</label>
              <input
                type="text"
                placeholder="예: 분수와 소수"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              📷 문제 사진 직접 찍어 올리기 또는 파일 선택 (JPG, PNG, PDF 이미지)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl p-4 text-center transition bg-slate-950/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              {problemImage ? (
                <div className="space-y-2">
                  <img
                    src={problemImage}
                    alt="업로드된 문제"
                    className="max-h-48 mx-auto rounded-xl border border-slate-700 object-contain shadow-md"
                  />
                  <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> 사진이 등록되었습니다 (클릭하여 변경)
                  </p>
                </div>
              ) : (
                <div className="py-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    여기를 클릭하거나 문제 이미지 파일을 끌어다 놓으세요
                  </p>
                  <p className="text-[11px] text-slate-500">스마트폰 사진 촬영 / 캡처 이미지 지원 (최대 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* 문제 풀이 내용으로 변경 및 정답/해설 탭 삭제 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              문제 풀이 내용 (선택)
            </label>
            <textarea
              rows={3}
              placeholder="문제 지문이나 세부 풀이 설명을 입력해 주세요."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
            >
              {loading ? '등록 처리 중...' : '문제 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
