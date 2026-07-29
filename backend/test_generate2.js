const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

async function testGenerate2() {
  // test gemini-2.0-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "수학 문제: 1+1=? 간단히 숫자로 정답만 대답해줘." }] }]
    })
  });

  console.log('Gemini 2.0 Status:', res.status);
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

testGenerate2();
