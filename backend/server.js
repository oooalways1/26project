const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const isVercel = process.env.VERCEL === '1';
const DB_FILE = isVercel ? '/tmp/db.json' : path.join(__dirname, 'db.json');
const ADMIN_PASSWORD = '0000';

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
let aiClient = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log(`🤖 Google Gemini API 로드 완료 (Key: ${apiKey.substring(0, 8)}...)`);
  } catch (e) {
    console.warn('⚠️ Gemini API 초기화 실패:', e.message);
  }
}

const defaultData = {
  students: [],
  submissions: [],
  problems: [
    {
      id: 'p1',
      grade: 3,
      category: '분수와 소수',
      title: '단위 분수의 크기 비교',
      question: '다음 두 분수 중에서 더 큰 분수를 찾고, 그 이유를 설명해 보세요.\n$$\\frac{1}{4} \\quad \\text{vs} \\quad \\frac{1}{6}$$',
      standardAnswer: '1/4',
      explanation: '전체를 똑같이 4조각으로 나누었을 때 한 조각이, 6조각으로 나누었을 때 한 조각보다 큽니다. 분모가 작은 분수가 더 큽니다.',
      hints: ['피자 한 판을 4명이 나누어 먹을 때와 6명이 나누어 먹을 때 한 사람이 먹는 양을 생각해 보세요.']
    },
    {
      id: 'p2',
      grade: 4,
      category: '삼각형',
      title: '삼각형의 세 각의 크기의 합',
      question: '어떤 삼각형의 두 각의 크기가 각각 $50^\\circ$ 와 $70^\\circ$ 입니다. 남은 한 각의 크기는 몇 도인지 구하고 풀이 과정을 쓰세요.',
      standardAnswer: '60',
      unit: '도',
      explanation: '삼각형의 세 내각의 합은 $180^\\circ$ 입니다. $180 - (50 + 70) = 180 - 120 = 60^\\circ$ 입니다.',
      hints: ['삼각형의 모든 각을 더하면 몇 도가 되나요?']
    },
    {
      id: 'p3',
      grade: 5,
      category: '다각형의 둘레와 넓이',
      title: '직사각형의 넓이 구하기',
      question: '가로의 길이가 $12\\text{cm}$ 이고 세로의 길이가 $8\\text{cm}$ 인 직사각형이 있습니다. 이 직사각형의 넓이를 구하고 풀이 과정을 작성하세요.',
      standardAnswer: '96',
      unit: 'cm²',
      explanation: '직사각형의 넓이 = (가로) × (세로) = $12 \\times 8 = 96\\text{cm}^2$',
      hints: ['직사각형의 넓이 구하는 공식을 써 보세요.']
    },
    {
      id: 'p4',
      grade: 6,
      category: '비와 비율',
      title: '백분율 구하기',
      question: '전체 $50$개의 사과 중에서 빨간 사과가 $18$개 있습니다. 빨간 사과는 전체 사과의 몇 $\%$ 인지 구하고 풀이 과정을 적으세요.',
      standardAnswer: '36',
      unit: '%',
      explanation: '비율 = $\\frac{18}{50} = 0.36$, 백분율 = $0.36 \\times 100 = 36\\%$',
      hints: ['(부분) ÷ (전체) × 100 공식을 사용해 보세요.']
    }
  ]
};

let inMemoryDB = null;

function readDB() {
  if (inMemoryDB) return inMemoryDB;
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      inMemoryDB = defaultData;
      return defaultData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    inMemoryDB = JSON.parse(data);
    return inMemoryDB;
  } catch (err) {
    inMemoryDB = defaultData;
    return defaultData;
  }
}

function writeDB(data) {
  inMemoryDB = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {}
}

app.get('/api/submissions', (req, res) => {
  const { studentId } = req.query;
  const db = readDB();
  let subs = db.submissions;
  if (studentId) {
    subs = subs.filter((s) => s.studentId === studentId);
  }
  return res.json({ submissions: subs });
});

app.post('/api/auth/register', (req, res) => {
  const { school, grade, classGroup, name, password } = req.body;
  if (!school || !grade || !classGroup || !name || !password) {
    return res.status(400).json({ error: '학교, 학년, 반, 이름, 비밀번호를 모두 입력해 주세요.' });
  }

  const db = readDB();
  const normSchool = school.trim();
  const normName = name.trim();
  const numGrade = Number(grade);
  const numClass = Number(classGroup);

  const existing = db.students.find(
    (s) => s.school === normSchool && s.grade === numGrade && s.classGroup === numClass && s.name === normName
  );

  if (existing) {
    return res.status(400).json({ error: '이미 동일한 정보로 가입된 학생이 존재합니다. 로그인해 주세요.' });
  }

  const newStudent = {
    id: 'st_' + Date.now(),
    school: normSchool,
    grade: numGrade,
    classGroup: numClass,
    name: normName,
    password: password.trim(),
    stars: 0,
    totalSolved: 0,
    correctCount: 0,
    createdAt: new Date().toISOString()
  };

  db.students.push(newStudent);
  writeDB(db);

  return res.json({ success: true, student: newStudent });
});

app.post('/api/auth/login', (req, res) => {
  const { school, grade, classGroup, name, password } = req.body;
  if (!school || !name || !grade) {
    return res.status(400).json({ error: '초등학교명, 이름, 학년을 입력해 주세요.' });
  }

  const db = readDB();
  const normSchool = school.trim();
  const normName = name.trim();
  const numGrade = Number(grade);
  const numClass = classGroup ? Number(classGroup) : null;

  let student = db.students.find(
    (s) => s.school === normSchool && s.name === normName && s.grade === numGrade && (!numClass || s.classGroup === numClass)
  );

  if (student) {
    if (student.password && password && student.password !== password.trim()) {
      return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
    }
  } else {
    student = {
      id: 'st_' + Date.now(),
      school: normSchool,
      grade: numGrade,
      classGroup: numClass || 1,
      name: normName,
      password: password ? password.trim() : '0000',
      stars: 0,
      totalSolved: 0,
      correctCount: 0,
      createdAt: new Date().toISOString()
    };
    db.students.push(student);
    writeDB(db);
  }

  return res.json({ success: true, student });
});

app.get('/api/problems', (req, res) => {
  const db = readDB();
  const { grade } = req.query;
  let problems = db.problems;
  if (grade) {
    problems = problems.filter((p) => Number(p.grade) === Number(grade));
  }
  return res.json({ problems });
});

app.post('/api/problems', (req, res) => {
  const { title, grade, category, questionText, problemImage, standardAnswer, explanation } = req.body;

  if (!title || (!questionText && !problemImage)) {
    return res.status(400).json({ error: '문제 제목과 지문(또는 이미지)을 입력해 주세요.' });
  }

  const db = readDB();
  const newProblem = {
    id: 'custom_p_' + Date.now(),
    title: title.trim(),
    grade: Number(grade) || 4,
    category: category ? category.trim() : '직접 업로드 문제',
    question: questionText ? questionText.trim() : '아래 사진/이미지 문제를 읽고 풀이해 보세요.',
    problemImage: problemImage || null,
    standardAnswer: standardAnswer ? standardAnswer.trim() : '자유풀이',
    explanation: explanation ? explanation.trim() : '선생님이 직접 등록하신 문제입니다.',
    hints: ['문제를 꼼꼼히 읽고 풀이 과정을 적어보세요.'],
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  db.problems.unshift(newProblem);
  writeDB(db);

  return res.json({ success: true, problem: newProblem });
});

// Gemini AI 멀티모달 채점 API
app.post('/api/evaluate', async (req, res) => {
  const { studentId, problemId, submissionType, userSolutionText, canvasImage } = req.body;

  if (!studentId || !problemId) {
    return res.status(400).json({ error: '필수 제출 데이터가 누락되었습니다.' });
  }

  const db = readDB();
  const student = db.students.find((s) => s.id === studentId);
  const problem = db.problems.find((p) => p.id === problemId);

  if (!student || !problem) {
    return res.status(404).json({ error: '학생 또는 문제 정보를 찾을 수 없습니다.' });
  }

  let evaluationResult = null;
  let engineUsed = 'Fallback Engine';
  let apiErrorLog = null;

  const targetModels = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];

  if (aiClient && apiKey) {
    const promptText = `
당신은 대한민국 초등학교 전문 수학 교육 AI 튜터입니다.
학생(${student.name}, ${student.grade}학년)의 수학 문제 풀이를 정밀 채점하고 친절한 피드백을 제공하세요.

[문제 정보]
- 제목: ${problem.title} (${problem.category})
- 학년: ${problem.grade}학년
- 문제 지문: ${problem.question}
- 표준 정답: ${problem.standardAnswer}
- 표준 해설: ${problem.explanation}

[학생 제출 내용]
- 제출 형식: ${submissionType === 'canvas' ? '손글씨 캔버스 이미지' : '수식/텍스트'}
- 텍스트 입력: ${userSolutionText || '(이미지/캔버스 확인)'}

[응답 포맷 (JSON 전용)]
{
  "isCorrect": true/false,
  "score": 0~100 사이의 점수,
  "stepAnalysis": [
    { "step": 1, "text": "문제 조건 및 수식 파악", "status": "pass"/"fail", "note": "설명..." },
    { "step": 2, "text": "계산 과정 및 공식 적용", "status": "pass"/"fail", "note": "설명..." },
    { "step": 3, "text": "최종 답안 도출", "status": "pass"/"fail", "note": "설명..." }
  ],
  "errorConcept": "틀린 경우 핵심 원인 (맞았으면 null)",
  "praise": "친절한 칭찬 문구",
  "feedback": "구체적인 피드백"
}
`;

    const contents = [promptText];

    if (submissionType === 'canvas' && canvasImage && canvasImage.startsWith('data:image')) {
      const base64Data = canvasImage.replace(/^data:image\/\w+;base64,/, '');
      contents.push({ inlineData: { mimeType: 'image/png', data: base64Data } });
    }

    if (problem.problemImage && problem.problemImage.startsWith('data:image')) {
      const pBase64 = problem.problemImage.replace(/^data:image\/\w+;base64,/, '');
      contents.push({ inlineData: { mimeType: 'image/png', data: pBase64 } });
    }

    for (const modelName of targetModels) {
      try {
        console.log(`🤖 Gemini AI [${modelName}] 호출 중...`);
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: contents,
          config: { responseMimeType: 'application/json' }
        });

        const textRes = response.text;
        evaluationResult = JSON.parse(textRes);
        engineUsed = `Gemini AI (${modelName})`;
        console.log(`✅ Gemini AI [${modelName}] 정밀 채점 완료!`);
        break;
      } catch (aiErr) {
        console.warn(`⚠️ 모델 [${modelName}] 에러:`, aiErr.message);
        apiErrorLog = `[${modelName}]: ${aiErr.message}`;
      }
    }
  } else {
    apiErrorLog = 'GEMINI_API_KEY가 등록되지 않았습니다.';
  }

  if (!evaluationResult) {
    const solText = (userSolutionText || '').toLowerCase().trim();
    const stdAns = (problem.standardAnswer || '').toLowerCase().trim();
    const isCorrect = solText.includes(stdAns);
    const score = isCorrect ? 100 : solText.length > 0 ? 40 : 10;

    evaluationResult = {
      isCorrect,
      score,
      stepAnalysis: [
        { step: 1, text: '문제 조건 및 수식 파악', status: 'pass', note: '문제 조건 파악' },
        { step: 2, text: '계산 과정 및 공식 적용', status: isCorrect ? 'pass' : 'fail', note: isCorrect ? '계산 과정 완벽' : '계산 검토 필요' },
        { step: 3, text: '최종 답안 도출', status: isCorrect ? 'pass' : 'fail', note: isCorrect ? `정답(${problem.standardAnswer}) 도출` : '정답과 다름' }
      ],
      errorConcept: isCorrect ? null : `${problem.category} 기본 원리 점검`,
      praise: isCorrect ? `🎉 잘했습니다, ${student.name} 학생!` : `👏 노력하는 모습이 아주 멋져요!`,
      feedback: isCorrect ? `수식 이해력이 훌륭합니다.` : `참고 해설: ${problem.explanation}`
    };
  }

  const otherProblems = db.problems.filter((p) => p.id !== problem.id);
  const recommendedProblem = otherProblems.length > 0 ? otherProblems[Math.floor(Math.random() * otherProblems.length)] : null;

  const submission = {
    id: 'sub_' + Date.now(),
    studentId: student.id,
    studentSchool: student.school || '초등학교',
    studentName: student.name || '익명 학생',
    studentGrade: student.grade || 4,
    studentClassGroup: student.classGroup || 1,
    problemId: problem.id,
    problemTitle: problem.title,
    category: problem.category,
    grade: problem.grade,
    submissionType,
    userSolutionText: userSolutionText || '',
    canvasImage: canvasImage || null,
    isCorrect: evaluationResult.isCorrect,
    score: evaluationResult.score,
    stepAnalysis: evaluationResult.stepAnalysis,
    errorConcept: evaluationResult.errorConcept,
    praise: evaluationResult.praise,
    feedback: evaluationResult.feedback,
    engineUsed,
    apiErrorLog,
    recommendedProblem,
    createdAt: new Date().toISOString()
  };

  student.totalSolved += 1;
  if (evaluationResult.isCorrect) {
    student.correctCount += 1;
    student.stars += 10;
  } else {
    student.stars += 2;
  }

  db.submissions.unshift(submission);
  writeDB(db);

  return res.json({
    success: true,
    submission,
    updatedStudent: student
  });
});

app.delete('/api/admin/submissions/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const initialLength = db.submissions.length;

  db.submissions = db.submissions.filter((s) => s.id !== id);
  writeDB(db);

  return res.json({ success: true, deleted: db.submissions.length < initialLength });
});

app.delete('/api/admin/submissions', (req, res) => {
  const db = readDB();
  db.submissions = [];
  writeDB(db);
  return res.json({ success: true });
});

function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

app.get('/api/admin/stats', (req, res) => {
  const { password } = req.query;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '교사 인증 비밀번호가 올바르지 않습니다.' });
  }

  const db = readDB();
  const totalStudents = db.students.length;
  const totalSubmissions = db.submissions.length;
  const correctSubmissions = db.submissions.filter((s) => s.isCorrect).length;
  const geminiCount = db.submissions.filter((s) => (s.engineUsed || '').includes('Gemini')).length;
  const fallbackCount = db.submissions.filter((s) => (s.engineUsed || '').includes('Fallback')).length;

  const schoolStats = {};
  db.students.forEach((s) => {
    const sch = s.school || '초등학교';
    schoolStats[sch] = (schoolStats[sch] || 0) + 1;
  });

  return res.json({
    hasApiKey: !!apiKey,
    currentApiKeyPreview: apiKey ? `${apiKey.substring(0, 6)}...` : '없음',
    totalStudents,
    totalSubmissions,
    correctSubmissions,
    accuracyRate: totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0,
    engineStats: {
      gemini: geminiCount,
      fallback: fallbackCount
    },
    schoolStats,
    students: db.students,
    problems: db.problems,
    recentSubmissions: db.submissions.slice(0, 50)
  });
});

// 👩‍🏫 교사 대시보드
app.all('/admin', (req, res) => {
  const reqPassword = req.method === 'POST' ? req.body.password : req.query.password;
  const isAuth = reqPassword === ADMIN_PASSWORD;
  const db = readDB();

  if (!isAuth) {
    const authHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>MathAI 교사 대시보드 보안 접속</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f8fafc; font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
    <div class="text-center space-y-2">
      <div class="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center mx-auto text-2xl">
        🔒
      </div>
      <h2 class="text-2xl font-black text-white">교사 전용 대시보드 접속</h2>
      <p class="text-xs text-slate-400">교사 전용 대시보드에 접근하려면 비밀번호를 입력하세요.</p>
    </div>

    ${reqPassword && reqPassword !== ADMIN_PASSWORD ? `
      <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
        ❌ 비밀번호가 올바르지 않습니다.
      </div>
    ` : ''}

    <form action="/admin" method="POST" class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-300 mb-1.5 uppercase">교사 인증 비밀번호</label>
        <input
          type="password"
          name="password"
          placeholder="비밀번호 입력"
          class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm tracking-widest text-center"
          required
          autofocus
        />
      </div>

      <button
        type="submit"
        class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition"
      >
        대시보드 접속하기 ➔
      </button>
    </form>
  </div>
</body>
</html>
    `;
    return res.send(authHtml);
  }

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>MathAI 교사 통합 대시보드</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body class="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
    <div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
          🔒 교사 인증됨
        </span>
      </div>
      <h1 class="text-3xl font-black text-white mt-2">MathAI 교사 통합 대시보드</h1>
      <p class="text-xs text-slate-400 mt-1">백엔드 DB에 영구 저장된 학생들의 채점 이력, 정답률 및 Gemini AI 상태를 모니터링합니다.</p>
    </div>
    <div class="flex items-center gap-3">
      <a href="http://localhost:5173" target="_blank" class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30">
        학생 프론트엔드 이동 ➔
      </a>
      <a href="/admin" class="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
        🔒 잠그기
      </a>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
      <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">등록 학생 수</div>
      <div class="text-3xl font-black text-white mt-1">${db.students.length} <span class="text-sm font-normal text-slate-500">명</span></div>
    </div>
    <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
      <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">총 제출 풀이 수</div>
      <div class="text-3xl font-black text-purple-400 mt-1">${db.submissions.length} <span class="text-sm font-normal text-slate-500">건</span></div>
    </div>
    <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
      <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Gemini API 키 상태</div>
      <div class="text-lg font-bold ${apiKey ? 'text-emerald-400' : 'text-rose-400'} mt-1 flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full ${apiKey ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}"></span>
        ${apiKey ? '정상 등록됨 (' + apiKey.substring(0, 6) + '...)' : '미등록'}
      </div>
    </div>
    <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
      <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">등록 문제 수</div>
      <div class="text-3xl font-black text-indigo-400 mt-1">${db.problems.length} <span class="text-sm font-normal text-slate-500">개</span></div>
    </div>
  </div>

  <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-bold text-white">최근 풀이 제출 이력 (DB 실시간 출력)</h3>
        <p class="text-xs text-slate-400">개별 이력 삭제 및 전체 제출 기록 초기화가 가능합니다.</p>
      </div>
      ${db.submissions.length > 0 ? `
        <button
          onclick="deleteAllSubmissions()"
          class="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          🗑️ 전체 이력 초기화 (삭제)
        </button>
      ` : ''}
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
            <th class="py-3 px-4">학생명</th>
            <th class="py-3 px-4">학교 / 학년 / 반</th>
            <th class="py-3 px-4">제출 문제</th>
            <th class="py-3 px-4">채점 엔진</th>
            <th class="py-3 px-4">점수</th>
            <th class="py-3 px-4">제출 일시</th>
            <th class="py-3 px-4 text-right">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          ${db.submissions.length === 0 ? `
            <tr><td colSpan="7" class="py-8 text-center text-slate-500">제출된 이력이 없습니다.</td></tr>
          ` : db.submissions.slice(0, 50).map(s => `
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-3.5 px-4 font-bold text-white">${s.studentName || '익명 학생'}</td>
              <td class="py-3.5 px-4 text-slate-400">${s.studentSchool || '초등학교'} (${s.studentGrade || 4}학년 ${s.studentClassGroup ? s.studentClassGroup + '반' : ''})</td>
              <td class="py-3.5 px-4 text-indigo-300 font-semibold">${s.problemTitle}</td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${(s.engineUsed || '').includes('Gemini') ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
                  ${s.engineUsed || 'Fallback Engine'}
                </span>
              </td>
              <td class="py-3.5 px-4 font-black text-sm ${s.isCorrect ? 'text-emerald-400' : 'text-rose-400'}">${s.score}점</td>
              <td class="py-3.5 px-4 text-slate-300 font-mono text-[11px]">${formatDate(s.createdAt)}</td>
              <td class="py-3.5 px-4 text-right">
                <button
                  onclick="deleteSingleSubmission('${s.id}')"
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition text-[11px]"
                >
                  🗑️ 삭제
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function deleteSingleSubmission(id) {
      if (!confirm('이 제출 이력을 정말 삭제하시겠습니까?')) return;
      try {
        const res = await fetch('/api/admin/submissions/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          location.reload();
        } else {
          alert('삭제에 실패했습니다.');
        }
      } catch (e) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }

    async function deleteAllSubmissions() {
      if (!confirm('경고: 모든 학생의 제출 이력이 완전히 삭제됩니다! 정말 초기화하시겠습니까?')) return;
      try {
        const res = await fetch('/api/admin/submissions', { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          location.reload();
        } else {
          alert('초기화 중 오류가 발생했습니다.');
        }
      } catch (e) {
        alert('초기화 중 오류가 발생했습니다.');
      }
    }
  </script>
</body>
</html>
  `;
  res.send(html);
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`✅ 수학 평가 AI 백엔드 서버가 실행되었습니다: http://localhost:${PORT}`);
    console.log(`💻 교사 통합 대시보드 바로가기: http://localhost:${PORT}/admin`);
  });
}

module.exports = app;
