export interface ContentAssets {
  captions: string;
  thread: string[];
  carousel: {
    slideNumber: number;
    headline: string;
    bullets: string[];
  }[];
  script: {
    hook: string;
    body: string;
    close: string;
    fullScript: string;
  };
}

export interface ProcessResult {
  transcript: string;
  summary: string;
  assets: ContentAssets;
}
