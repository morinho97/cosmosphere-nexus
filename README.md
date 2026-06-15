# 🌍 Cosmosphere Nexus

**The Interactive Digital Twin of Near-Earth Space**

> An orbital intelligence platform built for the space-tech hackathon generation.

[![Build](https://img.shields.io/badge/build-passing-39FF14)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-00D4FF)](#)
[![Three.js](https://img.shields.io/badge/Three.js-r184-A855F7)](#)
[![License](https://img.shields.io/badge/license-MIT-F59E0B)](#)

---

## What is Cosmosphere Nexus?

Cosmosphere Nexus is not a satellite tracker. It is a **living simulation** of Earth's orbital environment — a real-time digital twin that lets users understand, explore, and monitor the increasingly complex ecosystem of objects surrounding our planet.

Think: **NASA Mission Control × SpaceX Visualization Lab × Sci-Fi Planetarium**

---

## Features

### 🛸 Real-Time Satellite Intelligence
- Live TLE propagation (CelesTrak) for 10,000+ objects
- SGP4/SDP4 orbital mechanics via satellite.js
- ISS, Starlink, GPS, Galileo, GLONASS, Weather, Scientific, Comms

### 🌍 Cinematic Earth
- Ultra-HD Blue Marble textures with atmospheric scattering
- Animated aurora borealis, cosmic dust, shooting stars
- Volumetric nebulae and star field with color temperature

### 📡 Orbital Traffic Control
- Orbital highway congestion visualization
- Altitude-band density spectrum
- Traffic advisories for crowded shells

### ⚠️ Collision Risk Engine
- Conjunction alert monitoring with probability + distance
- Critical/High/Medium/Low severity classification
- Time-to-event countdown

### ☀️ Space Weather Layer
- Kp geomagnetic index (0–9) with gauge visualization
- X-ray solar flare classification
- Solar wind speed + proton flux
- Van Allen belt activity + operational impacts

### 🌱 Space Sustainability Index
- Orbital pollution score (0–100)
- Kessler Syndrome cascade risk level
- Active/dead/debris population breakdown
- IADC guideline compliance tracking

### 🔭 Constellation Intelligence
- 8 major constellations with deployment progress
- Animated inter-satellite link mesh topology
- Live globe visibility toggling

### 🖥️ Mission Control Dashboard
- System status bar + real-time telemetry
- Fleet analytics with orbital regime breakdown
- Conjunction alerts + launch timeline feed

### ⏱️ Orbital Time Machine
- ±24h simulation with keyboard-driven speed control
- Past replay + future prediction mode

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

See [INSTALL.md](./INSTALL.md) for full setup instructions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| 3D Globe | globe.gl (Three.js r184) |
| Orbital Math | satellite.js (SGP4) |
| Animation | Framer Motion |
| State | Zustand |
| Styling | Tailwind CSS |
| Data | CelesTrak TLE (live) |
| Deploy | Vercel / Docker + Nginx |

---

## License

MIT — Open source for the benefit of space education and awareness.

*Built with ❤️ for orbital situational awareness.*
