# ⬡ LINKINTEL

> Paste a video link. Get transcript, insights, and content assets.

**Production-ready MVP** — YouTube, Loom, Vimeo, direct MP4/MP3 → full transcript + AI insights + social content assets + export.

---

## ✦ Features

- **Transcript** — Full timestamped transcript via OpenAI Whisper
- **Insights** — Summary, key points, action items via GPT-4o
- **Content Assets** — Caption, Twitter thread, carousel slides, short-form script
- **Export** — TXT, Markdown, SRT download
- **Clean UI** — Dark terminal-industrial design, mobile responsive

---

## ✦ Architecture

```
linkintel/
├── app/
│   ├── api/
│   │   ├── process/route.ts      ← Main processing endpoint
│   │   └── export/route.ts       ← Export download endpoint
│   ├── components/
│   │   ├── URLInput.tsx          ← URL input + platform detection
│   │   ├── ProcessingIndicator.tsx
│   │   ├── ResultsView.tsx       ← Tabbed output
│   │   ├── TranscriptPanel.tsx
│   │   ├── InsightsPanel.tsx
│   │   ├── AssetsPanel.tsx
│   │   ├── ExportBar.tsx
│   │   └── CopyButton.tsx
│   ├── lib/
│   │   ├── urlParser.ts          ← URL detection + validation
│   │   └── exportFormatter.ts    ← TXT/MD/SRT formatters
│   ├── server/
│   │   ├── audioExtractor.ts     ← yt-dlp + ffmpeg pipeline
│   │   ├── transcriptionProvider.ts ← Whisper abstraction layer
│   │   ├── intelligenceEngine.ts ← GPT-4o insights + assets
│   │   └── jobProcessor.ts       ← Pipeline orchestrator
│   ├── types/index.ts            ← All TypeScript types
│   ├── utils/helpers.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .env.example
├── vercel.json
└── package.json
```

---

## ✦ Prerequisites

Install these system dependencies **before** running the app:

### 1. yt-dlp
```bash
pip install yt-dlp
# or on Mac:
brew install yt-dlp
```

### 2. FFmpeg
```bash
# Ubuntu/Debian:
sudo apt install ffmpeg

# Mac:
brew install ffmpeg

# Windows: https://ffmpeg.org/download.html
```

Verify both are installed:
```bash
yt-dlp --version
ffmpeg -version
```

---

## ✦ Installation

```bash
# 1. Clone / download project
cd linkintel

# 2. Install Node dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
```

Edit `.env.local`:
```env
OPENAI_API_KEY=sk-your-key-here
```

```bash
# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✦ Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | — | Used for Whisper + GPT-4o |
| `MAX_FILE_SIZE_MB` | No | `500` | Max audio size in MB |
| `TEMP_DIR` | No | `/tmp` | Temp directory for audio |
| `TRANSCRIPTION_PROVIDER` | No | `whisper` | Provider: `whisper` (extendable) |

---

## ✦ How It Works

```
User pastes URL
     ↓
URL Parser        → Detect platform (YouTube/Loom/Vimeo/MP4/MP3)
     ↓
Audio Extractor   → yt-dlp pulls audio → FFmpeg converts to WAV 16kHz
     ↓
Whisper API       → Timestamped transcript (chunked for long content)
     ↓
GPT-4o Insights   → Summary + key points + action items
     ↓
GPT-4o Assets     → Caption + thread + carousel + script
     ↓
Output UI         → Tabbed interface with copy + export
```

---

## ✦ Deployment (Vercel)

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

Follow prompts. Add env vars in Vercel dashboard.

### Option 2: GitHub + Vercel
1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variables
4. Deploy

### ⚠️ Important Vercel Notes

- **yt-dlp and ffmpeg** are NOT available in Vercel's serverless environment
- For production on Vercel: use a **Railway** or **Render** sidecar for audio extraction, OR use a **different transcription flow** (e.g., AssemblyAI's URL-based API)
- The cleanest production path: deploy backend on **Railway** (Docker), frontend on Vercel, connect via API

### Railway Deployment (Recommended for Full Stack)
```bash
# Dockerfile included below — deploy to Railway
# Add env vars in Railway dashboard
# Set domain, done.
```

---

## ✦ Dockerfile (for Railway / self-hosted)

```dockerfile
FROM python:3.11-slim

# Install system deps
RUN apt-get update && apt-get install -y \
    ffmpeg curl nodejs npm \
    && pip install yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

---

## ✦ Extending the Transcription Provider

Add a new provider by implementing the `TranscriptionProvider` interface:

```typescript
// app/server/myProvider.ts
import { TranscriptionProvider, TranscriptResult } from '@/app/types';

export class MyProvider implements TranscriptionProvider {
  name = 'myprovider';

  async transcribe(audioPath: string, options = {}): Promise<TranscriptResult> {
    // Your implementation
  }
}
```

Then register in `transcriptionProvider.ts`:
```typescript
case 'myprovider':
  return new MyProvider(apiKey);
```

Set `TRANSCRIPTION_PROVIDER=myprovider` in env.

---

## ✦ Supported URLs

| Platform | Example |
|---|---|
| YouTube | `https://youtube.com/watch?v=...` |
| YouTube Shorts | `https://youtube.com/shorts/...` |
| Loom | `https://loom.com/share/...` |
| Vimeo | `https://vimeo.com/...` |
| Direct MP4 | `https://example.com/video.mp4` |
| Direct MP3 | `https://example.com/audio.mp3` |

Private/login-required videos will be gracefully rejected.

---

## ✦ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **OpenAI Whisper** (transcription)
- **GPT-4o** (insights + content)
- **yt-dlp** (audio extraction)
- **FFmpeg** (audio conversion)

---

## ✦ What's Not Included (MVP Scope)

- Auth / user accounts
- Payments / limits
- Live meeting support
- Video player with sync
- Database / history

These are Phase 2 additions. The MVP proves the core flow.

---

## ✦ License

MIT — Build freely.
