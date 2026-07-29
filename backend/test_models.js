const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  console.log('ListModels Status:', res.status);
  const data = await res.json();
  if (data.models) {
    console.log('Available Models:', data.models.map(m => m.name));
  } else {
    console.log('Response:', JSON.stringify(data, null, 2));
  }
}

listModels();
