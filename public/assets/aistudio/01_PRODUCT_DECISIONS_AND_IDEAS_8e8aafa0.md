# VibeQuest — Product Decisions, Ideas & Open Questions

**Document ID:** VQ-DEC-001  
**Edition:** 0.1 — 2026-10-29 (Africa/Tunis)  
**Status:** LIVING DESIGN REGISTER; not a completed PRD, domain registry, database schema or build authorization.  
**Scope:** The **new** VibeQuest application. The old GitHub application, Gemini/legacy ZIPs and Manus files are **references only**. No existing code, database or infrastructure is being repaired as part of this document.

## How to use this register

This is the **single intake location** for Product Owner directions, design ideas, mechanics and open decisions while we work topic by topic. It must not silently become an implementation specification. The evidence baseline remains `00_SOURCE_BASELINE.md`; this register stores **new product direction and questions**, not historical evidence or lengthy copied source. Final approved requirements will later move into the appropriate canonical governing documents by explicit review, with stable decision IDs referenced rather than duplicated.

**Statuses:**
- **DIRECTED** — Product Owner has explicitly requested the behavior; authoritative as product direction, although implementation details may be unresolved.
- **PROPOSED** — Concept/recommendation from Grok, Manus, Gemini, earlier app or assistant; not yet approved.
- **OPEN** — A material question requiring a Product Owner decision before the complete architecture is approved.
- **LOCKED** — A full, clearly bounded decision explicitly reviewed and accepted by the Product Owner. Do not use this status merely because the idea was mentioned.
- **REVISED** — Superseded by a later explicitly cited owner decision; keep a history entry.

**Change protocol:** When a decision changes, identify affected journeys/domains/schema/policies, reconcile dependent drafts and preserve a dated history. No programming, new GitHub repository, Railway mutation or database installation is authorized by this register. Design issues are resolved incrementally; **the application is not implemented incrementally before its complete design is approved**.

## A. Product Owner directions already established

| ID | Status | Direction | Still to resolve |
|---|---|---|---|
| D-001 | DIRECTED | Rebuild a **new** VibeQuest application. Existing GitHub, Gemini/legacy ZIP and Manus output are reference evidence only. Create the new GitHub project **after** full clean documentation and plan approval. | Exact new repository and hosting identities; no provisioning now. |
| D-002 | DIRECTED | Create and review governing documents **one by one**, using previously reconciled documents, with a complete pre-build cross-document audit. | Final authority boundaries, sign-off record. |
| D-003 | DIRECTED | Resolve **all material** product rules and domain ownership decisions before architecture/database/build-plan approval, including Handshake. | Decision list in section C. |
| D-004 | DIRECTED | One VibeQuest product: browser and Telegram share canonical features and behavior; separate frontend-serving deployment targets. | Exact runtime/adapters, identity linkage and deployment contracts. |
| D-005 | DIRECTED | Primary navigation: HOME, EXPLORE, elevated central-heart SHARE, VIBE, PURSE. | Exact composition, responsive behavior and route conventions. |
| D-006 | DIRECTED | VibeCheck duration **180 seconds**; VibeFlash duration **33 seconds**, with server authority for expiry. | Eligibility, start triggers, evidence, cooldown and results. |
| D-007 | DIRECTED | **VQ is the only reward unit. No separate legacy Points balance/rewards.** VQ is initially an internal non-crypto reward credit; future paid uses may resemble Jetons for advertising/boosts; no token value, token conversion or cryptocurrency promise now. | Future spend/redeem and purchase policies intentionally not launch requirements; whether VQ is transferable remains OPEN. |
| D-008 | DIRECTED | Administrators configure eligible **activity reward amounts dynamically** in an Admin Control Panel; no hardcoded VQ amounts for activities. | Activity catalog, rule conditions, caps and authorization. |
| D-009 | DIRECTED | Support manual/custom-labeled VQ rewards for Vibe Guardians, Local Legends, individual users, selected groups and potentially all eligible users. | Bulk safeguards, approvals, recipient eligibility and reversal policy. |
| D-010 | DIRECTED | Guest-first browsing: public advertisements, places, Trails and other public content accessible **without an account**. Ask for sign-in only when a protected action is attempted (e.g., create Trail, message, join community). | Exact public/private route matrix; preservation of guest draft/intended action. |
| D-011 | DIRECTED | Global app defaults should respect device/host preferences (text scaling, light/dark appearance, language where available); users can control language, appearance and text size. | Supported locale catalog, text scaling limits, persisted guest settings, host constraints and accessibility testing. |
| D-012 | DIRECTED | Put a notification bell in the **top application bar**; put ordinary user settings/preferences in the **profile dropdown/menu**, rather than scattering settings across the app. | Guest bell behavior, unread counts, notifications permission model, mobile menu details. |
| D-013 | DIRECTED | Distinguish ordinary user preferences from privileged **Admin Control Panel** settings. Admin panel must be phone-usable. | Permission roles, section navigation, audit behavior and operational controls. |

## B. Admin and VQ — reference proposal inventory (NOT LOCKED)

The four Grok reference screens depict **Admin Dashboard**, **User Management**, **VQ Rules** and **Edit Rule**. They are UI inspiration, not an approved design system or executable specification. Their example users, balances, reward quantities and statistics are fictional demonstration content; do **not** copy them as defaults.

| ID | Status | Candidate capability | Important constraints to decide |
|---|---|---|---|
| P-VQ-01 | PROPOSED | Activity-rule catalog: stable approved action key, name, enabled status, amount, description, optional conditions. | New display rule must not invent a new executable business event or endpoint. |
| P-VQ-02 | PROPOSED | Caps, cooldowns, verified-action requirement, geographic eligibility, account eligibility, scheduled multipliers. | Define cap unit (awards/day vs VQ/day), clock/timezone, activation effective time, trust/consent, upper bounds and conflicts. |
| P-VQ-03 | PROPOSED | Individual/custom-label/manual grants, Guardian/Legend targeted grants, selected-group and all-user campaign grants. | Recipient preview, authorization, two-person approval for high-risk distributions, idempotency. |
| P-VQ-04 | PROPOSED | Simulation/preview before publishing a rule; activation/disable; immutable version history. | Test simulation must never issue real VQ. |
| P-VQ-05 | PROPOSED | Ledger history, reversible corrections via compensating entries, suspicious-pattern review, earning freeze. | Never edit balance or history in place; sanctions and grant authority must be defined. |
| P-ADM-01 | PROPOSED | Mobile admin sections: Dashboard, Users, VQ Rules, Places, Activities & Events, Challenges, Reports, Settings. | Extend to Guardians/Legends, Trails, reservations, communities, media, moderation and platform operations as justified by approved features. |
| P-ADM-02 | PROPOSED | Role-scoped admin actions and auditable user moderation; account bans, verification, deletion and VQ controls separated by privilege. | Two-person approval, emergency controls, privacy and account-erasure semantics. |
| P-ADM-03 | PROPOSED | Live operational analytics, moderation queues and verified data instead of invented metrics. | Metric definitions, privacy, retention, filtering and safe access. |

**Found discrepancy to resolve:** Grok's sample rule-list image says **50 VQ/day**, while its rule edit image says **No daily cap**; the examples cannot both be canonical. The illustrations also mix a “daily cap” as occurrences with a VQ amount/day. Clarify both before a UI or schema is approved. No screenshot numbers are product policy.

**Candidate VQ boundary (not final domain count):** Business domains prove qualifying activities; a single VQ award authority validates policy and records grants/compensating entries. The Administration UI requests authorized changes but must not act as a second writer. Keep identity/reputation/Guardian trust distinct from spendable VQ.

## C. Open decisions — resolve before overall baseline approval

| ID | Topic | Question that needs an explicit answer | Impact |
|---|---|---|---|
| O-001 | Domain count and ownership | Independently evaluate 26 **candidate** contexts; merge/split only on business invariants and sole-write authority. No 26-domain mandate. | Structure, Schema, Plan |
| O-002 | Handshake | Is it an in-person social encounter, Guardian/Tour completion, or both? Who can initiate/confirm, what constitutes proof, expiry/dispute and consequences? | Identity, Geo, Guardians, Reservations, Reputation |
| O-003 | Guardians / Local Legends | Eligibility, verification, freshness/selfie policy, categories, permissions and suspension. | Profiles, Media, Moderation |
| O-004 | Tours / reservations | Availability, booking holds, confirmation, cancellation, completion and refunds if applicable. | Reservations, Guardians, Messaging |
| O-005 | Geo / Radar / place verification | Consent, GPS accuracy, per-action proximity, spoofing defense, privacy retention, real provider and non-fabricated discoveries. | Geo, Places, Contributions, Rewards |
| O-006 | Challenges | VibeCheck and VibeFlash flows beyond the **locked durations**: triggers, response proof, eligibility, cooldown, expiry and notifications. | Challenges, Media, Geo |
| O-007 | VQ reward policy | Verified events and eligibility, reward catalog, caps, cooldowns, reversals, manual/bulk governance; whether user-to-user VQ transfers are permitted. | Rewards/VQ, Admin, Ledger |
| O-008 | VQ future utility | Future Jeton-style listing promotions/boosts and possible purchase mechanisms; no implicit launch requirement or crypto conversion. | Purse, Marketplace, Payments |
| O-009 | Guest permissions | Full public-read/authorized-write matrix across all features, including public community/Guardian views and draft preservation. | Identity, Shell, privacy |
| O-010 | Settings, locales, accessibility | Supported languages, RTL, device-derived defaults, guest/local persistence, account synchronization, browser/Telegram overrides and accessibility thresholds. | Shell, Profiles, Web/Telegram |
| O-011 | Admin roles | Define granular privileges, elevated approval, audit logs, role assignment and moderation safeguards. | Identity, Administration, all owners |
| O-012 | Social/messaging/communities/rooms | Canonical modes, matching vs following, private messaging, membership rights, real-time voice and abuse handling. | Social, Rooms, Messaging |
| O-013 | Media and notifications | Capture proof, video/images, privacy, retained variants, worker cleanup, push delivery and notification preference rules. | Media, Worker, Notifications |
| O-014 | Financial versus nonfinancial functionality | Keep internal VQ distinct from actual money, trading, crypto, custody and transfers; decide what is explicitly excluded from initial scope. | Purse, Marketplace, compliance |
| O-015 | Release/platform | Final cross-platform app support, build/deployment composition, security, installation migrations, testing and production gates. | Architecture, Database, Plan |

## D. Topic workflow: one decision at a time

1. Retrieve the latest Product Owner statements, the latest current draft and exact-source evidence; exclude `superseded-drafts/` as authority.
2. State the behavior and user journeys, evidence confidence, conflicts and unsolved questions.
3. Recommend options with ownership implications; let the Product Owner select the intended rule rather than inventing policy.
4. Capture the exact decision, date, scope and affected feature IDs; set **LOCKED** only after explicit approval of the bounded final specification.
5. Check compatibility with **all previously locked decisions**; reconcile any real contradiction before moving on.
6. Produce detailed feature specifications separately as needed, linking IDs in this register. Only after **all material issues** are resolved do we freeze Requirements, Structure, Database and Plan together and authorize the creation of the new GitHub project.

## E. Change history

| Date (Africa/Tunis) | Change | Authority |
|---|---|---|
| 2026-10-29 | Created a dedicated living register; recorded the Product Owner's new-app, VQ, admin, guest-first, app-settings and navigation directions, and separated Grok proposals from decisions. | Product Owner conversation through 2026-10-29; `00_SOURCE_BASELINE.md` |

**Not authorized:** Implementing any of the above, creating a new GitHub repo, editing the old repo, running SQL against Railway or changing external services.