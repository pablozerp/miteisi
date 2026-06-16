require('dotenv').config();
const { generateRoadmapWithGemini } = require('./src/services/geminiService');

async function test() {
  try {
    console.log("Testing generateRoadmapWithGemini...");
    const roadmap = await generateRoadmapWithGemini('Python');
    console.log("Roadmap OK:", roadmap?.length, "nodes");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
