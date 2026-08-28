---
title: P0 Review Checklist
description: Draft coordination checklist for P0 review of remaining RFCs and ADRs before acceptance
category: decisions
audience: maintainer
document_type: register
status: draft
website_publish: false
sidebar_order: 30
---

# P0 Review Checklist

> Status: **draft** (frontmatter `draft`). This document coordinates independent
> P0 review for the remaining proposed RFCs and ADRs. It does not describe
> implemented behavior, does not close any open question, and does not authorize
> shipped, stable, normative, or compatibility-guaranteed behavior. Each row
> remains `Proposed`/`Draft` until its reviewers record passing evidence and the
> [open-question register](../decisions/open-questions.md) is updated per its
> close rule. Lifecycle is `Draft -> experimental review evidence -> Accepted -> normative`.

## Purpose

Drive the P0 acceptance path for the eleven RFCs and ADRs that remain after the
Lua Runtime RFC (OQ-009) was accepted on 2026-08-27. As of 2026-08-28 all pending
drafts are P0-ready and coordinated under CTX-0048 in the `bitty` project:

- **OQ-002** — Default Distribution (bundled-disabled-by-default, empty enabled set, five disable surfaces)
- **OQ-008 / OQ-015 / OQ-016** — Rich presentation (images, `RichBlock`/`Scene`/`SemanticZone`, structured transports)
- **OQ-014** — Isolation and resource ceilings (per-plugin VM, queue, CPU, memory)
- **OQ-017** — CLI Contract (grammar, `bitty x` qualified route, action/output schemas, exit codes 0-8)
- **OQ-018** — IPC and Agent (instance selection, auth, scopes, rate limits, bounded messages)
- **OQ-019** — DevTools (instrumentation, event pipeline, debug protocol)
- **OQ-020** — Headless Daemon (ADR 0008, deferred to post-v1.0 with trust-boundary gate)
- **OQ-022 / OQ-026 / OQ-027 / OQ-028 / OQ-029** — Package Follow-up (resolver, yank, prerelease, registry, key directory)
- **OQ-030** — Lua pins, upgrade cadence, stdlib allowlist and unsafe-surface audit (ADR 0005)
- **OQ-031** — `os.getenv` exposure and `bitty` module policy (ADR 0006)
- **OQ-032** — Async/`Send` boundary, GC tuning, Config VM budgets, reload and module cache (ADR 0007)

All eleven are `Draft`/`Proposed` with frontmatter `draft` and require the three
independent reviewers in §2. Additional Open items that are not RFC-gated
(OQ-023 website content contract, OQ-024 repository governance, OQ-025 risk
evidence) remain tracked in the [open-question register](../decisions/open-questions.md)
and the [decision register](../decisions/index.md) but are listed in §7 for
visibility. This file is the CTX-0048 coordination single source; it stays
`draft` until the batch is accepted per the close rule.

## Review owners and gates

Per the [documentation workflow](../development/documentation-workflow.md) and
the [security overview](../security/overview.md), every candidate that touches a
trust boundary, capability, resource limit, package, IPC/MCP surface, or
sensitive-data path requires three independent reviews:

- **security-auditor** — threat-model, P0 acceptance criteria, and risk-register alignment; must not silently downgrade any normative P0 control
- **category-owner** — correctness of the mechanism for the owning domain (`architecture`, `extensibility`, `security`, `configuration`, `interfaces`)
- **docs-curator** — taxonomy, frontmatter, terminology, links, provenance, navigation, and English-only gates

All reviews record evidence in CarryCtx. No self-acceptance; crate presence
(`bitty-plugin-host`, `bitty-lua`, `bitty-rich`, `bitty-ipc`, `bitty-agent`)
does not constitute acceptance.

## Acceptance criteria for every row

A row moves from `Proposed`/`Draft` to `Accepted` only when:

1. `just check` is green (0 issues): `fmt-check`, `markdownlint`, `links`, `metadata`, `language`, `agents`, `hygiene`, `actionlint`
2. security-auditor confirms the RFC/ADR does not weaken any normative control in the [security overview](../security/overview.md), [threat model](../security/threat-model.md), and [P0 acceptance criteria](../security/p0-acceptance-criteria.md)
3. threat-model mapping in the RFC/ADR is complete and any new trust-boundary, capability, or rate-limit is justified with adversarial or negative tests
4. verification plan cites concrete evidence (headless tests, measurement harnesses, fuzz corpora, or `cargo check` gates) and the register links that evidence
5. the [decision register](../decisions/index.md), [specifications index](../specifications/README.md) or [ADR index](../decisions/adrs/README.md), and [open-question register](../decisions/open-questions.md) are updated atomically with the status flip
6. independent review plus required CI is green before merge (`just check` locally for `bitty-docs`; `cargo` gates for `bitty` where applicable)

## Primary P0 review queue

| RFC / ADR                                                                       | OQs                                    | Canonical document                                                                   | Current status                                                                                                                                                                                                                                                                            | Security-auditor gate                                                                                                                                                | Category-owner gate                                                                                                              | Docs-curator gate                                                                                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rich Presentation RFC                                                           | OQ-008, OQ-015, OQ-016                 | [rich-presentation-rfc.md](../specifications/rich-presentation-rfc.md)               | Accepted (`accepted`) — **P0 sign-off 2026-08-28 (security-auditor + category-owner + docs-curator pass, `just check` 91 files 0 issues; frontmatter `accepted`, OQs `Accepted` per CTX-0068)**                                                                                           | R-002, R-003, R-021, T-02, T-03, image-bundle, authenticated transports, alternate-screen policy                                                                     | `architecture` + `extensibility` (scene, zone, selection, a11y, search, export, anchor)                                          | frontmatter `accepted`, links to [rich content](../interfaces/rich-content.md) and threat model, English-only                                               |
| Isolation Resource RFC                                                          | OQ-014                                 | [isolation-resource-rfc.md](../specifications/isolation-resource-rfc.md)             | Proposed (`draft`) — queue budgets PerSub 64 strict / PerPlugin 1024/256 KiB / Global 8192/2 MiB hard-gated at Host admission, RC-1 10^7/50 ms/8 ms warning, RC-2 32 MiB hard-gated measured via `bitty-plugin-host` and `bitty-lua` headless tests (CTX-0037 PR #68, CTX-0040 `d67a65b`) | R-006, R-007, R-018, T-07, T-14, budgets, `forbid(unsafe_code)` for `bitty-lua`/`piccolo`                                                                            | `security-and-quality` + `architecture` (queue enforcement, `DropOldest` default, `VmBudgetSnapshot`, `would_exceed_*`)          | frontmatter, measurement evidence citations, lifecycle wording                                                                                              |
| IPC and Agent RFC                                                               | OQ-018                                 | [ipc-agent-rfc.md](../specifications/ipc-agent-rfc.md)                               | Draft (`draft`)                                                                                                                                                                                                                                                                           | R-011, R-012, R-013, T-09, T-10, 256 KiB framing, `SO_PEERCRED`/`LOCAL_PEERCRED`, scopes, RC-9/RC-10, untrusted-observation labeling                                 | `security-and-quality` (instance selection, transport, wire, auth, streaming)                                                    | links to [CLI](../interfaces/cli.md) and [threat model](../security/threat-model.md)                                                                        |
| DevTools RFC                                                                    | OQ-019                                 | [devtools-rfc.md](../specifications/devtools-rfc.md)                                 | Proposed (`draft`)                                                                                                                                                                                                                                                                        | R-014, `debug.inspect`/`trace`/`control` scopes, redaction, `0600` mode, export preview                                                                              | `architecture` + `quality` (instrumentation, observability pipeline, versioned debug protocol)                                   | links to [architecture overview](../architecture/overview.md) and delivery sequence                                                                         |
| ADR 0005 - Lua Pins, Upgrade Cadence, Stdlib Allowlist and Unsafe-Surface Audit | OQ-030                                 | [ADR-0005-lua-pins-and-stdlib.md](../decisions/adrs/ADR-0005-lua-pins-and-stdlib.md) | Proposed (`draft`)                                                                                                                                                                                                                                                                        | R-018, R-019, T-14, vendored Lua 5.4.7/5.4.8, `mlua` `vendored` + `lua54`, `piccolo` 0.3.3 `=`, `Cargo.lock` pin, unsafe-surface audit                               | `architecture` + `security-and-quality` (pins, cadence, allowlist, Tier 1 verification)                                          | frontmatter `draft`, sidebar 35, ADR index sync                                                                                                             |
| ADR 0006 - os.getenv Exposure and Bitty Module Policy                           | OQ-031                                 | [ADR-0006-os-env-policy.md](../decisions/adrs/ADR-0006-os-env-policy.md)             | Proposed (`draft`)                                                                                                                                                                                                                                                                        | R-006, R-014, T-11, P0-AC-026, `os.getenv` denial, `bitty.env.get` capability-gated allowlist, desensitization, audit logging                                        | `security-and-quality` + `configuration` (Config VM vs plugin VM deltas)                                                         | links to Lua Runtime RFC and security overview invariant 9                                                                                                  |
| ADR 0007 - Async/Send Boundary and GC Tuning for Lua VMs                        | OQ-032                                 | [ADR-0007-async-gc.md](../decisions/adrs/ADR-0007-async-gc.md)                       | Proposed (`draft`)                                                                                                                                                                                                                                                                        | R-006, R-007, R-018, T-07, T-14, `Send`/`Sync`, tasks 64/timers 32, GC incremental pause/step, budget charging against PB-1/PB-2                                     | `architecture` + `lua` (Config VM charging, reload/module-cache per-VM, `piccolo` vs `mlua`)                                     | joint ownership with [Configuration Model RFC](../specifications/configuration-model-rfc.md) noted                                                          |
| Default Distribution RFC                                                        | OQ-002                                 | [default-distribution-rfc.md](../specifications/default-distribution-rfc.md)         | Draft (`draft`) — bundled-disabled-by-default, empty enabled set for v1, five disable surfaces, PB-5 40 MiB cap, `bitty --safe` precedence                                                                                                                                                | R-006, R-007, R-009, R-016, R-022, T-06, T-07, invariants 2, 8, 10, PB-5, safe-mode recoverability, no private channel                                               | `product` + `extensibility` (distribution composition, pinning, disable precedence, generation disposal)                         | frontmatter `draft`, links to [product vision](../product/vision.md) and [plugin system](../extensibility/plugin-system.md)                                 |
| CLI Contract RFC                                                                | OQ-017                                 | [cli-contract-rfc.md](../specifications/cli-contract-rfc.md)                         | Draft (`draft`) — top-level tree 13 subtrees, single registry, `bitty x` qualified route, envelope v1, exit codes 0-8 stable for v1                                                                                                                                                       | R-011, R-012, R-014, T-09, T-01, P0-AC-001/021/022/023/026, 256 KiB framing, alias collision, bounded parsing                                                        | `interfaces` + `architecture` (command tree, dynamic namespace, action/output schemas, alias/completion)                         | frontmatter `draft`, links to [CLI](../interfaces/cli.md) and [threat model](../security/threat-model.md)                                                   |
| Package Follow-up RFC                                                           | OQ-022, OQ-026, OQ-027, OQ-028, OQ-029 | [package-followup-rfc.md](../specifications/package-followup-rfc.md)                 | Draft (`draft`) — resolver caret/tilde/closed grammar, single-version convergence, prerelease opt-in, yank advisory `yanked (locked)`, registry attestation boundary, key directory freshness 24h/expiry                                                                                  | R-015, R-016, R-017, R-022, T-12, invariants 7, 8, P0-AC-027 through P0-AC-030, freeze/downgrade resistance, revocation monotonic                                    | `extensibility` + `security-and-quality` (resolver, lifecycle, registry, key directory, provenance H-A/H-B/H-C)                  | frontmatter `draft`, links to supply-chain controls, H-A/H-B binding                                                                                        |
| ADR 0008 - Headless Daemon, Detach/Reattach and Remote UI Trust Boundary        | OQ-020                                 | [ADR-0008-headless.md](../decisions/adrs/ADR-0008-headless.md)                       | Proposed (`draft`) — deferred to post-v1.0, trust-boundary gate mandatory for future daemon/remote, no `bittyd` crate/binary/service before gate                                                                                                                                          | R-011, R-012, R-013, T-09, invariants 5, 6, P0-AC-021/022/026, local peer-credential vs remote mTLS/SSH, no TCP by default, bounded persistence, secret minimization | `architecture` + `security-and-quality` (headless runtime vs daemon vs remote, session-grained attach/detach, FS-IP containment) | frontmatter `draft`, sidebar 38, links to [product vision](../product/vision.md) and [proposed delivery sequence](../product/proposed-delivery-sequence.md) |

## Threat-model and verification mapping

| RFC / ADR                  | Threat-model section                                                 | P0 acceptance criteria                                                                    | Required verification evidence                                                                                                                                                                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rich Presentation RFC      | PTY to terminal state (image, graphics), local files, markdown/scene | P0-AC-003, P0-AC-004, P0-AC-005, P0-AC-021                                                | Pre-allocation rejection tests, decompression-bomb suite, aggregate-store eviction test, regular-file/approved-path negative tests, no-script rendering audit                                                                                                                                                         |
| Isolation Resource RFC     | Plugin isolation and budgets                                         | P0-AC-011 through P0-AC-015 (isolation, budgets, queues)                                  | `EventQueue::push` PerSub 64 strict, `EventPipeline::publish` PerPlugin/Global hard-gated eviction/drop, `bitty-lua` `Fuel` + wall deadline + `total_memory()` RC-1/RC-2 headless suites (17/21/15 tests), `just check` + `cargo check --target x86_64-pc-windows-gnu`                                                |
| IPC and Agent RFC          | IPC/MCP boundary, Agent confused deputy                              | P0-AC-016 through P0-AC-020 (instance, auth, scopes, rate limits, labeling)               | Peer-credential negative tests, scope-enforcement tests, 256 KiB framing/decoder limit tests, RC-9/RC-10 concurrency tests, untrusted-observation labeling suite                                                                                                                                                      |
| DevTools RFC               | DevTools and sensitive-data handling                                 | P0-AC-026 (trace minimization and redaction)                                              | Scope-separation tests (`inspect` vs `trace` vs `control`), redaction unit tests, `0600` file-mode tests, export-preview manual audit                                                                                                                                                                                 |
| ADR 0005                   | Unsafe/FFI and dependency governance                                 | P0-AC-024, P0-AC-025                                                                      | Vendored-build verification on Tier 1, `Cargo.lock` exact-pin audit, `SAFETY` rationale for `mlua` unsafe, `forbid(unsafe_code)` for `bitty-lua`                                                                                                                                                                      |
| ADR 0006                   | Sensitive-data handling, capability model                            | P0-AC-026, R-014                                                                          | `os.getenv` denial test, `bitty.env.get` allowlist capability test, trace redaction test, audit-log test                                                                                                                                                                                                              |
| ADR 0007                   | Plugin isolation, resource budgets                                   | P0-AC-011, P0-AC-015                                                                      | `Send`/`Sync` compile gate, timer/task cap tests, GC tuning measurement, Config VM PB-1/PB-2 charging test, reload cache-generation test                                                                                                                                                                              |
| Default Distribution RFC   | Bundled distribution, safe startup, capability grants                | P0-AC-006 through P0-AC-010 (safe startup), P0-AC-027/028, PB-5 40 MiB, invariants 2/8/10 | Empty-default proof (fresh data dir, no VM), enable/disable matrix across five surfaces, generation-disposal completeness, PB-3 reclaim 15% after GC, capability orthogonality, safe-mode independence, distribution integrity checksum test, workspace-narrowing only                                                |
| CLI Contract RFC           | CLI/parse, IPC boundary, child environment                           | P0-AC-001 (parser bounds), P0-AC-021/022/023/026                                          | Registry conformance suite, CLI grammar suite (`bitty run -- htop`, `UsageError` 2), output envelope suite (`json`/`jsonl` v1, stdout/stderr separation, 256 KiB), alias collision suite, exit-code 0-8 suite, instance-targeting precedence suite, safe-mode redaction suite                                         |
| Package Follow-up RFC      | Supply-chain, registry, keys, provenance                             | P0-AC-027 through P0-AC-030                                                               | PLF-AC-001 through PLF-AC-010: source-class provenance, grammar determinism, single-version convergence with conflict report, yank/prerelease selection `yanked (locked)`, local-path drift, registry attestation boundary, bundled isolation, key enrollment/rotation/revocation/freshness 24h, downgrade resistance |
| ADR 0008 - Headless Daemon | Headless/daemon/remote trust transitions, local IPC reuse            | P0-AC-021/022/026, invariants 5/6, T-09/R-011/R-012/R-013/R-014                           | Staging gate, taxonomy consistency `rg` report, transport invariance `rg -i tcp` audit, security co-ownership review, no-artifact `cargo tree --workspace` proof, E1-E8 cross-doc closure (delivery sequence, architecture overview, open-questions, decision register)                                               |

## Just-check and hygiene gates

- `just fmt` / `just fmt-check` — Prettier 3.9.6
- `just markdownlint` — markdownlint-cli2 0.23.1 (MD013 off, MD025 front-matter title)
- `just links` — repository-local links and fragments without network
- `just metadata` — exact flat frontmatter schema per [documentation workflow](../development/documentation-workflow.md)
- `just language` — English-only, no CJK
- `just agents` — line budgets for `AGENTS.md`/`TODO.md`
- `just hygiene` — no generated, temp, or DB artifacts
- `just actionlint` — actionlint 1.7.12

Run `just check` (all of the above) before requesting any reviewer sign-off.
Do not push with known failures; docs-only merge requires local `just check`
green (`bitty-docs` is docs-only, no `cargo` gate).

## Coordination checklist

- [x] Rich Presentation RFC (OQ-008/015/016) — **Accepted 2026-08-28 (CTX-0068; frontmatter `accepted`, OQs `Accepted`)** — security-auditor `bitty-security` pass (R-002, R-003, R-021, T-02, T-03, P0-AC-003/004/005, image bounds before allocation, deny-by-default loader, authenticated transport, alternate-screen default-deny), category-owner `bitty-architect` + `bitty-experience` pass (ImageStore/ImagePlacement/RichBlock/Scene/SemanticZone, anchor survival, ui.rich/ui.protocol-register framing/backpressure/lifecycle), docs-curator `bitty-curator` pass (frontmatter `accepted`, taxonomy, links to Rich Content/Threat Model, English-only), `just check` 91 files 0 issues, threat-model mapping complete, verification plan linked
- [ ] Isolation Resource RFC (OQ-014) — security-auditor reviews RC-1/RC-2/Global hard-gating and queue budgets; category-owner confirms `DropOldest` default and measurement evidence; `just check` green
- [ ] IPC and Agent RFC (OQ-018) — security-auditor reviews instance/auth/scope/rate-limit/bounded-message; category-owner confirms local-only transport; `just check` green
- [ ] DevTools RFC (OQ-019) — security-auditor reviews scopes and redaction; category-owner confirms instrumentation and observability pipeline; `just check` green
- [ ] ADR 0005 (OQ-030) — security-auditor reviews pins and unsafe-surface audit; category-owner confirms vendored verification; `just check` green
- [ ] ADR 0006 (OQ-031) — security-auditor reviews `os.getenv` denial and `bitty.env.get` allowlist; category-owner confirms capability gating; `just check` green
- [ ] ADR 0007 (OQ-032) — security-auditor reviews `Send` boundary and budget charging; category-owner confirms GC tuning and reload semantics; `just check` green
- [ ] Default Distribution RFC (OQ-002) — security-auditor reviews bundled-disabled default, safe-mode precedence, and P0-AC-006/010; category-owner confirms empty enabled set and five disable surfaces with generation disposal; `just check` green
- [ ] CLI Contract RFC (OQ-017) — security-auditor reviews `bitty x` qualified route, alias collision handling, and 256 KiB/32 depth bounds; category-owner confirms registry, tree, envelope v1, and exit codes 0-8 stability; `just check` green
- [ ] Package Follow-up RFC (OQ-022/026-029) — security-auditor reviews resolver convergence, yank/prerelease, registry attestation, key revocation/freshness, and P0-AC-027/030; category-owner confirms constraint grammar and provenance H-A/H-B/H-C; `just check` green
- [ ] ADR 0008 - Headless Daemon (OQ-020) — security-auditor reviews deferral position and local/remote trust-boundary gates; category-owner confirms headless runtime vs daemon vs remote taxonomy and bounded persistence; `just check` green

On per-RFC acceptance: flip the RFC/ADR frontmatter only as part of the
acceptance PR that also updates the [decision register](../decisions/index.md),
the [specifications](../specifications/README.md) or [ADR index](../decisions/adrs/README.md),
and the [open-question register](../decisions/open-questions.md) per the
documentation map close rule, and record the CarryCtx decision and checkpoint.

## Visibility: other Open drafts not in this P0 batch

These items are Open but are **not** RFC-gated drafts in the eleven-item P0
batch above. They remain tracked in the registers and require independent
review and evidence before closure, but they do not block the CTX-0048 review
wave:

- OQ-023 — Website content contract (loader, sync, route mapping, redirect manifest) — Open — no RFC yet, tracked in [open-question register](../decisions/open-questions.md) and [website content contract](../project/website-content-contract.md)
- OQ-024 — Repository governance (licenses, branch protections, ownership, compatibility policy) — Open
- OQ-025 — Security risk closure (implementation and test evidence per risk exit condition) — Open until cited evidence satisfies each entry in the [risk register](../security/risk-register.md)

All eleven P0 RFCs/ADRs above are now in review; the remaining visibility items
are governance and evidence-tracking topics without a draft RFC surface. They
follow the same lifecycle and gate rules when an ADR is proposed. Closing any
of them requires the same three-reviewer evidence and atomic register updates.

## References

- [Decision register](../decisions/index.md)
- [Open-question register](../decisions/open-questions.md)
- [Security overview](../security/overview.md)
- [Threat model](../security/threat-model.md)
- [Risk register](../security/risk-register.md)
- [P0 acceptance criteria](../security/p0-acceptance-criteria.md)
- [Documentation workflow](../development/documentation-workflow.md)
- [Toolchain policy](../development/toolchain-policy.md)
