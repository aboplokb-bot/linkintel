'use client';

import { useState } from 'react';
import { ProcessResult } from '@/app/types';

interface ExportBarProps {
  data: ProcessResult;
}

type ExportFormat = 'txt' | 'md' | 'srt';

export default function ExportBar({ data }: ExportBarProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, data }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const filename = (data?.metadata?.title ?? "Untitled")
  .toString()
  .replace(/[^a-z0-9]/gi, '_')
  .slice(0, 60);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(null);
    }
  };

  const formats: Array<{ id: ExportFormat; label: string; desc: string }> = [
    { id: 'txt', label: 'TXT', desc: 'Full transcript' },
    { id: 'md', label: 'MD', desc: 'Structured Markdown' },
    { id: 'srt', label: 'SRT', desc: 'Timestamped subtitles' },
  ];

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="section-label">EXPORT</div>
      <div className="flex flex-wrap gap-2">
        {formats.map(f => (
          <button
            key={f.id}
            onClick={() => handleExport(f.id)}
            disabled={exporting === f.id}
            className="btn-ghost flex items-center gap-1.5"
            title={f.desc}
          >
            {exporting === f.id ? (
              <span className="spinner" style={{ width: 10, height: 10 }} />
            ) : (
              <span style={{ fontSize: '0.8rem' }}>↓</span>
            )}
            {f.label}
            <span style={{ color: 'var(--ghost-dim)', fontSize: '0.6rem', marginLeft: '2px' }}>
              {f.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
