const API_BASE = '/api';

export async function loginStudent(school, name, grade) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ school, name, grade })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '로그인에 실패했습니다.');
  }
  return await response.json();
}

export async function fetchProblems(grade) {
  const url = grade ? `${API_BASE}/problems?grade=${grade}` : `${API_BASE}/problems`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('문제 목록을 가져오지 못했습니다.');
  }
  return await response.json();
}

export async function uploadProblem(payload) {
  const response = await fetch(`${API_BASE}/problems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '문제 업로드에 실패했습니다.');
  }
  return await response.json();
}

export async function evaluateSubmission(payload) {
  const response = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '채점 평가 중 오류가 발생했습니다.');
  }
  return await response.json();
}

export async function fetchSubmissions(studentId) {
  const response = await fetch(`${API_BASE}/submissions/student/${studentId}`);
  if (!response.ok) {
    throw new Error('제출 이력을 가져오지 못했습니다.');
  }
  return await response.json();
}

export async function fetchAdminStats() {
  const response = await fetch(`${API_BASE}/admin/stats`);
  if (!response.ok) {
    throw new Error('교사 대시보드 통계를 불러오지 못했습니다.');
  }
  return await response.json();
}
