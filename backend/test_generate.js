const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

async function testGenerate() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "수학 문제: 1+1=? 간단히 숫자로 정답만 대답해줘." }] }]
    })
  });

  console.log('Generate Content Status:', res.status);
  const data = await res.json();
  console.log('AI Response:', data.candidates[0].content.parts[0].text);
}

testGenerate();
