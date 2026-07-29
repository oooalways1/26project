const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

async function testGenerate3() {
  const models = ['gemini-2.0-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
  
  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "수학 1+1=?" }] }]
        })
      });
      console.log(`Model [${m}] Status:`, res.status);
      if (res.status === 200) {
        const data = await res.json();
        console.log(`✅ Model [${m}] Success:`, data.candidates[0].content.parts[0].text);
        break;
      } else {
        const err = await res.json();
        console.log(`❌ Model [${m}] Error:`, err.error.message.substring(0, 120));
      }
    } catch (e) {
      console.error(e);
    }
  }
}

testGenerate3();
