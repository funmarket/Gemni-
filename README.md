# 🌌 VQgemni — Architecture & DevOps Specification
## High-Fidelity Domain-Driven Social Geofencing Engine

Welcome to the production-grade rebuild specification for **VQgemni**. This repository contains the system blueprints, migration protocols, and visual design guidelines compiled to deliver a robust, clean-running, and high-performance social networking application.

This v2 architecture resolves the technical debt, modularity degradation, and dark/light styling complications identified in the initial prototype.

---

## 🚀 1. System Mission & Core Capabilities

VQgemni coordinates offline, real-world interactions through spatial geofencing, dual-optic capture verifications, gamified streaks, and instant peer-to-peer tipping.

### Key Capabilities:
- **Spatial Proximity Radar & Mapping**: Sub-millisecond nearby node discoveries and live activity maps using PostGIS spatial coordinates.
- **Dual-Optic Challenge Verification**: Strict 5-minute capture countdowns using sequential front-and-back camera streams to verify real-world presence within a 200m geofence.
- **Dynamic Check-in Streaks**: Automated database triggers to maintain consecutive daily scan tracking with exponential point multipliers (1.1x to 2.0x).
- **Immutable Ledger Auditing**: Post-transaction SHA-256 signature hashes and block height allocations simulating secure decentralized wallet ledgers.
- **Paltalk-Style Local Chatrooms**: Real-time localized messaging panels complete with audio-synthesized ambient soundboards.

---

## 🛠️ 2. Production Tech Stack & DevOps Guidelines

The v2 application is engineered to run in a containerized environment (e.g., Cloud Run) with a secure, highly scalable runtime profile:

```
                      [ Client-Side Browser ]
                         (React 18 / Vite)
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
   [ Geolocation HAL ]    [ Camera HAL ]       [ Audio Synth HAL ]
           │                     │                     │
           └─────────────────────┬─────────────────────┘
                                 │
                     [ Infrastructure Repositories ]
                                 │
                                 ▼
                   [ Firebase Auth / Firestore ]
```

### Dependency Standards:
- **UI & View**: React 18+ with Vite (Hot Module Replacement disabled in staging via `DISABLE_HMR=true`).
- **Icons**: Imported exclusively from `lucide-react` (strictly no custom SVG elements in component views).
- **Animations**: Fluid layout transformations utilizing `motion/react` layout transitions.
- **Charts & Vis**: Interactive administrative statistics mapped via `recharts` and canvas heatmaps.
- **Database / Sync**: Canonical cloud persistence powered by Google Cloud Firestore.

### 🔌 Ingress Port Protocol:
- **The Application must bind strictly to PORT 3000** and listen on host `0.0.0.0` (critical for ingress reverse proxy rules). 
- Do not attempt to dynamically alter or override this configuration at runtime.

---

## 📐 3. The Core Anti-Debt & Styling Commandments

To prevent code degradation, any developer or automated agent editing this repository must adhere to these structural constraints:

### I. The 200-Line Codebase Limit
No React component file may exceed **200 lines** of code. If a component grows, it must be modularized.
- Move static data models to specialized data files (e.g. `src/features/home/data/*`).
- Move complex helper algorithms to domain utility helpers.
- Decompose sub-views (like chat sidebars, custom cards, and active soundboards) into dedicated leaf components.

### II. Absolute Styling Separation
- **No Class-Matching Hacks in CSS**: Never target Tailwind elements using class matching selectors (e.g., `[class*="bg-black/20"]` or `[class*="from-[#"]`). This is fragile and breaks production builds.
- **Semantic Theme Variables**: All dark and light mode color changes must be driven strictly through the CSS Variables defined in `src/index.css`. All components must consume these variables via standard Tailwind utility tokens.
- **High Contrast Contrast Minimums**: Light mode colors must remain dark and high-contrast (such as deep emerald `#0D7A5C` or bold dark blue `#1D4ED8` on light backgrounds). Do not use light grey text on light off-white containers.

### III. Zero Tech-Larping
- Avoid decorating interfaces with mock telemetry pings, system logs, fake compile lines, or unnecessary status indicators (e.g., "CORE_NODE_ONLINE" or "CONTAINER PORT: 3000").
- Craft comes from structural negative space, responsive layout scaling, and robust user interactions.

---

## 🏗️ 4. Quickstart Staging Build

Initialize packages:
```bash
npm install
```

Start the development container:
```bash
npm run dev
```

Validate type safety and compile structure:
```bash
npm run lint
npm run build
```
