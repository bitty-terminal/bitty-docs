---
title: Package Manager and Runtime Loader Boundary
description: Accepted W-72 focused contract for package-operation ownership network paths read-only startup validation and OQ-021 migration and rollback evidence
category: development
audience: contributor
document_type: specification
status: accepted
website_publish: true
sidebar_order: 28
---

# Package Manager and Runtime Loader Boundary

## Document status

Accepted focused contract. This document is the `W-72` deliverable for the
package-manager and runtime-loader boundary that
[ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
accepted in direction and gated on `W-72`. It fixes the operation ownership
split, makes the network paths and CI gates explicit, states what Core does when
it loads already-installed plugins, and carries the accepted OQ-021 activation,
rollback, and migration evidence.

This document authorizes no implementation and describes no implemented
behavior. The external tool is a working name confirmed here as
`bitty-plugin-manager`; that repository exists today only as a metadata-only
scaffold with governance, toolchain, and CI metadata and no product code
([candidate extraction repositories](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/repository-map.md)).
The `bitty-package` crate carries package-management code in the current
`bitty` workspace; that is current-location evidence, not acceptance of this
boundary and not a claim that the boundary is implemented. Every ownership
statement here is a contract direction for a later implementation; nothing is
`Verified`. Frontmatter `status` is `accepted` per the repository metadata
schema.

- Owning task: `W-72` (bitty-docs), CarryCtx `CTX-0261`, Issue
  [bitty-docs#401](https://github.com/bitty-terminal/bitty-docs/issues/401).
- Predecessor decision:
  [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 2; binding constraint 5).
- Related:
  [Plugin Contract and Manager Boundary](plugin-contract-and-manager-boundary.md),
  [Native Component Boundary](native-component-boundary.md), and the
  [small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md).
- Downstream owners named but not decided here: `W-101` (bitty, CarryCtx
  `CTX-0927`) and the `bitty-plugin-manager` implementation task (CarryCtx
  `CTX-0003`).

## Purpose and scope

This specification finalizes the boundary between Core, the external package
manager, and the plugin host before any extraction is implemented. It exists
because install-time package management and runtime plugin loading are different
concerns with different trust levels, and because Core keeps a non-negotiable
startup responsibility even when the install path moves out.

In scope:

- the ownership of every public package operation: manifest parse, dependency
  resolution, source fetch, integrity/lock/checksum verification, install,
  activate, rollback, runtime load/prepare, capability grant/deny, update,
  uninstall, and list/inspect;
- the network paths that may reach the network, the gate for each, and the
  Core-never-network invariant;
- the CI gates that must validate the network and integrity paths;
- what Core does at startup with already-installed plugins without executing
  package code, and what `bitty --safe` does instead;
- the accepted OQ-021 transactional activation, rollback, retained-environment,
  capability-increase, and migration evidence;
- the security owner sign-off and the downstream owners.

Out of scope and not decided here:

- exact API and CLI spellings, install-layout paths, manifest and lock schemas,
  and the `[components]` and `[[network.egress]]` manifest tables, which ADR
  0015 parks to `W-10`;
- registry and index service boundaries, attestation, key management, and
  freshness, which stay with the accepted OQ-028 and OQ-029 contracts;
- the concrete shape of the external tool (crate, sidecar, or CLI), which the
  `bitty-plugin-manager` implementation task decides after this contract;
- any implementation, extraction, or migration action.

Nothing here weakens a normative security control. Where a control or threshold
appears to need change, it is recorded under "Open points" instead.

## Normative sources this specification must not weaken

This boundary must be read together with, and must not weaken:

- The [security overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/overview.md),
  the [threat model](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/threat-model.md),
  the [risk register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/risk-register.md),
  and the [P0 acceptance criteria](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/p0-acceptance-criteria.md).
  In particular, the four supply-chain controls this boundary is bound by are
  preserved by reference and must not be weakened:
  - **P0-AC-027 Install executes no package code.** Download, manifest
    validation, checksum/provenance verification, and content-addressed storage
    complete with zero package-supplied code executed; first execution happens
    only after authorization.
  - **P0-AC-028 Lock and checksum integrity.** A package whose bytes, manifest
    hash, source, revision, dependencies, or API compatibility differ from the
    lockfile record fails closed at install/update validation.
  - **P0-AC-029 Transactional activation and rollback.** A mid-way activation
    failure or a later rollback retains or restores the prior working
    environment deterministically.
  - **P0-AC-030 Capability increases block update.** An update whose manifest
    requests capabilities absent from the installed version blocks pending an
    explicit permission diff and approval.

  Related controls that also bind this boundary are the restricted plugin
  standard library and least privilege (`P0-AC-011`, `P0-AC-012`), native
  plugin rejection (`P0-AC-018`), safe mode and targeted disable (`P0-AC-019`,
  `P0-AC-020`), project configuration trust (`P0-AC-031`, `P0-AC-032`), and
  dependency policy checks (`P0-AC-034`).

- The accepted [Package Lifecycle RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-lifecycle-rfc.md)
  (the OQ-021 integrity, staged-activation, and safe-rollback contract), the
  [Package Follow-up RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-followup-rfc.md)
  (OQ-022, OQ-026 through OQ-029), the
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  the [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  and the [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md).
  The package manifest, lockfile, version, resolver, validation, transactional
  activation, rollback, and retained-environment contracts stay with OQ-021;
  this document does not redefine them.
- DIR-016 and DIR-017 (Core network boundary: Core stays network-free and never
  initiates a network connection, with AF_UNIX IPC the only exception) and the
  no-initiate architecture rules in the
  [future-boundaries direction](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/future-boundaries.md).
- DIR-028 and the [Plugin Contract and Manager Boundary](plugin-contract-and-manager-boundary.md):
  the Bitty-owned manager, the host-controlled Lua resolver, and the rule that
  entering a repository never auto-installs or executes a plugin.
- [ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  binding constraint 5: runtime loading still validates installed package
  integrity, compatibility, and grants; external package management does not
  make startup trust blind.

## Terminology

- **Core**: the always-available terminal mechanism that works with zero plugins
  and in `bitty --safe`; it owns Terminal Truth, permission and resource
  enforcement, and the startup validation described here.
- **`bitty-package`**: the current Core-owned package lifecycle and integrity
  model crate. Under this boundary its retained role narrows to the shared
  manifest/lock schema, the bounded parser, and the integrity primitives Core
  links for startup validation; the install-time mechanics move to the external
  tool. Its present contents are current-location evidence only.
- **External manager (`bitty-plugin-manager`)**: the external tool that owns
  install, source fetch, dependency resolution, transactional activation, and
  rollback. The working name is confirmed as the exact name by this
  specification; the repository is a metadata-only scaffold and no product code
  is claimed.
- **Plugin host (`bitty-plugin-host`)**: the in-Core runtime component that
  instantiates the plugin VM from an already-validated active generation, wires
  the restricted standard library and service registry, and enforces
  capability checks on every privileged call.
- **Installed generation**: an immutable, content-addressed package version
  recorded by the external manager with its full lock resolution, generation
  root digest, capability grant snapshot, activation time, and previous
  generation ID.
- **Read-only load**: Core's startup path over already-installed plugins, which
  opens the install layout read-only, verifies integrity, compatibility, and
  grants, and prepares the plugin without executing package-supplied code; it
  never fetches, resolves, installs, activates, rolls back, updates, or
  uninstalls.
- **Network path**: any code path that opens a network connection. Core has
  none; the external manager is the only package-management actor that may have
  one, and only under the gate stated below.
- **Candidate**: a proposal that has not been decided; candidate status is not
  acceptance and is not implementation.

## Owners and actors

Four owners are possible for a package operation:

- **Core** retains startup validation, the capability gate, resource budgets,
  Terminal Truth, and the no-network invariant. It is always available with
  zero plugins and in safe mode.
- **`bitty-package`** is the retained Core boundary artifact: the canonical
  bounded manifest/lock parser and integrity primitive that both the external
  manager and Core consume so their opinions cannot drift.
- **`bitty-plugin-manager`** is the external tool that owns install-time
  package management. It holds no startup-trust authority.
- **The plugin host** (`bitty-plugin-host`) owns runtime load, capability
  enforcement at call time, and VM disposal, all under Core enforcement.

The unified CLI verbs (`add`, `update`, `sync`, `doctor`, `list`,
`enable`/`disable`, `info`, `permissions`) are presentations over these
operations; the CLI is not itself an owner and gains no authority.

## Ownership of every public package operation

| Public package operation                   | Owner                  | Contract role and constraints                                                                                                                                                         |
| ------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manifest parse                             | `bitty-package`        | Canonical bounded parser and manifest schema; the external manager and Core link the same parser. Parsing untrusted data is bounded and executes nothing.                             |
| Dependency resolution                      | `bitty-plugin-manager` | Resolution of the Bitty plugin graph at build or install time; records the result in the lock; executes no package code.                                                              |
| Source fetch                               | `bitty-plugin-manager` | The canonical network access point for resolution and install/update when a source is remote; explicit user invocation only; never triggered by entering a repository.                |
| Integrity, lock, and checksum verification | `bitty-plugin-manager` | Runs the accepted OQ-021 verification chain at install/update time and fails closed (`P0-AC-028`); executes no package code (`P0-AC-027`); Core independently re-verifies at startup. |
| Install                                    | `bitty-plugin-manager` | Download, manifest validation, checksum/provenance verification, and content-addressed storage; zero package-supplied code executed (`P0-AC-027`).                                    |
| Activate                                   | `bitty-plugin-manager` | Transactional generation switch over named phases with an atomic all-or-nothing result (`P0-AC-029`); executes no package code.                                                       |
| Rollback                                   | `bitty-plugin-manager` | Reverse staged activation over retained generations; reproduces the prior lock digest; executes no package code; capability gates apply symmetrically.                                |
| Update                                     | `bitty-plugin-manager` | A capability increase blocks automatic application pending an explicit permission diff and approval (`P0-AC-030`).                                                                    |
| Uninstall                                  | `bitty-plugin-manager` | Removes the package content and lock record; never cascades to a shared component without an explicit request; leaves no half-removed generation for Core to read.                    |
| List / inspect                             | `bitty-plugin-manager` | Read-only enumeration of installed packages, versions, lock resolution, and capability snapshots; presentation only, no execution.                                                    |
| Runtime load / prepare                     | Plugin host            | Instantiates the plugin VM from the already-validated active generation under Core permission and resource enforcement; first execution only after authorization.                     |
| Capability grant / deny                    | Plugin host            | Deny-by-default capability check on every privileged host call, with no allow-all boolean (`P0-AC-012`); Core validates the recorded grant snapshot before load.                      |

The external manager never determines startup trust: Core re-derives the
integrity, compatibility, and grant verdict itself and fails closed on any
mismatch. The plugin host never decides what is installed, and Core never
mutates the package store.

## Network paths

**Core-never-network.** Core does not fetch, does not resolve remote metadata,
and never opens a network connection. DIR-016 and DIR-017 make this an
architecture invariant, and Core links no network implementation crate; AF_UNIX
IPC is the only permitted socket use and is not a package path.

**The external manager is the only package actor that may reach the network.**
The operations that may reach it are source fetch, and dependency resolution or
install/update when a source is remote. List, inspect, uninstall, activate, and
rollback operate on local state and need no network.

**Gate.** Every network path is behind an explicit, user-initiated command
(`add`, `update`, `sync`) and never behind entering a repository or loading a
project. A project composition file is declarative and receives no process,
network, filesystem-write, or runtime-admin authority without explicit consent
(`P0-AC-031`, `P0-AC-032`). No package code runs during fetch, resolution,
download, validation, or storage (`P0-AC-027`). Integrity is verified against
the lock and fails closed (`P0-AC-028`). An update that requests new
capabilities blocks pending approval (`P0-AC-030`). A build-time Lua dependency
toolchain, where used, is confined to development and packaging and is never an
end-user install path.

**Offline.** End-user installs use self-contained, pre-resolved artifacts and
must remain installable without network access; the manager must fail closed,
not silently degrade, when a required artifact is absent offline.

## CI gates

Any implementation of this boundary must pass, in the owning repositories:

1. **Core network-free dependency-DAG gate.** A test asserts that Core's
   dependency graph contains no network implementation or egress path and that
   startup performs no fetch, exercising the DIR-016 enforcement.
2. **Supply-chain acceptance matrix.** Adversarial tests tamper with every lock
   dimension independently (`P0-AC-028`) and instrument install to prove zero
   package or script invocation (`P0-AC-027`).
3. **Transactional activation and rollback gate.** Fault injection at each
   activation phase restores the prior environment, and rollback reproduces the
   prior lock digest (`P0-AC-029`).
4. **Capability-diff gate.** A capability increase in an update blocks
   automatic application until the permission diff is approved (`P0-AC-030`).
5. **Dependency-policy gate.** Advisory, source, license, and banned-dependency
   checks are present, gating, and demonstrated to catch a seeded violation
   (`P0-AC-034`).
6. **Platform gate.** The network, integrity, activation, and rollback tests
   run in CI on every supported platform; no claim rests on a single host.
7. **Documentation gate.** `just check` passes with zero issues in this
   repository.

These gates are requirements on the implementations, not evidence that they
exist.

## Read-only loading at startup

Before the plugin host loads any already-installed plugin, Core performs a
read-only validation pass and fails closed on any mismatch:

1. **Discover.** Read installed generations from the external manager's install
   layout read-only; Core takes no write lock and does not invoke the manager.
2. **Parse.** Parse the installed manifest with the bounded `bitty-package`
   parser; malformed or oversized input is rejected without execution.
3. **Verify integrity.** Recompute the generation digests against the lock
   (artifact, canonical manifest, and content root) and reject a tampered or
   unverifiable generation.
4. **Validate compatibility.** Confirm host and harness compatibility for the
   installed version.
5. **Validate capability grants.** Check the recorded capability grant snapshot
   against the closed capability set; a capability the set does not cover, or a
   grant that cannot be re-derived, fails closed and the plugin is not loaded.
6. **Hand off.** Only after all checks pass does Core prepare the plugin for the
   plugin host to instantiate.

Core executes no package-supplied code on this path. It does not resolve
dependencies, fetch, install, activate, roll back, update, or uninstall. Under
`bitty --safe`, Core loads zero third-party plugins and reads none of this
state; safe startup succeeds even when every installed generation is corrupt
(`P0-AC-019`). Unverifiable packages stay unloaded rather than being trusted or
silently repaired.

## Migration and rollback evidence (OQ-021)

This specification carries the accepted OQ-021 evidence. A later implementation
must record each item below; none is claimed here.

### Transactional activation

Activation is one transaction with named phases (preflight, quiesce, commit,
wake, confirm); failure anywhere before commit leaves the active environment
untouched, and the switch is observably all-or-nothing. Evidence must prove that
an induced failure at each phase restores the prior environment and that the
active pointer is unchanged on abort.

### Retained environments and rollback

Each successful activation records an immutable generation entry: full lock
resolution, generation root digest, capability grant snapshot, activation time,
and previous generation ID. Retention keeps the current plus a bounded number of
previous generations and never prunes the current generation or leaves zero
rollback targets. Full rollback selects a retained generation and performs the
same staged activation in reverse; per-plugin rollback restores one plugin to
its previously retained version, with targeted disable as the surgical path when
no prior version exists. Rollback executes no package code and reproduces the
prior lock digest. Capability gates apply symmetrically: rolling forward to a
higher-capability version requires the same approval diff as any update, so
rollback never silently reintroduces broader authority.

### Capability increases block update

A capability-diff test must show that an update requesting a capability absent
from the installed version blocks automatic application until the explicit
permission diff is approved (`P0-AC-030`). Approval gates activation, not merely
the notification.

### Migration path

Two migrations are in scope and must each be explicit, never an in-place
reinterpretation:

- **Boundary migration.** Moving install-time package management out of
  `bitty-package` and into `bitty-plugin-manager` must preserve the existing
  installed layout or provide a reviewed one-time import, keep a single source
  of truth for the lock, and keep Core's read-only startup validation working
  throughout. `W-101` audits and narrows in-Core package-manager use and must
  not remove install or verification behavior before the replacement boundary
  exists. A dual-run or import window is acceptable only when it cannot produce
  two disagreeing lock authorities.
- **Format migration.** A manifest or lock format version change requires an
  explicit migration, never in-place reinterpretation; a migration must be
  reversible or paired with a retained previous generation so the pre-migration
  environment remains selectable.

## Downstream ownership

This specification fixes who owns the remaining decisions; it does not decide
their content.

- **`W-101` (bitty, CarryCtx `CTX-0927`)** owns the Core audit and narrowing of
  package-manager use in the host. It must not remove install or verification
  behavior before a replacement boundary exists, and it decides where Core's
  retained parser and integrity primitives live. The `bitty` owner answers it.
- **`bitty-plugin-manager` implementation task (CarryCtx `CTX-0003`)** owns the
  external tool's concrete shape and implementation of the install, fetch,
  resolve, activate, and rollback operations, after this contract. The
  repository is a metadata-only scaffold; nothing is implemented. The
  `bitty-plugin-manager` owner answers it.
- **`W-10`** owns the parked `[components]` and `[[network.egress]]` manifest
  schema and must reconcile it with DIR-016, DIR-017, and DIR-030; this
  specification does not admit those tables.
- **`W-80` through `W-84`** own the downstream documentation synchronization
  once this contract is accepted; the exact spelling of any cross-repository
  page is theirs.

## Security review

Core's startup validation, the external manager's install and network paths, and
the plugin host's capability enforcement all touch trust boundaries the security
overview governs. Independent security review is required before this
specification merges. The security owner is the `security-architect`, who
confirms that:

- the four supply-chain controls `P0-AC-027` through `P0-AC-030` are preserved
  and not weakened, and that Core's read-only startup validation cannot be
  bypassed by a package-manager verdict;
- Core has no network path and the only network-reaching package operations are
  gate-bound as stated;
- install, fetch, resolution, and rollback execute no package code, and no
  private first-party bypass exists for official plugins;
- rollback cannot silently reintroduce broader capability authority;
- no later focused contract may weaken a P0 control.

The downstream implementations `W-101` and the `bitty-plugin-manager` task each
require security review again before their own merge.

## Verification plan

This is a contract specification; it has no executable verification of its own.
Any later implementation of the boundary must prove, at minimum:

1. **Install executes no package code.** An instrumented install shows zero
   package or script invocations, including a hostile manifest with hooks
   (`P0-AC-027`).
2. **Lock integrity fails closed.** Every tampered lock dimension (bytes,
   manifest hash, source, revision, dependencies, API compatibility) is
   independently detected and rejected (`P0-AC-028`).
3. **Activation is transactional.** Induced failure at each activation phase
   restores the prior environment, and rollback reproduces the prior lock
   digest (`P0-AC-029`).
4. **Capability increase blocks update.** A capability-diff test blocks
   auto-update and an approval gates activation (`P0-AC-030`).
5. **Core never networks and never executes package code at startup.** A
   dependency-DAG test shows no network path in Core, and a startup test shows
   no package code executed while loading an installed plugin.
6. **Startup validation is independent.** A generation that the external
   manager would accept but whose integrity, compatibility, or grant snapshot
   fails Core's re-derivation is not loaded.
7. **Safe mode stays clean.** `bitty --safe` starts with zero third-party
   plugins and reads no installed-generation state, even against a full hostile
   fixture set (`P0-AC-019`).
8. **Migration is explicit and reversible.** A boundary or format migration
   keeps a single lock authority and leaves the pre-migration environment
   selectable; no in-place reinterpretation occurs.
9. **Cross-platform evidence exists.** The network, integrity, activation, and
   rollback tests run on every supported platform.
10. **Documentation gates pass.** The repository-local `just check` passes with
    zero issues.

## Alternatives considered

| Alternative                                                      | Disposition                                                                                                                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep install-time package management inside Core                 | Rejected: contradicts DIR-001 and leaves optional behavior in the small core; Core retains startup validation instead.                                           |
| Let the external manager also decide startup trust               | Rejected by ADR 0015: runtime loading must still validate installed integrity, compatibility, and grants; external management does not make startup trust blind. |
| Let Core fetch or resolve during startup                         | Rejected: DIR-016 and DIR-017 keep Core network-free and Core performs no fetch at startup.                                                                      |
| Let the plugin host decide install or activation                 | Rejected: the host enforces capability and budget at runtime; it must not own package state or install-time trust.                                               |
| One shared lock with two writers (Core and the external manager) | Rejected: a single lock authority is required; a dual-run window that can produce disagreeing locks is not allowed.                                              |
| Auto-install or auto-execute on entering a repository            | Rejected: project composition is declarative and needs explicit consent (`P0-AC-031`, `P0-AC-032`).                                                              |
| Reinterpret a manifest in place on a format version change       | Rejected by the accepted OQ-021 contract: a format change requires explicit migration, never in-place reinterpretation.                                          |
| A private first-party bypass for official plugins                | Rejected: official plugins use the same public, capability-gated path and receive no startup-trust shortcut.                                                     |
| Trust the external manager's prior verification without re-check | Rejected by ADR 0015 binding constraint 5: Core re-derives the verdict itself and fails closed.                                                                  |

## Affected contracts

- [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md):
  Boundary 2 now has its focused contract; binding constraint 5 is preserved.
- [Small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md):
  `W-72` now has its deliverable; the dependency order (`W-72` then `W-101`)
  is unchanged.
- [P0 Security Acceptance Criteria](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/p0-acceptance-criteria.md):
  `P0-AC-027` through `P0-AC-030` are referenced unchanged and must not be
  weakened.
- [Plugin Contract and Manager Boundary](plugin-contract-and-manager-boundary.md):
  the Bitty-owned manager, manifest split, and host-controlled resolver stay
  the direction; this document fixes the operation ownership.
- [Native Component Boundary](native-component-boundary.md): component install
  and `bitty plugin add` resolution compose with the external manager without
  automatic download in v1.
- [Development index](README.md): routes to this document.
- [Open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md):
  OQ-021 remains Accepted and is not reopened; no new global open question is
  admitted by this document.

## Open points

The following details are parked, not decided. Each park names the owning task
and the reason. None is a global open question: none blocks the current
milestone, and no implementation evidence forces one yet.

- **Manifest, lock, and install-layout schemas** parked to `W-10` and the
  `bitty-plugin-manager` task: the concrete manifest and lock schemas, the
  `[components]` and `[[network.egress]]` tables, and the exact install layout.
- **Retained-parser placement** parked to `W-101`: whether Core links
  `bitty-package` directly or a narrower shared crate for the bounded parser and
  integrity primitive.
- **External tool shape** parked to the `bitty-plugin-manager` task: whether the
  external manager is a crate, a sidecar process, or a CLI.
- **Signature and provenance depth** parked to the Package Follow-up RFC owners:
  the accepted OQ-022 contract fixes verifiability direction, while real
  signature verification remains draft; the split between install-time and
  startup verification depth is undecided.
- **Registry and index network details** parked to the accepted OQ-028 and
  OQ-029 contracts: registry service boundaries, attestation, key management,
  and freshness are not redefined here.
- **Cross-platform atomic switch** parked to the Package Lifecycle RFC owners:
  the contract requires observable all-or-nothing behavior, not a specific
  rename syscall, and the platform mechanism remains open.
- **Dual-run/import migration semantics** parked to `W-101`: the exact
  transition mechanics that keep a single lock authority while install-time
  management moves out of Core.

## Acceptance criteria

- The ownership table covers every public package operation named in this
  specification and assigns each to `bitty-package`, `bitty-plugin-manager`,
  Core, or the plugin host.
- Core-never-network is explicit, the network-reaching operations and their
  gate are explicit, and the CI gates that validate the network and integrity
  paths are listed.
- Read-only startup loading is explicit: what Core verifies and what it does
  not do, without executing package code.
- The OQ-021 transactional activation, rollback, retained-environment,
  capability-increase, and migration evidence is required.
- The four controls `P0-AC-027` through `P0-AC-030` are preserved verbatim by
  reference and stated to be unweakenable.
- The `security-architect` sign-off is named and required before merge.
- `W-101` (bitty, CarryCtx `CTX-0927`) and the `bitty-plugin-manager`
  implementation task (CarryCtx `CTX-0003`) are named as downstream owners
  without deciding their content.
- The external manager is not described as implemented and no operation is
  described as implemented.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                              | Requirement                                                                      |
| -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `architecture-owner` | Operation ownership, retained Core mechanisms, and the network boundary            | Approve; confirms the ownership split and retained startup validation.           |
| `security-architect` | Trust boundaries, package integrity, network gate, capability grants, and rollback | Independent security-architect sign-off is required before merge.                |
| `docs-curator`       | Taxonomy, metadata, links, terminology, and register synchronization               | Approve; confirms discoverability, schema, and the untouched P0 control wording. |

## References

- [bitty-docs#401](https://github.com/bitty-terminal/bitty-docs/issues/401)
  (CarryCtx `CTX-0261`, plan key `W-72`).
- [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 2; binding constraint 5).
- [P0 Security Acceptance Criteria](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/p0-acceptance-criteria.md)
  (`P0-AC-027` through `P0-AC-030`) and the
  [security overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/overview.md).
- [Package Lifecycle RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-lifecycle-rfc.md)
  (OQ-021) and [Package Follow-up RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-followup-rfc.md).
- [Plugin Contract and Manager Boundary](plugin-contract-and-manager-boundary.md),
  [Native Component Boundary](native-component-boundary.md), and the
  [small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md).
- [Development index](README.md), [documentation workflow](documentation-workflow.md),
  and the [open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md).
