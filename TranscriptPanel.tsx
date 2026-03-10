'use client';

import { useRef, useCallback } from 'react';
import { TranscriptResult } from '@/app/types';
import CopyButton from './CopyButton';

interface TranscriptPanelProps {
  transcript: TranscriptResult;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function groupSegmentsIntoParagraphs(segments: TranscriptResult['segments'], wordsPerParagraph = 80) {
  const paragraphs: Array<{ start: number; end: number; text: string }> = [];
  let currentWords: string[] = [];
  let currentStart = 0;
  let currentEnd = 0;

  for (const seg of segments) {
    const words = seg.text.split(' ');
    currentWords.push(...words);
    if (paragraphs.length === 0 && currentWords.length === words.length) currentStart = seg.start;
    currentEnd = seg.end;

    if (currentWords.length >= wordsPerParagraph) {
      paragraphs.push({ start: currentStart, end: currentEnd, text: currentWords.join(' ') });
      currentWords = [];
      currentStart = seg.end;
    }
  }

  if (currentWords.length > 0) {
    paragraphs.push({ start: currentStart, end: currentEnd, text: currentWords.join(' ') });
  }

  return paragraphs;
}

export default function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paragraphs = groupSegmentsIntoParagraphs(transcript.segments);

  const handleTimestampClick = useCallback((seconds: number) => {
    // For future: link to video player
    console.log(`Jump to: ${seconds}s`);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="section-label flex-1">TRANSCRIPT</div>
        <div className="ml-4 flex items-center gap-2">
          <span className="font-mono text-xs text-ghost-dim">
            {transcript.segments.length} segments · {Math.round(transcript.duration / 60)} min
          </span>
          <CopyButton text={transcript.fullText} label="All" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-2"
        style={{ maxHeight: '60vh' }}
      >
        <div className="flex flex-col gap-5">
          {paragraphs.map((para, i) => (
            <div key={i} className="flex gap-3 group fade-up" style={{ animationDelay: `${i * 0.02}s` }}>
              <button
                onClick={() => handleTimestampClick(para.start)}
                className="timestamp flex-shrink-0 mt-0.5"
                title={`${formatTime(para.start)}`}
              >
                {formatTime(para.start)}
              </button>
              <p className="text-ghost-bright text-sm leading-relaxed flex-1">
                {para.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
