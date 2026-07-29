const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

async function testGemini() {
  console.log('Testing key:', apiKey);
  
  // 1. Direct REST fetch test to Google Gemini API
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    console.log('REST Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('REST Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('REST Error:', err);
  }
}

testGemini();
