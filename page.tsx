'use client';

import { useState, useCallback } from 'react';
import URLInput from './components/URLInput';
import ProcessingIndicator from './components/ProcessingIndicator';
import ResultsView from './components/ResultsView';
import { ProcessResult, ProcessingState } from './types';

const PROGRESS_STEPS: Record<string, { progress: number; message: string }> = {
  parsing:            { progress: 5,  message: 'Validating URL and detecting platform...' },
  fetching_metadata:  { progress: 15, message: 'Fetching video metadata...' },
  extracting_audio:   { progress: 30, message: 'Extracting audio track (this may take a moment)...' },
  transcribing:       { progress: 55, message: 'Running Whisper transcription...' },
  generating_insights:{ progress: 75, message: 'Generating AI insights...' },
  generating_assets:  { progress: 88, message: 'Building content assets...' },
  complete:           { progress: 100, message: 'Done.' },
};

export default function HomePage() {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [result, setResult] = useState<ProcessResult | null>(null);

  const isLoading = processingState.status !== 'idle' &&
    processingState.status !== 'complete' &&
    processingState.status !== 'error';

  const setStep = useCallback((step: ProcessingState['status']) => {
    const s = PROGRESS_STEPS[step] || { progress: 0, message: '' };
    setProcessingState({ status: step, progress: s.progress, message: s.message });
  }, []);

  const handleSubmit = useCallback(async (url: string) => {
    setResult(null);
    setStep('parsing');

    // Simulate step progression while waiting for server
    const stepTimer = setTimeout(() => setStep('fetching_metadata'), 800);
    const stepTimer2 = setTimeout(() => setStep('extracting_audio'), 2000);
    const stepTimer3 = setTimeout(() => setStep('transcribing'), 8000);
    const stepTimer4 = setTimeout(() => setStep('generating_insights'), 60000);
    const stepTimer5 = setTimeout(() => setStep('generating_assets'), 90000);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      clearTimeout(stepTimer5);

      const data = await response.json();

      if (!data.success) {
        setProcessingState({
          status: 'error',
          progress: 0,
          message: '',
          error: data.error || 'Processing failed. Please try again.',
        });
        return;
      }

      setProcessingState({ status: 'complete', progress: 100, message: 'Done.' });
      setResult(data.data);
    } catch (err) {
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      clearTimeout(stepTimer5);

      setProcessingState({
        status: 'error',
        progress: 0,
        message: '',
        error: err instanceof Error ? err.message : 'Network error. Please check your connection.',
      });
    }
  }, [setStep]);

  const handleReset = useCallback(() => {
    setResult(null);
    setProcessingState({ status: 'idle', progress: 0, message: '' });
  }, []);

  const showInput = !result && processingState.status === 'idle';
  const showProgress = !result && processingState.status !== 'idle';

  return (
    <main className="relative min-h-screen flex flex-col items-center" style={{ zIndex: 1 }}>
      {/* Header */}
      <header className="w-full max-w-3xl px-4 pt-16 pb-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="font-mono text-xs tracking-widest"
            style={{ color: 'var(--signal)', letterSpacing: '0.3em', fontSize: '0.65rem' }}
          >
            ⬡ LINKINTEL
          </div>
          <h1
            className="font-display font-extrabold leading-none"
            style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              letterSpacing: '-0.03em',
              color: 'var(--ghost-bright)',
            }}
          >
            Paste a link.
            <br />
            <span className="signal-glow" style={{ color: 'var(--signal)' }}>
              Get intelligence.
            </span>
          </h1>
          <p
            className="font-body text-ghost max-w-sm leading-relaxed"
            style={{ fontSize: '0.9rem' }}
          >
            Transcript · Insights · Content assets — from any public video URL.
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="w-full max-w-3xl px-4 pb-20 flex flex-col gap-6">
        {showInput && (
          <div className="card-active p-6 fade-up">
            <URLInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {showProgress && (
          <>
            <ProcessingIndicator state={processingState} />
            {processingState.status === 'error' && (
              <button onClick={handleReset} className="btn-ghost self-start">
                ← Try Again
              </button>
            )}
          </>
        )}

        {result && (
          <ResultsView data={result} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer
        className="w-full py-6 text-center font-mono"
        style={{ color: 'var(--ghost-dim)', fontSize: '0.6rem', letterSpacing: '0.1em' }}
      >
        LINKINTEL · Built for makers · v0.1.0
      </footer>
    </main>
  );
}
