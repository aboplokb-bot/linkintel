// ============================================================
// LINKINTEL — Job Processor
// Orchestrates the full ingestion → transcription → intelligence pipeline
// ============================================================

import { parseMediaURL } from '@/app/lib/urlParser';
import { extractAudio } from '@/app/server/audioExtractor';
import { getTranscriptionProvider } from '@/app/server/transcriptionProvider';
import { generateInsights, generateContentAssets } from '@/app/server/intelligenceEngine';
import { ProcessRequest, ProcessResponse, ProcessResult } from '@/app/types';

export async function processMediaJob(request: ProcessRequest): Promise<ProcessResponse> {
  const { url, options = {} } = request;

  // Step 1: Parse and validate URL
  const parsed = parseMediaURL(url);
  if (!parsed.isSupported) {
    return { success: false, error: parsed.error || 'Unsupported URL.' };
  }

  let cleanup: (() => void) | null = null;

  try {
    // Step 2: Extract audio
    const extracted = await extractAudio(parsed);
    cleanup = extracted.cleanup;

    // Step 3: Transcribe
    const provider = getTranscriptionProvider();
    const transcript = await provider.transcribe(extracted.audioPath, {
      language: options.language || 'en',
      timestamps: true,
    });

    // Post-process transcript
    if (options.removeFillersWords) {
      transcript.fullText = removeFillersWords(transcript.fullText);
      transcript.segments = transcript.segments.map(seg => ({
        ...seg,
        text: removeFillersWords(seg.text),
      }));
    }

    // Step 4: Generate insights
    const insights = await generateInsights(transcript);

    // Step 5: Generate content assets
    const assets = await generateContentAssets(transcript, extracted.metadata.title);

    const result: ProcessResult = {
      metadata: extracted.metadata,
      transcript,
      insights,
      assets,
      processedAt: new Date().toISOString(),
    };

    return { success: true, data: result };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  } finally {
    cleanup?.();
  }
}

function removeFillersWords(text: string): string {
  const fillers = /\b(um|uh|er|ah|like|you know|basically|literally|actually|sort of|kind of|right\?|okay so|so yeah)\b,?\s*/gi;
  return text.replace(fillers, ' ').replace(/\s+/g, ' ').trim();
}
