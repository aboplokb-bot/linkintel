// ============================================================
// LINKINTEL — Intelligence Engine
// Generates insights and content assets using GPT-4
// ============================================================

import { TranscriptResult, InsightsResult, ContentAssets, CarouselSlide, ShortFormScript } from '@/app/types';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

async function callGPT(systemPrompt: string, userPrompt: string, maxTokens = 2000): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GPT API error: ${response.status} — ${err}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content.trim();
}

function truncateTranscript(text: string, maxChars = 12000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n\n[...transcript continues...]';
}

// ---- Insights Generation ----

export async function generateInsights(transcript: TranscriptResult): Promise<InsightsResult> {
  const text = truncateTranscript(transcript.fullText);

  const systemPrompt = `You are an expert content analyst. Extract structured intelligence from transcripts.
Always respond with valid JSON only. No markdown, no explanation.`;

  const userPrompt = `Analyze this transcript and return JSON with this exact structure:
{
  "summary": "A clear, structured 2-3 paragraph summary of the content",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "actionItems": ["action 1", "action 2", "action 3", "action 4"]
}

Rules:
- Summary should capture the core message, main arguments, and conclusion
- Key points should be distinct, specific, and insightful (5-8 points)
- Action items should be concrete, actionable steps a viewer could take (3-6 items)
- Write in third person for summary, imperative for actions

TRANSCRIPT:
${text}`;

  const raw = await callGPT(systemPrompt, userPrompt, 1500);
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return {
      summary: parsed.summary || '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
    };
  } catch {
    // Fallback parse attempt
    return {
      summary: raw.slice(0, 500),
      keyPoints: ['See transcript for details'],
      actionItems: ['Review transcript for action items'],
    };
  }
}

// ---- Content Assets Generation ----

export async function generateContentAssets(transcript: TranscriptResult, title: string): Promise<ContentAssets> {
  const text = truncateTranscript(transcript.fullText, 8000);

  const systemPrompt = `You are an expert social media content creator and strategist.
Create high-converting, platform-native content from transcripts.
Always respond with valid JSON only. No markdown code blocks.`;

  const userPrompt = `Create content assets from this transcript titled: "${title}"

Return JSON with this exact structure:
{
  "captions": "A single punchy Instagram/LinkedIn caption (150-220 words). Start with a hook. Use line breaks for readability. End with a clear CTA.",
  "thread": [
    "Tweet 1 (the hook, max 260 chars)",
    "Tweet 2",
    "Tweet 3",
    "Tweet 4",
    "Tweet 5",
    "Tweet 6 (CTA/close)"
  ],
  "carousel": [
    { "slideNumber": 1, "headline": "Hook slide title", "bullets": ["single compelling point"] },
    { "slideNumber": 2, "headline": "Slide 2 title", "bullets": ["bullet 1", "bullet 2", "bullet 3"] },
    { "slideNumber": 3, "headline": "Slide 3 title", "bullets": ["bullet 1", "bullet 2", "bullet 3"] },
    { "slideNumber": 4, "headline": "Slide 4 title", "bullets": ["bullet 1", "bullet 2"] },
    { "slideNumber": 5, "headline": "Slide 5 title", "bullets": ["bullet 1", "bullet 2"] },
    { "slideNumber": 6, "headline": "Slide 6 title", "bullets": ["bullet 1", "bullet 2"] },
    { "slideNumber": 7, "headline": "Key takeaway", "bullets": ["The single most important insight"] },
    { "slideNumber": 8, "headline": "Save this! Follow for more.", "bullets": ["CTA line"] }
  ],
  "script": {
    "hook": "Opening hook (10-15 sec script, one sentence that creates curiosity)",
    "body": "Core value delivery (30-40 sec, 3-4 key points from the content)",
    "close": "Strong close with CTA (5-10 sec)",
    "fullScript": "Complete combined script with [HOOK], [BODY], [CLOSE] labels"
  }
}

TRANSCRIPT:
${text}`;

  const raw = await callGPT(systemPrompt, userPrompt, 2500);
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    const carousel: CarouselSlide[] = Array.isArray(parsed.carousel)
      ? parsed.carousel.map((s: { slideNumber: number; headline: string; bullets: string[] }) => ({
          slideNumber: s.slideNumber,
          headline: s.headline || '',
          bullets: Array.isArray(s.bullets) ? s.bullets : [],
        }))
      : [];

    const scriptData = parsed.script || {};
    const script: ShortFormScript = {
      hook: scriptData.hook || '',
      body: scriptData.body || '',
      close: scriptData.close || '',
      fullScript: scriptData.fullScript || [scriptData.hook, scriptData.body, scriptData.close].join('\n\n'),
    };

    return {
      captions: parsed.captions || '',
      thread: Array.isArray(parsed.thread) ? parsed.thread : [],
      carousel,
      script,
    };
  } catch {
    return {
      captions: 'Content generation failed. Please retry.',
      thread: [],
      carousel: [],
      script: { hook: '', body: '', close: '', fullScript: '' },
    };
  }
}
