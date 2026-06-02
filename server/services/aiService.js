const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const logger = require('../config/logger');

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

/**
 * Build a detailed system + user prompt for the AI code reviewer.
 * @param {string} code
 * @param {string} language
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
function buildPrompts(code, language) {
  const systemPrompt = `You are a senior software engineer and code review expert with 15+ years of experience across multiple languages and paradigms. Your job is to perform a thorough, constructive code review.

Analyze the provided ${language} code and respond ONLY with a valid JSON object (no markdown, no explanation outside the JSON). The JSON must follow this exact schema:

{
  "score": <integer 0-100, overall code quality>,
  "summary": "<concise 2-4 sentence overview of the code quality>",
  "issues": [
    {
      "line": <line number or null if not applicable>,
      "severity": "<critical|warning|info|suggestion>",
      "category": "<security|performance|style|logic|maintainability>",
      "message": "<clear description of the problem>",
      "suggestion": "<specific, actionable fix in plain English>",
      "fix": "<the corrected code snippet that should replace the problematic code, or null if not applicable>"
    }
  ],
  "positives": ["<strength 1>", "<strength 2>"],
  "overallSuggestions": ["<high-level improvement 1>", "<improvement 2>"]
}

Severity guide:
- critical: security vulnerabilities, data loss risks, crashes
- warning: bugs, incorrect logic, significant performance issues
- info: notable improvements, best-practice violations
- suggestion: style, naming, minor refactors

Category guide:
- security: injection, auth, data exposure, crypto
- performance: algorithmic complexity, memory leaks, unnecessary computation
- style: naming conventions, formatting, readability
- logic: incorrect algorithms, edge cases, off-by-one errors
- maintainability: coupling, modularity, documentation, testability

Score guide:
- 90-100: production-ready, excellent
- 70-89: good with minor improvements
- 50-69: acceptable but needs work
- 30-49: significant issues present
- 0-29: major problems, not production-ready

For the "fix" field: provide a concise corrected code snippet (1-5 lines) showing exactly what the problematic code should be replaced with. Use null if a code fix is not applicable (e.g., for documentation suggestions).

Be specific, actionable, and constructive. Always output valid JSON.`;

  const userPrompt = `Please review the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  return { systemPrompt, userPrompt };
}

// ---------------------------------------------------------------------------
// JSON parser – strips markdown code fences if the AI wraps its response
// ---------------------------------------------------------------------------

/**
 * Safely parse JSON from an AI response string.
 * Handles responses wrapped in ```json … ``` or plain JSON.
 * @param {string} text
 * @returns {object}
 */
function parseAIResponse(text) {
  // Strip leading/trailing whitespace
  let cleaned = text.trim();

  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1];
  }

  return JSON.parse(cleaned);
}

// ---------------------------------------------------------------------------
// Validation – ensure the parsed object has the required shape
// ---------------------------------------------------------------------------

function validateReviewShape(obj) {
  if (typeof obj.score !== 'number') throw new Error('Missing score');
  if (typeof obj.summary !== 'string') throw new Error('Missing summary');
  if (!Array.isArray(obj.issues)) throw new Error('Missing issues array');
  if (!Array.isArray(obj.positives)) throw new Error('Missing positives array');
  if (!Array.isArray(obj.overallSuggestions))
    throw new Error('Missing overallSuggestions array');
}

// ---------------------------------------------------------------------------
// Primary provider: Google Gemini
// ---------------------------------------------------------------------------

/**
 * @param {string} code
 * @param {string} language
 * @returns {Promise<object>} Parsed review object
 */
async function reviewWithGemini(code, language) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  const { systemPrompt, userPrompt } = buildPrompts(code, language);

  const result = await model.generateContent({
    systemInstruction: systemPrompt,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
  });

  const responseText = result.response.text();
  const parsed = parseAIResponse(responseText);
  validateReviewShape(parsed);

  // Gemini token usage
  const tokensUsed =
    result.response?.usageMetadata?.totalTokenCount ||
    result.response?.usageMetadata?.promptTokenCount ||
    null;

  return { ...parsed, aiProvider: 'gemini-2.5-flash', tokensUsed };
}

// ---------------------------------------------------------------------------
// Fallback provider: Groq (llama-3.3-70b-versatile)
// ---------------------------------------------------------------------------

/**
 * @param {string} code
 * @param {string} language
 * @returns {Promise<object>} Parsed review object
 */
async function reviewWithGroq(code, language) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const groq = new Groq({ apiKey });
  const { systemPrompt, userPrompt } = buildPrompts(code, language);

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '';
  const parsed = parseAIResponse(responseText);
  validateReviewShape(parsed);

  const tokensUsed = completion.usage?.total_tokens || null;

  return { ...parsed, aiProvider: 'llama-3.3-70b-versatile', tokensUsed };
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * Review code using the best available AI provider.
 *
 * Strategy:
 *   1. Try Gemini (primary)
 *   2. If Gemini fails or key is absent, fall back to Groq
 *   3. If both fail, return a structured error review (no crash)
 *
 * @param {string} code        - Source code to review
 * @param {string} language    - Programming language (default 'javascript')
 * @param {object} options     - Reserved for future options
 * @returns {Promise<object>}  - Review result object
 */
async function reviewCode(code, language = 'javascript', options = {}) {
  // --- Try Gemini first ---
  if (process.env.GEMINI_API_KEY) {
    try {
      logger.info(`[aiService] Starting Gemini review (language: ${language})`);
      const result = await reviewWithGemini(code, language);
      logger.info(`[aiService] Gemini review completed. Score: ${result.score}`);
      return result;
    } catch (geminiErr) {
      logger.warn(`[aiService] Gemini failed: ${geminiErr.message}. Falling back to Groq.`);
    }
  } else {
    logger.info('[aiService] GEMINI_API_KEY not set. Trying Groq directly.');
  }

  // --- Try Groq fallback ---
  if (process.env.GROQ_API_KEY) {
    try {
      logger.info(`[aiService] Starting Groq review (language: ${language})`);
      const result = await reviewWithGroq(code, language);
      logger.info(`[aiService] Groq review completed. Score: ${result.score}`);
      return result;
    } catch (groqErr) {
      logger.error(`[aiService] Groq also failed: ${groqErr.message}`);
    }
  } else {
    logger.warn('[aiService] GROQ_API_KEY not set. No AI provider available.');
  }

  // --- Both providers failed – return safe error response ---
  logger.error('[aiService] All AI providers failed. Returning fallback response.');
  return {
    score: 0,
    summary:
      'The AI code review service is temporarily unavailable. Please check your API keys and try again.',
    issues: [
      {
        line: null,
        severity: 'info',
        category: 'maintainability',
        message: 'Code review could not be performed due to an AI service error.',
        suggestion: 'Please try again later or contact support.',
      },
    ],
    positives: [],
    overallSuggestions: [
      'Ensure GEMINI_API_KEY or GROQ_API_KEY environment variables are configured correctly.',
    ],
    aiProvider: 'none',
    tokensUsed: null,
    error: true,
  };
}

module.exports = { reviewCode };
