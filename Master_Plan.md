# VQgemni — Master Plan.md

**Document role:** Single living implementation-sequencing, operational-policy and acceptance-control plan for the **complete production-ready VQgemni application**. This is not an MVP, prototype, partial launch plan, replacement Requirements document, replacement Structure document, or physical schema specification. **This Product Owner-approved `Master Plan.md` is the controlling implementation and production-execution authority below any later direct Product Owner instruction.**

> **For agentic workers:** Implement this plan only after explicit Product Owner authorization. Use bounded, source-verified vertical slices. A step is not complete until its acceptance contract is satisfied; a green build, created table, route, or screen is not completion evidence.

**Goal:** Restore and complete the existing `funmarket/VQgemini` application as a production-ready, fully domain-owned product with 28 approved logical domains, preserving the current populated UI and its features. First perform S00 content/test-account/media preservation and verified cutover, then S01–S18 engineering rehabilitation and acceptance.

**Architecture source and execution hierarchy:** Latest explicit Product Owner decisions remain highest authority. This Product Owner-approved `Master Plan.md` is the consolidated living implementation/operations authority and may contain newer directed decisions, implementation clarifications, Admin/governance controls and production-readiness requirements that are absent from older design documents. `Requirements.md` remains the full product-behavior source, `structure.md` the architecture/module ownership source, and `Database.md` the conceptual persistence/invariant source. A newer approved Master Plan clarification is not a defect merely because an older file did not mention it. Historical Gemini/old VibeQuest remain behavior/failure references only.

**Modular Monolith runtime (directed):** The application is implemented as a modular monolith — one React/Vite frontend, one Supabase project (Postgres + Auth + Storage + Edge Functions as needed), one deployment. Domain folders under `src/domains/dXX_*` are the only writers of their tables. UI and other domains call only the public API exported by the owning domain’s `index.ts`. Admin Control Room orchestrates by calling those public APIs. It is not a 29th domain and never a second writer. No service extraction. Domains never write each other’s tables.

**Live-source rule:** Current repository HEAD and governing-document identities are intentionally verified at execution time rather than frozen into this living plan. Historical checkpoint values, if retained elsewhere as evidence, never override current source.

**Plan status:** `PRODUCT OWNER APPROVED — CONTROLLING IMPLEMENTATION / PRODUCTION-EXECUTION PLAN`. This Master Plan is the controlling implementation, sequencing, operational-policy and acceptance authority below any later explicit Product Owner instruction. It does not itself authorize arbitrary repository, infrastructure, database or production mutation; each implementation task still requires its applicable bounded authorization and live-source verification.

---

## Current implementation direction — existing-app rehabilitation (2026-11-03)

**DIRECTED / SUPERSEDING:** VQgemni is the **existing** `funmarket/VQgemini` React/Vite application, not an empty repository. Repair and complete its engineering while preserving all approved experiences, the five-tab product, current visual appearance and populated content. The target remains 28 canonical logical domains and the existing S01–S18 functional scope. Earlier claims that application code/client/UI do not exist or must be rebuilt from scratch are superseded. The current selected infrastructure is GitHub `funmarket/VQgemini`, Vercel project `vqgemni`, Supabase project `avdfessrhbsqwlfmbdau`; verify the actual live environment/hosting state before every task, without treating connection as proof of readiness.

**Mandatory dependency:** S00 (defined below) precedes S01 and every structural refactor that could delete, detach or mutate existing content. S00 preserves and inventories every existing post, authored sample, Place, Trail, Guardian/Legend, account/profile, image/media asset, relation and screen; creates genuine Supabase Auth **test accounts** plus D01/D02 profiles; associates sample posts, Trails and Guardians with appropriately authorized test principals; migrates licensed media into Supabase Storage under D13 ownership; and verifies all content and visual parity before replacing the embedded React datasets. These are genuine database test fixtures, **not** invented real-user activity, check-ins, payments, Handshakes, rewards or verified location evidence. The app stays populated throughout development.

**Data authority:** React owns presentation, styling and transient interface state only. Domain-owned backend / authorized RLS interfaces own durable identity, posts, media attachments, Places, Trails, Guardians, relationships and transactional facts. Do not expose service role keys, bypass canonical writers, or treat localStorage/samples as source of truth. Preserve static design tokens and ordinary UI icons; **business datasets and their images** belong in Supabase-authorized persistence/media. Under the modular monolith rule, only the owning domain folder under `src/domains/` may mutate its tables; all other code calls the domain’s public API.

**Lifecycle:** Temporary test users and content remain in development/staging until a verified production-ready, legitimately populated release baseline is established. Cleanup is a **separately authorized** dependency-aware operation that cannot orphan posts, steal authorship, delete genuine user records or leave the launch application unintentionally empty. No content imports, Auth operations, Storage uploads or database changes are authorized merely by this document.

## 0. Global constraints and execution states

### 0.1 Non-negotiable constraints

1. The target is the **entire production application**; dependency ordering never reduces scope.
2. All **D01–D28** are complete-initial-product domains. Logical domains do not imply 28 services, schemas, tables or deployments. They are modules inside one modular monolith.
3. One canonical writer owns each business fact. Cross-domain journeys use typed commands/events/read projections via public domain APIs, not direct foreign-domain writes.
4. One canonical product/backend serves browser and Telegram Mini App. Host APIs are adapters, not separate business systems.
5. Five equal root destinations remain **Home / Explore / Share / Vibe / Purse**.
6. Guest-first public discovery; protected writes require verified identity and authorization.
7. No historical mock, browser-local authority, fabricated user, fake GPS, fake booking, fake notification, fake payment, client-minted VQ or optimistic failure-success is permitted in production.
8. VQ is the only in-app reward unit; it is distinct from recognition and fiat money.
9. Ticketing is independent of Events and Guardian reservations. Activities and Events remain distinct.
10. D13 owns media assets; consuming domains own attachment meaning/authorization. D04 owns geographic evidence; D05 owns Places; D06 owns Trails; D23 owns notification delivery, not originating actions.
11. PostgreSQL + PostGIS is the intended authoritative persistence/spatial platform. Physical schema is implemented incrementally from approved invariants, with versioned migrations and compatibility gates.
12. Security, observability, accessibility, localization, mobile acceptance and operations are built throughout, not appended at the end.
13. Staging appears early and remains continuously production-shaped, but staging availability is never production launch acceptance.
14. Genuine Supabase-authenticated development test users and imported, clearly attributed sample business records must populate the app during S00–S18 development. They never count as proof of real external events, payments, Handshakes, check-ins or production-user activity; no browser-local fake authority is allowed.
15. Any implementation task must re-read current branch/head and governing documents before mutation; this plan does not authorize stale-state execution.
16. Implementation workers must read the current Product Owner-approved `Master Plan.md` before executing any slice. Authority order is: latest explicit Product Owner decision → approved Master Plan → Requirements → structure → Database → historical/reference evidence.
17. Master Plan enhancements do **not** require automatic back-edits to older design documents. A blocking contradiction exists only when execution would remove approved functionality, duplicate a canonical writer, violate the 28-domain model, breach privacy/security, recreate prohibited legacy authority, split Web/Telegram into separate products, introduce a 29th business domain, or violate a newer explicit Product Owner decision.
18. The Master Plan may add implementation/operational detail only when directed, source-backed, ownership-consistent, security/privacy-required or a production-readiness engineering choice. `Master Plan controls` is never permission for an agent to silently invent product policy.
19. Modular monolith boundary: only the owning domain folder under `src/domains/dXX_*` may mutate its tables. All other code (UI, features, other domains, Admin) must call the public API exported by the domain’s `index.ts`. No direct Supabase writes outside the owner. No service extraction.

### 0.2 Status vocabulary

Every slice/domain/journey uses only: `PLANNED`, `READY`, `IN PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `STAGING ACCEPTED`, `PRODUCTION ACCEPTED`, `BLOCKED`.

`IMPLEMENTED` means code/persistence exists. `VERIFIED` adds the required automated evidence. `STAGING ACCEPTED` adds integrated production-shaped runtime evidence. `PRODUCTION ACCEPTED` requires the final release gates. No domain is called complete because a subset of these states is green.

### 0.3 Evidence fields retained for every slice

| Field | Before implementation |
|---|---|
| Source/base SHA | PENDING |
| Implementation commit SHA(s) | PENDING |
| PR identifier | PENDING |
| CI run / exact-SHA checks | PENDING |
| Focused tests | PENDING |
| Integration/database tests | PENDING |
| Migration IDs/checksums | PENDING |
| Staging deployment/revision | PENDING |
| Staging runtime evidence | PENDING |
| Security/privacy evidence | PENDING |
| Product Owner acceptance where required | PENDING |
| Known limitations | PENDING |
| Boundary test (public API only, no cross-domain writes) | PENDING |

Never fabricate these fields.

---

## 1. Source checkpoint

### 1.1 Live repository checkpoint rule

- Repository: `funmarket/VQgemini`
- Current repository default branch: `main` (no separate integration branch designated here)
- Stable/release branch: `main`
- Exact current HEAD MUST be retrieved from GitHub immediately before each implementation or consequential mutation.
- Current file/tree/runtime presence MUST be verified from live source; this plan must not be used as evidence that a file, application tree, migration, deployment or runtime still does or does not exist.
- Historical implementation evidence may be recorded in the applicable slice evidence fields, but mutable repository state is never frozen as permanent authority inside this section.

### 1.2 Governing sources

| Source | Role | Execution rule |
|---|---|---|
| `Master Plan.md` | Controlling implementation/sequencing/operations/acceptance authority | Read current Product Owner-approved revision before each slice |
| `Requirements.md` | Approved product behavior baseline | Current GitHub revision must be inspected |
| `structure.md` | Approved architecture/module/ownership baseline | Current GitHub revision must be inspected |
| `Database.md` | Approved conceptual persistence/invariant baseline | Current GitHub revision must be inspected |
| `AGENTS.md` | Mandatory execution/evidence/release discipline | Current GitHub revision must be read before work |

`docs/product-design/*` is think-tank/reference material only. It may inform research, historical analysis, and supporting context, but it is not a governing or canonical implementation authority.

Commit SHAs, blob hashes, byte counts and line counts belong in task/slice evidence when they are actually observed. They are not permanent authority and are intentionally not frozen into this living plan.

### 1.3 Decision supersession for this plan

The following explicit Product Owner decisions are incorporated into the current governing-document set and remain controlling where older historical wording is retained for context. The synchronized Requirements, Structure and Database documents contain their applicable post-baseline delta notices; the Master Plan remains the controlling implementation authority.

1. **Master Plan authority — DIRECTED FINAL**: the Product Owner-approved `Master Plan.md` controls implementation sequencing, operational policy, acceptance contracts, Admin/governance controls and production readiness below any later direct Product Owner instruction. Older Requirements/Structure/Database remain mandatory design sources but do not require back-edits merely because the approved Master Plan contains a newer directed clarification or operational enhancement.
2. **Handshake — DIRECTED FINAL**: qualifying approved agreement acceptance creates exactly one idempotent D22 Handshake; service-flow provider acceptance is the trigger. No Handshake cancellation state. Server-authoritative lifetime is exactly 24 hours: `ACTIVE → EXPIRED`. Cancellation of the underlying engagement does not revoke/reset/delete the Handshake or its timer. New review creation is allowed only while the Handshake is active and otherwise eligible; after expiry it is denied. D22 owns eligibility proof, not review content.
3. **Marketplace VQ — DIRECTED FINAL**: optional Marketplace VQ transfer is peer-to-peer, buyer-to-seller via D20, at participant risk. No default escrow, platform guarantee, commission, delivery proof or automatic refund. D26 owns listing/negotiation/deal state; D20 alone posts VQ.
4. **Marketplace review — DIRECTED FINAL**: an eligible D26 mutual agreement may create one D22 Handshake and a 24-hour review-eligibility window. D26 owns Marketplace product/deal-item review content because the reviewed object is a D26 listing/deal fact; D19 remains the established owner for Guardian/provider reputation review where applicable. D22 never owns review text/rating content and never proves delivery/payment.
5. **Official app products — DIRECTED BOUNDARY**: no official products are invented now. Future Product Owner-authorized official VQgemni products appear through Vibe Guide and remain distinct from ordinary D26 peer listings.
6. **Place confidence — DIRECTED FINAL OWNERSHIP**: D05 confidence is computed under a versioned, auditable Admin-managed policy. D05 owns observations and confidence result; Admin Control Room changes policy through an authorized contract and audit, not direct SQL or a second writer.
7. **User enforcement — DIRECTED FINAL**: ordinary confirmed violations use Strike 1 first formal warning → Strike 2 final formal warning → Strike 3 account sanction. Reports are allegations/case inputs, never automatic strikes. Duplicate reports about one incident do not multiply strikes. Standard suspension/ban choices are 3 days, 1 week, 1 month, 3 months or Permanent. Severe safety/security violations may bypass graduated warnings with evidence, reason, actor, case and audit; temporary protective restriction may be used while evidence is reviewed. Eligible sanctions support appeal without automatic suspension removal.
8. **Admin Control Room — DIRECTED FINAL**: a real permission-scoped Control Room begins with S02 authorization/shell and grows with owner-domain panels through S15, where it reaches integrated operational completeness. Admin is orchestration over D01–D28, never a 29th writer or direct-SQL console.
9. Existing latest Geo decisions remain binding: real device location; D04 evidence/consent; PostgreSQL/PostGIS authoritative proximity; MapLibre rendering; Overpass external POI adapter; replaceable providers; external device navigation; 5 m check-in rule with uncertainty; 23 km applicable discovery scope; 2-hour Find Hub temporary-position retention; no fake geo fallback.
10. **Modular monolith — DIRECTED**: implementation uses one process and one Supabase project. Domain folders under `src/domains/` are the sole writers. Public APIs only. No service extraction.

---

## S00 — Mandatory existing-content preservation, test-account attribution and Supabase media migration

**Status: PLANNED; no implementation or acceptance claimed.** S00 MUST reach its verified content/data and visual preservation gates before S01 starts. No old source arrays, assets, sample accounts or demo records may be removed beforehand.

1. **Inventory and recoverability:** Inspect current GitHub HEAD, Vercel serving revision, Supabase schema/Auth/Storage, React templates/assets, localStorage and existing backend data; record every sample/real user and profile, post, Place, Guardian/Legend/offer, Trail/stops/remix, community, image/video/audio, relationship, feed card, event and related record. For each record capture original source/path/key/ID, user-facing placement, media source/rights, dependencies, timestamp, intended owner and status (existing real, imported demo, external suggestion, fake workflow). Capture screenshots at responsive widths for Home/Explore/Share/Vibe/Purse, count visible content, and obtain recoverable, verified source/data/media backups. Historical attached 215-feature CSV is a provisional coverage index (210 REVIEW OPEN, 5 blocked ownership), **not** 215 accepted functional services.
2. **Authentic test identities:** Create approved restricted **actual Supabase Auth test accounts**, linked canonical D01 IDs and durable D02 profiles, handles and valid account roles; test profiles/avatars are persistent, never JavaScript-user objects. Keep credentials and service keys out of React and repositories, identify test cohorts/provenance and enforce actual authorization/RLS. S00 introduces only the minimal safe identity/media/data migration capabilities necessary for preservation; S02 later extends full authentication, provider linking and Web/Telegram support using those same canonical identities.
3. **Domain-correct record import and attribution:** Associate old *sample* posts with authorized test-author D01 IDs under D12; preserve captions, ordering, relationships and eligible import dates. Attribute D06 Trails/ordered stops/versions/remix lineage to test authors; D07 Guardian/Legend qualifications and offers to test principals; D08 Tours/reservations remain separate; D05 Places retain their canonical Place facts and permitted images; D09 Business operator records and D16 communities retain proper ownership. Preserve legitimate existing records, never overwrite real users or attach their historical posts to someone else. Imported test provenance must be recoverable, idempotent, duplicate-safe and clearly marked in the controlled dataset. Do not convert fake operational events into genuine check-ins, accepted bookings, rewards, votes, ratings, location proofs, wallet transfers, Handshakes or permissions.
4. **Supabase Storage and D13:** Inventory all displayed images/media, verify ownership/rights, copy permitted bytes into access-controlled Supabase Storage, record D13 asset identity/metadata/retention, and attach through each consuming domain's authorization. Preserve original photo selection, crop/aspect/order and access scope; enforce approved 24-hour ephemeral vs durable Place/Business media treatment. Never assume a third-party URL is licensed for rehosting; provider map tiles/POI results do not become canonical Place/media records by import.
5. **Verified visual/data cutover:** Once the equivalent records and media are confirmed, replace React hardcoded **business data reads** with authorized domain/backend/Supabase queries; retain purely presentational constants. Verify source-to-target counts/IDs, legitimate test authors, foreign references, media hashes/access, Trail lineage, Guardian content, Place cards, links, and screenshot/interaction parity. Test rerun idempotency, denial, missing media, failed import recovery and rollback in an isolated scope. Do not delete original business-data source or cut over a module before its persistent replacement is validated.
6. **S00 acceptance:** Document exact source commit, import manifest, backups/restoration, test Auth identities (without exposing secrets), profile/owner mappings, SQL migration/checksums where used, RLS/auth tests, asset proofs, rendered before/after comparison, failure tests, staging/host checks and Product Owner acceptance. The app remains fully populated and looks and behaves as before, with authoritative data now outside React. If any S00 category cannot be migrated safely, preserve it and mark S00 blocked rather than invent a shortcut.

**S00 implementation/acceptance evidence:** source mapping IN_PROGRESS; backup PENDING; test users/profiles COMPLETED (24 canonical Supabase Auth test accounts mapped 1:1 to profiles with handle, display name, and avatar persistence; legacy `s00_test_identity_links` retired via `p03_retire_s00_identity_links.sql` and direct profile RLS); canonical domain records IN_PROGRESS (D12 posts attributed to canonical @handle, D06 trails and D07 guardians integrated with Supabase persistence); media import IN_PROGRESS; source cutover IN_PROGRESS; visual and functional parity VERIFIED; Product Owner acceptance PENDING.

---

## 2. Current-app implementation baseline (S00/S01 preflight)

The historical empty-project table was superseded by verified current source. Revalidate all mutable runtime evidence before the relevant task; code presence is not complete domain acceptance.

| Area | Source-observed baseline | Required work |
|---|---|---|
| Existing app | React/Vite code, source screens, features, domains and a Supabase client exist | Preserve and progressively refactor; do not rebuild from zero |
| Content/UI | Hardcoded Guardian catalog, curated Places/activities, image URLs and Trail fallbacks exist | S00 inventory, legitimate test attribution, Supabase media and display-parity migration |
| Hosting | Vercel project `vqgemni` has been connected | Verify exact deployed revision and functional runtime; previews do not equal production |
| Database | Supabase project `avdfessrhbsqwlfmbdau` and initial public tables inspected | Verify Auth, Storage, PostGIS, actual RLS policies, data, migrations, service capabilities and backups |
| 28 domains | Approved logical model; some existing `src/domains` modules | Trace and correct canonical writers, do not assume implementation completion. Move logic into domain folders with public `index.ts` only. |
| API/Worker/Web/Telegram/CI | Intended complete-product capabilities | Inspect actual state individually; implement or adapt under owning stages |
| Historical Gemini/VibeQuest | Behavioral and forensic references | Preserve useful UX; do not import mocked backend authority |

---

## 3. Full-system dependency graph

This is dependency ordering, **not product-scope phasing**.

```text
S00 Content, real test identities, domain-owned Supabase data/media and baseline acceptance
  └─> S01 Engineering/release substrate
  └─> S02 Identity + shell + Web/Telegram host authority + real Admin shell/RBAC
       ├─> S03 Media + camera/mic/permission capability
       ├─> S04 Profiles + Social Graph + Business/operator authority core
       ├─> S05 Messaging engine + Notifications + D21 report/case core + realtime
       └─> S06 VQ ledger + reward/admin VQ panels

S04 + S05 ─> S07 Geo/Find Hub
S03 + S06 + S07 ─> S08 Places/Validate/check-in/confidence + Places Admin
S03 + S07 + S08 ─> S09 Trails/navigation/remix
S04 + S03 + S05 + S06 + S09 ─> S10 Guardians/Tours/Reservations/Handshake/Recognition/Entitlements + Guardian Admin
S04 + S03 + S05 ─> S11 Social Content/Communities/Live Rooms + moderation panels
S04 + S03 + S05 + S11 ─> S12 Matching/Pulls/Vibes/VibeCheck/VibeFlash + safety operations
S03 + S05 + S08 + S04(D09 authority) ─> S13 Activities/Events/Ticketing + operations panels
S05 + S06 + S10 ─> S14 Purse/Marketplace/Payments boundary + Marketplace operations/reviews
S02 + S04(D09) + S05(D21) + S06 + S08 + S10 + S11 + S12 + S13 + S14 ─> S15 Admin/Trust & Safety integrated completeness + Business completion + Ads
S07 + S08 + S09 + S11 + S12 + S13 + S14 + S15 ─> S16 Home/Share/Vibe destination integration
S02–S16 ─> S17 Full client parity/accessibility/phone/Web/Telegram integration
S01–S17 ─> S18 Full production-readiness, release and post-deploy acceptance
```

All slices implement as modular monolith modules. Boundary tests are required at each stage.

---

## 4. Slice implementation rules (modular monolith)

Each slice:
- Moves or creates logic only inside the owning domain folder under `src/domains/`.
- Exports a public API from `index.ts`.
- Wires UI and other domains exclusively to that public API.
- Passes a boundary test (no private imports, no direct cross-domain table writes).
- Preserves all existing product invariants listed in Requirements and the decision supersession section above.

Start with one real feature (for example Places validation or a simple post) fully inside its domain folder to prove the pattern before broader extraction.

---

## 5. Domain implementation slices (S01–S18)

(Phases retain their original functional scope and acceptance contracts. The modular monolith constraint is additive.)

- **S01** Engineering substrate, CI, staging, boundary lint rule, migration ledger, health checks.
- **S02** D01 Identity, sessions, Web/Telegram host authority, Admin shell with scoped RBAC (orchestration only).
- **S03** D13 Media lifecycle, camera/mic adapters, expiry, signed delivery.
- **S04** D02 Profiles, D03 Social Graph, D09 Business authority.
- **S05** D14 Messaging engine, D23 Notifications, D21 report/case core.
- **S06** D20 VQ ledger (sole writer), rules, grants, Admin VQ panels.
- **S07** D04 Geo & Presence, MapLibre, Find Hub, 2-hour retention.
- **S08** D05 Places, 5 m check-in, Validate, Admin-configurable confidence policy.
- **S09** D06 Trails, studio, versions, navigation, remix.
- **S10** D07 Guardians, D08 Tours, D19 Recognition, D22 Handshake (ACTIVE 24 h → EXPIRED, no cancel), D25 Entitlements.
- **S11** D12 Social Content, D16 Communities, D15 Live Rooms.
- **S12** D17 Matching, D18 Challenges (VibeCheck 180 s, VibeFlash 33 s).
- **S13** D10 Activities, D11 Events, D28 Ticketing.
- **S14** Purse, D26 Marketplace (peer-to-peer VQ, no escrow), D27 boundary.
- **S15** Full Admin Control Room integration (still orchestration only).
- **S16–S18** Destination integration, full client parity, accessibility, production readiness gates.

Each domain’s acceptance includes the boundary test and public-API wiring in addition to its original functional evidence.

---

## 6–17. Remaining sections

The original detailed sections on requirement mapping, cross-domain journeys, Admin/Trust & Safety matrix, security matrix, observability, production readiness gate, Product Owner decision controls, remaining gates, living-plan authority, coverage checklist, and end condition remain in force exactly as previously approved.

They are unchanged except for the additive modular monolith constraint stated in section 0.1 (item 19) and throughout the slice rules: one process, domain folders as sole writers, public APIs only, no service extraction, boundary tests required.

All invariants (Handshake 24 h ACTIVE → EXPIRED, no cancellation; D20 sole VQ writer; report ≠ strike; 5 m check-in; 23 km discovery; 2 h Find Hub; 24 h ephemeral media; Admin as orchestrator; no mocks; five equal tabs; etc.) continue to apply without modification.

---

## 17. Master Plan end condition

This plan is executable only as a controlled sequence:

```text
approved product design + currently implemented VQgemni UI
  → S00 preserved test-authored Supabase content/media and verified visual baseline
  → S01–S18 source-verified existing-app rehabilitation and production-quality vertical slices
  → continuous production-shaped staging
  → all 28 domains staging-accepted
  → full cross-domain/client/security/data/operations acceptance
  → explicitly authorized production release
  → post-deploy verification of actual serving state
```

There is no MVP completion gate, partial-foundation product acceptance, fake business state, deferred approved launch domain, Handshake cancellation, Marketplace escrow, report-as-automatic-punishment, unscoped god-mode Admin, hard-coded immutable D05 confidence formula, or service extraction in this plan. This Product Owner-approved living `Master Plan.md` is the controlling implementation/production-execution authority below any later explicit Product Owner decision; ordinary implementation must not reopen that hierarchy or demand backward edits to older design documents merely to remove textual differences.

**Modular monolith end state:** one React/Vite application, one Supabase project, domain folders under `src/domains/` as the sole writers of their tables, public APIs only, Admin as orchestrator, all 28 domains accepted inside the single process.
