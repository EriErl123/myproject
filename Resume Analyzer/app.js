const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "to", "of", "in", "on", "with", "by", "at", "from", "as",
  "is", "are", "was", "were", "be", "been", "being", "that", "this", "it", "its", "their", "his",
  "her", "our", "we", "you", "they", "them", "he", "she", "i", "my", "your", "will", "can", "could",
  "should", "would", "may", "might", "must", "have", "has", "had", "do", "does", "did", "not", "but"
]);

const ACTION_VERBS = new Set([
  "led", "built", "created", "designed", "developed", "improved", "implemented", "managed", "optimized",
  "increased", "reduced", "launched", "automated", "delivered", "analyzed", "coordinated", "executed", "achieved"
]);

const SKILL_PHRASES = [
  "machine learning", "data analysis", "project management", "software development", "cloud computing",
  "customer service", "team leadership", "sql", "python", "javascript", "react", "node", "nlp"
];

const PDF_JS_SOURCES = [
  {
    lib: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.min.js",
    worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js"
  },
  {
    lib: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
    worker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
  }
];

const analyzeBtn = document.getElementById("analyzeBtn");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");
const analysisModeEl = document.getElementById("analysisMode");
const targetRoleEl = document.getElementById("targetRole");
const experienceLevelEl = document.getElementById("experienceLevel");
const resumeFileEl = document.getElementById("resumeFile");
const uploadStatusEl = document.getElementById("uploadStatus");
const resumeTextEl = document.getElementById("resumeText");
const jobTextEl = document.getElementById("jobText");
const errorMsgEl = document.getElementById("errorMsg");

const resultsEl = document.getElementById("results");
const scoreRingEl = document.getElementById("scoreRing");
const scoreValueEl = document.getElementById("scoreValue");
const scoreSummaryEl = document.getElementById("scoreSummary");
const scoreBreakdownEl = document.getElementById("scoreBreakdown");
const matchedKeywordsEl = document.getElementById("matchedKeywords");
const missingKeywordsEl = document.getElementById("missingKeywords");
const priorityKeywordsEl = document.getElementById("priorityKeywords");
const metricActionsEl = document.getElementById("metricActions");
const metricNumbersEl = document.getElementById("metricNumbers");
const metricReadabilityEl = document.getElementById("metricReadability");
const metricSemanticEl = document.getElementById("metricSemantic");
const nlpFeedbackEl = document.getElementById("nlpFeedback");
const aiInsightsEl = document.getElementById("aiInsights");
const rewriteSuggestionsEl = document.getElementById("rewriteSuggestions");
const atsRisksEl = document.getElementById("atsRisks");

const SAMPLE_RESUME = `John Doe
Software Engineer

Summary
Results-driven software engineer with 5+ years building analytics products.

Experience
Built and maintained web applications using JavaScript, React, and Node.js.
Led migration of legacy reporting dashboards to modern data visualization stack.
Implemented SQL-based analytics pipeline and improved query performance by 38%.
Automated deployment workflows and reduced release time by 45%.
Collaborated with cross-functional teams to deliver customer-facing features.`;

const SAMPLE_JOB = `We are hiring a Software Engineer to design and develop scalable web applications.
Requirements: JavaScript, React, Node.js, SQL, cloud computing, and strong problem solving.
Responsibilities include project management, data analysis, API development, and team leadership.
Candidates should optimize performance, automate workflows, and deliver measurable business impact.`;

analyzeBtn.addEventListener("click", handleAnalyze);
resumeFileEl.addEventListener("change", handleResumeUpload);
sampleBtn.addEventListener("click", () => {
  resumeTextEl.value = SAMPLE_RESUME;
  jobTextEl.value = SAMPLE_JOB;
  targetRoleEl.value = "Software Engineer";
  experienceLevelEl.value = "mid";
  analysisModeEl.value = "balanced";
  errorMsgEl.textContent = "Sample content loaded.";
  uploadStatusEl.textContent = "";
});
clearBtn.addEventListener("click", () => {
  resumeTextEl.value = "";
  jobTextEl.value = "";
  resumeFileEl.value = "";
  targetRoleEl.value = "";
  experienceLevelEl.value = "mid";
  analysisModeEl.value = "balanced";
  errorMsgEl.textContent = "";
  uploadStatusEl.textContent = "";
  resultsEl.classList.add("hidden");
});

async function handleResumeUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  uploadStatusEl.textContent = "Reading file...";
  errorMsgEl.textContent = "";

  try {
    const text = (await extractTextFromFile(file)).trim();

    if (!text) {
      throw new Error("No extractable text found in this file. If it is scanned, paste text manually.");
    }

    resumeTextEl.value = text;
    uploadStatusEl.textContent = `${file.name} loaded successfully.`;
  } catch (error) {
    uploadStatusEl.textContent = "";
    errorMsgEl.textContent = error.message || "Could not read the selected file.";
  }
}

async function handleAnalyze() {
  const resumeText = await ensureResumeText();
  const jobText = jobTextEl.value.trim();
  const analysisMode = analysisModeEl.value;
  const targetRole = targetRoleEl.value.trim() || "Target role";
  const experienceLevel = experienceLevelEl.value;

  if (!jobText) {
    errorMsgEl.textContent = "Please provide the job description.";
    resultsEl.classList.add("hidden");
    return;
  }

  if (!resumeText) {
    errorMsgEl.textContent = "Please paste resume text or upload a readable .txt/.pdf file.";
    resultsEl.classList.add("hidden");
    return;
  }

  errorMsgEl.textContent = "";

  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobText);

  const jobKeywords = extractKeywords(jobText, jobTokens, 25);
  const resumeSet = new Set(resumeTokens);

  const matched = [];
  const missing = [];

  for (const keyword of jobKeywords) {
    if (resumeSet.has(keyword) || resumeText.toLowerCase().includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const score = jobKeywords.length === 0
    ? 0
    : Math.round((matched.length / jobKeywords.length) * 100);

  const actionVerbHits = countActionVerbHits(resumeTokens);
  const numberHits = (resumeText.match(/\b\d+(?:\.\d+)?%?\b/g) || []).length;
  const readabilityScore = computeReadabilityScore(resumeText, resumeTokens);
  const weighted = computeWeightedScore(score, actionVerbHits, numberHits, readabilityScore);
  const priorityMissing = getPriorityMissingKeywords(jobText, missing);
  const semanticSimilarity = computeSemanticSimilarity(resumeText, jobText);
  const sectionCoverage = computeSectionCoverage(resumeText);
  const advanced = computeAdvancedAiScore(weighted, semanticSimilarity, sectionCoverage.coverageScore, analysisMode);
  const atsRisks = getAtsRiskFlags(resumeText, sectionCoverage, missing, numberHits);

  renderScore(advanced.total, weighted, matched.length, missing.length, semanticSimilarity, sectionCoverage.coverageScore, analysisMode);
  renderMetrics(actionVerbHits, numberHits, readabilityScore, semanticSimilarity);
  renderKeywordList(matchedKeywordsEl, matched, "chip-match");
  renderKeywordList(missingKeywordsEl, missing, "chip-miss");
  renderPriorityKeywords(priorityMissing, analysisMode);
  renderAiInsights(semanticSimilarity, sectionCoverage, advanced, analysisMode, targetRole, experienceLevel);
  renderRewriteSuggestions(buildRewriteSuggestions(resumeText, missing, targetRole, experienceLevel));
  renderAtsRisks(atsRisks);

  const feedbackItems = buildNlpFeedback(
    resumeText,
    resumeTokens,
    matched,
    missing,
    advanced.total,
    actionVerbHits,
    numberHits,
    readabilityScore
  );
  renderFeedback(feedbackItems);

  resultsEl.classList.remove("hidden");
}

async function ensureResumeText() {
  const existingText = resumeTextEl.value.trim();
  if (existingText) {
    return existingText;
  }

  const [file] = resumeFileEl.files || [];
  if (!file) {
    return "";
  }

  try {
    uploadStatusEl.textContent = "Reading file before analysis...";
    const text = (await extractTextFromFile(file)).trim();

    if (!text) {
      throw new Error("No extractable text found in the file. If this is a scanned PDF, paste text manually.");
    }

    resumeTextEl.value = text;
    uploadStatusEl.textContent = `${file.name} is ready for analysis.`;
    return text;
  } catch (error) {
    uploadStatusEl.textContent = "";
    errorMsgEl.textContent = error.message || "Could not read the selected resume file.";
    return "";
  }
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token) && token.length > 1);
}

function extractKeywords(jobText, jobTokens, limit) {
  const counts = new Map();

  for (const token of jobTokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  const jobLower = jobText.toLowerCase();
  for (const phrase of SKILL_PHRASES) {
    if (jobLower.includes(phrase)) {
      counts.set(phrase, (counts.get(phrase) || 0) + 3);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function renderScore(score, weighted, matchCount, missingCount, semanticSimilarity, sectionCoverageScore, analysisMode) {
  const degrees = Math.round((score / 100) * 360);
  scoreRingEl.style.background = `conic-gradient(var(--primary) ${degrees}deg, #e2e8f0 ${degrees}deg)`;
  scoreValueEl.textContent = `${score}%`;

  let level = "Low alignment";
  if (score >= 75) {
    level = "Strong alignment";
  } else if (score >= 50) {
    level = "Moderate alignment";
  }

  scoreSummaryEl.textContent = `${level}: ${matchCount} matched, ${missingCount} missing key terms.`;
  renderScoreBreakdown(weighted, semanticSimilarity, sectionCoverageScore, analysisMode);
}

function renderScoreBreakdown(weighted, semanticSimilarity, sectionCoverageScore, analysisMode) {
  scoreBreakdownEl.innerHTML = "";

  const weights = getModeWeights(analysisMode);

  const items = [
    `Keyword relevance: ${weighted.keywordScore}% (${Math.round(weights.keyword * 100)}%)`,
    `Achievement impact: ${weighted.achievementScore}% (${Math.round(weights.achievement * 100)}%)`,
    `Readability: ${weighted.readabilityScore}% (${Math.round(weights.readability * 100)}%)`,
    `Semantic similarity: ${semanticSimilarity}% (${Math.round(weights.semantic * 100)}%)`,
    `Section coverage: ${sectionCoverageScore}% (${Math.round(weights.section * 100)}%)`
  ];

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    scoreBreakdownEl.appendChild(li);
  }
}

function renderMetrics(actionVerbHits, numberHits, readabilityScore, semanticSimilarity) {
  metricActionsEl.textContent = String(actionVerbHits);
  metricNumbersEl.textContent = String(numberHits);
  metricReadabilityEl.textContent = `${readabilityScore}%`;
  metricSemanticEl.textContent = `${semanticSimilarity}%`;
}

function renderKeywordList(element, items, className) {
  element.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "None";
    li.className = className;
    element.appendChild(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    li.className = className;
    element.appendChild(li);
  }
}

function buildNlpFeedback(
  resumeText,
  resumeTokens,
  matched,
  missing,
  score,
  actionVerbHits,
  numberHits,
  readabilityScore
) {
  const feedback = [];

  const sentenceCount = splitSentences(resumeText).length;
  const wordCount = resumeTokens.length;
  const avgWordsPerSentence = sentenceCount ? wordCount / sentenceCount : 0;

  if (score >= 75) {
    feedback.push({
      level: "positive",
      text: "Keyword alignment is strong for this job description."
    });
  } else if (score >= 50) {
    feedback.push({
      level: "warning",
      text: "Keyword alignment is moderate. Add more role-specific terms from the posting."
    });
  } else {
    feedback.push({
      level: "critical",
      text: "Keyword alignment is low. Tailor the resume more directly to the job requirements."
    });
  }

  if (missing.length > 0) {
    const topMissing = missing.slice(0, 5).join(", ");
    feedback.push({
      level: "warning",
      text: `Consider adding these missing keywords naturally: ${topMissing}.`
    });
  }

  if (actionVerbHits >= 5) {
    feedback.push({
      level: "positive",
      text: "Strong use of action verbs to describe accomplishments."
    });
  } else {
    feedback.push({
      level: "warning",
      text: "Use more action verbs (for example: led, implemented, optimized) to improve impact."
    });
  }

  if (numberHits >= 3) {
    feedback.push({
      level: "positive",
      text: "Good use of measurable outcomes (numbers/percentages)."
    });
  } else {
    feedback.push({
      level: "warning",
      text: "Add measurable results (percentages, revenue, time saved, volume) to strengthen credibility."
    });
  }

  if (avgWordsPerSentence > 24) {
    feedback.push({
      level: "warning",
      text: "Sentence length is high. Shorter bullet points can improve readability."
    });
  } else if (avgWordsPerSentence >= 10) {
    feedback.push({
      level: "positive",
      text: "Sentence length is generally readable and ATS-friendly."
    });
  } else {
    feedback.push({
      level: "warning",
      text: "Content may be too brief. Add context to show impact and scope."
    });
  }

  if (readabilityScore >= 75) {
    feedback.push({
      level: "positive",
      text: "Readability score is strong. Formatting and sentence rhythm are easy to scan."
    });
  } else {
    feedback.push({
      level: "warning",
      text: "Improve readability by using concise bullet points and reducing dense lines."
    });
  }

  return feedback;
}

function getPriorityMissingKeywords(jobText, missingKeywords) {
  if (!missingKeywords.length) {
    return [];
  }

  const jobLower = jobText.toLowerCase();
  const criticalSignals = [
    "required",
    "must",
    "minimum",
    "essential",
    "need",
    "qualification"
  ];

  return [...missingKeywords]
    .map((keyword) => {
      const index = jobLower.indexOf(keyword);
      const context = index >= 0 ? jobLower.slice(Math.max(0, index - 40), index + keyword.length + 40) : "";
      const boost = criticalSignals.some((signal) => context.includes(signal)) ? 2 : 0;
      return {
        keyword,
        score: (keyword.includes(" ") ? 2 : 1) + boost
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function renderPriorityKeywords(items, analysisMode) {
  priorityKeywordsEl.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "feedback-positive";
    li.textContent = "Great match. No high-priority missing keywords detected.";
    priorityKeywordsEl.appendChild(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.className = item.score >= 4 ? "feedback-critical" : "feedback-warning";
    const severity = item.score >= 4 ? "high" : item.score === 3 ? "medium" : "low";
    li.textContent = `${item.keyword} • ${severity} priority (${analysisMode} mode)`;
    priorityKeywordsEl.appendChild(li);
  }
}

function computeReadabilityScore(resumeText, resumeTokens) {
  const sentences = splitSentences(resumeText).length || 1;
  const avgWordsPerSentence = resumeTokens.length / sentences;

  if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 22) {
    return 90;
  }
  if (avgWordsPerSentence >= 9 && avgWordsPerSentence <= 26) {
    return 75;
  }
  if (avgWordsPerSentence >= 6 && avgWordsPerSentence <= 30) {
    return 60;
  }
  return 45;
}

function computeWeightedScore(keywordScore, actionVerbHits, numberHits, readabilityScore) {
  const achievementScore = Math.min(100, actionVerbHits * 8 + numberHits * 12);

  const total = Math.round(
    keywordScore * 0.6 +
    achievementScore * 0.25 +
    readabilityScore * 0.15
  );

  return {
    total,
    keywordScore,
    achievementScore,
    readabilityScore
  };
}

function splitSentences(text) {
  return text
    .split(/[.!?\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function countActionVerbHits(tokens) {
  let count = 0;
  for (const token of tokens) {
    if (ACTION_VERBS.has(token)) {
      count += 1;
    }
  }
  return count;
}

function renderFeedback(items) {
  nlpFeedbackEl.innerHTML = "";

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item.text;
    li.className = `feedback-${item.level}`;
    nlpFeedbackEl.appendChild(li);
  }
}

function renderAiInsights(semanticSimilarity, sectionCoverage, advanced, analysisMode, targetRole, experienceLevel) {
  aiInsightsEl.innerHTML = "";

  const insights = [];

  insights.push(`Role focus: ${targetRole} (${experienceLevel} level, ${analysisMode} mode).`);
  insights.push(`Semantic similarity with job description: ${semanticSimilarity}%.`);
  insights.push(`Resume section coverage: ${sectionCoverage.coverageScore}% (${sectionCoverage.present.join(", ") || "none"}).`);

  if (sectionCoverage.missing.length > 0) {
    insights.push(`Consider adding missing sections: ${sectionCoverage.missing.join(", ")}.`);
  }

  if (advanced.total >= 80) {
    insights.push("Profile is highly aligned. Focus on role-specific achievements for final refinement.");
  } else if (advanced.total >= 60) {
    insights.push("Profile is moderately aligned. Improve section completeness and include more job-specific evidence.");
  } else {
    insights.push("Profile needs stronger alignment. Increase overlap with required skills and add quantified wins.");
  }

  for (const text of insights) {
    const li = document.createElement("li");
    li.textContent = text;
    li.className = "feedback-warning";
    aiInsightsEl.appendChild(li);
  }
}

function renderRewriteSuggestions(items) {
  rewriteSuggestionsEl.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "feedback-positive";
    li.textContent = "No rewrite suggestions generated. Add bullet-style accomplishments for deeper optimization.";
    rewriteSuggestionsEl.appendChild(li);
    return;
  }

  for (const text of items) {
    const li = document.createElement("li");
    li.className = "feedback-warning";
    li.textContent = text;
    rewriteSuggestionsEl.appendChild(li);
  }
}

function buildRewriteSuggestions(resumeText, missingKeywords, targetRole, experienceLevel) {
  const sentences = splitSentences(resumeText).filter((line) => line.length > 24);
  const suggestions = [];
  const missingFocus = missingKeywords.slice(0, 3);

  for (const sentence of sentences.slice(0, 3)) {
    const lower = sentence.toLowerCase();
    const hasAction = [...ACTION_VERBS].some((verb) => lower.includes(verb));
    const hasNumber = /\b\d+(?:\.\d+)?%?\b/.test(sentence);

    if (!hasAction || !hasNumber) {
      const focus = missingFocus.length ? ` and include ${missingFocus.join(", ")}` : "";
      suggestions.push(`Rewrite (${targetRole}, ${experienceLevel}): Start with a strong action verb, add a measurable result${focus}.`);
    }
  }

  return suggestions.slice(0, 4);
}

function computeSemanticSimilarity(resumeText, jobText) {
  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobText);

  const resumeCounts = buildFrequencyMap(resumeTokens);
  const jobCounts = buildFrequencyMap(jobTokens);

  const vocabulary = new Set([...resumeCounts.keys(), ...jobCounts.keys()]);
  let dot = 0;
  let resumeNorm = 0;
  let jobNorm = 0;

  for (const term of vocabulary) {
    const a = resumeCounts.get(term) || 0;
    const b = jobCounts.get(term) || 0;
    dot += a * b;
    resumeNorm += a * a;
    jobNorm += b * b;
  }

  if (!resumeNorm || !jobNorm) {
    return 0;
  }

  const cosine = dot / (Math.sqrt(resumeNorm) * Math.sqrt(jobNorm));
  return Math.max(0, Math.min(100, Math.round(cosine * 100)));
}

function computeSectionCoverage(resumeText) {
  const sections = ["summary", "experience", "skills", "education", "projects", "certifications"];
  const lower = resumeText.toLowerCase();

  const present = sections.filter((section) => lower.includes(section));
  const missing = sections.filter((section) => !lower.includes(section));
  const coverageScore = Math.round((present.length / sections.length) * 100);

  return { present, missing, coverageScore };
}

function computeAdvancedAiScore(weighted, semanticSimilarity, sectionCoverageScore, analysisMode) {
  const weights = getModeWeights(analysisMode);
  const total = Math.round(
    weighted.keywordScore * weights.keyword +
    weighted.achievementScore * weights.achievement +
    weighted.readabilityScore * weights.readability +
    semanticSimilarity * weights.semantic +
    sectionCoverageScore * weights.section
  );
  return { total, weights };
}

function getModeWeights(mode) {
  if (mode === "strict") {
    return {
      keyword: 0.5,
      achievement: 0.18,
      readability: 0.07,
      semantic: 0.15,
      section: 0.1
    };
  }

  if (mode === "creative") {
    return {
      keyword: 0.35,
      achievement: 0.2,
      readability: 0.15,
      semantic: 0.2,
      section: 0.1
    };
  }

  return {
    keyword: 0.45,
    achievement: 0.2,
    readability: 0.1,
    semantic: 0.15,
    section: 0.1
  };
}

function getAtsRiskFlags(resumeText, sectionCoverage, missingKeywords, numberHits) {
  const risks = [];
  const lower = resumeText.toLowerCase();

  if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText)) {
    risks.push({ level: "critical", text: "Missing visible email address." });
  }

  if (!/(\+?\d[\d\s\-()]{7,}\d)/.test(resumeText)) {
    risks.push({ level: "warning", text: "Phone number not detected." });
  }

  if (sectionCoverage.missing.includes("experience") || sectionCoverage.missing.includes("skills")) {
    risks.push({ level: "critical", text: "Essential ATS sections may be missing (Experience/Skills)." });
  }

  if (missingKeywords.length > 8) {
    risks.push({ level: "warning", text: "High keyword gap against the job description." });
  }

  if (numberHits < 2) {
    risks.push({ level: "warning", text: "Low quantified impact; add measurable results." });
  }

  if (splitSentences(resumeText).some((line) => line.split(/\s+/).length > 35)) {
    risks.push({ level: "warning", text: "Very long lines can reduce ATS readability." });
  }

  if (!lower.includes("experience")) {
    risks.push({ level: "critical", text: "No explicit 'Experience' heading found." });
  }

  return risks.length
    ? risks
    : [{ level: "positive", text: "No major ATS blockers detected." }];
}

function renderAtsRisks(risks) {
  atsRisksEl.innerHTML = "";

  for (const risk of risks) {
    const li = document.createElement("li");
    li.className = `feedback-${risk.level}`;
    li.textContent = risk.text;
    atsRisksEl.appendChild(li);
  }
}

function buildFrequencyMap(tokens) {
  const map = new Map();
  for (const token of tokens) {
    map.set(token, (map.get(token) || 0) + 1);
  }
  return map;
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) {
    return readTextFile(file);
  }

  if (name.endsWith(".pdf")) {
    return readPdfFile(file);
  }

  throw new Error("Unsupported file type. Upload a .txt or .pdf resume.");
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read text file."));
    reader.readAsText(file);
  });
}

async function readPdfFile(file) {
  const pdfjsLib = await ensurePdfJsLoaded();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    pages.push(text);
  }

  return pages.join("\n");
}

async function ensurePdfJsLoaded() {
  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_SOURCES[0].worker;
    }
    return window.pdfjsLib;
  }

  for (const source of PDF_JS_SOURCES) {
    try {
      await loadExternalScript(source.lib);
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = source.worker;
        return window.pdfjsLib;
      }
    } catch {
      continue;
    }
  }

  throw new Error("PDF parser failed to load from available CDNs. You can still upload .txt or paste resume text.");
}

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-external-src="${src}"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Script load failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-external-src", src);
    script.addEventListener("load", () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("Script load failed")), { once: true });
    document.head.appendChild(script);
  });
}
