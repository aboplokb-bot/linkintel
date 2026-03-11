import { ParsedURL, SupportedPlatform } from '@/app/types';

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

const LOOM_PATTERN = /loom\.com\/share\/([a-zA-Z0-9]+)/;
const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;
const MP4_PATTERN = /\.(mp4|m4v|mov|avi|webm)(\?.*)?$/i;
const MP3_PATTERN = /\.(mp3|wav|m4a|ogg|aac|flac)(\?.*)?$/i;

export function parseMediaURL(rawUrl: string): ParsedURL {
  const url = rawUrl.trim();

  if (!url) {
    return { platform: 'unknown', originalUrl: url, isSupported: false, error: 'Please enter a URL.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { platform: 'unknown', originalUrl: url, isSupported: false, error: 'Invalid URL format. Please include https://' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { platform: 'unknown', originalUrl: url, isSupported: false, error: 'Only HTTP/HTTPS URLs are supported.' };
  }

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return { platform: 'youtube', originalUrl: url, videoId: match[1], isSupported: true };
    }
  }

  const loomMatch = url.match(LOOM_PATTERN);
  if (loomMatch) {
    return { platform: 'loom', originalUrl: url, videoId: loomMatch[1], isSupported: true };
  }

  const vimeoMatch = url.match(VIMEO_PATTERN);
  if (vimeoMatch) {
    return { platform: 'vimeo', originalUrl: url, videoId: vimeoMatch[1], isSupported: true };
  }

  if (MP4_PATTERN.test(parsed.pathname)) {
    return { platform: 'mp4', originalUrl: url, isSupported: true };
  }

  if (MP3_PATTERN.test(parsed.pathname)) {
    return { platform: 'mp3', originalUrl: url, isSupported: true };
  }

  return {
    platform: 'unknown',
    originalUrl: url,
    isSupported: false,
    error: 'Unsupported source. LINKINTEL supports YouTube, Loom, Vimeo, and direct MP4/MP3 URLs.',
  };
}

export function getPlatformLabel(platform: SupportedPlatform): string {
  const labels: Record<SupportedPlatform, string> = {
    youtube: 'YouTube',
    loom: 'Loom',
    vimeo: 'Vimeo',
    mp4: 'Direct Video',
    mp3: 'Direct Audio',
    unknown: 'Unknown',
  };
  return labels[platform];
}

export function getPlatformIcon(platform: SupportedPlatform): string {
  const icons: Record<SupportedPlatform, string> = {
    youtube: '▶',
    loom: '⬤',
    vimeo: '◈',
    mp4: '⬡',
    mp3: '♪',
    unknown: '?',
  };
  return icons[platform];
}