---
title: ADR 0017 - Retirement of the bitty-terminal.tabs Alias and the Bundled bitty-terminal.shell-integration Manifest
description: Owner decision retiring the bitty-terminal.tabs compatibility alias and the bundled bitty-terminal.shell-integration manifest at a v0.2.0 floor, with the stored-grant migration path and the resolution of the missing DEC-0032 citation
category: decisions
audience: maintainer
document_type: specification
status: accepted
website_publish: true
sidebar_order: 47
---

# ADR 0017 - Retirement of the bitty-terminal.tabs Alias and the Bundled bitty-terminal.shell-integration Manifest

## Document status

Accepted on 2026-10-03 by the project initiator as an owner decision on
[bitty-docs#397](https://github.com/bitty-terminal/bitty-docs/issues/397),
CarryCtx `CTX-0257`, plan key `W-02`. This ADR decides whether to retire the
`bitty-terminal.tabs` compatibility alias and the bundled
`bitty-terminal.shell-integration` manifest, fixes the version floor for the
retirement, and defines the stored-grant migration path. It authorizes no
implementation, describes no implemented behavior, and weakens no normative
security control. Lifecycle is `Draft -> owner review -> Accepted (2026-10-03)
-> normative`.

- Deciders: project initiator (owner decision, 2026-10-03).
- Vehicle: this is a new ADR rather than a dated amendment to
  [ADR 0014](ADR-0014-workspace-core-presentation-plugins.md). The decision
  extends ADR 0014 for the `bitty-terminal.tabs` alias, but it also retires the
  bundled `bitty-terminal.shell-integration` manifest, which is outside
  ADR 0014's workspace-presentation scope and is not named by
  [ADR 0015](ADR-0015-small-core-extraction-boundaries.md) Boundary 5. It
  additionally resolves the `DEC-0032` citation that the code carries but no
  docs register entry materializes. A standalone record keeps ADR 0014 coherent
  and follows the rule that accepted records are extended by dated or
  superseding records, not silently rewritten. ADR 0014 and ADR 0015 stand as
  accepted history.
- Related:
  [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md)
  and
  [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 5, legacy chrome); the accepted
  [Legacy Chrome Retirement](../../development/legacy-chrome-retirement.md)
  contract; and the
  [small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md).

## Purpose and scope

The `bitty` tree carries a deprecated `bitty-terminal.tabs` compatibility alias
and one remaining bundled first-party manifest,
`bitty-terminal.shell-integration`. The code cites a `>= v0.2.0` compatibility
window and a `DEC-0032` authority, but the decision register carries no
materialized entry for it, and the stored-grant consequence of removing either
identifier has not been decided in the canonical corpus. This ADR closes that
gap.

In scope:

- whether to retire the `bitty-terminal.tabs` alias and the bundled
  `bitty-terminal.shell-integration` manifest;
- the version floor and timeline for each retirement;
- the stored-grant migration path, including the remap, carry-forward,
  inert-record, and notification behavior;
- the materialization and resolution of the `DEC-0032` citation;
- the downstream owners and the gates that gate implementation.

Out of scope and not decided here:

- any implementation, code deletion, manifest removal, or grant-store
  migration execution; those are `W-104`, `W-26`, and `W-27`;
- behavior parity evidence and the independent bar review (`W-40`);
- the content, packaging, registration, and onboarding of the independently
  versioned shell-integration package, which is plugin-ecosystem work;
- the exact spellings of the workspace read API, events, capabilities, and
  command namespace, which stay open under `OQ-056`;
- per-window versus per-workspace tab order and the native-window-form
  questions, which stay open under `OQ-052`;
- the fate of `workspace.show_bar` and `workspace.bar.edge`, which stay with
  ADR 0014 and the `W-26`/`W-27` migration.

Nothing here weakens a normative security control. Where a control appears to
need change, it is recorded under "Open points" instead.

## Normative sources this document must not weaken

This decision must be read together with, and must not weaken:

- The [security overview](../../security/overview.md), the
  [threat model](../../security/threat-model.md), the
  [risk register](../../security/risk-register.md), and the
  [P0 security acceptance criteria](../../security/p0-acceptance-criteria.md),
  which stay authoritative for the plugin trust boundary, the capability model,
  safe mode, and the grant lifecycle named here.
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md):
  workspace is a Core mechanism, presentation is plugin-only, the bundled
  `bitty-terminal.workspace` manifest and its `bitty-terminal.tabs` alias are
  retiring, and `bitty --safe` has no built-in minimal bar.
- [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md):
  Boundary 5 and its binding constraints, including the retained Core
  mechanisms and the prohibition on a private first-party bypass.
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  which fixes the manifest, capability, and grant model; the
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  which fixes hash-bound grant storage and the permission-diff update path; and
  the
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md),
  which fixes the public extension surfaces a replacement may use.
- The accepted
  [Default Distribution RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/default-distribution-rfc.md),
  which fixes the bundled-disabled distribution semantics and the empty v1
  enabled set.
- The accepted
  [Bundled-Plugin Split Decision (OQ-053)](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  and the
  [Plugin Roadmap](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/plugin-roadmap.md),
  which fix the split-to-independent-packages direction this decision applies
  to the last bundled manifest.

## Terminology

- **Compatibility alias**: a deprecated identifier, claim, command spelling, or
  constant kept only so stored grants, scripts, and third-party claimants keep
  working during a documented window. The `bitty-terminal.tabs` id, the
  `bitty-terminal.tabs:*` commands, the `tabline` claim, the `TABS_*`
  constants, and the `TabsIntegration` functions are compatibility aliases.
- **Bundled manifest**: a first-party `PluginManifest` compiled into the host
  and resolved from the bundled catalog without an install. Bundled does not
  mean enabled; the bundled set is disabled by default and skipped in
  `bitty --safe`.
- **Stored grant**: a persisted `GrantRecord` in `grants.toml`, bound to
  `(plugin_id, manifest_hash)` with the granted and denied capability sets.
- **Effective grant**: a stored grant that currently applies, meaning the
  plugin id resolves to a manifest whose hash equals the stored hash and the
  capability is in the granted set.
- **Permission diff**: the explicit approval path that a manifest update with
  added capabilities must pass before a broadened grant takes effect.
- **Compat window**: the interval during which a compatibility alias keeps
  resolving. The window closes at the removal boundary, not before.
- **Floor, not deadline**: a version before which removal must not happen. It
  does not schedule removal; removal still requires every applicable gate.

## Context

The `bitty-terminal.tabs` alias was introduced by the tabs-to-workspace rename
in `bitty` `abde197f` (`CTX-0240`, PR #415), which recorded the decision as
`ALIAS not flag-day (removal >= v0.2.0 per DEC-0032)`. The evidence today:

- `crates/bitty-runtime/src/tabs.rs` is a deprecated alias shim: `TABS_*`
  constants, the `TabsIntegration` type, and the `create_tabs_panel` and
  `validate_tabs_panel_config` functions delegate to the canonical `workspace`
  module, each carrying a `removal >= v0.2.0` note. Its header cites
  `DEC-0032`.
- `crates/bitty-plugin-host/src/bundled.rs` carries `TABS_PLUGIN_ID`,
  `TABLINE_CLAIM`, `TABS_COMMANDS`, `tabs_manifest`,
  `is_deprecated_bundled_alias`, `deprecated_alias_warning`, and the command
  and claim canonicalizers, each documented as `removal >= v0.2.0`. Its
  comments cite `DEC-0032` for the `ALIAS, not flag-day` policy. The bundled
  catalog itself (`all_bundled_manifests`) returns only
  `shell_integration_manifest()` and `workspace_manifest()`; the tabs alias is
  resolvable but is not a catalog entry.
- `crates/bitty-plugin-host/src/grant.rs` persists grants in `grants.toml`
  keyed by plugin id; a record is content-addressed to the manifest hash, and
  `is_granted` returns false when the stored hash does not equal the current
  manifest hash. `apply_update` carries a narrowed or equal capability set
  forward and blocks an added capability until explicit approval.

`DEC-0032` is a CarryCtx decision (`CTX-0239`, the tabs-workspace rename RFC;
display id `DEC-0032`) titled "tabs-workspace rename uses ALIAS with removal
`>= v0.2.0`". Its recorded rationale is that stored grants bind
`(plugin_id, manifest_hash)`, so a hard rename invalidates grants, and that
safe-mode lists, scripts, and third-party claim parity need a compatibility
window; test-only `xuepoo.tabs` strings carry no compatibility promise. The
decision exists in the execution record but has never been materialized as a
canonical docs register entry, so the code cites an authority a docs reader
cannot resolve.

`bitty-terminal.shell-integration` is the last bundled first-party manifest
after ADR 0014 retires the bundled workspace manifest. It is a manifest-only
dogfood entry: capability `terminal.semantic-read` (read-only, bounded
observation), events `terminal.cwd-changed`, `terminal.title-changed`, and
`terminal.bell`, no filesystem, process, or network authority. Its behavior
(OSC 7/133 semantic zones, cwd and title propagation) is Core Terminal Truth
mechanism; the manifest only observes committed state. Neither ADR 0014 nor
ADR 0015 Boundary 5 names it, and the OQ-053 split decision left it bundled.
This ADR revises that specific OQ-053 verdict: it retires the bundled manifest
and re-homes the id to an independently versioned first-party package, rather
than keeping it bundled, for the reasons recorded below.

The project version direction keeps every first-party artifact at `0.0.x` until
the `0.1.0` stable release (`DIR-019`). Under that direction `v0.2.0` is the
first minor release at or after the stable `0.1.0` line, so a `>= v0.2.0`
boundary keeps the aliases present across the entire pre-1.0 `0.0.x` series.

## Decision

### Retire the bitty-terminal.tabs compatibility alias: yes

The `bitty-terminal.tabs` alias is retired at the first-party removal boundary
described under "Version floor and timeline". Until that boundary every alias
path named above continues to resolve to the canonical workspace names and
grants no extra authority. The retirement is not a flag-day: stored grants must
be migrated first, as defined under "Stored-grant migration path". This
confirms and fixes the direction ADR 0014 and ADR 0015 Boundary 5 already
accepted, and materializes the `DEC-0032` policy in the canonical corpus.

### Retire the bundled bitty-terminal.shell-integration manifest: yes, keeping the id

The bundled `bitty-terminal.shell-integration` manifest is retired from the
compiled catalog at the same boundary. "Retire the bundled manifest" does not
mean "retire the plugin id": the id continues to be available through an
independently versioned first-party package (the OQ-053 split pattern), so it
is not a compatibility alias and needs no rename window. Core retains the
underlying mechanism: OSC 7/133 parsing, semantic zones, and Terminal Truth
state stay Core-owned, as they are today, and the package observes them through
the public `terminal.semantic-read` capability. The bundled manifest is removed
only after the replacement package is available and reaches parity on the
observations it provides, and only after the stored-grant path below is
satisfied. The package content, packaging, and registry onboarding are
plugin-ecosystem work and are not decided here.

### Version floor and timeline

1. **Floor.** Neither the `bitty-terminal.tabs` alias nor the bundled
   `bitty-terminal.shell-integration` manifest is removed before Core
   `v0.2.0`. This respects the `>= v0.2.0` floor the code encodes and the
   `DEC-0032` rationale, and it supersedes nothing: it makes explicit that
   `v0.2.0` is a floor, not a scheduled deadline.
2. **Gates.** Removal also requires the
   [Legacy Chrome Retirement](../../development/legacy-chrome-retirement.md)
   gates that apply: behavior parity, the independent bar review (`W-40`), the
   alias and grant migration (`W-26`, `W-27`), the documentation
   synchronization (`W-83`), and green repository-local gates and CI on the
   removal revision. The `bitty-terminal.shell-integration` removal
   additionally requires the replacement package to be available and at
   parity.
3. **Slip, never flag-day.** If the gates are unmet when `v0.2.0` ships,
   removal slips to the next minor release; it is never forced to a date. A
   flag-day removal is not allowed.
4. **Order.** The replacement reaches parity (`W-40` and the shell-integration
   package); grants and settings are migrated (`W-26`, `W-27`); the alias, the
   bundled shell-integration manifest, and the transitional Core presentation
   are removed (`W-104`); Core keeps the retained mechanism listed in
   [Legacy Chrome Retirement](../../development/legacy-chrome-retirement.md).
5. **Scope fence.** This ADR decides the two identifiers in its title. The
   removal of `bitty-terminal.workspace`, the transitional workspaceline, and
   the candidate tab-strip module keeps its ADR 0014/0015 ownership and its
   `W-104` execution.

### Stored-grant migration path

The storage model is the accepted one: `grants.toml`, keyed by plugin id, each
record bound to `(plugin_id, manifest_hash)` with granted and denied
capability sets, deny-by-default, and safe-mode skipping the bundled set. The
migration never widens authority, never bypasses consent, and never revives a
denied plugin or a per-capability denial.

#### Tabs alias grants: migrate by remap

A stored `bitty-terminal.tabs` record is migrated to
`bitty-terminal.workspace`, preserving the user's earlier consent without
widening it:

1. **Trigger.** Migration runs when the alias id is resolved during the compat
   window, and as a one-time removal sweep in `W-104`. It is idempotent: a
   second run makes no further change.
2. **No canonical record.** Re-key the record to `bitty-terminal.workspace`,
   update its `plugin_id`, and rebind its `manifest_hash` to the canonical
   workspace manifest hash. The alias manifest and the workspace manifest
   request the same capability set, so the granted set is carried unchanged.
3. **Canonical record already present.** Rewrite the canonical record to the
   effective values and drop the alias record: its granted set becomes the
   intersection of the two records, never their union, and its denied set
   becomes their union, so a denial on either id stays denied. The rewrite is
   atomic and idempotent; any alias record that is merged or dropped is
   reported (see Notification).
4. **Denials carry forward.** A plugin-level denial or a per-capability denial
   recorded against `bitty-terminal.tabs` is re-keyed to
   `bitty-terminal.workspace` so that the canonical id cannot become granted
   merely because the denied id is renamed away. This is required:
   `grant.rs` keeps denials out of the grant record precisely so a rename must
   not resurrect a revoked plugin.
5. **After removal.** Once the alias no longer resolves, a leftover unmigrated
   `bitty-terminal.tabs` record is inert: it grants no authority because no
   manifest resolves to bind it. It is not silently deleted; it is retained for
   audit and reported by `bitty plugin doctor`/`bitty plugin list` as an
   orphaned alias record.
6. **Unmappable records.** A malformed or conflicting record that cannot be
   remapped is invalidated with a recorded reason and reported. Invalidation
   removes authority, never creates it; it is never silent.

#### Shell-integration grants: carry forward or re-consent

Because the plugin id is preserved, the stored record is found by id and the
ordinary hash-bound update path applies when the independently versioned
package replaces the bundled manifest:

1. **Same or narrowed capability set.** When the package manifest requests the
   same or a narrower set (the expected `terminal.semantic-read` observation
   only), the grant carries forward through the `apply_update` path with no
   re-prompt.
2. **Added capability.** If the package manifest adds a capability, the update
   blocks pending the explicit permission diff and approval, exactly as for any
   other plugin update. No broadened grant takes effect without consent.
3. **Denied plugin or capability.** A denial is never revived by the update; an
   explicit re-grant is required, and a per-capability denial is never
   resurrected.
4. **No manifest.** If the package is not installed, the stale bundled-hash
   record is inert: it grants no authority because no manifest resolves to bind
   it. It is reported, not silently dropped.

#### User notification

1. **During the window.** The existing `deprecated_alias_warning` for the
   `bitty-terminal.tabs` id is surfaced by CLI resolution and by
   `bitty plugin list`/`inspect`, as it is today.
2. **At removal.** `W-104` reports a one-time migration notice through
   `bitty plugin list`/`bitty plugin doctor` stating that the alias was removed
   and which grants were remapped to `bitty-terminal.workspace`, and listing
   any unmapped, invalidated, or orphaned record with its reason.
3. **On shell-integration update.** The standard permission-diff prompt is the
   notification when the package manifest changes capabilities; there is no
   second notification channel.
4. **No silent loss.** An approved capability is never dropped or re-scoped
   without a visible notice; an unmapped record is reported even when it is
   invalidated.

#### Safety invariants

Migration only relabels and rebinds; it does not add a capability, bypass
consent, change deny-by-default, alter read-never-implies-control, or affect
safe mode. The `grants.toml` hardening (state-directory mode, file mode) is
preserved, and the migration is written atomically through the existing store
path.

### Resolution of the DEC-0032 citation

`DEC-0032` was the CarryCtx decision (`CTX-0239`) that selected an alias with a
`>= v0.2.0` removal floor for the tabs-to-workspace rename, for the grant,
safe-mode, script, and third-party-claim reasons quoted under "Context". It was
never materialized as a canonical docs entry, so the code cited an authority a
docs reader could not resolve. This ADR is that materialized authority: it
records the decision, fixes the floor, and defines the migration the
`DEC-0032` rationale implied. The `DEC-0032` citations in
`crates/bitty-runtime/src/tabs.rs` and
`crates/bitty-plugin-host/src/bundled.rs` are superseded and must be updated to
reference this ADR as part of `W-104`. The CarryCtx `DEC-0032` row is not
deleted and remains execution history; its disposition is "materialized by
ADR 0017".

### What is not decided here

This ADR does not start, schedule, or authorize implementation; it does not
remove the alias or manifest; it does not migrate a grant store; it does not
decide the replacement package's content or registration; and it does not
change `OQ-052` or `OQ-056`.

## Consequences

- The `bitty-terminal.tabs` alias and the bundled
  `bitty-terminal.shell-integration` manifest have a decided disposition and a
  `v0.2.0` floor, closing the ownership gap the code citations left.
- The bundled first-party catalog becomes empty once both retirements land: the
  `bitty-terminal.workspace` manifest retires under ADR 0014 and the
  `bitty-terminal.shell-integration` manifest retires here. The zero-bundled
  state is consistent with the small-core direction, with the empty v1 enabled
  set, and with the 2026-09-30 removal of the remaining bundled panels.
- Core keeps the shell-integration mechanism (OSC 7/133, semantic zones,
  Terminal Truth) and the workspace mechanism; only the bundled manifests and
  the compatibility alias are retired.
- Stored grants survive the retirement through remap (tabs) and hash-bound
  carry-forward or re-consent (shell-integration); no approved capability is
  silently lost, and no denial is silently revived.
- The `DEC-0032` citation is resolved and the code must be updated in `W-104`.
- This ADR authorizes no code by itself and changes no accepted pin or ceiling.

## Alternatives considered

| Alternative                                                                         | Disposition                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Retire the `bitty-terminal.tabs` alias immediately in a flag-day change             | Rejected: contradicts `DEC-0032` and [Legacy Chrome Retirement](../../development/legacy-chrome-retirement.md); stored grants, scripts, and third-party `tabline` claimants would break with no migration.               |
| Keep the `bitty-terminal.tabs` alias indefinitely                                   | Rejected: ADR 0014 and ADR 0015 Boundary 5 already accepted its retirement; keeping a shim forever keeps dead compatibility surface in Core and leaves the code citation unresolved.                                     |
| Supersede the `>= v0.2.0` floor with an earlier date                                | Rejected: the floor protects stored grants and third-party claimants across the pre-1.0 `0.0.x` series; no evidence shows a shorter window is safe. Making it a floor rather than a deadline is the explicit refinement. |
| Retire the `bitty-terminal.shell-integration` id entirely and invalidate its grants | Rejected: the id is not a compatibility artifact and can move to an independently versioned package; retiring the id would invalidate stored grants unnecessarily and lose the public observation surface.               |
| Keep the bundled `bitty-terminal.shell-integration` manifest forever as dogfood     | Rejected: it is the last bundled first-party manifest, its behavior is Core mechanism, and the split-to-independent-packages direction (OQ-053) covers it; dogfood does not require a shipped bundled entry.             |
| Remove the bundled manifest without a replacement package                           | Rejected: shell-integration observation would regress and parity is a removal gate; the replacement must exist first.                                                                                                    |
| Decide package content, registration, or the grant-store implementation in this ADR | Rejected: those belong to the plugin ecosystem and to `W-26`/`W-27`/`W-104`; this ADR decides only the retirement and the migration policy.                                                                              |

## Affected contracts

- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md):
  its `bitty-terminal.tabs` retirement direction now has a version floor and a
  grant-migration path; its accepted text is unchanged.
- [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md):
  Boundary 5's `W-26`/`W-27`/`W-104` ordering is unchanged; the bundled
  `bitty-terminal.shell-integration` manifest is added to the retirement scope
  by this record.
- [Legacy Chrome Retirement](../../development/legacy-chrome-retirement.md): its
  recorded `>= v0.2.0` alias window and deprecation gates remain accurate; the
  deprecation-window mechanics it parked to `W-26` and `W-27` are now decided
  in policy here and implemented there. `W-26`, `W-27`, `W-40`, `W-83`, and
  `W-104` keep the recorded dependencies and gates stated there.
- [Small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md):
  `W-104`, `W-40`, `W-51`, and `W-80` through `W-84` keep their recorded
  dependencies.
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md)
  and
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md):
  the hash-bound grant, permission-diff, and denial semantics this migration
  uses are theirs and are not changed.
- The accepted
  [Default Distribution RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/default-distribution-rfc.md),
  the
  [Bundled-Plugin Split Decision (OQ-053)](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md),
  and the
  [Plugin Roadmap](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/plugin-roadmap.md):
  the bundled catalog shrinks to empty through this record plus ADR 0014.
- [Decision register](../index.md) and [ADR index](README.md): route to this
  ADR.

## Open points

The following remain open and are parked to their named owners. None is a new
global open question.

- **Replacement package onboarding** parked to the plugin ecosystem
  (`bitty-plugins`): the independently versioned shell-integration package's
  content, packaging, registry entry, and parity evidence. This ADR requires
  the package to exist and reach parity but does not decide it.
- **Migration implementation** parked to `W-26`, `W-27`, and `W-104`: the
  concrete grant-store code, the atomic rewrite, the removal sweep, and the
  `bitty plugin doctor` reporting surface.
- **Exact removal release** parked to `W-104`: the specific minor release at or
  after `v0.2.0` in which the floor and all gates are met.
- **API and event spellings** stay open under `OQ-056`, and tab order stays
  open under `OQ-052`.

## Security review

The decision touches the plugin trust boundary, the capability and consent
model, hash-bound grant storage, and safe mode. Independent security review is
required before this ADR merges. The security reviewer confirms that:

- the retirement cannot remove a security enforcement point, because the
  capability checks, deny-by-default model, hash binding, and safe-mode skip
  stay in Core and are unchanged;
- the tabs remap preserves denials and never revives a denied plugin or
  capability, and never unions capability sets into a widened grant;
- the shell-integration update path uses the existing permission-diff approval
  for any added capability and never silently broadens a grant;
- an inert record grants no authority absent a resolved manifest, and an
  invalidated record only removes authority;
- no P0 control is weakened, and the safe-mode startup path
  ([P0-AC-019](../../security/p0-acceptance-criteria.md)) keeps zero
  third-party plugins.

The downstream implementation tasks (`W-104`, `W-26`, `W-27`) each require
security review again before their own merge where they touch the grant
boundary.

## Verification plan

This is a decision record; it has no executable verification of its own. Any
later implementation must prove, at minimum:

1. **Alias window.** The `bitty-terminal.tabs` alias resolves during the window
   and is removed only at the documented `v0.2.0` floor, never earlier.
2. **Remap.** A stored `bitty-terminal.tabs` grant becomes an effective
   `bitty-terminal.workspace` grant with the same capability set; a
   pre-existing canonical record is not widened; the migration is idempotent.
3. **Denial safety.** A plugin-level or per-capability denial on the alias
   stays denied on the canonical id; no update, rename, or approved expansion
   revives it.
4. **Shell-integration carry-forward.** A same-or-narrowed package manifest
   carries the grant forward; an added capability blocks pending the
   permission diff; a denied plugin is not revived.
5. **Inert and orphaned records.** An unmigrated alias record, or a
   bundled-hash record with no resolved manifest, grants no authority and is
   reported by `bitty plugin doctor`/`bitty plugin list`.
6. **No widening.** No migration path adds a capability, bypasses consent, or
   changes safe-mode behavior.
7. **No regression.** The regression suite covers the no-plugin baseline, safe
   mode, workspace navigation, and the grant lifecycle, and stays green on the
   removal revision.
8. **Documentation gates.** The repository-local `just check` passes with zero
   issues, and affected pages are synchronized.

## Acceptance criteria

- The `bitty-terminal.tabs` alias and the bundled
  `bitty-terminal.shell-integration` manifest each have an explicit retirement
  decision, a `v0.2.0` floor, and named gates.
- The stored-grant migration path is defined for both: remap for the alias,
  carry-forward or re-consent for the manifest, with inert-record and
  invalidate behavior, denial preservation, and user notification.
- The `DEC-0032` citation is recorded and resolved, and the code update is
  assigned to `W-104`.
- The document is a standalone ADR with a stated vehicle rationale, valid
  numbering, and register rows.
- [Legacy Chrome Retirement](../../development/legacy-chrome-retirement.md) and
  the [handoff](../../handoff/2026-10-02-small-core-refactor.md) are not
  contradicted; their recorded aliases, deprecations, and dependencies stand.
- No implementation is described as done, and no P0 control is weakened.
- The document is self-contained and contains no research-archive reference.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                              | Requirement                                                                  |
| -------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `architecture-owner` | Retirement scope, version floor, retained Core mechanism, and boundary correctness | Approve; confirms the two retirements and the `v0.2.0` floor.                |
| `security-architect` | Grant migration, denial preservation, consent, and safe mode                       | Independent security sign-off is required before merge.                      |
| `docs-curator`       | Vehicle rationale, numbering, metadata, links, and register synchronization        | Approve; confirms schema, discoverability, and untouched P0 control wording. |

## References

- [bitty-docs#397](https://github.com/bitty-terminal/bitty-docs/issues/397)
  (CarryCtx `CTX-0257`, plan key `W-02`).
- CarryCtx `DEC-0032` (task `CTX-0239`, tabs-workspace rename RFC): the
  materialized alias-window decision this ADR resolves.
- `bitty` `abde197f` (`CTX-0240`, PR #415): the tabs-to-workspace alias
  implementation that cites `DEC-0032`.
- `bitty` source evidence: `crates/bitty-runtime/src/tabs.rs`,
  `crates/bitty-plugin-host/src/bundled.rs`, and
  `crates/bitty-plugin-host/src/grant.rs`.
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md)
  and
  [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md).
- [Legacy Chrome Retirement](../../development/legacy-chrome-retirement.md) and
  the
  [small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md).
- [Security overview](../../security/overview.md),
  [threat model](../../security/threat-model.md),
  [risk register](../../security/risk-register.md), and
  [P0 security acceptance criteria](../../security/p0-acceptance-criteria.md).
- [Decision register](../index.md), [ADR index](README.md), and
  [open-question register](../open-questions.md).
