# structure.md

**Document ID:** VQ-STRUC-002  
**Status:** Modular Monolith Baseline  
**Date:** 2026-11-05  
**Destination:** funmarket/VQgemini / main  

**Companion documents:** Requirements.md (approved product contract) and Master_Plan.md (controlling implementation authority). Files under docs/product-design/* are think-tank/reference material only and are not governing or canonical implementation authority.

---

### Post-Baseline Architecture & Ownership Updates — Master Plan Controlled

> Authority notice:  
> This document remains the Product Owner-approved architecture/domain/module baseline. Newer explicit Product Owner decisions and the approved Master Plan implementation/operational architecture control execution where they supersede conflicting, incomplete, OPEN/UNSPECIFIED or absent older wording. Latest explicit Product Owner direction remains highest authority; the approved Master Plan controls implementation sequencing and newer operational architecture below it.

**Modular Monolith runtime (directed):**  
The application is a single process: one React/Vite frontend + one Supabase project (Postgres + Auth + Storage + Edge Functions as needed) + one deployment.  
Domain folders under `src/domains/dXX_*` are the only writers of their tables.  
UI, features, hooks, other domains, and Admin call only the public API exported by a domain’s `index.ts`.  
No domain writes another domain’s tables. No service extraction. Admin is orchestration, never a 29th domain or second writer.

---

## Structure Delta K — S00 preservation and domain-by-domain rehabilitation of the existing app — DIRECTED 2026-11-03

**Current implementation target:** The existing funmarket/VQgemini React/Vite application already has screens, src/features, src/domains, a Supabase client, static content catalogs and relationships. It is the implementation baseline to repair, not a disposable historical ZIP or an empty project. The proposed apps/client / apps/api / apps/worker tree remains a logical target to reconcile against current source, not permission to replace running frontend features with placeholder scaffolding. Split monolithic scripts by independently testable presentation, domain commands, records/reads, permissions, capture and media responsibilities. Preserve the five equal destinations, current look, images and user journeys while adapting verified source code. One canonical business writer per fact; frontend feature boundaries do not create domains 29+.

**Strict S00 before S01:** First establish complete source/data/media inventories and recoverable checkpoints; create genuine authorized Supabase Auth test accounts with 1:1 D01 identity/D02 profile links; transfer sample D12 post authorship, D06 Trail authors/stops/remix, D07 Guardian/Legend/offer identities and appropriate D05 Place, D09 Business, D16 community and related records to canonical owner paths. D08 Tour offers/reservations remain separate from D06 Trail origin, D22 Handshake remains accepted-agreement-only. Migrate permitted media bytes into Supabase Storage with D13 asset/provenance metadata and consuming-domain attachment permission. Compare stored data, image access and live rendered visual baseline before cutting over each React sample read path. Keep test content accessible during later development, with restricted fixture provenance and future separately authorized cleanup. S00 migration operations are not automatically granted by this documentation change.

**Runtime ownership contract:** React owns styling, navigation, components, loading/empty/error state and transient presentation; it must not own persistent accounts, posts, Places, Trails, Guardian identity, canonical coordinates, reward balances or media objects. Domain-owned authorized reads/writes use the existing Supabase integration only within actual security/RLS limits, or secured API/DB functions for privileged transactional operations. A client SDK's presence is not permission for unrestricted direct-to-database business mutation. Server-authenticated identity, canonical single-writer invariants, idempotent side effects, RLS/auth authorization and media delivery are required. The S00 test users are legitimate test principals but not evidence of verified real-world participation, location, provider acceptance, payments or Handshakes. Static design assets/icons remain frontend presentation; hardcoded sample business content/images masquerading as persisted records do not.

**Preservation gate:** Establish before/after evidence for every affected module: source record IDs/counts, author IDs, profile/Guardian/Trail lineage, Place facts, D13 objects and permissions, post visibility, navigation, visual screenshots across current phone widths, error handling and rollback/retry. Remove original template fixtures only when their persisted replacement passes its acceptance contract. Maintain correct Web/Telegram host/permission boundaries throughout; never introduce a second identity or parallel writer.

---

## Structure Delta A — Master Plan execution authority

The approved Master Plan.md is the consolidated living implementation and production-control authority. This Structure remains the canonical architecture baseline unless a newer explicit Product Owner decision or approved Master Plan clarification supersedes a point for execution. A newer operational/implementation detail is not a contradiction merely because this older baseline did not describe it.

---

## Structure Delta B — Admin Control Room architecture

The Admin Control Room is a first-class application surface and dedicated frontend/application orchestration module. It is progressively built, protected by scoped Admin authorization, uses canonical owner-domain public commands, reads authorized projections and emits privileged audit records. It is not direct SQL, an unrestricted god-mode subsystem or a second writer.

---

## Structure Delta C — Admin Control Room is NOT D29

> Admin Control Room is not D29.  
> Its screens and application orchestration may have dedicated modules plus cross-cutting audit/operations infrastructure, but canonical business records remain owned by D01–D28. Admin commands invoke those owners’ public APIs rather than maintaining shadow copies or second-writer tables.

Examples of canonical authority remain:

- D01 → Admin identity/capability associations and authentication authority
- D05 → Place truth and confidence
- D07 → Guardian/Legend eligibility
- D09 → Business/operator authority
- D20 → VQ rules, postings, grants and corrections
- D21 → reports, cases, sanctions and appeals
- D24 → Advertising
- D25 → subscriptions/entitlements
- D26 → Marketplace
- D28 → Ticketing

---

## Structure Delta D — Dedicated Admin application/platform module

Although it is not a business domain, Admin has its own implementation boundary for navigation, dashboard composition, scoped role/capability checks, owner-domain command invocation, authorized read projections, case workflows, privileged audit visibility and read-only operations visibility. That application/platform module does not own the underlying business facts it manages.

---

## Structure Delta E — Admin authorization ownership

D01 owns the canonical identity/authentication records and the role/capability associations used to authorize privileged Admin sessions/actions under the established architecture. Admin UI consumes server-validated capabilities; no UI-only elevation or hidden client-side privilege is valid.

---

## Structure Delta F — D21 Trust & Safety ownership

D21 is the canonical owner of reports, moderation cases, assignments, investigation/decision state, strike records, capability restrictions, suspensions, bans, appeals and moderation case history. A report alone is not punishment. Source domains remain owners of their own content/business state and execute source-record changes through their own public commands when D21 decisions require them.

---

## Structure Delta G — Progressive Admin sequencing

The permanent Admin product grows with the owning domains rather than starting at the end:

- S02 → permanent Admin shell and scoped authorization/RBAC
- S05 → Reports & Cases core
- S06 → VQ rules/ledger/grants
- S08 → Places/Validate/D05 confidence policy
- S10 → Guardians/Tours/Handshakes/reviews/entitlements operations
- S11 → Social Content/Communities/Live Rooms moderation
- S12 → Vibe/Pulls/VibeCheck/VibeFlash operational moderation
- S13 → Activities/Events/Ticketing operations
- S14 → Marketplace operations/disputes/reviews
- S15 → integrated Control Room completeness, Dashboard, Users, Businesses, Advertising, full Trust & Safety, audit and global operations

These are permanent panels of one Control Room, not temporary throwaway screens.

---

## Structure Delta H — Messaging sequencing

S05 establishes the real D14 messaging engine, D23 delivery infrastructure, D21 report core and source-context authorization contracts. Source-specific conversation contexts reach full staging acceptance only when their source owner exists:

- Guardian consultation → S10
- Community chat → S11
- confirmed-Vibe personal DM → S12
- Event discussion → S13
- Marketplace negotiation chat → S14

No fabricated source-domain record may be created merely to claim D14 acceptance.

---

## Structure Delta I — Marketplace review ownership

- D22 owns Handshake issuance, the server-authoritative ACTIVE → EXPIRED lifecycle, exact 24-hour expiry and review-eligibility proof only; there is no Handshake cancellation state.
- D26 owns Marketplace product/deal-item review content for the eligible Marketplace journey.
- D19 continues to own established Guardian/provider reputation review content.
- No new review domain is introduced.

---

## Structure Delta J — Privileged audit infrastructure

Cross-cutting privileged-action auditing may exist as application/platform infrastructure without becoming a business domain. Audit entries may record actor, validated capability/role, target, linked case/report, action, reason, owning-domain command, result/failure, timestamp and correlation/causation ID. Audit infrastructure records privileged execution history; it does not become the canonical writer of the business facts being changed.

---

## Structure Delta L — Canonical D06 Trails and anti-mock

D06 owns Trails. No hardcoded samples or stock photos as persisted data. Real Supabase records only after S00.

---

## Modular Monolith Rules (additive)

### Domain folder shape (required)

```
src/domains/d05_places/
  index.ts          // public API only
  commands.ts       // write operations
  queries.ts        // read operations
  types.ts
  rules.ts          // invariants
```

### Logical module grouping (organization only)

The numbered folders stay. Grouping is for mental model and code organization:

| Module | Domains | Notes |
|--------|---------|-------|
| Identity & Profile | D01, D02, D03 | Always together |
| Places & Trails | D04, D05, D06 | Spatial + content |
| Social & Content | D12, D13, D16 | Posts, media, communities |
| Matching & Challenges | D17, D18 | Drift, Pulls, VibeCheck, VibeFlash |
| Economy | D20, D22, D26 | VQ, Handshakes, Marketplace |
| Admin & Trust | D21 + Admin shell | Orchestration only |
| Remaining | D07–D11, D14, D15, D19, D23–D25, D27, D28 | Stay as folders until they grow |

### Boundary enforcement

- Code outside `domains/dXX_*` may import only from `domains/dXX_*/index.ts`.
- No direct Supabase writes outside the owning domain.
- UI owns presentation only. Domains own persistent state.
- ESLint or architecture test enforces the public-API rule.

---

## Domain Ownership (D01–D28)

Each domain has one canonical writer. No second writers or shadow copies. Cross-domain coordination uses explicit public calls.

- **D01** Identity (accounts, sessions, credentials, Admin capability links)
- **D02** Profiles (presentation, interests, privacy)
- **D03** Social graph (follow/block)
- **D04** Geo-presence (location evidence, geofences, temporary presence)
- **D05** Places (check-ins, validation, confidence)
- **D06** Trails (itinerary, stops, lineage)
- **D07** Guardians (eligibility, offers)
- **D08** Tours & reservations (offers, slots)
- **D09** Businesses & organizations (verified identities)
- **D10** Activities (schedules, participation)
- **D11** Events (RSVP, independent of tickets)
- **D12** Social content (posts, Vibes, reactions)
- **D13** Global media (uploads, lifecycle, all bytes)
- **D14** Messaging (conversations, receipts)
- **D15** Live rooms (sessions, participants)
- **D16** Communities (membership, permissions)
- **D17** Matching (Drift, Pulls, Vibes)
- **D18** Challenges (VibeCheck, VibeFlash)
- **D19** Recognition (badges, reviews)
- **D20** VQ ledger (rewards, balances — sole writer)
- **D21** Moderation (reports, cases, strikes, sanctions)
- **D22** Handshakes (agreements, eligibility proof)
- **D23** Notifications (inbox, delivery)
- **D24** Advertising (campaigns, impressions)
- **D25** Subscriptions (plans, entitlements)
- **D26** Marketplace (listings, deals)
- **D27** Payments & billing (future placeholder)
- **D28** Ticketing (inventory, issuance)

---

## UI Composition

Five equal navigation tabs: **Home / Explore / Share / Vibe / Purse**.

- Home composes city calibration, check-ins, feeds, activities, Flash Event banner.
- Explore includes search, map (Vibe Orbit style), place validation.
- Share handles sequential dual-camera capture and composition.
- Vibe manages gossip, matches, challenges.
- Purse shows ledger and marketplace.

UI owns styling, navigation, components, loading/empty/error states.  
Domains own all persistent state.  
Preserve current look, images, gestures, modals, deep links, empty states, and Telegram adaptation.

---

## Decision precedence

Product Owner → Master Plan → Requirements → Structure → Database.

All 28 domains remain canonical owners. They are modules inside one process, not separate services.
