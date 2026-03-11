'use client';

import { useState, useCallback } from 'react';
import { parseMediaURL, getPlatformLabel } from '@/app/lib/urlParser';
import { ParsedURL } from '@/app/types';

interface URLInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function URLInput({ onSubmit, isLoading }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<ParsedURL | null>(null);
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    if (val.trim().length > 10) {
      setParsed(parseMediaURL(val));
      setTouched(true);
    } else {
      setParsed(null);
      setTouched(false);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    const p = parseMediaURL(url);
    if (!p.isSupported) {
      setParsed(p);
      setTouched(true);
      return;
    }
    onSubmit(url.trim());
  }, [url, isLoading, onSubmit]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted) {
      setTimeout(() => {
        setParsed(parseMediaURL(pasted));
        setTouched(true);
      }, 50);
    }
  }, []);

  const isValid = parsed?.isSupported === true;
  const isInvalid = touched && parsed && !parsed.isSupported;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            className={`url-input pr-32 ${isInvalid ? 'border-red-500/50' : ''} ${isValid ? 'border-signal/30' : ''}`}
            placeholder="Paste YouTube, Loom, Vimeo, or MP4/MP3 URL..."
            value={url}
            onChange={handleChange}
            onPaste={handlePaste}
            disabled={isLoading}
            autoFocus
            spellCheck={false}
          />
          {isValid && parsed && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-signal bg-signal-glow border border-signal/20 px-2 py-0.5 rounded"
              style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              {getPlatformLabel(parsed.platform).toUpperCase()}
            </span>
          )}
        </div>
        {isInvalid && parsed?.error && (
          <p className="text-red-400 font-mono text-xs px-1 fade-up">{parsed.error}</p>
        )}
        <button type="submit" className="btn-primary flex items-center justify-center gap-2"
          disabled={isLoading || (!isValid && touched)}>
          {isLoading ? (
            <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Processing...</>
          ) : (
            <><span>⬡</span>EXTRACT INTELLIGENCE</>
          )}
        </button>
      </div>
      <p className="mt-3 font-mono text-xs text-ghost-dim text-center">
        Supports: YouTube · Loom · Vimeo · Direct MP4/MP3
      </p>
    </form>
  );
}