import React, { useState } from 'react';
import { School, User, GraduationCap, Sparkles, ArrowRight, CheckCircle2, Lock, KeyRound, UserPlus, LogIn, Users, AtSign } from 'lucide-react';
import { registerStudent, loginStudent } from '../services/api';

export default function LoginScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // 로그인 폼
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 회원가입 폼
  const [regId, setRegId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState(4);
  const [classGroup, setClassGroup] = useState(1);
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setError('아이디를 입력해 주세요.');
      return;
    }
    if (!loginPassword.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const student = await loginStudent({
        username: loginId.trim(),
        password: loginPassword.trim()
      });
      onLoginSuccess(student);
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regId.trim()) {
      setError('회원가입할 아이디를 입력해 주세요.');
      return;
    }
    if (!regPassword.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다. 다시 확인해 주세요.');
      return;
    }
    if (!school.trim()) {
      setError('초등학교 이름을 입력해 주세요.');
      return;
    }
    if (!name.trim()) {
      setError('학생 이름을 입력해 주세요.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await registerStudent({
        username: regId.trim(),
        password: regPassword.trim(),
        school: school.trim(),
        grade: Number(grade),
        classGroup: Number(classGroup),
        name: name.trim()
      });

      setSuccessMsg(`🎉 회원가입 성공! [${regId.trim()}] 아이디로 로그인해 주세요.`);
      setLoginId(regId.trim());
      setLoginPassword('');
      setRegPassword('');
      setRegConfirmPassword('');
      setMode('login');
    } catch (err) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTeacherDashboard = () => {
    const pwd = prompt('🔒 교사 대시보드 접속 비밀번호를 입력하세요.');
    if (pwd === '0000') {
      window.open('http://localhost:5000/admin?password=0000', '_blank');
    } else if (pwd !== null) {
      alert('❌ 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0b0f19]">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4 animate-spin" /> 초등 수학 AI 채점 & 맞춤 피드백
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            수학 탐험가 <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{mode === 'login' ? '로그인' : '회원가입'}</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            {mode === 'login' ? '아이디와 비밀번호를 입력하고 탐험을 시작하세요!' : '새 계정을 만들고 비밀번호를 2번 확인하여 가입하세요!'}
          </p>
        </div>

        {/* 탭 전환 (로그인 vs 회원가입) */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>로그인</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>학생 회원가입</span>
          </button>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center mb-4 leading-relaxed">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center mb-4 leading-relaxed">
              {successMsg}
            </div>
          )}

          {/* 1. 로그인 폼 (아이디 + 비밀번호) */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  <AtSign className="w-4 h-4 inline mr-1 text-indigo-400" /> 학생 아이디 (ID)
                </label>
                <input
                  type="text"
                  placeholder="가입한 아이디 입력"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition text-sm"
                  required
                  autofocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 inline mr-1 text-pink-400" /> 비밀번호 (Password)
                </label>
                <input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition text-sm tracking-wider"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <span>로그인 중...</span>
                ) : (
                  <>
                    <span>수학 탐험 시작하기</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* 2. 회원가입 폼 (아이디 + 비밀번호 + 비밀번호확인 + 학교 + 학년 + 반 + 이름) */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  <AtSign className="w-4 h-4 inline mr-1 text-indigo-400" /> 사용할 아이디 (ID)
                </label>
                <input
                  type="text"
                  placeholder="영문, 숫자 가능 (예: student1)"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    <KeyRound className="w-4 h-4 inline mr-1 text-pink-400" /> 비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="비밀번호 설정"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm tracking-wider"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    <KeyRound className="w-4 h-4 inline mr-1 text-emerald-400" /> 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    placeholder="비밀번호 한번 더 입력"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm tracking-wider"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  <School className="w-4 h-4 inline mr-1 text-indigo-400" /> 초등학교 이름
                </label>
                <input
                  type="text"
                  placeholder="예: 대구OO초등학교"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4 inline mr-1 text-cyan-400" /> 학년
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g} className="bg-slate-900 text-white">
                        {g}학년
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    <Users className="w-4 h-4 inline mr-1 text-purple-400" /> 반
                  </label>
                  <select
                    value={classGroup}
                    onChange={(e) => setClassGroup(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white focus:outline-none focus:border-purple-500 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((cls) => (
                      <option key={cls} value={cls} className="bg-slate-900 text-white">
                        {cls}반
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  <User className="w-4 h-4 inline mr-1 text-amber-400" /> 학생 실명
                </label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-purple-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <span>가입 처리 중...</span>
                ) : (
                  <>
                    <span>학생 회원가입 완료</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Gemini AI 멀티모달 채점</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 안전 암호화 가입</span>
            </p>
          </div>
        </div>

        {/* 교사 대시보드 바로가기 버튼 */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleOpenTeacherDashboard}
            className="w-full py-3 px-4 rounded-2xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg hover:scale-102"
          >
            <Lock className="w-4 h-4 text-pink-400" />
            <span>👩‍🏫 MathAI 교사 통합 대시보드 보기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
