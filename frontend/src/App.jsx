import React, { useState, useEffect } from 'react';
import katex from 'katex';
import { loginStudent, fetchProblems, evaluateSubmission } from './services/api';

import LoginScreen from './components/LoginScreen';
import Navbar from './components/Navbar';
import MathCanvas from './components/MathCanvas';
import TextSolver from './components/TextSolver';
import PresetSelector from './components/PresetSelector';
import FeedbackModal from './components/FeedbackModal';
import HistoryDashboard from './components/HistoryDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ProblemUploadModal from './components/ProblemUploadModal';

import {
  Sparkles,
  BookOpen,
  Edit3,
  FileText,
  Send,
  GraduationCap,
  ChevronRight,
  Lightbulb,
  ArrowLeft,
  PlusCircle,
  Camera
} from 'lucide-react';

export default function App() {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('solve'); // 'solve' | 'history' | 'teacher'
  const [isTeacherViewOnly, setIsTeacherViewOnly] = useState(false);

  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [gradeFilter, setGradeFilter] = useState(null);

  // 커스텀 문제 업로드 모달 state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [submissionType, setSubmissionType] = useState('canvas'); // 'canvas' | 'text'
  const [canvasImage, setCanvasImage] = useState(null);
  const [userText, setUserText] = useState('');
  const [showHint, setShowHint] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('math_ai_student');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudent(parsed);
        setGradeFilter(parsed.grade);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (student) {
      loadProblems(gradeFilter || student.grade);
    }
  }, [student, gradeFilter]);

  const loadProblems = async (grade) => {
    try {
      const res = await fetchProblems(grade);
      setProblems(res.problems || []);
      if (res.problems && res.problems.length > 0) {
        setSelectedProblem(res.problems[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (school, name, grade) => {
    const res = await loginStudent(school, name, grade);
    if (res.success && res.student) {
      setStudent(res.student);
      setGradeFilter(res.student.grade);
      setIsTeacherViewOnly(false);
      localStorage.setItem('math_ai_student', JSON.stringify(res.student));
    }
  };

  const handleLogout = () => {
    setStudent(null);
    setIsTeacherViewOnly(false);
    localStorage.removeItem('math_ai_student');
  };

  const handleProblemUploaded = (newProb) => {
    setProblems((prev) => [newProb, ...prev]);
    setSelectedProblem(newProb);
    setShowHint(false);
  };

  const handleSubmitSolution = async () => {
    if (!student || !selectedProblem) return;

    if (submissionType === 'text' && !userText.trim()) {
      alert('풀이 내용이나 정답을 텍스트로 입력해 주세요!');
      return;
    }

    setModalOpen(true);
    setIsScanning(true);

    try {
      const res = await evaluateSubmission({
        studentId: student.id,
        problemId: selectedProblem.id,
        submissionType,
        userSolutionText: userText,
        canvasImage: submissionType === 'canvas' ? canvasImage : null
      });

      setTimeout(() => {
        setIsScanning(false);
        setLastSubmissionResult(res.submission);
        if (res.updatedStudent) {
          setStudent(res.updatedStudent);
          localStorage.setItem('math_ai_student', JSON.stringify(res.updatedStudent));
        }
      }, 1500);
    } catch (err) {
      setIsScanning(false);
      alert(err.message || '채점 평가 요청 중 오류가 발생했습니다.');
      setModalOpen(false);
    }
  };

  const handleTryRecommended = (prob) => {
    setSelectedProblem(prob);
    setModalOpen(false);
    setCanvasImage(null);
    setUserText('');
    setShowHint(false);
  };

  const renderMath = (str) => {
    if (!str) return null;
    try {
      const html = str.replace(/\$\$([\s\S]+?)\$\$/g, (_, eq) => {
        return katex.renderToString(eq, { displayMode: true, throwOnError: false });
      }).replace(/\$([\s\S]+?)\$/g, (_, eq) => {
        return katex.renderToString(eq, { displayMode: false, throwOnError: false });
      });
      return <div dangerouslySetInnerHTML={{ __html: html.replace(/\n/g, '<br/>') }} />;
    } catch (e) {
      return <span>{str}</span>;
    }
  };

  if (isTeacherViewOnly && !student) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MathAI Tutor - 교사 관리자 직통 뷰
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="http://localhost:5000/admin"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              백엔드 (Port 5000) 직접 열기
            </a>
            <button
              onClick={() => setIsTeacherViewOnly(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>학생 로그인 화면으로 돌아가기</span>
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
          <TeacherDashboard />
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <LoginScreen
        onLoginSuccess={handleLogin}
        onOpenTeacherDashboard={() => setIsTeacherViewOnly(true)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar
        student={student}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {activeTab === 'teacher' ? (
          <TeacherDashboard />
        ) : activeTab === 'history' ? (
          <HistoryDashboard student={student} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 왼쪽: 문제 목록 & 사진/파일 업로드 버튼 */}
            <div className="lg:col-span-5 space-y-6">

              {/* 내 문제 직접 업로드 (사진/PDF/이미지) 버튼 */}
              <button
                onClick={() => setUploadModalOpen(true)}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-800/80 hover:to-pink-800/80 border border-purple-500/40 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 group"
              >
                <Camera className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                <span>📷/📁 문제 직접 업로드 (사진 찍기 / 파일)</span>
              </button>

              {/* 학년 필터 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-400" /> 학년별 문제 선택
                  </span>
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {gradeFilter ? `${gradeFilter}학년` : '전체'}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGradeFilter(g)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition ${
                        gradeFilter === g
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {g}학년
                    </button>
                  ))}
                </div>
              </div>

              {/* 문제 카드 목록 */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-purple-400" /> 도전할 문제 리스트 ({problems.length}개)
                  </span>
                </div>
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {problems.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProblem(p);
                        setShowHint(false);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between group ${
                        selectedProblem && selectedProblem.id === p.id
                          ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${p.isCustom ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                            {p.category}
                          </span>
                          <span className="text-xs text-slate-400">{p.grade}학년</span>
                        </div>
                        <h4 className="text-sm font-bold mt-1 text-white group-hover:text-indigo-200">
                          {p.title}
                        </h4>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${selectedProblem && selectedProblem.id === p.id ? 'translate-x-1 text-indigo-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 선택된 문제 상세 카드 */}
              {selectedProblem && (
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      {selectedProblem.category}
                    </span>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 transition"
                    >
                      <Lightbulb className="w-3.5 h-3.5 fill-amber-400" />
                      {showHint ? '힌트 닫기' : '힌트 보기'}
                    </button>
                  </div>

                  <h3 className="text-xl font-extrabold text-white leading-snug">
                    {selectedProblem.title}
                  </h3>

                  {/* 업로드된 사진 문제가 있는 경우 이미지 표시 */}
                  {selectedProblem.problemImage && (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 text-center">
                      <img src={selectedProblem.problemImage} alt="문제 사진" className="max-h-64 mx-auto rounded object-contain" />
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-slate-200 text-base leading-relaxed font-sans">
                    {renderMath(selectedProblem.question)}
                  </div>

                  {showHint && selectedProblem.hints && (
                    <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1 text-amber-400">
                        <Lightbulb className="w-3.5 h-3.5" /> 힌트 가이드
                      </div>
                      <p className="leading-relaxed">{selectedProblem.hints[0]}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 오른쪽: 풀이 작성 & 제출 */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSubmissionType('canvas')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                      submissionType === 'canvas'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>손글씨 캔버스 풀이</span>
                  </button>
                  <button
                    onClick={() => setSubmissionType('text')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                      submissionType === 'text'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>수식 & 텍스트 풀이</span>
                  </button>
                </div>

                <div className="text-[11px] text-indigo-400 font-semibold hidden sm:block pr-2">
                  🤖 Gemini 2.0 Flash AI 채점 가동 중
                </div>
              </div>

              <PresetSelector
                currentProblem={selectedProblem}
                onSelectPreset={(presetText) => {
                  setSubmissionType('text');
                  setUserText(presetText);
                }}
              />

              {submissionType === 'canvas' ? (
                <MathCanvas onCanvasChange={(dataUrl) => setCanvasImage(dataUrl)} />
              ) : (
                <TextSolver text={userText} setText={setUserText} />
              )}

              <button
                onClick={handleSubmitSolution}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                <span>Gemini AI 정오답 채점 & 피드백 받기</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 커스텀 문제 업로드 모달 */}
      <ProblemUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onProblemUploaded={handleProblemUploaded}
      />

      <FeedbackModal
        isOpen={modalOpen}
        isScanning={isScanning}
        submission={lastSubmissionResult}
        onClose={() => setModalOpen(false)}
        onTryRecommended={handleTryRecommended}
      />
    </div>
  );
}
