# S00 — restricted sample-image importer

This is an **operator-only** bulk import tool. It uses Supabase Storage's authenticated service-role API from a trusted machine; it does **not** add an upload capability to the Supabase ChatGPT connector. Do not ship this tool with frontend code.

## Scope and guardrails

- All imported image bytes go **only** to private Supabase bucket `media` under `imports/<importId>/<SHA256>.<extension>`, never to `users`.
- `users` remains reserved for authenticated users' private personal media, governed by the existing UUID-folder Storage policies.
- Explicit source manifest with source code reference, domain, legacy test owner, immutable import ID, and source commit. Hannibal's legacy user ID is refused.
- Source files must be in the app image folders; remote fetches are HTTPS-only, host-allowlisted and disallow redirects. Limit 12 MiB/image; only JPEG/PNG/WebP byte signatures accepted.
- On execution, files are uploaded without overwriting existing paths. The importer downloads each stored object again and compares SHA-256 for verified completion.
- Each invocation writes a **new** report JSON file containing object key, hash, source, owner, domain, outcome and import batch. Preserve the report in secure operator records; it is needed for later cleanup. A report file is not a database-native provenance table or a production cutover.
- No existing content, Auth principals, profile IDs or media references are changed. This is not the completed S00 migration.

## Run from the repository root

Start by reviewing and expanding `manifests/s00-media-sample.json` from actual app source. The bundled two-item manifest is an intentionally bounded example, not an inventory of all app images.

Dry run (no credentials, no Storage writes):

```sh
node scripts/import-sample-media.mjs --manifest manifests/s00-media-sample.json --report /tmp/s00-dryrun-001.json
```

For a **real import**, run only from a trusted operator environment with `@supabase/supabase-js` installed and server-only environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` configured through that environment's secret manager. Never commit secrets or expose them as `VITE_*` variables. The authenticated connector here does not provide service-role credentials or a Storage upload operation.

```sh
node scripts/import-sample-media.mjs --manifest manifests/s00-media-sample.json --report /secure/path/s00-import-001.json --execute
```

Stop and investigate any failed item. **Do not** delete originals or swap UI image URLs before a complete import manifest, actual uploaded-object readbacks, durable provenance/ownership records, and the S00 visual/content acceptance checks are independently verified. Supabase Storage is private: frontend readers cannot use raw permanent public URLs. Implement authorized read/delivery separately.

## Cleanup safety

The operator's later cleanup must be separately authorized, select only the exact recorded `media/imports/<importId>/` objects, reconcile against app attachments, and verify that Hannibal's or genuine users' material is excluded. Do not infer ownership from a display name. No cleanup command is included because deletion is not part of this packet.
