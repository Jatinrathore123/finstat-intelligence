// The AI Analyst calls Google's Gemini API directly from the browser using
// a key the USER supplies and pastes into the app. The key is kept only in
// localStorage on their machine — it is never sent anywhere except Google's
// API endpoint, and there is no backend/server in this project to store it.
// Gemini has a free tier (as of writing) which is why it's used here instead
// of a paid API. Users can get a free key at https://aistudio.google.com/apikey

const GEMINI_MODEL = 'gemini-2.0-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export function getStoredApiKey() {
  return localStorage.getItem('finstat_gemini_key') || ''
}

export function setStoredApiKey(key) {
  if (key) localStorage.setItem('finstat_gemini_key', key)
  else localStorage.removeItem('finstat_gemini_key')
}

// Builds a prompt strictly from computed data — the model is instructed to
// only reason over the numbers given, never invent figures.
function buildPrompt(companyName, year, prevYear, snapshot) {
  return `You are a financial analyst reviewing a company's financial statements.
You must ONLY use the numbers provided below. Never invent or estimate a figure
that isn't given to you. If something can't be determined from the data, say so
explicitly rather than guessing. Do not give buy/sell/hold investment advice —
this is analytical commentary only, not investment advice.

Company: ${companyName || 'The company'}
Analysis year: ${year}${prevYear ? ` (compared with ${prevYear})` : ''}

Structured financial data (JSON):
${JSON.stringify(snapshot, null, 2)}

Answer the following, using short, specific paragraphs grounded in the numbers above:
1. What is happening? (2-3 sentences summarizing the period)
2. Why is it happening? (link the ratio/trend changes to likely operational causes)
3. Is it good or bad, and for whom (equity holder vs lender vs management)?
4. What should be investigated further?
5. Top 3 strengths
6. Top 3 risks/concerns
7. Top 3 questions to ask management

Format your response in clear markdown with headers for each section.`
}

export async function runAiAnalyst({ apiKey, companyName, year, prevYear, snapshot }) {
  if (!apiKey) {
    throw new Error('No API key set. Add a free Gemini API key in AI Analyst settings.')
  }
  const prompt = buildPrompt(companyName, year, prevYear, snapshot)

  const res = await fetch(`${API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3 },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`AI request failed (${res.status}). ${errText.slice(0, 200)}`)
  }

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || ''
  if (!text) throw new Error('AI returned an empty response. Try again.')
  return text
}
