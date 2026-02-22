const Groq = require("groq-sdk");
const fs = require("fs");

if (!process.env.GROQ_API_KEY) {
  console.error("❌ FATAL ERROR: GROQ_API_KEY is missing in .env file");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────
// Helper: parse Rs string to number
// ─────────────────────────────────────────────
const parseRs = (str) => parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;

// ─────────────────────────────────────────────
// 1. Full ROI Farm Analysis
// ─────────────────────────────────────────────
exports.analyzeFarm = async (req, res) => {
  try {
    console.log("🤖 AI Farm Analysis Request Received...");
    const { farmProfile, location } = req.body;

    if (!farmProfile || !location) {
      return res.status(400).json({ message: "farmProfile and location are required" });
    }

    const cropName = farmProfile.cropType === "Other"
      ? (farmProfile.customCropType || "Unknown Crop")
      : (farmProfile.cropType || "Unknown Crop");

    const equipmentArr = Array.isArray(farmProfile.equipment) ? farmProfile.equipment : [];
    const allEquipment = farmProfile.customEquipment
      ? [...equipmentArr, farmProfile.customEquipment]
      : equipmentArr;
    const equipmentText = allEquipment.length > 0 ? allEquipment.join(", ") : "None";

    const budgetText =
      farmProfile.budgetRange === "Custom"
        ? farmProfile.customBudget
          ? `Rs ${Number(farmProfile.customBudget).toLocaleString("en-IN")}`
          : "Not specified"
        : farmProfile.budgetRange || "Low (< Rs 10,000)";

    const prompt = `
You are an expert agronomist AI for 'Crop2Cash', an Indian agri-tech platform solving stubble burning by recommending profitable residue alternatives.

FARMER PROFILE:
- Location: ${location}
- Crop: ${cropName}
- Land Area: ${farmProfile.landArea || 0.1} acres
- Soil Type: ${farmProfile.soilType || "Unknown"}
- Irrigation: ${farmProfile.irrigationType || "Unknown"}
- Season: ${farmProfile.season || "Unknown"}
- Equipment: ${equipmentText}
- Budget: ${budgetText}

YOUR TASK:
Generate a COMPREHENSIVE analysis with AT LEAST 8 different crop residue management methods. Include ALL of the following categories where applicable:
1. Thermal / Energy: Biochar Production, Pellet Manufacturing, Briquette Making, Gasification
2. Agricultural: Composting, Direct Soil Incorporation, Mulching / Surface Cover, Vermicomposting
3. Commercial: Animal Feed / Baling, Mushroom Cultivation on Straw, Paper/Cardboard Industry Supply
4. Advanced: Biogas / Anaerobic Digestion, Biofuel Ethanol Production

For each method, use real 2024 Indian market prices for ${cropName} residue in ${location}.

CALCULATION RULES (apply strictly):
- profit = income - cost (plain numbers, no commas, no Rs prefix)
- roi = round((profit / cost) * 100)
- paybackMonths = round(cost / (income / 12))
- efficiency = round((income / cost) * 10) / 10
- Rank by ROI descending; rank 1 = best
- feasibility: "High" if doable with farmer's current equipment+budget, "Medium" if needs modest extra investment, "Low" if not feasible for this farmer
- Only include methods that make economic sense for THIS farmer's crop, land size, and region

SOIL DAMAGE DATA: Provide accurate data about what happens when farmers burn residue instead of using alternatives. Use real agricultural research data.

Return ONLY raw JSON — no markdown, no backticks, no extra text:
{
  "estimatedResidue": "5.2",
  "biomassValue": "20000",
  "bestMethod": "Composting",
  "aiReason": "Short explanation of why this is best for THIS farmer specifically",
  "profitEstimation": "18000",
  "riskLevel": "Low",
  "breakEvenMonths": "2",
  "investmentEfficiency": "7.0",
  "soilDamage": {
    "fertilityLoss": "30-40% reduction in organic matter",
    "bacteriaKilledPercent": "85",
    "nutrientLoss": "Loses N, P, K, S — worth Rs 4,000-8,000 per acre",
    "recoveryYears": "3",
    "description": "Burning destroys beneficial mycorrhizal fungi and nitrogen-fixing bacteria. Soil temperature rises to 200-300°C killing all microbial life in top 2cm. Carbon stored in soil is released as CO2."
  },
  "nearbyBuyers": [
    { "type": "Composting Unit", "distance": "12 km", "contact": "Contact local agriculture dept", "buyingPrice": "Rs 4,000-6,000/ton" },
    { "type": "Cattle Feed Aggregator", "distance": "8 km", "contact": "Contact local mandi", "buyingPrice": "Rs 2,500-3,500/ton" },
    { "type": "Biogas Plant", "distance": "20 km", "contact": "Contact district energy office", "buyingPrice": "Rs 1,500-2,500/ton" }
  ],
  "roiTable": [
    {
      "method": "Composting",
      "category": "Agricultural",
      "cost": "3000",
      "income": "21000",
      "profit": "18000",
      "roi": "600",
      "paybackMonths": "2",
      "efficiency": "7.0",
      "feasibility": "High",
      "rank": 1,
      "setupDetails": "Use tractor + rotavator. Mix residue with cow dung. 45-day cycle.",
      "hindiName": "खाद बनाना"
    },
    {
      "method": "Animal Feed / Baling",
      "category": "Commercial",
      "cost": "1500",
      "income": "10000",
      "profit": "8500",
      "roi": "567",
      "paybackMonths": "2",
      "efficiency": "6.7",
      "feasibility": "High",
      "rank": 2,
      "setupDetails": "Baler required. Sell to dairy farms and gaushalas directly.",
      "hindiName": "पशु चारा / बेलिंग"
    },
    {
      "method": "Mushroom Cultivation",
      "category": "Agricultural",
      "cost": "5000",
      "income": "35000",
      "profit": "30000",
      "roi": "500",
      "paybackMonths": "2",
      "efficiency": "7.0",
      "feasibility": "Medium",
      "rank": 3,
      "setupDetails": "Use straw as substrate for oyster mushrooms. 30-day crop cycle. High returns.",
      "hindiName": "मशरूम की खेती"
    },
    {
      "method": "Biochar Production",
      "category": "Thermal/Energy",
      "cost": "5000",
      "income": "18000",
      "profit": "13000",
      "roi": "260",
      "paybackMonths": "3",
      "efficiency": "3.6",
      "feasibility": "Medium",
      "rank": 4,
      "setupDetails": "Pyrolysis kiln needed. Biochar sold to horticulture and organic farms.",
      "hindiName": "बायोचार उत्पादन"
    },
    {
      "method": "Pellet Manufacturing",
      "category": "Thermal/Energy",
      "cost": "8000",
      "income": "22000",
      "profit": "14000",
      "roi": "175",
      "paybackMonths": "4",
      "efficiency": "2.75",
      "feasibility": "Medium",
      "rank": 5,
      "setupDetails": "Pelletizer machine needed (Rs 40,000-80,000 rental available). Sell to industrial boilers.",
      "hindiName": "पेलेट निर्माण"
    },
    {
      "method": "Briquette Making",
      "category": "Thermal/Energy",
      "cost": "4000",
      "income": "12000",
      "profit": "8000",
      "roi": "200",
      "paybackMonths": "4",
      "efficiency": "3.0",
      "feasibility": "Medium",
      "rank": 6,
      "setupDetails": "Hydraulic briquette press. Briquettes used as fuel in brick kilns and industries.",
      "hindiName": "ब्रिकेट बनाना"
    },
    {
      "method": "Biogas / Anaerobic Digestion",
      "category": "Thermal/Energy",
      "cost": "10000",
      "income": "25000",
      "profit": "15000",
      "roi": "150",
      "paybackMonths": "5",
      "efficiency": "2.5",
      "feasibility": "Low",
      "rank": 7,
      "setupDetails": "Community biogas plant. Generates gas for cooking + slurry fertilizer.",
      "hindiName": "बायोगैस उत्पादन"
    },
    {
      "method": "Direct Soil Incorporation",
      "category": "Agricultural",
      "cost": "2000",
      "income": "5000",
      "profit": "3000",
      "roi": "150",
      "paybackMonths": "5",
      "efficiency": "2.5",
      "feasibility": "High",
      "rank": 8,
      "setupDetails": "Disc harrow or rotavator. Mix into soil pre-sowing. Saves fertilizer cost next season.",
      "hindiName": "मिट्टी में मिलाना"
    },
    {
      "method": "Mulching / Surface Cover",
      "category": "Agricultural",
      "cost": "500",
      "income": "3000",
      "profit": "2500",
      "roi": "400",
      "paybackMonths": "2",
      "efficiency": "6.0",
      "feasibility": "High",
      "rank": 9,
      "setupDetails": "Spread residue between crop rows. Reduces irrigation need, prevents weed growth.",
      "hindiName": "मल्चिंग"
    },
    {
      "method": "Vermicomposting",
      "category": "Agricultural",
      "cost": "3500",
      "income": "15000",
      "profit": "11500",
      "roi": "329",
      "paybackMonths": "3",
      "efficiency": "4.3",
      "feasibility": "Medium",
      "rank": 10,
      "setupDetails": "Earthworm-based composting. High-value vermicompost sold to organic farms and nurseries.",
      "hindiName": "केंचुआ खाद"
    }
  ],
  "impact": {
    "co2Reduced": "2.1",
    "burningPrevented": "5.2",
    "airQuality": "High",
    "householdsHelped": "120"
  },
  "summary": {
    "totalAlternatives": "10",
    "bestROI": "600",
    "savingsVsBurning": "18000",
    "worstOption": "Burning"
  }
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert agronomist AI for Indian farmers solving stubble burning. Always respond with raw JSON only — no markdown, no backticks, no extra text whatsoever. Generate at least 8-10 different methods.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 4096,
    });

    let text = chatCompletion.choices[0]?.message?.content || "";
    console.log("✅ AI Farm Analysis Response received");
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON Parse Error. Raw AI Response:", text);
      return res
        .status(500)
        .json({ message: "AI returned invalid JSON. Please try again.", rawResponse: text });
    }

    // ✅ Backend recalculates all ROI math to guarantee accuracy
    if (Array.isArray(data.roiTable)) {
      data.roiTable = data.roiTable.map((row) => {
        const cost = parseRs(row.cost);
        const income = parseRs(row.income);
        const profit = income - cost;
        const roi = cost > 0 ? Math.round((profit / cost) * 100) : 0;
        const payback = income > 0 ? Math.round(cost / (income / 12)) : 0;
        const eff = cost > 0 ? Math.round((income / cost) * 10) / 10 : 0;
        return { ...row, profit, roi, paybackMonths: payback, efficiency: eff };
      });

      // Sort by ROI descending, re-assign ranks
      data.roiTable.sort((a, b) => b.roi - a.roi);
      data.roiTable = data.roiTable.map((row, i) => ({ ...row, rank: i + 1 }));

      // Set best method from rank 1
      if (data.roiTable[0]) {
        data.bestMethod = data.roiTable[0].method;
        data.profitEstimation = data.roiTable[0].profit;
        data.breakEvenMonths = String(data.roiTable[0].paybackMonths);
        data.investmentEfficiency = String(data.roiTable[0].efficiency);
        if (data.summary) {
          data.summary.bestROI = String(data.roiTable[0].roi);
          data.summary.savingsVsBurning = String(data.roiTable[0].profit);
          data.summary.totalAlternatives = String(data.roiTable.length);
        }
      }
    }

    // Format display values
    data.biomassValue = `Rs ${Number(parseRs(data.biomassValue)).toLocaleString("en-IN")}`;
    data.profitEstimation = `Rs ${Number(data.profitEstimation).toLocaleString("en-IN")}`;
    if (data.summary?.savingsVsBurning) {
      data.summary.savingsVsBurning = `Rs ${Number(
        parseRs(data.summary.savingsVsBurning)
      ).toLocaleString("en-IN")}`;
    }

    res.json(data);
  } catch (error) {
    console.error("❌ AI Controller Error:", error);
    res.status(500).json({ message: "AI Analysis Failed", error: error.message });
  }
};

// ─────────────────────────────────────────────
// 2. Visual Residue Estimation from Images
// ─────────────────────────────────────────────
exports.estimateResidueFromImages = async (req, res) => {
  try {
    console.log("📸 Visual Residue Estimation Request Received...");
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ message: "At least one image is required" });

    console.log(`📷 Processing ${files.length} image(s)...`);

    const imageContents = files.map((file) => {
      const base64 = fs.readFileSync(file.path).toString("base64");
      return {
        type: "image_url",
        image_url: { url: `data:${file.mimetype};base64,${base64}` },
      };
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert agronomist AI specializing in crop residue analysis from field photographs. Always respond with raw JSON only.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze these post-harvest field images for 'Crop2Cash'. Return ONLY raw JSON, no markdown, no backticks:
              {
                "residueCoveragePercent": "65",
                "estimatedResidueTons": "4.8",
                "residueType": "Wheat Straw",
                "residueDensity": "Medium",
                "fieldCondition": "Dry",
                "harvestQuality": "Good",
                "recommendedAction": "Baling and selling as animal feed would be most profitable",
                "potentialValue": "Rs 18,000",
                "confidence": "High",
                "observations": "Field shows uniform residue distribution with approximately 60-70% ground cover."
              }`,
            },
            ...imageContents,
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.3,
      max_tokens: 1024,
    });

    let text = chatCompletion.choices[0]?.message?.content || "";
    console.log("✅ Visual Residue Estimation Response received");
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "AI returned invalid JSON.", rawResponse: text });
    }

    data.uploadedImages = files.map((f) => `/uploads/${f.filename}`);
    res.json(data);
  } catch (error) {
    console.error("❌ Visual Residue Estimation Error:", error);
    res.status(500).json({ message: "Image Analysis Failed", error: error.message });
  }
};