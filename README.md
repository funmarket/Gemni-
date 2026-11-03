# VQgemni — Existing Application Repair and Production Readiness

**Project identity:** [funmarket/VQgemini](https://github.com/funmarket/VQgemini), default branch `main`  
**Current web deployment project:** Vercel `vqgemni`  
**Current nominated auth, database and object storage:** Supabase `avdfessrhbsqwlfmbdau`  
**Status:** Existing React/Vite app undergoing architecture and content-persistence rehabilitation; *not* proven production ready.

## Mission — preserve the product, repair the engineering

VQgemni is an existing mobile-first cultural exploration and social application. Keep its current populated look and behavior across **Home / Explore / Share / Vibe / Purse** while separating monolithic UI, data and business responsibilities into the approved **D01–D28 canonical ownership** model. Preserve present posts, profiles, Places, Vibe Trails, Guardians/Local Legends, images and feature journeys; replace hardcoded business data and simulated outcomes with real authenticated, domain-owned records, managed media, permission-aware services and genuine testable workflows. This is **not** a new empty application, MVP-only rebuild, Firebase/Firestore migration or permission to remove current functionality.

### Source and decision hierarchy

Latest explicit Product Owner direction → [Master_Plan.md](Master_Plan.md) → [requirements.md](requirements.md) → [structure.md](structure.md) → [Database.md](Database.md) → historical Gemini/old VibeQuest reference evidence. The current Master Plan defines **S00 then S01–S18**, acceptance contracts and release rules. Historical archives and the attached 215-feature CSV guide discovery but are not production-status certification or blanket acceptance of provisional ownership.

## S00 — mandatory before any S01 refactoring

1. **Preserve source and appearance.** Inspect actual main/source/deployment, inventory all sample and existing content, authors, relationships and images, capture full screenshots and recoverable backup/export state.
2. **Create genuine test users.** Establish authorized **Supabase Auth** development test identities and durable D01/D02 profiles, real handles and permitted account categories. Do not bake test user objects or credentials into React.
3. **Attribute sample content.** Import existing posts as D12 records owned by identifiable test authors; D06 Trails retain ordered stops/version/remix/author links; D07 Guardians/Legends and service offers link to eligible test users; D05 Places, D08 Tours, D09 Businesses and D16 Communities retain their independent domain ownership. These imported fixtures are test content, not authentic real-person history, verified GPS visits, valid bookings, Handshakes, VQ credits or completed payments.
4. **Move media into Supabase Storage.** Only upload assets with appropriate rights, attach them by D13 asset metadata and authorized consuming-domain relationships, preserve image composition/order, privacy and media retention. Presentation icons and theme styling remain in React; sample business records and their asset catalogs do not.
5. **Keep the app populated and prove parity.** Switch each frontend module to authorized persisted data only after data/media import and mapping are verified. Compare post counts, profiles, Places, images, Trails, Guardians, interactions, screen screenshots and navigation. Demonstrate idempotency, RLS, error states, restored backups and controlled retry/rollback before accepting S00.

**No S01 structural refactor until S00 is accepted.** Test users and content remain throughout S01–S18 so every feature can be tested with a populated interface. Final cleanup is a separately approved, dependency-safe task after production readiness and a legitimate nonempty launch-content baseline, never an automatic account deletion that orphans posts.

## S01–S18 — progressive domain-owned completion

After S00, refactor the actual React/Vite app incrementally, preserving meaningful UI and source-verified feature behavior. One canonical domain writer owns each business fact; React renders authorized projections and maintains only ephemeral UI state. A browser-accessible Supabase client can perform properly authorized reads where appropriate, but must not bypass protected business commands, RLS, server-authenticated identity, D20 journal rules, D04 location proof, D22 Handshake qualification or D13 media policy. API, Worker, migrations, PostGIS, Telegram host parity, CI and staging are verified and adapted from current code/environment; their existence or absence must never be guessed from a proposal.

**Approved product invariants still govern:** VibeCheck 180 seconds, VibeFlash 33 seconds, Place check-in 5 m with adequate evidence, 23 km appropriate discovery scope, server-authoritative 24-hour qualifying Handshake lifecycle, scoped Admin Control Room, independent Ticketing, non-crypto VQ ledger and peer-to-peer Marketplace without default escrow. Do not infer a different policy from older screenshots or Gemini notes.

### Current evidence limits

- The live GitHub project has React/Vite modules, a Supabase client and embedded example data (including Guardian catalog, curated coordinate/activity data and image URL fallbacks). Their actual source and runtime relationships require S00 inventory.
- The linked Vercel project, a successful preview build, and visible Supabase tables are not evidence that all 28 domain workflows, migrations, actual Auth profiles, Storage, PostGIS, RLS, tests, Telegram or production readiness are complete.
- Changes to database records, identities, storage, deployments and releases require separately authorized, evidence-backed implementation tasks. Do not create fake real-world activity or silently alter a user's genuine content.

## Development commands (verify dependency state first)

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

These commands check parts of the frontend and do **not** alone satisfy product, security, data, visual or release acceptance. The current dependency lockfile and Vercel build state must be reconciled before assuming clean installation.

**This README is an orientation document; the current approved Master Plan is the controlling execution and acceptance authority.**
