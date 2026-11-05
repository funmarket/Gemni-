# requirements.md

**Document ID:** VQ-REQ-002  
**Status:** Approved Product Contract (Modular Monolith)  
**Date:** 2026-11-05  

This document remains the product behavior contract. The architecture note below is added so implementation stays consistent with the modular monolith.

---

## Architecture Note — Modular Monolith

The product is delivered as a single React/Vite application backed by one Supabase project.  
The 28 domains (D01–D28) are internal modules under `src/domains/`.  
Each domain is the sole writer of its persistent facts.  
UI and other domains call only the public API exported by the owning domain.  
Admin Control Room orchestrates by calling those public APIs.  
No domain is extracted into a separate service in the current plan.  
All product rules, timers, distances, ownership, and “no mock” constraints continue to apply exactly as written.

---

## Core Product Requirements

- Preserve the existing five-section UI: **Home / Explore / Share / Vibe / Purse**. Equal tabs. Mobile-first. Midnight Obsidian / neon aesthetic.
- One responsive codebase for browser and Telegram Mini App. Shared backend, identity, and data.
- Guest-first read-only discovery of public content. Sign-in required for protected actions.
- Server-authoritative time for all expiry (Handshakes, ephemeral media, challenges).
- No fake check-ins, GPS presence, reservations, Handshakes, VQ postings, payments, notifications, or social approvals.
- Real device location with clear permission states. MapLibre for maps. OSM Overpass for POI discovery (replaceable).
- English, French, Arabic (RTL), accessibility, and device typography.
- Every interactive surface supports honest loading, empty, permission-denied, offline, expired, and failure states.

---

## Key Invariants

### VibeCheck (D18)
One-to-one invitation to eligible friend/match/Pull/Community member. No geographic gate. 180-second server deadline. Reciprocal completion creates a D17 Vibe. +30 VQ if qualified. Ephemeral 24 hours. Live capture only.

### VibeFlash (D18)
Collective challenge for eligible Vibes/Community members. No geographic gate. 33-second server deadline. Synchronized alert. Fresh capture. Responder-only Mosaic. Ephemeral 24 hours. Distinct from the multi-hour Home Flash Event.

### Check-ins (D04 + D05)
Server-authoritative. 5 m Place proximity with fresh, precise evidence (better than 50 m device accuracy insufficient). No invented states.

### Handshakes (D22)
Exactly one idempotent record per qualifying mutual agreement. ACTIVE for exactly 24 hours. No cancellation state. Enables review eligibility. +75 VQ each if qualified.

### Ephemeral content
24-hour expiry for personal Gossip, Share, VibeCheck, and VibeFlash media. D13 owns bytes. Server expiration. No permanent history for personal ephemeral content.

### Geo & discovery
23 km discovery scope for Secrets / Find Hub / nearby feed. 2-hour Find Hub position retention. Consented geofences. No precise public GPS.

### VQ ledger (D20)
Immutable append-only. Sole writer. Idempotent credits/debits. Admin-configurable rules. No crypto or fiat implication. Examples: +25 daily streak, +50 check-in (max 3/day), +100 Trail completion (max 2/day), +75 Handshake, +30 VibeCheck.

### Marketplace (D26)
Peer-to-peer. No escrow, commission, or platform guarantee of delivery or quality.

### Admin
Scoped orchestration over D01–D28. Versioned, auditable policies. Never a second writer. Strike system: warning → final warning → sanction. Sanctions have server-authoritative expiry. Appeals do not auto-remove sanctions.

### Drift & matching (D17)
12 interest wavelengths. Mutual acceptance required before DM. Empty genuine candidates show empty state. No seeded identities.

### Reviews
Last 11 recent reviews kept per place; older ones deleted. Business reviews and posts are permanent. Personal messages and photos in Gossip and Home feed are ephemeral (24 h).

### Flash Events
Urgent temporary Home banner with server countdown. Covers secret parties, after-hours, private games, business happy hours, and limited promos. Distinct from 33-second VibeFlash. Hunt Now opens the linked Secret, Place, or promo. Banner disappears when the timer ends.

### Share camera
Sequential dual-camera capture (scene then selfie), PIP composite, timed authenticity window. Used for VibeCheck, VibeFlash, Join Vibe, Guardian selfies. No gallery fallback for proofs.

---

## Five Destinations

- **Home** — city calibration, check-ins, feeds, activities, Flash Event banner.
- **Explore** — search, map (Vibe Orbit / Discovery Pulse style), place validation.
- **Share** — sequential dual-camera capture (scene then selfie), PIP composite, timed authenticity. Used for VibeCheck, VibeFlash, Join Vibe, Guardian selfies. No gallery fallback for proofs.
- **Vibe** — gossip, matches, Drift, challenges, camera button.
- **Purse** — VQ ledger, peer-to-peer transfers, Marketplace.

---

## Non-functional

- Backend-authoritative state.
- Idempotency on critical paths (VQ, Handshakes, tickets, check-ins).
- PostgreSQL + PostGIS for spatial.
- RLS and object-level authorization.
- Accessibility (RTL, focus management).
- Observability (logs, metrics, traces, audit).
- No mock data in production paths.

---

## Decision precedence

Product Owner decisions > Master Plan > this Requirements document > Structure > Database.

All product behavior described above is mandatory. The modular monolith architecture note is the implementation constraint that keeps ownership clean while the product remains one application.
