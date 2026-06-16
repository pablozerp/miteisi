require('dotenv').config();
const { generateComparativeRoadmap } = require('./src/services/geminiService');

async function test() {
  try {
    console.log("Testing generateComparativeRoadmap...");
    const comp = await generateComparativeRoadmap('Java', 'Kotlin');
    console.log("Comparative OK:", comp.langA, comp.langB, comp.codeExamples?.length, "examples");

  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
