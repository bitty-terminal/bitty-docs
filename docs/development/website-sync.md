---
title: Website Sync Contract
description: Developer guide to the pinned docs-to-website mirror, route mapping, and parity gates
category: development
audience: contributor
document_type: guide
status: draft
website_publish: true
sidebar_order: 25
---

# Website Sync Contract

This guide translates the accepted
[Website Delivery RFC](../specifications/website-delivery-rfc.md)
and [Website content contract](../project/website-content-contract.md)
into the developer command surface. It does not invent product code,
does not authorize shipped behavior, and does not weaken the normative
English-only, metadata, or link gates.

## Source of truth

`bitty-docs` owns canonical prose, metadata, source paths, and internal
links. `bitty-website` is a static presentation shell. It must not fork,
copy-paste, or silently rewrite a specification. Any file outside
`bitty-website/src/content/docs/` that is a verbatim copy of a docs body
is a non-duplication violation (LD-6) and must be removed in favor of the
loader path.

The website consumes only a pinned immutable revision. Floating branches
such as `main` are never a publishable input.

## Pinned mirror (SY-2)

The single source of truth for the consumed corpus is
`bitty-website/src/content/docs-revision.json`:

```json
{
  "revision": "847725635893fad0fa120128aabab3918807fc0f",
  "source": "github.com/bitty-terminal/bitty-docs",
  "synced_at": "2026-08-29T14:33:51.959Z"
}
```

`revision` is a full 40-character commit SHA or an immutable tag that
resolves to a single SHA. The file has no extra keys and is committed.

Synchronization is the single command defined by SY-2:

```sh
bun run sync:docs --pin <40-char-sha-or-tag>
```

Behavior, per the RFC and `bitty-website/scripts/sync-docs.mjs`:

1. Reject a missing `--pin`, a short SHA, or a floating name such as
   `main` (SY-3) — fail closed.
2. Resolve the pin to a commit (`git rev-parse <pin>^{commit}`); peel a
   tag to its commit SHA.
3. Clear stale content under `bitty-website/src/content/docs/`.
4. Fetch `docs/` from the pinned revision via `git archive` (sparse
   checkout equivalent) into `src/content/docs/` after clearing stale
   content.
5. Run parity gates on the copied tree — `metadata`, `language`, `links`,
   `hygiene` via `bitty-docs/.github/scripts/check-docs.mjs` — so the
   mirror inherits the same fail-closed checks as the canonical repo.
6. Write the pin back to `src/content/docs-revision.json` with a fresh
   `synced_at`.

Manual edits inside `src/content/docs/` are not allowed. The directory is
a generated read-only mirror of the pin (SY-4). A commit that changes
rendered documentation without updating the pin is a hygiene failure.

## Pin validation (SY-3)

The Astro build imports the pin and fails closed when:

- the pin file is missing or malformed;
- the pin names a floating branch;
- the copied tree does not match the pin (or the peeled tag SHA).

Stale-content detection (SY-4) rejects a build where a Markdown file's
embedded pin comment or sidecar does not equal
`src/content/docs-revision.json`. Preview builds may render a candidate
pin but must surface it (for example `<!-- docs-revision: <sha> -->`) and
must not be promoted to production without advancing the pin to the merged
docs SHA.

## Publication filtering (LD-3)

The loader validates every file before filtering. Only after a file
passes the eight-field frontmatter schema, the `title == H1` check, and
the language and link checks does the loader keep entries where
`website_publish: true`. Filtering before validation is a failure — a
file with `website_publish: false` still fails the build when its
frontmatter is malformed or its body contains CJK. The schema is the
single `z.object` in `bitty-website/src/content.config.ts` (LD-2) that
mirrors [Documentation workflow](documentation-workflow.md).

## Route mapping (RM-1..RM-4)

The deterministic mapping is:

```text
source: docs/<category>/<path>.md
route:  /docs/<version>/<category>/<slug>/
```

- `README.md` maps to the category index
  `docs/<category>/README.md -> /docs/<version>/<category>/` and
  `docs/README.md -> /docs/<version>/` (RM-2).
- The category is the single segment after `docs/`; subdirectories
  preserve hierarchy (`docs/specifications/foo/bar.md` maps to
  `/docs/<version>/specifications/foo/bar/`).
- Only `.md` files are routable; only the final segment is slugified
  (lowercased, non-alphanumerics collapsed to `-`); hierarchy is
  otherwise preserved case-sensitively (RM-1).
- Source-relative path is the authoritative content identity (RM-3).
- If two distinct eligible sources would map to the same public route,
  validation rejects the build. The fix belongs in `bitty-docs` by
  renaming the source and declaring a redirect, not by patching the
  mapper (RM-4).

The function lives in exactly one module,
`bitty-website/src/lib/docsRoutes.ts` (RM-6), with collision fixtures
and a negative collision test.

## Version selector (RS-3)

The selector is presentation-only and data-driven from
`bitty-website/src/content/versions.json` (RS-1):

```json
{
  "latest": "0.1.0",
  "stable": "0.1.0",
  "versions": [
    {
      "version": "0.1.0",
      "revision": "847725635893fad0fa120128aabab3918807fc0f",
      "label": "latest — 2026-08-29T12:50:39Z",
      "prerelease": false
    }
  ]
}
```

Navigation rewrites only the version segment
`/docs/<from>/<path>` to `/docs/<to>/<path>` (RS-3), preserving query
and hash. When the same content identity exists in the target revision,
navigation lands there; otherwise it falls back to the target revision's
index `/docs/<to>/`. The router accepts only version segments that are
`latest`, `stable`, or a listed `versions[].version` (RS-5).

## Redirects (RD-3/RD-4)

Intent lives in `bitty-docs/docs/project/redirects.json` (RD-2);
implementation lives in `bitty-website/src/redirects.json` (RD-3).
At build time the website merges both and emits Astro `redirects` plus
`dist/_redirects` for Cloudflare Workers Static Assets.

- `old` and `new` are exact `/docs/` prefixes ending with `/`, without
  the version segment; the website expands them per hosted version.
- `status` is `301` for moves and `302` only for deprecated aliases.
- Validation rejects (RD-4): an `old` with no previously published
  target, a `new` with no currently published target, loops, chains
  longer than one hop, duplicate `old` entries, wildcard or regex
  patterns, and external destinations.
- The expanded per-version table is emitted as a build artifact
  (`dist/redirects.json`) for review (RD-6).

A rename or removal of a file with `website_publish: true` must declare
`Old identity`, `New identity`, `Reason`, `Effective version`,
`Redirect`, and replacement guidance in the docs pull request (RD-1).

## Parity gates (`check-docs.mjs`)

The sync command re-runs the canonical four gates on the copied tree so
the mirror cannot drift from the source:

- `metadata` — eight flat frontmatter fields, `title == H1`,
  category/audience/document_type/status enums, unquoted boolean and
  integer checks;
- `language` — no Han, Hiragana, Katakana, Hangul, Bopomofo, or
  `U+3000-303F` range;
- `links` — unresolved local targets, missing fragments, or directory
  links without an index fail closed without network access;
- `hygiene` — no generated, temporary, database, or editor artifacts
  inside the mirrored tree.

The website build separately runs its own `just check` (format, lint,
typecheck, static build, Wrangler dry-run) and the same source-of-truth
rule applies: filtering by `website_publish` never hides a malformed
file.

## Static site, no staleness

The website is static (`astro build` to `dist/`, Workers Static Assets).
There is no server-side docs fetch at request time and no copy-paste
staleness. Every published page is traceable to exactly one
`bitty-docs` SHA via `src/content/docs-revision.json` and
`src/content/versions.json`; rebuilding the website at the recorded
commit and pin reproduces the same `dist/`. Until public domains are
registered, the placeholder origin is `bitty.xuepoo.xyz` and no
deployment has been performed or verified — the deployment workflow
remains configuration only.

## Cross-repository ordering

1. The `bitty-docs` change updates content, metadata, links, and
   `docs/project/redirects.json` when a published identity moves, and
   passes `just check`.
2. The `bitty-website` change advances the pin to that exact docs SHA
   via `bun run sync:docs --pin <sha>`, implements presentation or
   routing changes, and passes `just check` with the new pin.
3. Each pull request links the other (`Docs-PR`, optional `Code-PR`,
   `RFC: Website Delivery RFC OQ-023`, `CarryCtx: CTX-XXXX`) and names
   ordering constraints.
4. Independent review and CI pass in both repositories before any
   publish.

A content change is not done when the website would publish stale or
duplicated contracts. A website integration is not done when it bypasses
the metadata, language, link, revision-pin, publication,
route-collision, or redirect gates.
