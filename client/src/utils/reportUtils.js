// ─── reportUtils.js ───────────────────────────────────────────────
// Utilities for downloading AI analysis reports as PDF or CSV

// ── CSV Export ────────────────────────────────────────────────────
export function downloadCSV(report) {
  const { farmProfile, location, aiData, createdAt } = report;
  const dateStr = new Date(createdAt).toLocaleString("en-IN");

  const cropName = farmProfile.cropType === "Other"
    ? (farmProfile.customCropType || "Unknown")
    : (farmProfile.cropType || "Unknown");

  const rows = [];

  // Header metadata
  rows.push(["Crop2Cash - AI Analysis Report"]);
  rows.push(["Generated On", dateStr]);
  rows.push(["Farmer Location", location]);
  rows.push(["Crop", cropName]);
  rows.push(["Land Area (Acres)", farmProfile.landArea || "—"]);
  rows.push(["Soil Type", farmProfile.soilType || "—"]);
  rows.push(["Season", farmProfile.season || "—"]);
  rows.push(["Budget", farmProfile.budgetRange || "—"]);
  rows.push([]);

  // Summary
  rows.push(["AI Recommendation", aiData.bestMethod]);
  rows.push(["Max Profit", aiData.profitEstimation]);
  rows.push(["Estimated Residue (Tons)", aiData.estimatedResidue]);
  rows.push(["Biomass Value", aiData.biomassValue]);
  rows.push(["Break-Even (Months)", aiData.breakEvenMonths]);
  rows.push(["Investment Efficiency", `Rs ${aiData.investmentEfficiency} per Re 1`]);
  rows.push(["Risk Level", aiData.riskLevel]);
  rows.push([]);

  // Soil damage
  if (aiData.soilDamage) {
    rows.push(["── Soil Damage from Burning ──"]);
    rows.push(["Fertility Loss", aiData.soilDamage.fertilityLoss]);
    rows.push(["Bacteria Killed (%)", aiData.soilDamage.bacteriaKilledPercent + "%"]);
    rows.push(["Nutrient Loss", aiData.soilDamage.nutrientLoss]);
    rows.push(["Recovery Time", aiData.soilDamage.recoveryYears + " years"]);
    rows.push([]);
  }

  // ROI Table
  rows.push(["── Full ROI Comparison Table ──"]);
  rows.push(["Rank", "Method", "Cost (Rs)", "Income (Rs)", "Profit (Rs)", "ROI %", "Payback (Months)", "Efficiency", "Feasibility", "Category"]);

  (aiData.roiTable || []).forEach((row) => {
    rows.push([
      row.rank,
      row.method,
      row.cost,
      row.income,
      row.profit,
      row.roi + "%",
      row.paybackMonths,
      row.efficiency + "x",
      row.feasibility,
      row.category || "—",
    ]);
  });

  rows.push([]);

  // Environmental impact
  if (aiData.impact) {
    rows.push(["── Environmental Impact ──"]);
    rows.push(["CO2 Reduced (Tons)", aiData.impact.co2Reduced]);
    rows.push(["Burning Prevented (Tons)", aiData.impact.burningPrevented]);
    rows.push(["Air Quality Impact", aiData.impact.airQuality]);
    rows.push(["Households Helped", aiData.impact.householdsHelped]);
  }

  // Convert to CSV string
  const csvContent = rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `crop2cash-report-${cropName}-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── PDF Export (via print-to-PDF using a styled HTML window) ─────
export function downloadPDF(report) {
  const { farmProfile, location, aiData, createdAt } = report;
  const dateStr = new Date(createdAt).toLocaleString("en-IN");

  const cropName = farmProfile.cropType === "Other"
    ? (farmProfile.customCropType || "Unknown")
    : (farmProfile.cropType || "Unknown");

  const roiRows = (aiData.roiTable || [])
    .map(
      (row, i) => `
        <tr style="${i === 0 ? "background:#f0fdf4;font-weight:700;" : i % 2 === 0 ? "background:#f9fafb;" : ""}">
          <td>${i === 0 ? "🥇 #1" : "#" + row.rank}</td>
          <td>${row.method}</td>
          <td style="color:#ef4444">Rs ${Number(row.cost).toLocaleString("en-IN")}</td>
          <td style="color:#3b82f6">Rs ${Number(row.income).toLocaleString("en-IN")}</td>
          <td style="color:#16a34a;font-weight:700">Rs ${Number(row.profit).toLocaleString("en-IN")}</td>
          <td style="color:#15803d;font-weight:800">${row.roi}%</td>
          <td>${row.paybackMonths} mo.</td>
          <td>${row.efficiency}x</td>
          <td>
            <span style="padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;
              background:${row.feasibility === "High" ? "#dcfce7" : row.feasibility === "Medium" ? "#fef9c3" : "#fee2e2"};
              color:${row.feasibility === "High" ? "#166534" : row.feasibility === "Medium" ? "#854d0e" : "#991b1b"}">
              ${row.feasibility}
            </span>
          </td>
          <td style="font-size:11px;color:#6b7280">${row.category || "—"}</td>
        </tr>`
    )
    .join("");

  const soilBlock = aiData.soilDamage
    ? `<div class="section" style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;border-radius:8px;margin-top:20px">
        <h3 style="color:#c2410c;margin:0 0 10px">🔥 Soil Damage from Burning</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
          <div><b>Fertility Loss:</b> ${aiData.soilDamage.fertilityLoss}</div>
          <div><b>Bacteria Killed:</b> ${aiData.soilDamage.bacteriaKilledPercent}%</div>
          <div><b>Nutrient Loss:</b> ${aiData.soilDamage.nutrientLoss}</div>
          <div><b>Recovery Time:</b> ${aiData.soilDamage.recoveryYears} years</div>
          <div style="grid-column:1/-1"><b>Impact:</b> ${aiData.soilDamage.description}</div>
        </div>
      </div>` : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Crop2Cash Report - ${cropName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; color: #1f2937; font-size: 13px; padding: 24px; }
    .header { background: linear-gradient(135deg,#166534,#16a34a); color: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 22px; font-weight: 800; }
    .header .sub { opacity: 0.85; font-size: 13px; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; }
    .meta-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .meta-card .label { font-size: 10px; text-transform: uppercase; color: #9ca3af; font-weight: 600; }
    .meta-card .value { font-size: 16px; font-weight: 700; margin-top: 4px; }
    .section { margin-bottom: 20px; }
    .section h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; }
    td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
    .best { background: linear-gradient(135deg,#166534,#15803d); color: white; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .best h3 { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
    .best .reason { font-size: 12px; opacity: 0.9; font-style: italic; }
    .impact-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .impact-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; text-align: center; }
    .impact-card .val { font-size: 20px; font-weight: 800; color: #166534; }
    .impact-card .lbl { font-size: 10px; color: #6b7280; margin-top: 2px; }
    .footer { margin-top: 24px; text-align: center; color: #9ca3af; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌾 Crop2Cash — AI Analysis Report</h1>
    <div class="sub">Generated: ${dateStr} &nbsp;·&nbsp; Location: ${location} &nbsp;·&nbsp; Crop: ${cropName} &nbsp;·&nbsp; Land: ${farmProfile.landArea} Acres</div>
  </div>

  <div class="best">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px">🏆 AI Recommended Method</div>
        <h3>${aiData.bestMethod}</h3>
        <div class="reason">"${aiData.aiReason}"</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;opacity:0.8">Best ROI</div>
        <div style="font-size:32px;font-weight:900">${aiData.roiTable?.[0]?.roi || "—"}%</div>
        <div style="font-size:10px;opacity:0.8">Max Profit: ${aiData.profitEstimation}</div>
      </div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-card"><div class="label">Max Profit</div><div class="value" style="color:#16a34a">${aiData.profitEstimation}</div></div>
    <div class="meta-card"><div class="label">Break-Even</div><div class="value" style="color:#2563eb">${aiData.breakEvenMonths} months</div></div>
    <div class="meta-card"><div class="label">Efficiency</div><div class="value" style="color:#7c3aed">Rs ${aiData.investmentEfficiency}</div></div>
    <div class="meta-card"><div class="label">Est. Residue</div><div class="value" style="color:#b45309">${aiData.estimatedResidue} Tons</div></div>
  </div>

  ${soilBlock}

  <div class="section" style="margin-top:20px">
    <h3>📊 Full ROI Comparison Table</h3>
    <table>
      <thead>
        <tr><th>Rank</th><th>Method</th><th>Cost</th><th>Income</th><th>Profit</th><th>ROI %</th><th>Payback</th><th>Efficiency</th><th>Feasibility</th><th>Category</th></tr>
      </thead>
      <tbody>${roiRows}</tbody>
    </table>
    <div style="margin-top:10px;font-size:11px;color:#9ca3af;padding:8px;background:#f9fafb;border-radius:6px">
      ROI% = (Profit ÷ Cost) × 100 &nbsp;·&nbsp; Payback = months to recover investment &nbsp;·&nbsp; Efficiency = Rs earned per Re 1 invested
    </div>
  </div>

  ${aiData.impact ? `
  <div class="section">
    <h3>🌿 Environmental Impact</h3>
    <div class="impact-grid">
      <div class="impact-card"><div class="val">${aiData.impact.co2Reduced}</div><div class="lbl">Tons CO₂ Reduced</div></div>
      <div class="impact-card"><div class="val">${aiData.impact.burningPrevented}</div><div class="lbl">Tons Burning Prevented</div></div>
      <div class="impact-card"><div class="val">${aiData.impact.airQuality}</div><div class="lbl">Air Quality Impact</div></div>
      <div class="impact-card"><div class="val">${aiData.impact.householdsHelped || "—"}</div><div class="lbl">Households Helped</div></div>
    </div>
  </div>` : ""}

  <div class="footer">
    Crop2Cash AI Advisory System &nbsp;·&nbsp; Report ID: ${report.id} &nbsp;·&nbsp; For farmer use only
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}