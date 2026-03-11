'use client';

import { useState, useCallback } from 'react';
import URLInput from './components/URLInput';
import ProcessingIndicator from './components/ProcessingIndicator';
import ResultsView from './components/ResultsView';
import { ProcessResult, ProcessingState } from './types';

const PROGRESS_STEPS: Record<string, { progress: number; message: string }> = {
  parsing:             { progress: 5,  message: 'Validating URL and detecting platform...' },
  fetching_metadata:   { progress: 15, message: 'Fetching video metadata...' },
  extracting_audio:    { progress: 30, message: 'Extracting audio track...' },
  transcribing:        { progress: 55, message: 'Running Whisper transcription...' },
  generating_insights: { progress: 75, message: 'Generating AI insights...' },
  generating_assets:   { progress: 88, message: 'Building content assets...' },
  complete:            { progress: 100, message: 'Done.' },
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
    setProcessingS