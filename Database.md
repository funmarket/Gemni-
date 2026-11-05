# Database.md

**Document ID:** VQ-DB-002  
**Status:** Modular Monolith Ownership Baseline  
**Date:** 2026-11-05  

This document defines conceptual ownership and invariants. Physical table names, columns, and migrations are implementation decisions. PostgreSQL + PostGIS is the intended spatial store.

**Modular Monolith ownership rule:**  
One Supabase Postgres database.  
Each domain owns its tables.  
Only code inside `src/domains/dXX_*` may mutate those tables.  
Other domains and the UI may read via the owning domain’s public queries or via RLS-protected views.  
No shadow tables. Admin never writes business facts directly.  
Cross-domain relationships are conceptual. No domain writes another domain’s tables.

---

## Domain Ownership Map

| Domain | Canonical ownership |
|--------|---------------------|
| D01 | Identity, sessions, credentials, Admin capability links |
| D02 | Profiles, handles, preferences, privacy |
| D03 | Follow and block edges |
| D04 | Geo consent, temporary presence (2 h max), geofence rules |
| D05 | Places, check-ins, validation observations, confidence policy versions |
| D06 | Trails, versions, stops, lineage, saves |
| D07 | Guardian qualifications, service offers, selfie freshness |
| D08 | Hire requests, tour offers, slots, reservations |
| D09 | Business profiles, branches, operator authority |
| D10 | Activities and participation |
| D11 | Events and RSVPs |
| D12 | Posts, Vibes, reactions, comments |
| D13 | All media assets, variants, attachments, retirement intents |
| D14 | Conversations and messages |
| D15 | Live room sessions and participants |
| D16 | Communities, membership, roles |
| D17 | Confirmed Vibes, Pulls, matching state |
| D18 | Challenges, responses, outcomes (VibeCheck, VibeFlash) |
| D19 | Badges, stamps, Guardian/provider reviews |
| D20 | VQ accounts, journal, rules, grants (sole writer) |
| D21 | Reports, cases, strikes, sanctions, appeals |
| D22 | Handshakes (issuance, ACTIVE 24 h → EXPIRED, eligibility proof) |
| D23 | Notifications, inbox, delivery attempts |
| D24 | Advertising campaigns and placements |
| D25 | Entitlements and plans |
| D26 | Marketplace listings, deals, deal reviews |
| D27 | Future fiat transaction placeholder only |
| D28 | Ticket products and issued tickets |

---

## Media & Retention Rules

- D13 owns every media byte and its lifecycle.
- Consuming domains own the meaning of an attachment.
- Personal Gossip / Share / VibeCheck / VibeFlash media: 24-hour expiry, then retirement intent and durable cleanup.
- Event / Activity media: expires with the owning lifecycle.
- Business / Place profile media: persists until owner or Admin deletion.
- No unrestricted personal profile-photo downloads or permanent public URLs.
- Cleanup is durable (PostgreSQL authoritative). Redis may schedule but does not own truth.
- Last 11 recent reviews kept per place; older ones deleted. Business reviews and posts remain permanent. Personal messages and photos in Gossip and Home feed are ephemeral (24 h).

---

## Key Invariants

- Handshake: exactly one idempotent record per qualifying mutual agreement. ACTIVE for exactly 24 hours. No CANCELLED state.
- VQ: append-only journal. Only D20 writes balances.
- Places check-in: 5 m proximity with fresh, precise evidence. Device accuracy worse than 50 m is insufficient.
- Find Hub positions: 2-hour maximum retention.
- Discovery scope: 23 km (not a geofence radius).
- Ephemeral personal media: 24 hours.
- Report ≠ strike. Strikes require confirmation. Duplicate incidents do not multiply strikes.
- Admin is never a second writer of any domain’s facts.
- Flash Events: urgent temporary Home banner with server countdown. Distinct from 33-second VibeFlash. Covers secret parties, after-hours, private games, business happy hours, and limited promos. Banner disappears when the timer ends.

---

## Conceptual vs Physical

Entities and relationships in this document are conceptual.  
Physical schema (table names, indexes, RLS policies, PostGIS types) is decided during implementation under the ownership rule above.  
No domain may create shadow tables or write another domain’s records.

Source hierarchy: newest Product Owner decisions > Master Plan > Requirements > Structure > this document.
