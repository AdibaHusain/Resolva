import 'dotenv/config';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const VALID_CATEGORIES   = ['electrical','plumbing','wifi','hostel','academic','food','safety','event','other'];
const VALID_PRIORITIES   = ['low','medium','high','critical'];
const DEPARTMENT_MAP     = {
  electrical: 'Electrical & Maintenance',
  plumbing:   'Civil & Plumbing',
  wifi:       'IT & Network',
  hostel:     'Hostel Administration',
  academic:   'Academic Affairs',
  food:       'Mess & Catering',
  safety:     'Security & Safety',
  event:      'Student Affairs',
  other:      'General Administration',
};

// ─── Build the prompt ────────────────────────────────────────────────────────
const buildPrompt = (title, description, userCategory) => `
You are a complaint analysis engine for a college campus management system.
Analyze the following student complaint and return a JSON object ONLY — no explanation, no markdown, no extra text.

Complaint title: "${title}"
Complaint description: "${description}"
User-selected category: "${userCategory}"

Return this exact JSON structure:
{
  "category": "<one of: electrical, plumbing, wifi, hostel, academic, food, safety, event, other>",
  "priority": "<one of: low, medium, high, critical>",
  "severityScore": <integer 1-10>,
  "isUrgent": <true or false>,
  "suggestedDepartment": "<department name string>",
  "aiReason": "<one sentence explaining why this priority was assigned>"
}

Scoring guide:
- severityScore 9-10 + critical: immediate safety risk (electrical near water, fire hazard, structural damage, medical emergency)
- severityScore 7-8 + high: significant impact on many students, health risk, essential service outage (WiFi down campus-wide, no water in hostel)
- severityScore 5-6 + medium: moderate inconvenience, affects some students (single room WiFi, broken furniture, food quality)
- severityScore 1-4 + low: minor issue, cosmetic, or informational (suggestion, minor damage, single student affected)

If the user-selected category seems wrong based on the description, correct it.
The suggestedDepartment should be the most relevant department that should handle this.
`;

// ─── Parse and validate the AI response ──────────────────────────────────────
const parseAIResponse = (raw) => {
  try {
    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    // Validate and sanitize — never trust raw AI output directly
    return {
      category:           VALID_CATEGORIES.includes(parsed.category) ? parsed.category : null,
      priority:           VALID_PRIORITIES.includes(parsed.priority) ? parsed.priority : 'medium',
      severityScore:      Number.isInteger(parsed.severityScore) && parsed.severityScore >= 1 && parsed.severityScore <= 10
                            ? parsed.severityScore : 5,
      isUrgent:           typeof parsed.isUrgent === 'boolean' ? parsed.isUrgent : false,
      suggestedDepartment: typeof parsed.suggestedDepartment === 'string' ? parsed.suggestedDepartment.slice(0, 100) : '',
      aiReason:           typeof parsed.aiReason === 'string' ? parsed.aiReason.slice(0, 300) : '',
    };
  } catch {
    return null; // parsing failed — caller handles graceful fallback
  }
};

// ─── Main exported function ───────────────────────────────────────────────────
export const analyzeComplaint = async (title, description, userCategory) => {
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001', // fast + cheap — perfect for classification
        max_tokens: 300,
        messages: [
          { role: 'user', content: buildPrompt(title, description, userCategory) }
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[AI Service] API error:', response.status, err);
      return null;
    }

    const data  = await response.json();
    const raw   = data.content?.[0]?.text ?? '';
    const result = parseAIResponse(raw);

    if (!result) {
      console.error('[AI Service] Failed to parse response:', raw);
      return null;
    }

    console.log(`[AI Service] Analyzed: severity=${result.severityScore}, priority=${result.priority}, urgent=${result.isUrgent}`);
    return result;

  } catch (err) {
    // Network error, timeout, etc. — never crash the complaint flow
    console.error('[AI Service] Unexpected error:', err.message);
    return null;
  }
};