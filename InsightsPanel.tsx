'use client';

import { InsightsResult } from '@/app/types';
import CopyButton from './CopyButton';

interface InsightsPanelProps {
  insights: InsightsResult;
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  const fullInsights = [
    'SUMMARY\n\n' + insights.summary,
    '\n\nKEY POINTS\n\n' + insights.keyPoints.map(p => `• ${p}`).join('\n'),
    '\n\nACTION ITEMS\n\n' + insights.actionItems.map(a => `→ ${a}`).join('\n'),
  ].join('');

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="flex flex-col gap-3 fade-up fade-up-1">
        <div className="flex items-center justify-between">
          <div className="section-label flex-1">SUMMARY</div>
          <div className="ml-4">
            <CopyButton text={insights.summary} label="Summary" />
          </div>
        </div>
        <div className="card p-4">
          <p className="text-sm leading-7 text-ghost-bright">{insights.summary}</p>
        </div>
      </div>

      {/* Key Points */}
      <div className="flex flex-col gap-3 fade-up fade-up-2">
        <div className="flex items-center justify-between">
          <div className="section-label flex-1">KEY POINTS</div>
          <div className="ml-4">
            <CopyButton text={insights.keyPoints.map(p => `• ${p}`).join('\n')} label="Points" />
          </div>
        </div>
        <div className="card p-4">
          {insights.keyPoints.map((point, i) => (
            <div key={i} className="insight-bullet">
              {point}
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="flex flex-col gap-3 fade-up fade-up-3">
        <div className="flex items-center justify-between">
          <div className="section-label flex-1">ACTION ITEMS</div>
          <div className="ml-4">
            <CopyButton text={insights.actionItems.map(a => `→ ${a}`).join('\n')} label="Actions" />
          </div>
        </div>
        <div className="card p-4">
          {insights.actionItems.map((action, i) => (
            <div key={i} className="flex gap-3 items-start py-2 border-b border-wire last:border-0">
              <span className="font-mono text-xs text-signal mt-0.5 flex-shrink-0">→</span>
              <span className="text-sm text-ghost-bright leading-relaxed">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Copy All */}
      <div className="flex justify-end pt-2 border-t border-wire">
        <CopyButton text={fullInsights} label="All Insights" />
      </div>
    </div>
  );
}
