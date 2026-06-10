const { File } = require('node:buffer');
const fs = require('fs');

/** Swap structure() to Anthropic by changing this module — Groq only for now. */
const GROQ_CONFIG = {
  baseUrl: 'https://api.groq.com/openai/v1',
  transcriptionModel: 'whisper-large-v3-turbo',
  structureModel: 'llama-3.3-70b-versatile',
};

const LANGUAGE_LABELS = {
  en: 'English',
  es: 'Spanish',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  ko: 'Korean',
  vi: 'Vietnamese',
  tl: 'Tagalog',
};

function getApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    const err = new Error('Voice logging is not configured — contact your administrator');
    err.status = 503;
    throw err;
  }
  return key;
}

async function groqFetch(path, options = {}) {
  const res = await fetch(`${GROQ_CONFIG.baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 429) {
    console.error('[groq] rate limit', path);
    const err = new Error('Voice service is busy — try again in a moment');
    err.status = 429;
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[groq] error', res.status, path, text.slice(0, 300));
    const err = new Error('Could not process voice note — please try again');
    err.status = res.status >= 500 ? 502 : 400;
    throw err;
  }

  return res;
}

/**
 * @param {string} filePath - path to audio on disk
 * @param {string} mimeType
 * @returns {Promise<{ text: string, detectedLanguage: string }>}
 */
async function transcribe(filePath, mimeType = 'audio/webm') {
  const buffer = fs.readFileSync(filePath);
  const ext = mimeType.includes('mp4') || mimeType.includes('m4a') ? 'm4a' : 'webm';
  const form = new FormData();
  form.append('file', new File([buffer], `recording.${ext}`, { type: mimeType }));
  form.append('model', GROQ_CONFIG.transcriptionModel);
  form.append('response_format', 'json');
  form.append('temperature', '0');

  const res = await groqFetch('/audio/transcriptions', { method: 'POST', body: form });
  const data = await res.json();
  const text = (data.text || '').trim();
  if (!text) {
    const err = new Error('Could not hear anything — try speaking a little louder');
    err.status = 400;
    throw err;
  }

  return {
    text,
    detectedLanguage: data.language || 'unknown',
  };
}

function extractJson(raw) {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * @param {string} transcript
 * @param {{ residentName: string, staffName: string, facilityName: string }} residentContext
 * @param {string} targetLanguage - e.g. 'en', 'es'
 */
async function structure(transcript, residentContext, targetLanguage = 'en') {
  const targetLabel = LANGUAGE_LABELS[targetLanguage] || LANGUAGE_LABELS.en;

  const systemPrompt = `You are a care documentation assistant for elder care facilities.
Given a staff member's spoken note, output STRICT JSON only — no markdown, no commentary.
Schema: {"careNote":"...","familyUpdate":"..."}

Rules:
- careNote: factual, clinical-ish, for internal staff records. Include observable details only.
- familyUpdate: warm, plain-language, 1-3 sentences for the resident's family. No medical jargon.
- familyUpdate MUST be written in ${targetLabel}.
- NEVER invent facts, diagnoses, medications, or events not stated in the transcript.
- If the transcript is vague, keep both fields conservative and brief.
- Preserve the resident's name when mentioned: ${residentContext.residentName}.`;

  const userPrompt = `Staff member: ${residentContext.staffName}
Facility: ${residentContext.facilityName}
Resident: ${residentContext.residentName}
Family update language: ${targetLabel}

Spoken transcript:
"""
${transcript}
"""`;

  const res = await groqFetch('/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_CONFIG.structureModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const parsed = extractJson(raw);

  if (!parsed?.familyUpdate) {
    return {
      careNote: transcript,
      familyUpdate: transcript,
      parseFailed: true,
    };
  }

  return {
    careNote: String(parsed.careNote || transcript).trim(),
    familyUpdate: String(parsed.familyUpdate).trim(),
    parseFailed: false,
  };
}

module.exports = { transcribe, structure, GROQ_CONFIG };
