import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { TranscriptionProvider, TranscriptionOptions, TranscriptResult } from '@/app/types';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const MAX_WHISPER_SIZE_BYTES = 24 * 1024 * 1024;

export class WhisperProvider implements TranscriptionProvider {
  name = 'whisper';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioPath: string, options: TranscriptionOptions = {}): Promise<TranscriptResult> {
    const stats = fs.statSync(audioPath);
    if (stats.size > MAX_WHISPER_SIZE_BYTES) {
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

    const data = await response.json() as {
      text: string;
      language: string;
      duration: number;
      segments: Array<{ id: number; start: number; end: number; text: string }>;
    };

    const segments = (data.segments || []).map((seg, i) => ({
      id: i,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim().replace(/\s+/g, ' '),
    }));

    return {
      segments,
      fullText: segments.map(s => s.text).join(' '),
      language: data.language || 'en',
      duration: data.duration || 0,
    };
  }

  private async transcribeChunked(audioPath: string, options: TranscriptionOptions): Promise<TranscriptResult> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const tmpDir = process.env.TEMP_DIR || '/tmp';
    const chunkPattern = path.join(tmpDir, `chunk_%03d_${Date.now()}.wav`);

    await execAsync(`ffmpeg -i "${audioPath}" -f segment -segment_time 1200 -c copy "${chunkPattern}" -y`);

    const dirFiles = fs.readdirSync(tmpDir);
    const chunkFiles = dirFiles
      .filter(f => f.match(/^chunk_\d+_/))
      .sort()
      .map(f => path.join(tmpDir, f));

    const allSegments: TranscriptResult['segments'] = [];
    let segmentOffset = 0;
    let totalDuration = 0;

    for (const chunkFile of chunkFiles) {
      const result = await this.transcribeSingle(chunkFile, options);
      const offsetted = result.segments.map(seg => ({
        ...seg,
        start: seg.start + segmentOffset,
        end: seg.end + segmentOffset,
      }));
      allSegments.push(...offsetted);
      segmentOffset += result.duration;
      totalDuration += result.duration;
      fs.unlinkSync(chunkFile);
    }

    return {
      segments: allSegments,
      fullText: allSegments.map(s => s.text).join(' '),
      language: options.language || 'en',
      duration: totalDuration,
    };
  }
}

export function getTranscriptionProvider(): TranscriptionProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');
  return new WhisperProvider(apiKey);
}