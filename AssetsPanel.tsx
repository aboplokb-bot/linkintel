'use client';

import { useState } from 'react';
import type { ContentAssets } from '@/types';
import CopyButton from './CopyButton';

interface AssetsPanelProps {
  assets: ContentAssets;
}

type AssetTab = 'captions' | 'thread' | 'carousel' | 'script';

export default function AssetsPanel({ assets }: AssetsPanelProps) {
  const [activeAsset, setActiveAsset] = useState<AssetTab>('captions');

  const assetTabs: Array<{ id: AssetTab; label: string }> = [
    { id: 'captions', label: 'Caption' },
    { id: 'thread', label: 'Thread' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'script', label: 'Script' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Asset sub-tabs */}
      <div className="flex gap-1 flex-wrap">
        {assetTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveAsset(t.id)}
            className={`tab ${activeAsset === t.id ? 'tab-active' : ''}`}
            style={{ fontSize: '0.65rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Caption */}
      {activeAsset === 'captions' && (
        <div className="flex flex-col gap-3 fade-up">
          <div className="flex items-center justify-between">
            <div className="section-label flex-1">INSTAGRAM / LINKEDIN CAPTION</div>
            <div className="ml-4"><CopyButton text={assets.captions} label="Caption" /></div>
          </div>
          <div className="card p-4">
            <p className="text-sm leading-7 text-ghost-bright whitespace-pre-wrap font-body">
              {assets.captions}
            </p>
          </div>
        </div>
      )}

      {/* Thread */}
      {activeAsset === 'thread' && (
        <div className="flex flex-col gap-4 fade-up">
          <div className="flex items-center justify-between">
            <div className="section-label flex-1">X / TWITTER THREAD</div>
            <div className="ml-4">
              <CopyButton text={assets.thread.map((t, i) => `${i + 1}/${assets.thread.length}\n${t}`).join('\n\n')} label="Thread" />
            </div>
          </div>
          {assets.thread.map((tweet, i) => (
            <div key={i} className="card p-4 flex flex-col gap-2 fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-signal">{i + 1}/{assets.thread.length}</span>
                <CopyButton text={tweet} label="" />
              </div>
              <p className="text-sm leading-relaxed text-ghost-bright">{tweet}</p>
              <span className="font-mono text-xs text-ghost-dim">{tweet.length} chars</span>
            </div>
          ))}
        </div>
      )}

      {/* Carousel */}
      {activeAsset === 'carousel' && (
        <div className="flex flex-col gap-4 fade-up">
          <div className="flex items-center justify-between">
            <div className="section-label flex-1">CAROUSEL SLIDES ({assets.carousel.length})</div>
            <div className="ml-4">
              <CopyButton
                text={assets.carousel.map(s => `SLIDE ${s.slideNumber}: ${s.headline}\n${s.bullets.map(b => `• ${b}`).join('\n')}`).join('\n\n')}
                label="All Slides"
              />
            </div>
          </div>
          <div className="grid gap-3">
            {assets.carousel.map((slide) => (
              <div key={slide.slideNumber} className="card p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs font-bold rounded px-1.5 py-0.5 flex-shrink-0"
                      style={{
                        background: 'var(--signal-glow)',
                        color: 'var(--signal)',
                        border: '1px solid rgba(0,255,178,0.2)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {String(slide.slideNumber).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-display font-bold text-ghost-bright">{slide.headline}</span>
                  </div>
                  <CopyButton text={`${slide.headline}\n${slide.bullets.map(b => `• ${b}`).join('\n')}`} label="" />
                </div>
                <ul className="ml-1 flex flex-col gap-1">
                  {slide.bullets.map((bullet, j) => (
                    <li key={j} className="text-xs text-ghost leading-relaxed flex gap-2">
                      <span className="text-signal flex-shrink-0">·</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Script */}
      {activeAsset === 'script' && (
        <div className="flex flex-col gap-4 fade-up">
          <div className="flex items-center justify-between">
            <div className="section-label flex-1">30–60 SEC SHORT-FORM SCRIPT</div>
            <div className="ml-4"><CopyButton text={assets.script.fullScript} label="Full Script" /></div>
          </div>

          {[
            { label: 'HOOK', content: assets.script.hook, desc: '10–15 sec' },
            { label: 'BODY', content: assets.script.body, desc: '30–40 sec' },
            { label: 'CLOSE', content: assets.script.close, desc: '5–10 sec' },
          ].map(({ label, content, desc }) => (
            <div key={label} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-xs"
                    style={{ color: 'var(--signal)', letterSpacing: '0.1em', fontSize: '0.65rem' }}
                  >
                    [{label}]
                  </span>
                  <span className="font-mono text-xs text-ghost-dim">{desc}</span>
                </div>
                <CopyButton text={content} label="" />
              </div>
              <p className="text-sm leading-relaxed text-ghost-bright whitespace-pre-wrap">{content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
