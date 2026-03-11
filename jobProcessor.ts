import { parseMediaURL } from '@/app/lib/urlParser';
import { extractAudio } from '@/app/server/audioExtractor';
import { getTranscriptionProvider } from '@/app/server/transcriptionProvider';
import { generateInsights, generateContentAssets } from '@/app/server/intelligenceEngine';
import { ProcessRequest, ProcessResponse, ProcessResult } from '@/app/types';

export async function processMediaJob(request: ProcessRequest): Promise<ProcessResponse> {
  const { url, options = {} } = request;

  const parsed = parseMediaURL(url);
  if (!parsed.isSupported) {
    return { success: false, error: parsed.error || 'Unsupported URL.' };
  }

  let cleanup: (() => void) | null = null;

  try {
    const extracted = await extractAudio(parsed);
    cleanup = extracted.cleanup;

    const provider = getTranscriptionProvider();
    const transcript = await provider.transcribe(extracted.audioPath, {
      language: options.language || 'en',
      timestamps: true,
    });

    if (options.removeFillersWords) {
      const fillers = /\b(um|uh|er|ah|like|you know|basically|literally|actually|sort of|kind of)\b,?\s*/gi;
      transcript.fullText = transcript.fullText.replace(fillers, ' ').replace(/\s+/g, ' ').trim();
      transcript.segments = transcript.segments.map(seg => ({
        ...seg,
        text: seg.text.replace(fillers, ' ').replace(/\s+/g, ' ').trim(),
      }));
    }

    const insights = await generateInsights(transcript);
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