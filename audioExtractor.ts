// ============================================================
// LINKINTEL — Audio Extractor
// Uses yt-dlp to pull audio from supported platforms
// ============================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { ParsedURL, MediaMetadata } from '@/app/types';

const execAsync = promisify(exec);
const TEMP_DIR = process.env.TEMP_DIR || '/tmp';
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '500');

export interface ExtractedAudio {
  audioPath: string;
  metadata: MediaMetadata;
  cleanup: () => void;
}

async function checkYtDlp(): Promise<void> {
  try {
    await execAsync('yt-dlp --version');
  } catch {
    throw new Error('yt-dlp is not installed. Run: pip install yt-dlp');
  }
}

export async function extractAudio(parsed: ParsedURL): Promise<ExtractedAudio> {
  await checkYtDlp();

  const jobId = `linkintel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const outputTemplate = path.join(TEMP_DIR, `${jobId}.%(ext)s`);
  const finalPath = path.join(TEMP_DIR, `${jobId}.wav`);

  let metadata: MediaMetadata = {
    title: 'Untitled',
    platform: parsed.platform,
  };

  try {
    // Fetch metadata first
    metadata = await fetchMetadata(parsed);

    // Extract audio based on platform
    if (parsed.platform === 'mp3') {
      // Direct audio URL — download and convert
      await execAsync(
        `yt-dlp -x --audio-format wav --audio-quality 0 --no-playlist ` +
        `--max-filesize ${MAX_FILE_SIZE_MB}m ` +
        `-o "${outputTemplate}" "${parsed.originalUrl}"`
      );
    } else {
      // Video URL — extract audio only
      await execAsync(
        `yt-dlp -x --audio-format wav --audio-quality 0 ` +
        `--no-playlist --no-warnings ` +
        `--max-filesize ${MAX_FILE_SIZE_MB}m ` +
        `-o "${outputTemplate}" "${parsed.originalUrl}"`
      );
    }

    // Find generated file (yt-dlp may rename)
    const generatedPath = findGeneratedFile(jobId);
    if (!generatedPath) throw new Error('Audio extraction failed — no output file found.');

    // Convert to WAV if needed
    let audioPath = generatedPath;
    if (!generatedPath.endsWith('.wav')) {
      await execAsync(`ffmpeg -i "${generatedPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${finalPath}" -y`);
      fs.unlinkSync(generatedPath);
      audioPath = finalPath;
    } else {
      // Normalize existing WAV
      const normalizedPath = finalPath.replace('.wav', '_norm.wav');
      await execAsync(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${normalizedPath}" -y`);
      fs.unlinkSync(audioPath);
      audioPath = normalizedPath;
    }

    // Check file size
    const stats = fs.statSync(audioPath);
    const sizeMB = stats.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      fs.unlinkSync(audioPath);
      throw new Error(`File too large (${sizeMB.toFixed(0)}MB). Max is ${MAX_FILE_SIZE_MB}MB.`);
    }

    const cleanup = () => {
      try { if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath); } catch {}
    };

    return { audioPath, metadata, cleanup };
  } catch (error: unknown) {
    // Cleanup on error
    cleanupJob(jobId);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Private video') || msg.includes('Sign in')) {
      throw new Error('This video is private or requires login. Please use a public URL.');
    }
    if (msg.includes('max-filesize')) {
      throw new Error(`Video is too large. Please use a video under ${MAX_FILE_SIZE_MB}MB.`);
    }
    if (msg.includes('Unsupported URL') || msg.includes('Unable to extract')) {
      throw new Error('Could not extract audio from this URL. It may be unsupported or the video may be unavailable.');
    }
    throw new Error(`Audio extraction failed: ${msg}`);
  }
}

async function fetchMetadata(parsed: ParsedURL): Promise<MediaMetadata> {
  try {
    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-warnings --skip-download "${parsed.originalUrl}" 2>/dev/null`
    );
    const info = JSON.parse(stdout.trim());
    return {
      title: info.title || 'Untitled',
      duration: info.duration,
      thumbnail: info.thumbnail,
      platform: parsed.platform,
      author: info.uploader || info.channel || info.creator,
    };
  } catch {
    return { title: 'Untitled', platform: parsed.platform };
  }
}

function findGeneratedFile(jobId: string): string | null {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const match = files.find(f => f.startsWith(jobId));
    return match ? path.join(TEMP_DIR, match) : null;
  } catch {
    return null;
  }
}

function cleanupJob(jobId: string): void {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    files.filter(f => f.startsWith(jobId)).forEach(f => {
      try { fs.unlinkSync(path.join(TEMP_DIR, f)); } catch {}
    });
  } catch {}
}
