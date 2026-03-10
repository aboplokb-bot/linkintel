'use client';

import { useState } from 'react';
import { ProcessResult } from '@/app/types';
import TranscriptPanel from './TranscriptPanel';
import InsightsPanel from './InsightsPanel';
import AssetsPanel from './AssetsPanel';
import ExportBar from './ExportBar';

interface ResultsViewProps {
  data: ProcessResult;
  onReset: () => void;
}

type Tab = 'transcript' | 'insights' | 'assets';

export default function ResultsView({ data, onReset }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('insights');

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'transcript', label: 'Transcript', count: data.transcript.segments.length },
    { id: 'insights', label: 'Insights' },
    { id: 'assets', label: 'Content Assets' },
  ];

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${Math.floor(s % 60)}s` : `${Math.floor(s)}s`;
  };

  return (
    <div className="flex flex-col gap-6 fade-up">
      {/* Meta header */}
      <div className="card-active p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span
              className="font-mono text-xs text-signal"
              style={{ letterSpacing: '0.1em', fontSize: '0.6rem' }}
            >
              {data.metadata.platform.toUpperCase()} · PROCESSED
            </span>
            <h2
              className="font-display font-bold text-ghost-bright truncate"
              style={{ fontSize: '1.1rem', letterSpacing: '-0.01em' }}
              title={data.metadata.title}
            >
              {data.metadata.title}
            </h2>
            {data.metadata.author && (
              <span className="text-xs text-ghost-dim">{data.metadata.author}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {data.metadata.duration && (
              <span className="font-mono text-xs text-ghost-dim">
                {formatDuration(data.metadata.duration)}
              </span>
            )}
            <button onClick={onReset} className="btn-ghost" style={{ fontSize: '0.6rem' }}>
              ↩ New
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-wire pb-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 font-mono text-ghost-dim" style={{ fontSize: '0.6rem' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="card p-5 min-h-96">
        {activeTab === 'transcript' && <TranscriptPanel transcript={data.transcript} />}
        {activeTab === 'insights' && <InsightsPanel insights={data.insights} />}
        {activeTab === 'assets' && <AssetsPanel assets={data.assets} />}
      </div>

      {/* Export bar */}
      <ExportBar data={data} />
    </div>
  );
}
