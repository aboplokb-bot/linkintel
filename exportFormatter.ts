// ============================================================
// LINKINTEL — Export Formatter
// Converts ProcessResult into TXT, Markdown, SRT
// ============================================================

import { ProcessResult, TranscriptSegment } from '@/app/types';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

export function exportAsTXT(data: ProcessResult): string {
  const lines: string[] = [];

  lines.push(`LINKINTEL TRANSCRIPT EXPORT`);
  lines.push(`${'='.repeat(60)}`);
  lines.push(`Title: ${data.metadata.title}`);
  lines.push(`Platform: ${data.metadata.platform}`);
  if (data.metadata.author) lines.push(`Author: ${data.metadata.author}`);
  if (data.metadata.duration) lines.push(`Duration: ${formatTime(data.metadata.duration)}`);
  lines.push(`Processed: ${new Date(data.processedAt).toLocaleString()}`);
  lines.push('');
  lines.push(`${'='.repeat(60)}`);
  lines.push('SUMMARY');
  lines.push(`${'='.repeat(60)}`);
  lines.push(data.insights.summary);
  lines.push('');

  lines.push(`${'='.repeat(60)}`);
  lines.push('KEY POINTS');
  lines.push(`${'='.repeat(60)}`);
  data.insights.keyPoints.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  lines.push('');

  lines.push(`${'='.repeat(60)}`);
  lines.push('ACTION ITEMS');
  lines.push(`${'='.repeat(60)}`);
  data.insights.actionItems.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
  lines.push('');

  lines.push(`${'='.repeat(60)}`);
  lines.push('FULL TRANSCRIPT');
  lines.push(`${'='.repeat(60)}`);
  data.transcript.segments.forEach(seg => {
    lines.push(`[${formatTime(seg.start)}] ${seg.text}`);
  });

  return lines.join('\n');
}

export function exportAsMarkdown(data: ProcessResult): string {
  const lines: string[] = [];

  lines.push(`# ${data.metadata.title}`);
  lines.push('');
  lines.push(`> **Platform:** ${data.metadata.platform} | **Processed:** ${new Date(data.processedAt).toLocaleDateString()}`);
  if (data.metadata.author) lines.push(`> **Author:** ${data.metadata.author}`);
  if (data.metadata.duration) lines.push(`> **Duration:** ${formatTime(data.metadata.duration)}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## 📋 Summary');
  lines.push('');
  lines.push(data.insights.summary);
  lines.push('');

  lines.push('## 💡 Key Points');
  lines.push('');
  data.insights.keyPoints.forEach(p => lines.push(`- ${p}`));
  lines.push('');

  lines.push('## ✅ Action Items');
  lines.push('');
  data.insights.actionItems.forEach(a => lines.push(`- [ ] ${a}`));
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## 📱 Content Assets');
  lines.push('');

  lines.push('### Caption');
  lines.push('');
  lines.push('```');
  lines.push(data.assets.captions);
  lines.push('```');
  lines.push('');

  lines.push('### Twitter/X Thread');
  lines.push('');
  data.assets.thread.forEach((tweet, i) => {
    lines.push(`**${i + 1}/${data.assets.thread.length}**`);
    lines.push('');
    lines.push(tweet);
    lines.push('');
  });

  lines.push('### Carousel Slides');
  lines.push('');
  data.assets.carousel.forEach(slide => {
    lines.push(`**Slide ${slide.slideNumber}: ${slide.headline}**`);
    slide.bullets.forEach(b => lines.push(`- ${b}`));
    lines.push('');
  });

  lines.push('### Short-Form Script');
  lines.push('');
  lines.push('**[HOOK]**');
  lines.push(data.assets.script.hook);
  lines.push('');
  lines.push('**[BODY]**');
  lines.push(data.assets.script.body);
  lines.push('');
  lines.push('**[CLOSE]**');
  lines.push(data.assets.script.close);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## 🎙 Full Transcript');
  lines.push('');
  data.transcript.segments.forEach(seg => {
    lines.push(`**\`${formatTime(seg.start)}\`** ${seg.text}`);
    lines.push('');
  });

  return lines.join('\n');
}

export function exportAsSRT(data: ProcessResult): string {
  return data.transcript.segments
    .map((seg, index) => {
      return [
        `${index + 1}`,
        `${formatSRTTime(seg.start)} --> ${formatSRTTime(seg.end)}`,
        seg.text,
        '',
      ].join('\n');
    })
    .join('\n');
}
