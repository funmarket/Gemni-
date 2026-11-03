# VibeQuest — Source Baseline, Decision Ledger and Documentation Authority

**Document ID:** VQ-BASE-001  
**Edition:** 1.0 — 2026-10-29 (Africa/Tunis)  
**Status:** EVIDENCE BASELINE / DRAFT FOR PRODUCT OWNER REVIEW; not a completed architecture, approved schema, or authorization to implement.  
**Purpose:** Establish the reliable inputs, binding Product Owner instructions, known conflicts, and quality gates for drafting exactly one subsequent canonical document at a time.

## 1. Scope and non-authorization

This baseline governs documentation for a **new, clean VibeQuest application**. The legacy ZIP, current GitHub reconstruction, Gemini-related material, and Manus packages are sources of evidence, not automatically approved source code, schema, product policy, or topology. This baseline does not authorize changing GitHub, Railway, live databases, deployments, domain names, bots, object stores, or application code.

The entire product, domain ownership, target database and full execution plan must be designed, reconciled and approved **before coding begins**. Later implementation may use bounded, dependency-ordered changes to realize that complete design; the changes must not redefine the baseline silently.

## 2. Source hierarchy and exact captured identities

| Source ID | Source | Evidence use | Authority and limitation |
|---|---|---|---|
| PO | Latest explicit Product Owner instructions in this conversation | Binding decisions and documentation workflow | Override contradictory historic material; only the owner can approve unresolved policy |
| GH | `https://github.com/funmarket/VibeQuest`, branch `phase-0-foundation`; observed HEAD `daf273e1e3c1d1a9a3cbf39c97160fa26df92884` (2026-10-29) | Current reconstructed code, manifests, routes, migrations, tests, CI | Head verified via GitHub connector during the 2026-10-29 audit; **recheck before future exact-head claims**. Not the new target implementation |
| LEGACY | Supplied `/mnt/data/vibequest.zip` (350 archive entries) | Original screen scripts and historical behavior | Documented as secondary `vibequest last` variant; not the highest-priority primary `vibequestbest` source; mock behavior and provider fallbacks unsafe to copy |
| PRIMARY-REG | GitHub `docs/product/legacy-parity-inventory.md`, `screen-contract.md`, `mechanics-permissions.md`, and the three `references/product-truth-*.md` registers | Source-anchored reconstruction evidence of primary/secondary/tertiary variants | Historical forensic documentation. Original primary source not independently supplied in current archive; cited source lines require verification when primary files become available |
| MASTER-LEGACY | GitHub `docs/product/VIBEQUEST_MASTER_RECONSTRUCTION_PLAN.md` | Scope and historical requirement recovery | Not an executable new plan; reconcile every requirement and superseded implementation assumption |
| NOTES-A | Attached `approch(1).md` | Failure lessons, architecture rules, release gates, candidate domain boundaries | Proposed pre-documentation discipline, updated by later owner decisions; some older steps incorrectly imply foundation-packet approval can precede total design approval |
| NOTES-M | Attached `mechincs(1).md` | Screens, functions/hooks, mechanics and simulation defects | Evidence companion only; explicitly outdated about the two challenge durations, now superseded by PO decisions |
| MANUS | Latest supplied `vibequest-fresh-architecture-ownership-contracts.zip`; earlier Manus ZIPs retained only for change history | Candidate DDL and documentation ideas | Not canonical. The generated 215-engineering-contract mapping contains materially wrong writers, phantom endpoints and synthetic entity definitions |
| MANUS-VAL | `database-validation-report.md` and `database-bootstrap-validation.md` | Agent-reported isolated PostgreSQL/PostGIS test evidence | Reproducible assertions, not independently replayed here; does not prove business correctness, live installed schema or production authority |
| GEMINI | `gemini_v2_prompt.md` and related files in supplied original ZIP, plus past forensic material | Product discovery leads | Do not conflate the Gemini-built archive with independently verified primary product source |

**Availability checkpoint:** This document inventories local attached source and the cited GitHub head; it is not a fresh live Railway runtime census. Missing live verification must remain labeled `UNKNOWN`.

## 3. Evidence grades

- **PO-APPROVED:** explicitly decided by Product Owner.
- **SOURCE-VERIFIED:** observed in an identified source file/revision; says nothing about deployment.
- **RUNTIME-VERIFIED:** observed in identified live deployment or database, with timestamp/identity.
- **LEGACY-EVIDENCE:** historical code or forensic register, possibly simulated, unreachable or defective.
- **PROPOSED:** design recommendation, not approved nor implemented.
- **BLOCKED/UNKNOWN:** unverified source, unresolved policy, missing permission, or conflicting evidence.

For every consequential claim record a locator and say whether it proves presence, reachability, authoritative mutation, test execution, or runtime outcome. A file or handler name alone proves none of the latter.

## 4. Binding Product Owner decisions to propagate

| ID | Binding decision | Scope | Reconciliation required |
|---|---|---|---|
| PO-001 | **VibeCheck expires after 180 seconds (3 minutes)** | Distinct native challenge lifecycle; authoritative server deadline | Supersedes historical 300s/33s variants and `mechincs(1).md` OPEN timer text |
| PO-002 | **VibeFlash expires after 33 seconds** | Distinct native challenge lifecycle, NOT Home Flash Events | Supersedes historical 180s/60s variants and `mechincs(1).md` OPEN timer text |
| PO-003 | **All 26 named domain boundaries are candidates for review, not automatically approved** | Domain registry, entity owners, schema/package boundaries | A 26-role bootstrap is test evidence, not domain approval |
| PO-004 | **One canonical frontend product implementation with separately deployable and frontend-serving Web and Telegram instances** | Web and Telegram delivery architecture | A redirect-only Telegram deployment violates intended serving separation; sharing API/database does not guarantee backend capacity isolation |
| PO-005 | **One canonical User and shared API/database authority** | Web/Telegram identity and writes | Telegram launch credentials require backend verification and deliberate linking; no parallel Telegram User identities |
| PO-006 | **Navigation is HOME → EXPLORE → elevated-heart SHARE → VIBE → PURSE** | Main UX | No sixth root tab; Local/Pulls capabilities preserved pending placement decision |
| PO-007 | **Design the entire product, domain map, database model, contracts and master plan before application coding** | Documentation/approval sequence | No implementation or partial schema installation while baseline remains unresolved |
| PO-008 | **Write documents sequentially and reconcile each with earlier approved material** | Documentation process | No batch generation of five contradictory docs; each has one authoritative role |
| PO-009 | **Preserve approved existing UI/pages and feature mechanics as references, not blindly import mock logic** | Rebuild scope | No artificial feature loss or fake success, rewards, GPS, camera or financial state |
| PO-010 | **No unapproved source, GitHub, Railway, SQL or production mutation** | Safety | This document authorizes only local documentation generation and read-only inspection |

**Important:** Exact secondary challenge policy (eligibility, notification timing, scheduler cadence, response proof, timezone/cooldowns) remains open unless explicitly decided. Do not invent it from the locked durations.

## 5. Verified current reconstruction — NOT the clean target

The inspected GitHub source has a Next.js Web frontend and Fastify API. `apps/web/src/app/[locale]/[destination]/page.tsx` dispatches `home`, `explore`, `share`, `vibe`, `purse`. `apps/web/src/platform/host.tsx` contains browser/Telegram host detection and presentation adapter logic, not proof of secure Telegram login. The Web Purse page intentionally reports disconnected or unavailable financial capability.

`apps/api/src/app.ts` composes Places, Identity, Geo, Profiles, Media, Business, Activities, Events, Social and Content HTTP modules; `apps/api/src/main.ts` wires dependencies. `packages/database/migrations/` contains named files through `0020_geo_presence.sql` at the inspected GitHub head. Code presence does **not** show which migrations are installed on Railway or whether the latest API service passes readiness.

The previous API deployment was reported to fail readiness with HTTP 503 while Web and API versions diverged. The precise database cause was **suspected** but not established by a direct installed-schema census. Future documents must require exact environment, migration-ledger and deployed-artifact verification before release.

## 6. Legacy product evidence preservation

The GitHub Product Truth 002 register enumerates **215 scoped records: Discovery 101, Social 54, Platform/Purse 60**. These are preservation records, not necessarily 215 independent business features, tables, endpoints or executable flows. Keep the original IDs and descriptive source evidence. For each record separately determine:

1. Product concept and destination/page; 2. trigger and legacy handler; 3. real vs simulated behavior; 4. user-visible states and navigation; 5. validation, consent, security and timer semantics; 6. canonical business responsibility vs presentation/device adapter; 7. actual shared commands/read models; 8. persistence entity and owner **only when justified**; 9. errors, retries and concurrency; 10. feature-specific acceptance evidence; 11. requirement ID and eventual plan mapping.

**Never create one endpoint/table/event per register record.** Reusable operations and business entities govern service design. Filter tabs, headings, dialogs, hover behavior, navigation clicks and device permission prompts are not automatic authoritative database records.

Sources should include Home/Radar/streak/Find Hub, Explore/Places/Contributions/Trails/Guardians, Share/Camera/DualCam/VibeCheck/VibeFlash, Vibe/Gossip/Drift/Vibes/Orbit/Echo and additional views, rooms/DMs/circles, and Purse/finance with real-vs-mock classification.

## 7. Manus material to quarantine — known wrong semantic mappings

The latest `original-215-engineering-contracts.md` and generated CSV are **not implementation authority**. Confirmed review flags include:

- Location permission, camera permission, Admin and Notifications assigned to an `UNRESOLVED: Purse vs Payments boundary` bucket.
- Business event publication assigned to Places; Trail creation assigned to Geo & Presence.
- Financial SOL tips assigned to Rewards rather than a proper transfer/finance decision.
- Category chips like Food/Cafés converted into feature-named proposed persistence/API contracts.
- UI navigation headings assigned persisted business tables and invented mutation routes.
- Synthetic endpoint names and `candidate-...` placeholders presented as though engineering contracts.

Retain the **historical record IDs and source evidence**, but independently redesign the semantic columns. Do not copy the generated writer, persistence, API/event, or acceptance mappings without review.

## 8. Candidate domain analysis — no premature architecture lock

Review the following 26 candidate concerns; each can become an independently bounded module, approved subdomain, cross-cutting capability or projection as justified by business invariants. Do not assume 26 microservices, 26 database schemas, 26 workspace packages, or 26 owner DB roles.

Identity & Authentication; User Profiles; Social Graph; Geo & Presence; Places; Place Contributions; Vibe Trails; Vibe Guardians; Tours & Reservations; Business; Activities; Events; Social Content/Gossip; Global Media; Messaging; Live Rooms; Communities & Circles; Matching & Connections; Challenges & Live Vibes; Rewards & Reputation; Purse & Ledger; Marketplace; Notifications; Moderation & Trust; Search & Discovery; Administration & Operations.

Boundary evaluation must cover: sole business writer, owning entities, commands, reads and event contracts, security and retention, consent/verification, cross-domain transactions, Worker/Outbox and Media relationships, migration ownership, testing and dependencies. Review notably Places↔Geo↔Trails, Guardians↔Reservations↔Messaging, Community↔Rooms↔Messaging, Content↔Media↔Worker, Marketplace↔Purse, and Search/Home as read projections.

## 9. Database baseline must be designed as a whole before installation

Manus has proposed a 93-table baseline (`sql/0001_fresh_vibequest_target.sql`), eight candidate extension tables (`0002...NOT_INSTALL_APPROVED`), and a 93-row ownership bootstrap with proposed database roles (`0003_ownership_bootstrap.sql`). Reported isolated PostgreSQL/PostGIS install and role probes are valuable **test leads**, not proof that entities/privileges match the right semantic domains.

The complete target design must include ERD, entity owner, business constraints and state machines, spatial indexes, authorized read/write paths, idempotency, finance ledger separation, privacy and retention, media references, outbox, migration-ledger checksums, real service principals, role grants, production-compatible deployment sequence, rollback/forward recovery and tests. **Do not execute candidate DDL against live environments or adopt 26 physical schemas by default.**

A no-direct-table-writes runtime policy requires a credible *working* owner-command path (e.g., rigorously designed routines/ports), not only denied INSERT probes. Model owner commands, `SECURITY DEFINER` privilege hazards, and connection-pool/session role semantics before choosing enforcement. Every write API must have a provable authorized route to commit.

## 10. Release-governance constraints inherited from failure evidence

- Choose and document stable `main` vs integration branch/repository policy **before** new app creation; GitHub currently has `phase-0-foundation` as observed default. Do not pretend `main` exists or rename the old branch silently.
- Separate dev/staging/prod resources and confirm actual resource identities.
- Preflight exact deployed Git SHA, app image, migration manifest and target environment.
- Verify installed target DB schema + checksums + required functions/indexes/permissions **before** API/Worker rollout.
- Test schema forward/backward compatibility with currently serving instances.
- API liveness != release readiness; readiness checks current registered dependency requirements, not all aspirational tables.
- Serve Web and Telegram as independent frontend deployments of the same canonical code/version; validate API compatibility, auth, host behavior and media.
- Outbox/Worker retries and dedupe must be durable, observable and tested.
- Keep rollback/data repair procedures separately specified; database rollback may be unsafe even if code rollback is possible.
- Promotion requires traceable actual browser, Telegram, API, DB, Worker and media acceptance, not just CI pass.

## 11. Canonical document creation order and single-writer authority

**Only this first baseline is authored now.** Proposed next order; confirm each completed doc against previously accepted docs before drafting the next:

1. `00_SOURCE_BASELINE.md` (**this file**): evidence identity, source priority, Product Owner decisions, contradictions, completeness boundaries and workflow.
2. `Requirements.md`: complete product feature/page/interaction specification and original 215-record traceability; does not invent DB schema or finalize candidate domains.
3. `Structure.md`: one coherent proposed architecture, frontend/Telegram topology, domain boundaries and contracts, acceptance of which resolves domain ownership.
4. `Database.md`: complete target entity/ERD/DDL and migration/privilege design based on **accepted Requirements and Structure**, not a speculative 93-table shortcut.
5. `Plan.md`: full end-to-end implementation/release plan based on the preceding coherent specifications; no implementation authorization until complete baseline approval.
6. `README.md`: accurate project entry point and navigation to the now-finalized specifications; only commands that genuinely exist or clearly marked proposed bootstrap commands.

**Supporting after justified need:** a single versioned decisions register, normalized feature crosswalk, schema SQL and ERDs, API contract catalog, test matrix, release runbook and progress/evidence ledger. Keep source observations and design decisions linked, not restated inconsistently in parallel masters.

## 12. Gates for *each* subsequent document

- Explicit ownership and authority statement; precise reference to earlier canonical documents.
- Complete topical scope, source/legacy distinctions and latest owner decisions.
- Each route, entity, API, table and job is SOURCE-VERIFIED, PO-APPROVED, PROPOSED, or UNKNOWN.
- No invented provider success, business policy or complete coverage assertion without verification.
- Each unresolved decision has stable ID, alternatives, impact and blocking downstream topic.
- Review coverage against original ZIP + Product Truth registers + current exact GitHub head + attached notes + latest relevant Manus evidence without copying its generated mistakes.
- Validate internal links and cross-document consistency; no superseded text may silently override current source.
- Independent read-only review and explicit owner acceptance before the next canonical document is locked.

## 13. Outstanding questions and blockers register

| ID | Open item | Why it matters | Documentation boundary |
|---|---|---|---|
| D-001 | Primary `vibequestbest` source archive not provided independently | Exact top-priority UI/handler source proof incomplete | Requirements must preserve primary claims as historical register evidence |
| D-002 | 26 candidate domains require semantic review and approval | Wrong canonical writer causes DB/API design drift | Structure before Database |
| D-003 | Actual live Railway installed migration ledger and deployed peer SHAs not independently censused in this baseline | Failed release cause not fully proved | Plan/release preflight, not speculative database facts |
| D-004 | Rewards/streak/Radar charging and provider economics not owner-approved | Determines safe state transitions and monetary-like claims | Requirements; dependent Schema gated |
| D-005 | Guardian verification/selfie freshness, bookings, in-person handshake | Determines security/privacy and booking entities | Requirements and Database |
| D-006 | Finance asset/custody/transfers/escrow/provider/regulatory model | Can substantially change financial storage and API design | Requirements and Database |
| D-007 | Proximity thresholds, user consent, retention, notifications and realtime provider | Impacts security, privacy, resource budgets | Requirements/Structure/Database |
| D-008 | Local/Pulls tab nesting, Orbit/Echo semantics and final UI tokens | Prevents invented presentation UX | Requirements/Structure |
| D-009 | Operational target scales, RPO/RTO and Railway env topology | Cannot responsibly finalize pool budgets/backup policy | Structure/Plan |
| D-010 | Physical DB authorization model and migration ledger/role implementations | Direct-write denial is not proof that real owner commands work | Database |

## 14. Outcome and next document gate

This document establishes a **controlled drafting basis**, not a complete approved application architecture. The next document should be `Requirements.md`, populated by feature-level source comparison, screen inventory, genuine mechanics, unknowns and 215 original IDs **without converting every UI record into a fabricated endpoint/table**. Domain and database approvals follow only after the feature requirements are coherent.

**No remote repository, Railway or database mutation performed by preparing this baseline.**