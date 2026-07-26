import { jsPDF } from "jspdf";

const MARGIN = 44;
const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;

function newDoc() {
  return new jsPDF({ unit: "pt", format: "a4" });
}

/**
 * Builds a clean, text-based PDF report from a report payload (see
 * GET /api/report/:id). Deliberately avoids DOM rasterization (html2canvas)
 * for reliability — glassmorphism/backdrop-filter CSS renders inconsistently
 * across browsers when captured to canvas.
 */
export function exportSimulationReport(report) {
  const doc = newDoc();
  let y = MARGIN;

  const ensureSpace = (needed) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const heading = (text, size = 18) => {
    ensureSpace(size + 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(20, 20, 30);
    doc.text(text, MARGIN, y);
    y += size + 10;
  };

  const subheading = (text) => {
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(60, 60, 80);
    doc.text(text, MARGIN, y);
    y += 18;
  };

  const paragraph = (text, size = 10) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(50, 50, 60);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    lines.forEach((line) => {
      ensureSpace(size + 4);
      doc.text(line, MARGIN, y);
      y += size + 4;
    });
    y += 4;
  };

  const bulletList = (items, size = 10) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(50, 50, 60);
    items.forEach((item) => {
      const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_W - 10);
      lines.forEach((line, idx) => {
        ensureSpace(size + 4);
        doc.text(line, MARGIN + (idx === 0 ? 0 : 12), y);
        y += size + 4;
      });
    });
    y += 4;
  };

  const divider = () => {
    ensureSpace(16);
    doc.setDrawColor(220, 220, 230);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 16;
  };

  // ---- Cover -----------------------------------------------------------
  doc.setFillColor(15, 16, 26);
  doc.rect(0, 0, PAGE_W, 170, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Future Simulator Report", MARGIN, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 215);
  const decisionLines = doc.splitTextToSize(`Decision: ${report.decision}`, CONTENT_W);
  doc.text(decisionLines, MARGIN, 100);
  doc.setFontSize(9.5);
  doc.setTextColor(160, 160, 180);
  doc.text(
    `Horizon: ${report.horizonYears} years   •   Generated: ${new Date(
      report.generatedAt
    ).toLocaleString()}`,
    MARGIN,
    140
  );
  y = 200;

  // ---- Profile / assumptions -------------------------------------------
  heading("Your Profile");
  const p = report.profile;
  paragraph(
    `${p.age}-year-old ${p.profession} based in ${p.city}, ${p.country}. ` +
      `${p.education}. ${p.yearsExperience} years of experience, currently earning ` +
      `${p.salary} ${p.currency}/year with ${p.savings} ${p.currency} in savings. ` +
      `${p.relationshipStatus}, ${p.dependents} dependent(s). Risk appetite: ${p.riskAppetite}. ` +
      `Career goal: ${p.careerGoal}. Core values: ${p.values.join(", ")}.`
  );
  divider();

  // ---- Futures -----------------------------------------------------------
  heading("Simulated Futures");
  report.futures.forEach((f) => {
    subheading(`Future ${f.id} — ${f.title}`);
    paragraph(f.summary);
    paragraph(
      `Probability of success: ~${f.probabilityOfSuccess}%   |   Risk level: ${f.riskLevel}/100`,
      9.5
    );
    paragraph("Key assumptions:", 10);
    bulletList(f.keyAssumptions);
    paragraph("Biggest risk: " + f.biggestRisk, 10);
    paragraph("Biggest reward: " + f.biggestReward, 10);
    divider();
  });

  // ---- Comparison table ---------------------------------------------------
  heading("Comparison");
  const colW = CONTENT_W / (report.futures.length + 1);
  const rows = [
    ["Metric", ...report.futures.map((f) => f.id)],
    ["Probability of success", ...report.futures.map((f) => `${f.probabilityOfSuccess}%`)],
    ["Risk level", ...report.futures.map((f) => `${f.riskLevel}`)],
    ["Happiness", ...report.futures.map((f) => `${f.metrics.happiness}`)],
    ["Financial stability", ...report.futures.map((f) => `${f.metrics.financialStability}`)],
    ["Career satisfaction", ...report.futures.map((f) => `${f.metrics.careerSatisfaction}`)],
  ];
  rows.forEach((row, rIdx) => {
    ensureSpace(18);
    doc.setFont("helvetica", rIdx === 0 ? "bold" : "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(rIdx === 0 ? 20 : 60, rIdx === 0 ? 20 : 60, rIdx === 0 ? 30 : 70);
    row.forEach((cell, cIdx) => {
      doc.text(String(cell), MARGIN + cIdx * colW, y);
    });
    y += 16;
  });
  y += 8;
  divider();

  // ---- AI Board ------------------------------------------------------------
  heading("AI Board");
  report.aiBoard.forEach((entry) => {
    subheading(`${entry.expert} — ${entry.role}`);
    paragraph(entry.stance);
    paragraph("Advice: " + entry.advice, 9.5);
    divider();
  });

  paragraph("Consensus: " + report.consensus);
  if (report.disagreements?.length) {
    paragraph("Points of disagreement:");
    bulletList(report.disagreements);
  }
  divider();

  // ---- Recommendation ------------------------------------------------------
  heading("Suggested Starting Point");
  if (report.recommendation?.topFuture) {
    paragraph(
      `Based on a weighted blend of the simulated metrics, Future ${report.recommendation.topFuture.id} ` +
        `("${report.recommendation.topFuture.title}") scores highest — but this is a heuristic, not certainty.`
    );
  }
  paragraph(report.recommendation?.note || "", 9);

  doc.save(`future-simulator-${report.id}.pdf`);
}
