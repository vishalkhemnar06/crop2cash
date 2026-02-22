// testGroq.js — Test your Groq API key
// Run: node testGroq.js
require("dotenv").config();

const Groq = require("groq-sdk");

async function main() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY not found in .env file!");
    console.error("   Add this line to your .env: GROQ_API_KEY=your_key_here");
    process.exit(1);
  }

  console.log("✅ API Key found:", apiKey.slice(0, 8) + "...\n");

  const groq = new Groq({ apiKey });

  const models = [
    "llama-3.3-70b-versatile",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
  ];

  let workingModel = null;

  for (const modelName of models) {
    console.log(`🔄 Testing: ${modelName} ...`);
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: "Say OK and nothing else." }],
        model: modelName,
        max_tokens: 10,
      });
      const text = response.choices[0]?.message?.content?.trim();
      console.log(`✅ ${modelName} WORKS! Response: ${text}\n`);
      if (!workingModel) workingModel = modelName;
    } catch (e) {
      console.error(`❌ ${modelName} FAILED: ${e.message.slice(0, 100)}\n`);
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (workingModel) {
    console.log(`🎉 Your Groq key works! Best model: "${workingModel}"`);
    console.log(`   Your aiController.js is already configured to use this.`);
    console.log(`   Start your server: node server.js`);
  } else {
    console.log("⚠️  No working model found. Check your GROQ_API_KEY in .env");
    console.log("   Get a free key at: https://console.groq.com");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main();