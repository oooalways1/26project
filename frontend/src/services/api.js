const API_BASE_URL = import.meta.env.PROD
  ? ''
  : 'http://localhost:5000';

export async function loginStudent(credentials) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '로그인에 실패했습니다.');
  }
  return data.student;
}

export async function registerStudent(registrationData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '회원가입에 실패했습니다.');
  }
  return data.student;
}

export async function fetchProblems(grade = null) {
  const url = grade
    ? `${API_BASE_URL}/api/problems?grade=${grade}`
    : `${API_BASE_URL}/api/problems`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '문제 목록을 가져오는데 실패했습니다.');
  }
  return data.problems;
}

export async function generateAiProblem(grade, category = null) {
  const res = await fetch(`${API_BASE_URL}/api/problems/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade, category })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'AI 문제 생성에 실패했습니다.');
  }
  return data.problem;
}

export async function fetchSubmissions(studentId = null) {
  try {
    const url = studentId
      ? `${API_BASE_URL}/api/submissions?studentId=${studentId}`
      : `${API_BASE_URL}/api/submissions`;
    const res = await fetch(url);
    const data = await res.json();
    return data.submissions || [];
  } catch (e) {
    return [];
  }
}

export async function uploadProblem(problemData) {
  const res = await fetch(`${API_BASE_URL}/api/problems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(problemData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '문제 업로드에 실패했습니다.');
  }
  return data.problem;
}

export async function evaluateSolution(payload) {
  const res = await fetch(`${API_BASE_URL}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '채점에 실패했습니다.');
  }
  return data;
}

export async function fetchAdminStats(password) {
  const res = await fetch(`${API_BASE_URL}/api/admin/stats?password=${encodeURIComponent(password)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '대시보드 통계를 가져오는데 실패했습니다.');
  }
  return data;
}
