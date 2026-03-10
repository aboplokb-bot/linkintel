// ============================================================
// LINKINTEL — Core Types
// ============================================================

export type SupportedPlatform = 'youtube' | 'loom' | 'vimeo' | 'mp4' | 'mp3' | 'unknown';

export interface ParsedURL {
  platform: SupportedPlatform;
  originalUrl: string;
  videoId?: string;
  isSupported: boolean;
  error?: string;
}

export interface MediaMetadata {
  title: string;
  duration?: number; // seconds
  thumbnail?: string;
  platform: SupportedPlatform;
  author?: string;
}

export interface TranscriptSegment {
  id: number;
  start: number; // seconds
  end: number;   // seconds
  text: string;
}

export interface TranscriptResult {
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
  duration: number;
}

export interface InsightsResult {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

export interface ContentAssets {
  captions: string;
  thread: string[];
  carousel: CarouselSlide[];
  script: ShortFormScript;
}

export interface CarouselSlide {
  slideNumber: number;
  headline: string;
  bullets: string[];
}

export interface ShortFormScript {
  hook: string;
  body: string;
  close: string;
  fullScript: string;
}

export type ProcessingStatus =
  | 'idle'
  | 'parsing'
  | 'fetching_metadata'
  | 'extracting_audio'
  | 'transcribing'
  | 'generating_insights'
  | 'generating_assets'
  | 'complete'
  | 'error';

export interface ProcessingState {
  status: ProcessingStatus;
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface ProcessResult {
  metadata: MediaMetadata;
  transcript: TranscriptResult;
  insights: InsightsResult;
  assets: ContentAssets;
  processedAt: string;
}

// API Request/Response shapes
export interface ProcessRequest {
  url: string;
  options?: {
    removeFillersWords?: boolean;
    language?: string;
  };
}

export interface ProcessResponse {
  success: boolean;
  data?: ProcessResult;
  error?: string;
  jobId?: string;
}

export interface ExportRequest {
  format: 'txt' | 'md' | 'srt';
  data: ProcessResult;
}

// Transcription provider abstraction
export interface TranscriptionProvider {
  name: string;
  transcribe(audioPath: string, options?: TranscriptionOptions): Promise<TranscriptResult>;
}

export interface TranscriptionOptions {
  language?: string;
  timestamps?: boolean;
  model?: string;
}
