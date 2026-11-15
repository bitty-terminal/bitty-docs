---
title: P0-AC-022 Scope by Method Matrix 2026-11-16
description: Generated 15-scope by 51-method authorization matrix at bitty a8abf31c, one allowed cell per method and 714 typed ScopeDenied cells, printed by crates/bitty-daemon/tests/scope_matrix.rs
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 55
---

# P0-AC-022 Scope by Method Matrix 2026-11-16

**Status: generated artifact; independent review pending.** This is the
"full scope × action matrix" that
[`P0-AC-022`](../p0-acceptance-criteria.md) names as its pass threshold and the
2026-11-13 and 2026-11-15 records carried as their first residual cell. Every
cell below is evaluated by the same function the IPC layer authorizes with,
`bitty_ipc_api::scope::authorize_method`, over the frozen v1 registry:
15 scopes × 51 method names = **765 cells**, **51 allowed** (exactly the
method's own scope), **714 denied** with class `scope` and code
`ScopeDenied`.

## How this table is produced

```sh
CARGO_TARGET_DIR=<outside the repository> \
  cargo test -p bitty-daemon --test scope_matrix --offline -- --nocapture \
  the_scope_by_method_grid_is_printed_as_the_artifact
```

The target is `crates/bitty-daemon/tests/scope_matrix.rs`, added by the
companion code change at `bitty` `a8abf31c`. It does not sample: it walks all
765 cells and fails on any cell that disagrees with the following invariants,
so the table cannot drift from the decision point without turning the suite
red.

## The invariants the table carries

1. **Deny by default.** With no scope granted, all 51 methods are refused with
   `ScopeDenied`, and the refusal names that method's own required scope —
   never another one — and the method itself as the action.
2. **No implied scope.** Granting exactly one scope allows exactly the methods
   that require it. The grid therefore holds 51 allowed cells, one per row, and
   714 denials; there is no row with two `ok` cells.
3. **The denial is the scope's.** For each denied cell the refusal names the
   method's own required scope, so a denial can never be attributed to an
   unrelated stage.
4. **Not vacuous.** Holding all 15 scopes allows all 51 methods, so the denials
   above are caused by the missing grant and not by a name the registry does
   not serve.
5. **Grammar and registry refusals stay separate.** An unknown method inside a
   known family is `NotFound` and a grammar violation is `InvalidMethod`, both
   with every scope held, so deny-by-default does not rely on a well-formed
   name.

## Reading the grid

`ok` — the method is authorized by the column's scope. Every other cell is
`Denied/ScopeDenied` (`class: scope`, `code: ScopeDenied`). The `required scope`
column is the method's single requirement; the grid's `ok` always sits under
that column.

| method                    | required scope     | terminal.inspect | terminal.input | terminal.manage | view.inspect | view.manage | config.inspect | config.modify | plugin.inspect | plugin.manage | process.spawn | debug.inspect | debug.trace | debug.control | ai.inspect | ai.invoke |
| ------------------------- | ------------------ | ---------------- | -------------- | --------------- | ------------ | ----------- | -------------- | ------------- | -------------- | ------------- | ------------- | ------------- | ----------- | ------------- | ---------- | --------- |
| `terminal.list`           | `terminal.inspect` | ok               | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.text`           | `terminal.inspect` | ok               | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.get_text`       | `terminal.inspect` | ok               | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.snapshot`       | `terminal.inspect` | ok               | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.send`           | `terminal.input`   | —                | ok             | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.input`          | `terminal.input`   | —                | ok             | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.write`          | `terminal.input`   | —                | ok             | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.close`          | `terminal.manage`  | —                | —              | ok              | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.spawn`          | `terminal.manage`  | —                | —              | ok              | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.kill`           | `terminal.manage`  | —                | —              | ok              | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `terminal.manage`         | `terminal.manage`  | —                | —              | ok              | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `view.list`               | `view.inspect`     | —                | —              | —               | ok           | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `view.split`              | `view.manage`      | —                | —              | —               | —            | ok          | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `view.focus`              | `view.manage`      | —                | —              | —               | —            | ok          | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `view.close`              | `view.manage`      | —                | —              | —               | —            | ok          | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `view.create`             | `view.manage`      | —                | —              | —               | —            | ok          | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `view.manage`             | `view.manage`      | —                | —              | —               | —            | ok          | —              | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `config.show`             | `config.inspect`   | —                | —              | —               | —            | —           | ok             | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `config.get`              | `config.inspect`   | —                | —              | —               | —            | —           | ok             | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `config.inspect`          | `config.inspect`   | —                | —              | —               | —            | —           | ok             | —             | —              | —             | —             | —             | —           | —             | —          | —         |
| `config.reload`           | `config.modify`    | —                | —              | —               | —            | —           | —              | ok            | —              | —             | —             | —             | —           | —             | —          | —         |
| `config.set`              | `config.modify`    | —                | —              | —               | —            | —           | —              | ok            | —              | —             | —             | —             | —           | —             | —          | —         |
| `config.modify`           | `config.modify`    | —                | —              | —               | —            | —           | —              | ok            | —              | —             | —             | —             | —           | —             | —          | —         |
| `plugin.list`             | `plugin.inspect`   | —                | —              | —               | —            | —           | —              | —             | ok             | —             | —             | —             | —           | —             | —          | —         |
| `plugin.get`              | `plugin.inspect`   | —                | —              | —               | —            | —           | —              | —             | ok             | —             | —             | —             | —           | —             | —          | —         |
| `plugin.install`          | `plugin.manage`    | —                | —              | —               | —            | —           | —              | —             | —              | ok            | —             | —             | —           | —             | —          | —         |
| `plugin.disable`          | `plugin.manage`    | —                | —              | —               | —            | —           | —              | —             | —              | ok            | —             | —             | —           | —             | —          | —         |
| `plugin.enable`           | `plugin.manage`    | —                | —              | —               | —            | —           | —              | —             | —              | ok            | —             | —             | —           | —             | —          | —         |
| `plugin.remove`           | `plugin.manage`    | —                | —              | —               | —            | —           | —              | —             | —              | ok            | —             | —             | —           | —             | —          | —         |
| `process.spawn`           | `process.spawn`    | —                | —              | —               | —            | —           | —              | —             | —              | —             | ok            | —             | —           | —             | —          | —         |
| `debug.snapshot`          | `debug.inspect`    | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | ok            | —           | —             | —          | —         |
| `debug.inspect`           | `debug.inspect`    | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | ok            | —           | —             | —          | —         |
| `debug.get`               | `debug.inspect`    | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | ok            | —           | —             | —          | —         |
| `debug.start_trace`       | `debug.trace`      | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | ok          | —             | —          | —         |
| `debug.trace`             | `debug.trace`      | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | ok          | —             | —          | —         |
| `debug.break`             | `debug.control`    | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | ok            | —          | —         |
| `debug.control`           | `debug.control`    | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | ok            | —          | —         |
| `debug.pause`             | `debug.control`    | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | ok            | —          | —         |
| `ai.provider_list`        | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.provider_complete`    | `ai.invoke`        | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | ok        |
| `ai.model_select`         | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.model_fallback`       | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.model_cost`           | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.tool_dispatch`        | `ai.invoke`        | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | —          | ok        |
| `ai.context_read`         | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.extension_manifest`   | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.extension_contribute` | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.extension_activate`   | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.cache_hint`           | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.mcp_pin`              | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |
| `ai.mcp_snapshot`         | `ai.inspect`       | —                | —              | —               | —            | —           | —              | —             | —              | —             | —             | —             | —           | —             | ok         | —         |

## What this artifact does not prove

- **It is the transport registry, not the daemon catalog.** `bittyd` serves its
  own closed `session.*`/`daemon.*` catalog over six service scopes; the live
  allow/deny cells for those 20 methods are in the
  [2026-11-16 P0-AC-022 record](bittyd-ac022-scopes-2026-11-16.md), not here.
- **It is a component-tier evaluation.** The matrix is the authorization
  decision, not a served exchange. A served cell for each of the 51 names would
  need a daemon that serves the v1 families, and `bittyd` deliberately does not
  (`crates/bitty-daemon/src/service/scopes.rs`, `the_service_catalog_never_redefines_a_v1_method`).
- **One live grant shape only.** Every same-uid `bittyd` connection negotiates a
  fixed grant set, so the daemon cannot be driven into an arbitrary
  "granted only `terminal.inspect`" state; `C-09` carries that arm as an
  explicit `deferred` (`bitty#2917`). The matrix is what that seam would have to
  preserve, which is why it is frozen as an artifact rather than inferred.
- **Independent review.** No reviewer has signed this table off.

## References

- [P0 acceptance criteria](../p0-acceptance-criteria.md)
- [Evidence matrix](../evidence-matrix.md)
- [P0-AC-022 live scope evidence, 2026-11-16](bittyd-ac022-scopes-2026-11-16.md)
- [bittyd P0 evidence record 2026-11-13](../bittyd-p0-evidence-2026-11-13.md)
- [Security overview](../overview.md)
