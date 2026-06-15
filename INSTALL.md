# Cosmosphere Nexus — Installation Guide

## Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Production Build

```bash
npm run build
npm run preview   # preview production build locally
```

## Docker

```bash
# Build and run
docker build -t cosmosphere-nexus .
docker run -p 80:80 cosmosphere-nexus

# Or with Docker Compose
docker-compose up
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

The `vercel.json` config is already included.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause simulation |
| `R` | Toggle auto-rotate |
| `T` | Toggle Time Machine |
| `B` | Toggle sidebar |
| `1` | Globe view |
| `2` | Analytics view |
| `3` | Launches view |
| `4` | Alerts view |
| `+` / `-` | Increase / decrease playback speed |
| `Esc` | Deselect satellite |
| `G` | Toggle ground stations |
| `O` | Toggle orbit trails |
| `C` | Toggle Starlink constellation mesh |

## Troubleshooting

**Satellites not loading?**
CelesTrak requires a CORS proxy in the browser. The default uses `allorigins.win`.
If blocked, set `VITE_CORS_PROXY` in `.env` to your own proxy.

**Low FPS?**
- Reduce `MAX_PER_CATEGORY` in `src/services/satelliteService.ts`
- Toggle off Debris and Heatmap layers
- Enable GPU acceleration: `chrome://flags/#enable-gpu-rasterization`

**Black globe?**
Textures load from `unpkg.com`. Ensure network access is available.
