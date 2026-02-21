// ✅ Using Groq API — Fast, free, reliable
// Install: npm install groq-sdk
const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.error("❌ FATAL ERROR: GROQ_API_KEY is missing in .env file");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.analyzeFarm = async (req, res) => {
  try {
    console.log("🤖 AI Request Received...");
    const { farmProfile, location } = req.body;

    if (!farmProfile || !location) {
      return res.status(400).json({ message: "farmProfile and location are required" });
    }

    const prompt = `
      You are an expert agronomist AI for 'Crop2Cash'. Analyze the following farm data:
      - Location: ${location}
      - Crop: ${farmProfile.cropType || "Unknown"}
      - Land Area: ${farmProfile.landArea || 0} acres
      - Soil: ${farmProfile.soilType || "Unknown"}
      - Equipment: ${farmProfile.equipment || "None"}
      - Budget: ${farmProfile.budgetRange || "Low"}

      Return ONLY a raw JSON object. No markdown, no backticks, no explanation. 
      Use this exact structure:
      {
        "estimatedResidue": "5.2",
        "biomassValue": "Rs 20,000",
        "bestMethod": "Composting",
        "aiReason": "Best suits low budget with available equipment and soil type.",
        "profitEstimation": "Rs 15,000",
        "riskLevel": "Low",
        "roiTable": [
          {"method": "Composting", "cost": "Rs 2,000", "income": "Rs 17,000", "profit": "Rs 15,000"},
          {"method": "Biochar", "cost": "Rs 5,000", "income": "Rs 18,000", "profit": "Rs 13,000"},
          {"method": "Pellets", "cost": "Rs 8,000", "income": "Rs 22,000", "profit": "Rs 14,000"}
        ],
        "impact": {
          "co2Reduced": "2.1",
          "burningPrevented": "5.2",
          "airQuality": "High"
        }
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert agronomist AI. Always respond with raw JSON only — no markdown, no backticks, no extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile", // Best free model on Groq
      temperature: 0.3, // Lower = more consistent JSON output
      max_tokens: 1024,
    });

    let text = chatCompletion.choices[0]?.message?.content || "";
    console.log("✅ AI Response received from Groq");

    // Strip any markdown just in case
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON Parse Error. Raw AI Response:", text);
      return res.status(500).json({
        message: "AI returned invalid JSON. Please try again.",
        rawResponse: text,
      });
    }

    res.json(data);

  } catch (error) {
    console.error("❌ AI Controller Error:", error);
    res.status(500).json({
      message: "AI Analysis Failed",
      error: error.message,
    });
  }
};