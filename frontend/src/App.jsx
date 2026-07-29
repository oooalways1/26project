import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import PresetSelector from './components/PresetSelector';
import MathCanvas from './components/MathCanvas';
import FeedbackModal from './components/FeedbackModal';
import HistoryDashboard from './components/HistoryDashboard';
import ProblemUploadModal from './components/ProblemUploadModal';
import { loginStudent, fetchProblems, evaluateSolution } from './services/api';

export default function App() {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('solve'); // 'solve' | 'history'

  const [selectedGrade, setSelectedGrade] = useState(4);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemsLoading, setProblemsLoading] = useState(false);

  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const savedStudent = localStorage.getItem('math_ai_student');
    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        setStudent(parsed);
        if (parsed.grade) setSelectedGrade(parsed.grade);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    loadProblems(selectedGrade);
  }, [selectedGrade]);

  const loadProblems = async (grade) => {
    setProblemsLoading(true);
    try {
      const data = await fetchProblems(grade);
      setProblems(data);
      if (data && data.length > 0) {
        setSelectedProblem(data[0]);
      } else {
        setSelectedProblem(null);
      }
    } catch (err) {
      console.error('문제 불러오기 실패:', err);
    } finally {
      setProblemsLoading(false);
    }
  };

  const handleLogin = async (school, name, grade, classGroup, password) => {
    const loggedStudent = await loginStudent(school, name, grade, classGroup, password);
    setStudent(loggedStudent);
    setSelectedGrade(loggedStudent.grade || 4);
    localStorage.setItem('math_ai_student', JSON.stringify(loggedStudent));
  };

  const handleLogout = () => {
    setStudent(null);
    setSelectedProblem(null);
    setSubmissionHistory([]);
    localStorage.removeItem('math_ai_student');
  };

  const handleSubmitSolution = async ({ submissionType, solutionText, canvasImage }) => {
    if (!student || !selectedProblem) return;

    setEvaluating(true);
    try {
      const result = await evaluateSolution({
        studentId: student.id,
        problemId: selectedProblem.id,
        submissionType,
        userSolutionText: solutionText,
        canvasImage: canvasImage
      });

      setCurrentEvaluation(result.submission);
      setShowFeedbackModal(true);

      if (result.updatedStudent) {
        setStudent(result.updatedStudent);
        localStorage.setItem('math_ai_student', JSON.stringify(result.updatedStudent));
      }

      setSubmissionHistory((prev) => [result.submission, ...prev]);
    } catch (err) {
      alert(err.message || '채점 도중 오류가 발생했습니다.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleProblemUploaded = async () => {
    await loadProblems(selectedGrade);
    setShowUploadModal(false);
  };

  if (!student) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <Navbar
        student={student}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {activeTab === 'solve' ? (
          <div className="space-y-6">
            {/* 문제 직접 업로드 모달 열기 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-xl shadow-purple-600/30 transition flex items-center justify-center gap-2 group"
              >
                <span className="text-base">📷 📸 / 📁</span>
                <span>문제 직접 업로드 (사진 찍기 / 파일)</span>
              </button>
            </div>

            <PresetSelector
              selectedGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              problems={problems}
              selectedProblem={selectedProblem}
              setSelectedProblem={setSelectedProblem}
              loading={problemsLoading}
            />

            {selectedProblem ? (
              <MathCanvas
                problem={selectedProblem}
                onSubmit={handleSubmitSolution}
                evaluating={evaluating}
              />
            ) : (
              <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500">
                선택한 학년에 등록된 문제가 없습니다. 위에서 문제를 새로 등록해 보세요!
              </div>
            )}
          </div>
        ) : (
          <HistoryDashboard
            history={submissionHistory}
            onSelectProblem={(probId) => {
              const target = problems.find((p) => p.id === probId);
              if (target) {
                setSelectedProblem(target);
                setActiveTab('solve');
              }
            }}
          />
        )}
      </main>

      {/* 피드백 모달 */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        evaluation={currentEvaluation}
      />

      {/* 문제 업로드 모달 */}
      <ProblemUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploaded={handleProblemUploaded}
      />
    </div>
  );
}
