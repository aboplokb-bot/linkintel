'use client';

import { ProcessingState } from '@/app/types';

interface ProcessingIndicatorProps {
  state: ProcessingState;
}

const STATUS_LABELS: Record<string, string> = {
  parsing: 'Parsing URL...',
  fetching_metadata: 'Fetching metadata...',
  extracting_audio: 'Extracting audio...',
  transcribing: 'Transcribing with Whisper...',
  generating_insights: 'Generating insights...',
  generating_assets: 'Building content assets...',
  complete: 'Complete',
  error: 'Error',
};

export default function ProcessingIndicator({ state }: ProcessingIndicatorProps) {
  if (state.status === 'idle') return null;

  return (
    <div className="card fade-up p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {state.status !== 'complete' && state.status !== 'error' && (
            <div className="spinner" />
          )}
          {state.status === 'complete' && (
            <span className="text-signal font-mono text-sm">✓</span>
          )}
          {state.status === 'error' && (
            <span className="text-red-400 font-mono text-sm">✗</span>
          )}

          <span className="font-mono text-sm text-ghost-bright">
            {STATUS_LABELS[state.status] || state.message}
          </span>
        </div>

        <span className="font-mono text-xs text-signal">
          {state.progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${state.progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['parsing', 'extracting_audio', 'transcribing', 'generating_insights', 'generating_assets'].map((step, i) => {
          const statuses = ['parsing', 'fetching_metadata', 'extracting_audio', 'transcribing', 'generating_insights', 'generating_assets', 'complete'];
          const currentIdx = statuses.indexOf(state.status);
          const stepIdx = statuses.indexOf(step);
          const isDone = currentIdx > stepIdx;
          const isActive = currentIdx === stepIdx || (step === 'parsing' && state.status === 'fetching_metadata');

          return (
            <div key={step} className="flex items-center gap-1">
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: 6,
                  height: 6,
                  background: isDone ? 'var(--signal)' : isActive ? 'rgba(0,255,178,0.5)' : 'var(--wire-bright)',
                  boxShadow: isActive ? '0 0 6px rgba(0,255,178,0.4)' : 'none',
                }}
              />
              {i < 4 && (
                <div
                  className="h-px w-6 transition-all duration-300"
                  style={{ background: isDone ? 'var(--signal-dim)' : 'var(--wire)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {state.message && state.status !== 'error' && (
        <p className="font-mono text-xs text-ghost-dim">{state.message}</p>
      )}

      {state.error && (
        <p className="font-mono text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded p-3">
          {state.error}
        </p>
      )}
    </div>
  );
}
