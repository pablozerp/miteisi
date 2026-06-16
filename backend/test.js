require('dotenv').config();
const { generateRoadmapWithGemini, generateComparativeRoadmap } = require('./src/services/geminiService');

async function test() {
  try {
    console.log("Testing generateRoadmapWithGemini...");
    const roadmap = await generateRoadmapWithGemini('Python');
    console.log("Roadmap OK:", roadmap.length, "nodes");

    console.log("Testing generateComparativeRoadmap...");
    const comp = await generateComparativeRoadmap('Java', 'Kotlin');
    console.log("Comparative OK:", comp.langA, comp.langB, comp.codeExamples?.length, "examples");

  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
