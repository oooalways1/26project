import React, { useState } from 'react';
import { uploadProblem } from '../services/api';
import { Upload, Camera, FileText, X, PlusCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function ProblemUploadModal({ isOpen, onClose, onProblemUploaded }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState(4);
  const [category, setCategory] = useState('단원 평가');
  const [questionText, setQuestionText] = useState('');
  const [standardAnswer, setStandardAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [problemImage, setProblemImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미지/사진 업로드 처리 (Base64 변환)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('이미지 파일 크기는 10MB 이하이어야 합니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProblemImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('문제 제목을 입력해 주세요.');
      return;
    }
    if (!questionText.trim() && !problemImage) {
      setError('문제 지문을 텍스트로 쓰거나 문제 사진/이미지를 등록해 주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await uploadProblem({
        title,
        grade,
        category,
        questionText,
        problemImage,
        standardAnswer,
        explanation
      });

      if (res.success && res.problem) {
        onProblemUploaded(res.problem);
        onClose();
        // 초기화
        setTitle('');
        setQuestionText('');
        setProblemImage(null);
        setStandardAnswer('');
      }
    } catch (err) {
      setError(err.message || '문제 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <PlusCircle className="w-5 h-5" />
            <h3 className="text-xl font-bold text-white">커스텀 문제 직접 등록 / 사진 업로드</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 문제 제목 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">문제 제목 *</label>
            <input
              type="text"
              placeholder="예: 2026학년도 단원평가 5번 문제"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 학년 선택 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">대상 학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>{g}학년</option>
                ))}
              </select>
            </div>

            {/* 카테고리/단원 */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">단원 / 카테고리</label>
              <input
                type="text"
                placeholder="예: 분수와 소수"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 문제 사진 / 파일 직접 업로드 또는 촬영 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              📷 문제 사진 직접 찍어 올리기 또는 파일 선택 (JPG, PNG, PDF 이미지)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-4 text-center bg-slate-950/60 transition">
              <input
                type="file"
                accept="image/*,capture=camera"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {problemImage ? (
                <div className="space-y-2">
                  <img src={problemImage} alt="업로드 문제" className="max-h-36 mx-auto rounded border border-slate-700" />
                  <span className="text-xs text-emerald-400 font-bold block">✓ 사진이 등록되었습니다 (클릭하여 변경)</span>
                </div>
              ) : (
                <div className="space-y-1 py-2">
                  <Camera className="w-8 h-8 text-indigo-400 mx-auto animate-bounce" />
                  <span className="text-xs text-slate-300 font-semibold block">클릭하여 사진 찍기 또는 이미지 파일 선택</span>
                  <span className="text-[11px] text-slate-500">교재, 시험지, 풀이 문제집 직접 촬영 가능</span>
                </div>
              )}
            </div>
          </div>

          {/* 문제 텍스트 지문 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">문제 텍스트 지문 (선택)</label>
            <textarea
              rows={3}
              placeholder="사진이 없거나 텍스트로 문제를 쓸 경우 지문을 작성해 주세요."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* 표준 정답 & 해설 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">표준 정답 (채점 표준)</label>
              <input
                type="text"
                placeholder="예: 60"
                value={standardAnswer}
                onChange={(e) => setStandardAnswer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">기본 해설 가이드</label>
              <input
                type="text"
                placeholder="예: 세 내각의 합은 180도"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 업로드 완료 버튼 */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              {loading ? '등록 중...' : '문제 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
