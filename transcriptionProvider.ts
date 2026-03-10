// ============================================================
// LINKINTEL — Whisper Transcription Provider
// Implements TranscriptionProvider interface for OpenAI Whisper
// ============================================================

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { TranscriptionProvider, TranscriptionOptions, TranscriptResult, TranscriptSegment } from '@/app/types';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const MAX_WHISPER_SIZE_MB = 24; // Whisper limit is 25MB, use 24 for safety
const MAX_WHISPER_SIZE_BYTES = MAX_WHISPER_SIZE_MB * 1024 * 1024;

export class WhisperProvider implements TranscriptionProvider {
  name = 'whisper';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioPath: string, options: TranscriptionOptions = {}): Promise<TranscriptResult> {
    const stats = fs.statSync(audioPath);
    const fileSize = stats.size;

    if (fileSize > MAX_WHISPER_SIZE_BYTES) {
      // Split into chunks
      return this.transcribeChunked(audioPath, options);
    }

    return this.transcribeSingle(audioPath, options);
  }

  private async transcribeSingle(audioPath: string, options: TranscriptionOptions): Promise<TranscriptResult> {
    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath), {
      filename: path.basename(audioPath),
      contentType: 'audio/wav',
    });
    form.append('model', options.model || 'whisper-1');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'segment');
    if (options.language) form.append('language', options.language);

    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...form.getHeaders(),
      },
      body: form as unknown as BodyInit,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Whisper API error: ${response.status} — ${err}`);
    }

    const data = await response.json() as WhisperVerboseResponse;
    return this.parseWhisperResponse(data);
  }

  private async transcribeChunked(audioPath: string, options: TranscriptionOptions): Promise<TranscriptResult> {
    // Use ffmpeg to split into chunks
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const tmpDir = process.env.TEMP_DIR || '/tmp';
    const chunkPattern = path.join(tmpDir, `chunk_%03d_${Date.now()}.wav`);

    // Split into ~20MB chunks (roughly 20 minutes at 128kbps)
    await execAsync(`ffmpeg -i "${audioPath}" -f segment -segment_time 1200 -c copy "${chunkPattern}" -y`);

    // Find generated chunks
    const dirFiles = fs.readdirSync(tmpDir);
    const chunkFiles = dirFiles
      .filter(f => f.match(/^chunk_\d+_/))
      .sort()
      .map(f => path.join(tmpDir, f));

    const allSegments: TranscriptSegment[] = [];
    let segmentOffset = 0;
    let totalDuration = 0;

    for (const chunkFile of chunkFiles) {
      const result = await this.transcribeSingle(chunkFile, options);
      const offsettedSegments = result.segments.map(seg => ({
        ...seg,
        start: seg.start + segmentOffset,
        end: seg.end + segmentOffset,
      }));
      allSegments.push(...offsettedSegments);
      segmentOffset += result.duration;
      totalDuration += result.duration;
      fs.unlinkSync(chunkFile);
    }

    const fullText = allSegments.map(s => s.text).join(' ');
    return {
      segments: allSegments,
      fullText,
      language: options.language || 'en',
      duration: totalDuration,
    };
  }

  private parseWhisperResponse(data: WhisperVerboseResponse): TranscriptResult {
    const segments: TranscriptSegment[] = (data.segments || []).map((seg, i) => ({
      id: i,
      start: seg.start,
      end: seg.end,
      text: this.cleanText(seg.text),
    }));

    return {
      segments,
      fullText: segments.map(s => s.text).join(' '),
      language: data.language || 'en',
      duration: data.duration || 0,
    };
  }

  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^[,\s]+/, '');
  }
}

interface WhisperVerboseResponse {
  text: string;
  language: string;
  duration: number;
  segments: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
}

// Factory to get the configured provider
export function getTranscriptionProvider(): TranscriptionProvider {
  const provider = process.env.TRANSCRIPTION_PROVIDER || 'whisper';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');

  switch (provider) {
    case 'whisper':
    default:
      return new WhisperProvider(apiKey);
  }
}
