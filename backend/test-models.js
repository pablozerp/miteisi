require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function testModel(modelName) {
  try {
    const res = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: "Genera un JSON simple: {'ok': true}" }]
    });
    console.log(`[${modelName}] OK:`, res.choices[0].message.content);
  } catch (e) {
    console.error(`[${modelName}] Error:`, e.message);
  }
}

async function run() {
  await testModel("google/gemini-2.0-flash-lite-preview-02-05:free");
  await testModel("meta-llama/llama-3.3-70b-instruct:free");
  await testModel("openrouter/free");
}

run();
