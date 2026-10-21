---
title: Authenticated provider publication ingress and proof lifetime
description: Decision-ready security design for Core-origin provider publication ingress, replay protection, proof lifetime, audit evidence, and the component-broker boundary
category: security
audience: security-reviewer
document_type: specification
status: draft
website_publish: false
sidebar_order: 36
---

# Authenticated provider publication ingress and proof lifetime

## Document status

**DRAFT - decision-ready security design, not an accepted or implemented
control.** This page proposes the cross-project decision for the residual
authenticated Core-origin provider-publication ingress requested by Core
[#2199](https://github.com/bitty-terminal/bitty/issues/2199) and records the
proof-lifetime, replay, fail-closed, audit-evidence, and component-broker
consequences. It does not accept the mechanism, authorize Core, IPC, helper, or
Lua implementation, enable strict `ai.provider_list` dispatch, move a risk or
open-question state, or approve a dependency.

Authority split with the AI-owned mechanism page:

- The AI-owned
  [Authenticated provider publication](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/architecture/authenticated-provider-publication.md)
  owns the exact launch manifest, certificate profile, control-record bodies,
  canonical provider-routing payload, named bounds, and per-step transport
  accounting.
- This page proposes to own the cross-project ingress authority model, the
  replay and lifetime decision, the fail-closed ordering, the audit evidence
  contract, and the DIR-030 component-broker boundary.

Where the two pages overlap, the stricter requirement applies. A divergence
between them is a defect to resolve before either page is accepted, not a
license to choose the weaker text.

The previous conditional reviews of the AI-owned page do not transfer to this
page. No sign-off for this page is recorded in
[P0 Review Sign-off](#p0-review-sign-off).

## Purpose and scope

Resolve the residual authority, transport, source-mapping, and lifetime choices
that the accepted R1 provider/routing contract leaves open. The only later
strict target is `ai.provider_list` on the explicit provider-routing channel.
The helper remains the authority for registry population, selection, provider
I/O, credentials, and exact-byte equality proof. Core owns its read-only
publication view, publication identity and version, invalidation, and
acknowledgement handling.

In scope:

- ingress identity and authentication, including the candidate comparison
  between a launch-bound channel and an OS-attested local endpoint;
- bounded, versioned control records for establishment, publication,
  acknowledgement, invalidation, lifetime rotation, and proof handoff;
- replay protection and publication-state reconstruction with identical inputs;
- proof lifetime, rotation, revocation, expiry, and the tolerant-path boundary;
- fail-closed ordering and prohibition of side effects before refusal;
- audit evidence, retention, redaction, and review use;
- the boundary with the DIR-030 component broker and the external IPC surface;
- the boundary with extension/package publication and the open R-015
  signature/provenance-depth question.

Out of scope:

- implementation, dependency approval, pin upgrades, platform enablement, and
  performance evidence; those remain separately scoped gates;
- provider selection, provider I/O, credentials, model requests, and provider
  behavior in Core;
- completion, context, MCP, tools, extensions, or any other `ai.*` method;
- package signing, registry attestation, and extension publication contracts;
- remote transports, network listeners, daemons, and cross-instance sharing;
- new Lua, CLI, or external IPC surfaces.

This design introduces no public `ai.publish` method, no new `ai.*` method, and
no change to the existing 13 `ai.*` method schemas. The control record family is
a separate internal protocol. No provider-routing authority is minted by a
generic snapshot version, MCP `list_version`, caller metadata, or a plugin
capability.

## Normative sources this specification must not weaken

- [R1 provider/routing contract](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/architecture/execution-ownership-r1.md#providerrouting-snapshot-binding-contract-accepted-2026-10-17):
  projection, canonical bytes, ownership, exact equality, and fail-closed strict
  admission. The accepted subsection is pinned at AI-docs
  `abb820bdbb663d7ed1ae061a2ed7551208af02cb`.
- [Authenticated provider publication](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/architecture/authenticated-provider-publication.md):
  the selected launch-scoped mutual-certificate profile, launch material and
  bootstrap direction, exact records, constants, and carried gates.
- [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md):
  bounded framing, per-action scopes, current-user-local external IPC,
  read-only defaults, and secret minimization. This internal control protocol
  is a separate boundary; it does not replace external IPC authentication.
- [Security overview](overview.md), [threat model](threat-model.md),
  [P0 acceptance criteria](p0-acceptance-criteria.md),
  [risk register](risk-register.md), and
  [evidence matrix](evidence-matrix.md): normative trust boundaries, P0
  controls, and evidence rules. Mechanisms described here do not move a risk
  state or satisfy a P0 criterion by documentation.
- [Native component boundary](../development/native-component-boundary.md)
  (DIR-030): descriptor and digest verification, cleared environment, one
  process per instance, broker-owned request lifecycle, and the Core-versus-
  component authority split.
- [Package manager boundary](../development/package-manager-boundary.md) and
  the [Package Lifecycle RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-lifecycle-rfc.md)
  and [Package Follow-up RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-followup-rfc.md):
  extension/package publication trust, publisher signatures, key directory,
  revocation, and freshness. These contracts remain owner-separate.
- [Observability boundary](../development/observability-boundary.md): typed
  redaction, opt-in external observation, bounded buffers, and no default file
  or export path.
- [ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md):
  Core retains startup validation and fails closed; extraction never moves a
  trust gate without a focused contract.

These sources prevail on conflict. This draft changes no canonical risk,
evidence, or open-question row and does not claim independent security
acceptance.

## Terminology

| Term                           | Meaning in this document                                                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ingress                        | The authenticated path by which an authorized Core supervisor presents a provider-routing publication to a helper.                                                      |
| Delegation                     | The per-launch authority the trusted Core supervisor grants to exactly one verified helper launch for provider-publication control only.                                |
| Launch bootstrap               | The one-shot bounded record carrying the manifest and launch key material over a dedicated inherited channel.                                                           |
| Control session                | One mutually authenticated TLS 1.3 connection plus the matching application establishment exchange.                                                                     |
| Lifetime                       | One helper-created, non-reconstructible private capability plus its live revocation cell; distinct from the protocol-visible publication tuple and Core authentication. |
| Receipt                        | An opaque helper-resident lookup handle for one live proof; not a serialized proof, general credential, or caller parameter.                                            |
| Feed revision                  | Helper-owned registry mutation revision, covering aliases and projected model fields.                                                                                   |
| Publication version            | Core-owned monotonic publication revision; never inferred from a feed revision, MCP list version, or generic snapshot version.                                          |
| Snapshot version               | Core-owned source-view revision: `1` for the first adopted projection, then one greater for each replacement projection; never reset by publication-only re-mint.       |
| Strict admission               | The `Admit`/`Admitted` reservation and live-proof recheck that precedes only the scoped `ai.provider_list` handler.                                                     |
| Tolerant path                  | Existing standalone, safe-mode, and non-strict `ai.*` behavior that does not depend on publication authority.                                                           |
| Audit evidence                 | Bounded, typed, secret-minimizing local decision records and the test/review artifacts that prove control behavior.                                                     |
| Core publication-control owner | The Core module that owns the launch/control session, Core publication identity and version, the accepted read-only source view, and the Core-local audit ring.         |
| Helper authority owner         | The helper module that owns the lifetime capability, proof/receipt, authoritative populated registry, registry gate, and helper-local audit ring.                       |
| Broker                         | The DIR-030 `bitty_runtime::component` request/response component broker; not the publication authority.                                                                |

## Current evidence baseline (2026-10-21)

This dated baseline records implementation progress only. It claims no
integrated authority, no live authenticated publication, no platform support,
and no strict enablement.

| Component         | Pinned evidence                                                                                              | Limit of claim                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core              | `f246dc5589c779f652d13125bfa79b2dffd64ec8`; #2330 squash `3171f4f5`; launch seam #2286 squash `6b080e9d`     | Default-off `publication-control` feature; bounded framing and control state machine; Unix-only transport; the launch seam stops at TLS establishment and is not wired to the `ai_helper` spawn.                             |
| Core IPC contract | `bitty-ipc` #35 `e6a2c0c`; Core currently pins `9493674` (descendant, `e6a2c0c...9493674` two commits ahead) | Pure header/kind/body/canonical-payload contract and named bounds; no authentication, transport, proof, or registry work. Cross-pin golden-vector evidence remains required.                                                 |
| Core transport    | `bitty-network` #95 squash `c8710e0`; Core pins `c8710e0`                                                    | Launch material generation, manifest encoding, and TLS 1.3 client with DER-pin server verifier; no spawn, supervision, or control records.                                                                                   |
| AI helper         | `b5940b6`; #526 `8a11c47`; #529 `6c0832d`; #536 `5fd49b8`; #539 `44d0c9d`; AI-0327 `a2bb62a`                 | Helper-side lifetime binding, TLS server, state machine, and launch entrypoint. Uses `ControlOnlyRegistry` at feed revision `1`; no real provider registry, `Admit`, data channel, or provider contact. Strict is `Unbound`. |
| AI endpoint       | AI-0327 exact-byte binding `a2bb62a`; `bitty-ipc` pin `e6a2c0c`                                              | Retained exact publication bytes and offline equality; does not establish authenticated Core origin or cross-reset lifetime isolation.                                                                                       |

No row is integrated evidence. The Core launch seam, helper entrypoint, and
control state machines are not wired to each other in a supported launch; no
real provider registry source exists; no native platform matrix exists; no
audit evidence exists.

## Decision summary

The following decisions are proposed for independent acceptance. "Proposed"
does not mean accepted, implemented, or enabled.

| ID  | Decision                                                                                                                                                            | Status                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| D1  | Use candidate A: a dedicated launch-bound control stream plus a restricted one-shot bootstrap, with existing stdio retained for bounded data RPC.                   | Proposed              |
| D2  | Authenticate with per-launch mutual ECDSA P-256 certificates, SHA-256 DER pins, TLS 1.3 only, and ALPN `provider-publication-control/1`.                            | Proposed, conditional |
| D3  | Reject same-user identity, UID/SID/ACL equality, pipe possession, caller echoes, generic versions, and process-global counters as authority.                        | Proposed              |
| D4  | Protect replay with TLS records, per-direction application sequence, session/lifetime binding, Core publication high-water marks, and irreversible revocation.      | Proposed              |
| D5  | Make the helper the sole lifetime creator and proof holder; rotate through explicit invalidation and lifetime announcements with one retired predecessor.           | Proposed              |
| D6  | Refuse authority failures before acknowledgement or proof, and strict admission failures before handler, provider, credential, or tool contact.                     | Proposed              |
| D7  | Use the helper-to-Core read-only projection feed, not shared registration metadata; keep Core identity/version/invalidation and helper registry ownership separate. | Proposed              |
| D8  | Keep the DIR-030 broker generic; it never parses, relays, mints, caches, or authorizes publication authority.                                                       | Proposed              |
| D9  | Adopt a bounded, secret-minimizing audit evidence contract with an in-memory default and no remote sink; durable acceptance evidence stays in CI and CarryCtx.      | Proposed, open sink   |
| D10 | Keep strict dispatch disabled and scoped to `ai.provider_list` until every carried gate in [Open points](#open-points) is discharged.                               | Required              |

## Ingress identity and authentication model

### Trust root and delegation chain

The root of trust is an uncompromised running Core supervisor, its policy and
component-descriptor verification, the kernel's restricted spawn and
inheritance operation, the OS random source, and the trusted helper startup
code. Under those assumptions the chain is:

1. The supervisor verifies the component descriptor, executable name, version,
   and executable SHA-256, then grants exactly one launch for provider
   publication.
2. The supervisor generates fresh launch material for that launch: one ECDSA
   P-256 key pair and one self-signed leaf certificate per role.
3. The supervisor writes exactly one bounded launch bootstrap record to a
   dedicated one-shot inherited channel and closes its write end.
4. The helper consumes the record, builds its TLS server configuration, and
   accepts no control or data admission before that record is consumed.
5. Both sides complete TLS 1.3 with the pinned peer leaf, then exchange
   `Establish` and `Established` echoes bound to the launch nonce and manifest.
6. Only after establishment may the helper announce a projection, and only
   after the Core publication/acknowledgement/bind exchange may it retain a
   proof.

The launch manifest binds, in binary field order, the bootstrap format version,
control protocol version, fixed roles (`core-supervisor` as TLS client and
`ai-helper` as TLS server), the Core instance nonce, the fresh launch nonce,
the component name/descriptor version/executable name/executable digest, the
component protocol version, fresh control- and data-channel nonces, the sole
delegation purpose `provider-routing-publication`, and the control profile
`provider-publication-control/1`. The key-material block then carries the
helper leaf certificate and its PKCS#8 private key, the Core leaf certificate,
the key-material profile, and the key type. No key material appears in
`Establish`, `Established`, any other control record, the data stream, argv,
the environment, the filesystem, logs, traces, or caller parameters.

### Candidate comparison: launch-bound channel versus OS-attested endpoint

| Candidate                              | What it can establish                                                                         | Why it is or is not sufficient                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A: private stdio/pipe possession alone | That a process holds a duplicated descriptor or handle.                                       | Insufficient. Possession is not explicit supervisor delegation; a same-user process with a duplicated handle or inherited endpoint could present whatever it wants. The selected design adds the one-shot bootstrap and pairwise TLS on top of A.                                                                                                                                         |
| A plus restricted bootstrap and TLS    | Possession of the specific supervisor delegation bound to the component, launch, and channel. | Selected. The helper receives fresh key material only through the kernel-mediated launch; the pin is provisioned out of band from the channel it protects; the peer's TLS 1.3 CertificateVerify signature over the handshake transcript, validated under the pinned leaf, plus Finished and the establishment echo, prove the live peer holds the delegated key and matches the manifest. |
| B: OS-attested local socket/named pipe | That the peer is a same-user process and, where available, a process identity or ACL subject. | Rejected for this scope. UID/SID/ACL equality and caller identity identify the user, not the authorized Core component, instance, or channel. B would still need equivalent bootstrap/authentication plus discoverability, endpoint replacement and TOCTOU handling, per-OS peer APIs, and broader lifecycle work.                                                                        |
| B plus binary signing/attestation      | That an endpoint runs a signed binary under a platform trust root.                            | Not available and not selected. No product binary-signing or attestation delivery exists; asserting it would invent a trust root. It could be a separately reviewed future direction.                                                                                                                                                                                                     |

Candidate A is not accepted because a private pipe is "trusted". It is accepted
only as the carrier for a bootstrap-provisioned, pairwise TLS delegation. A
same-user attacker who can read the bootstrap handle or process memory has
already crossed the stated trust boundary; this design does not repair a
compromised bootstrap, a stolen key, a debugger, or a compromised kernel.

### Distinguishing the authorized component, instance, and channel

| Dimension     | Binding                                                                                                                                                  | Refusal before effects                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Core instance | Core instance nonce in the manifest and establishment echo, generated by the supervisor for that run.                                                    | Wrong or missing instance nonce, or an echo that does not match the private expectation, fails establishment before projection or publication. |
| Component     | Component name, descriptor version, executable name, and executable SHA-256 in the manifest; the descriptor is verified before spawn.                    | Wrong descriptor, stale executable, digest mismatch, or a helper launched by an untracked process fails before bootstrap acceptance.           |
| Launch        | Fresh launch nonce, fresh launch key material, and a fresh TLS session for every launch; no reuse across restarts or reconnects.                         | Old launch material, a superseded session, or a reconnect attempt lacks the current pin and fails; no reattach or replay path exists.          |
| Channel       | Dedicated inherited control descriptor, distinct control/data channel nonces, fixed TLS roles, and ALPN `provider-publication-control/1`.                | Control bytes on the data stream, data RPC on the control stream, wrong ALPN, wrong role, or a crossed channel fails and revokes the launch.   |
| Session       | The 32-byte launch nonce is the record `session_id`; per-direction application sequence starts at `1`; the sender role is fixed per record kind.         | Wrong session, wrong sender, sequence `0`, duplicate, stale, skipped, or reordered records revoke the session before body acceptance.          |
| Publication   | `publication_id` is the launch nonce plus the Core-owned publication version; the tuple carries the source-view `snapshot_version` and canonical digest. | A different identity, version, snapshot version, digest, lifetime, or feed revision is refused before acknowledgement or proof.                |

UID/SID/ACL equality, same-user endpoint access, process-ID inference, and
caller-supplied identity echoes are defense in depth only. They do not establish
the delegation. A same-user process that only holds a duplicated control or data
handle cannot produce a CertificateVerify signature or Finished under the pinned
key, and cannot satisfy the manifest echo or the per-session sequence.

### What the ingress proves and does not prove

It proves possession of the specific supervisor delegation bound to that
component, launch, and channel, under the trusted-launch assumptions. It does
not prove that a process named Core is universally trustworthy, that the
helper's registry contents are semantically true, that a package publisher is
authentic, or that the host is free of same-user debugger or memory access. The
helper feed is attested as the helper's current authoritative projection, not
as independent evidence about a compromised helper.

Detected leakage, debugger attachment under deployment policy, grant loss, or
suspected compromise requires supervisor-owned launch revocation, child
teardown, and a fresh bootstrap. Old launch material must never authenticate a
replacement session. Undetected theft inside the trusted-memory boundary is a
stated residual risk, not a solved problem.

### Authorization loss, process replacement, and generation confusion

- Authorization loss: a policy withdrawal, grant loss, shutdown, or supervisor
  decision to stop publication revokes locally first, sends
  `Invalidate(L1,R1)` with the `grant loss` or `shutdown` reason, closes
  control, and leaves strict publication disabled. It does not wait for or
  accept a `Lifetime`/`Projection`; no acknowledgement, proof, reservation, or
  handler entry is issued afterward. Re-enabling requires a fresh launch.
- Process replacement: there is no discoverable endpoint to replace. A
  substituted control stream lacks the per-launch private key and exact
  manifest and fails authentication. Replacement of the actual verified
  process revokes the supervisor slot and requires a fresh launch.
- Endpoint replacement in candidate B is precisely the unresolved problem that
  motivates A: PID reuse, ACL changes, endpoint squatting, and a stale listener
  can all satisfy same-user checks without proving the Core delegation.
- Generation/channel confusion: the launch nonce, channel nonces, fixed roles,
  ALPN, session ID, sender byte, sequence, lifetime ID, feed revision, and
  publication tuple are all checked. No caller field can override them. A
  crossed or replayed generation fails closed; it never falls back to a
  tolerant path or a different channel.

### Platform requirements

These are proposed adapter requirements, not claims of tested support. Strict
provider publication stays disabled on a platform until its native evidence
passes.

| Platform                                    | Required inherited-channel handling                                                                                                                                                                                                                                                                                                         | Evidence boundary                                                                                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linux x86_64 (Tier 1), Linux ARM64 (Tier 2) | Create non-inheritable descriptors atomically; explicit per-child spawn actions allow only the intended bootstrap, control, data, and stderr ends; close opposite and unused ends; make surviving control/data descriptors close-on-exec and exclude them from every helper descendant; audit concurrent spawns and descriptor duplication. | Current evidence is Linux-local only. It does not prove the bootstrap. Process memory, `/proc`, and ptrace access can defeat secrecy inside the stated compromise boundary.                                                         |
| FreeBSD x86_64 (Tier 2)                     | Reviewed platform-specific spawn actions and close-on-exec allowlist, including concurrent descriptor creation and fork behavior; no reliance on a PID supplied as zero by existing peer code.                                                                                                                                              | Verify FreeBSD independently under its Tier 2 scheduled evidence. Strict stays disabled until native leakage and revocation tests pass; Linux or generic POSIX behavior is not evidence.                                            |
| NetBSD and OpenBSD (Tier 3)                 | No publication-specific adapter is approved. A future adapter needs reviewed spawn actions, close-on-exec behavior, and descriptor ownership under the same rules as FreeBSD.                                                                                                                                                               | Tier 3 has no CI guarantee. Strict is unsupported until community-maintained native evidence and a separate enablement decision; no cross-tier inference.                                                                           |
| macOS ARM64 (Tier 1), macOS x86_64 (Tier 2) | Reviewed spawn file actions and close-on-exec facilities; inherit only selected descriptors, then close or restore flags; treat task and debugger access as compromise of trusted memory.                                                                                                                                                   | macOS-native tests are required for each enabled architecture. POSIX citations and Unix UID checks do not prove the adapter; strict stays disabled until they pass.                                                                 |
| Windows x86_64 (Tier 1)                     | Reviewed `STARTUPINFOEX` explicit handle list; inheritable child duplicates only for the target spawn; non-inheritable parent ends; narrow handle access; close bootstrap and unused handles immediately; clear inheritance on surviving child handles; exclude all from descendants.                                                       | SID/ACL checks alone are insufficient. Native tests must cover concurrent `CreateProcess`, handle duplication and process-access rights, and descendant leakage. The current Core and helper paths fail closed on non-Unix targets. |

Platform tier is not publication enablement. Even a Tier 1 platform keeps
strict publication disabled until the publication-specific native
handle-inheritance, leakage, replacement, and shutdown tests pass.

The bootstrap handle is a dedicated inherited channel: never standard input or
output, never a named path or socket path, never the control stream, and never
multiplexed with data framing. It is unidirectional supervisor-to-helper,
written once, read once to the exact record end, and closed by both sides.
Handle numbers are launch conventions, not secrets. Any read error, timeout,
duplicate delivery, trailing byte, unknown version, wrong descriptor, or
non-EOF close fails the launch.

The cleared child environment preserves only the owning component policy's
explicit allowlist and never carries bootstrap secrets. No helper child may
share control or bootstrap authority. Close-on-exec does not prevent a raw fork
from copying memory or descriptors: helper descendants must use the reviewed
spawn adapter, and uncontrolled fork or secret-bearing process cloning while
authority is live is forbidden.

## Control records, ordering, and bounds

### Record family

The control profile uses the pure `bitty-ipc-api` provider-publication contract
introduced at `e6a2c0c` and consumed by Core at `9493674` and by the AI endpoint
and helper at `e6a2c0c`. The record family is:

| Kind | Name          | Direction        | Purpose                                                                                                                         |
| ---- | ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `Establish`   | Core to helper   | Non-secret establishment echo; compare every field against the private bootstrap expectations; no publication acceptance yet.   |
| 2    | `Established` | Helper to Core   | Same echo plus a fresh non-secret lifetime ID; establishes the current lifetime only.                                           |
| 3    | `Projection`  | Helper to Core   | Bounded atomic registry projection at a feed revision; Core validates and canonicalizes before adopting its read-only view.     |
| 4    | `Publish`     | Core to helper   | Lifetime, feed revision, tuple, and canonical payload; validate origin, lifetime, version, schema, and digest before retention. |
| 5    | `Ack`         | Helper to Core   | Confirms validation and retention of one exact publication; not yet strict proof.                                               |
| 6    | `Bind`        | Core to helper   | Consumes the exact pending acknowledgement once and compares retained bytes with the current registry bytes.                    |
| 7    | `Bound`       | Helper to Core   | Returns an opaque receipt for the live proof after equality; no proof internals leave the helper.                               |
| 8    | `Invalidate`  | Either direction | Predecessor lifetime, pre-rotation feed revision, and a closed reason; revoke locally before enqueueing.                        |
| 9    | `Reserved`    | Neither          | Reserved tag; a receipt is a protocol error.                                                                                    |
| 10   | `Lifetime`    | Helper to Core   | Fresh lifetime ID and feed revision after a local reset, clone, reconstruction, or registry invalidation.                       |
| 11   | `Admit`       | Core to helper   | Current lifetime, feed revision, tuple, receipt, request ID, and exact data-frame digest; reserve one strict request.           |
| 12   | `Admitted`    | Helper to Core   | Confirms reservation only; handler admission rechecks the live proof at frame consumption.                                      |
| 13   | `Error`       | Either direction | Closed error code with fixed local text; no payload, identifier, path, model string, or secret.                                 |

The header is fixed at 49 bytes: magic ASCII `BPPC`, `version:u16` equal to `1`,
`kind:u16`, `sender:u8` (`1` Core, `2` helper), `sequence:u64`, and
`session_id:bytes32` (the launch nonce). Integers are unsigned big-endian.
A variable byte string is a `u32` byte length followed by exactly that many
bytes. There is no padding, compression, extension, duplicate field, unknown
tag, or trailing byte.

`Admit` is the only strict handoff. It is not a new `ai.*` method and does not
change provider-list params or results. The request ID is the existing numeric
JSON `u64` request ID; the data-frame digest is SHA-256 over the exact data-frame
payload bytes, separately from the canonical publication digest. A receipt is a
local lookup handle, never a serialized proof, a caller parameter, a scope, or a
credential.

### Establishment and exact publication

1. The supervisor starts the helper, delivers the bootstrap record, and closes
   its write end.
2. TLS 1.3 and `Establish`/`Established` complete within the establishment
   deadline. The helper compares every echo field against its private bootstrap
   expectations and confirms the role, descriptor, channel, and launch nonce.
3. The helper snapshots the actual authoritative registry and sends exactly one
   `Projection` at a non-zero feed revision.
4. Core validates the bounded feed, canonicalizes it with the shared pure
   canonicalizer, adopts a typed read-only view, allocates a fresh publication
   identity and version, and records one private pending tuple.
5. `Publish`/`Ack`/`Bind`/`Bound` completes within the transaction deadline.
   Core accepts only the exact pending acknowledgement and receipt on its
   current launch. An acknowledgement alone does not authorize a handler.
6. For later strict `ai.provider_list`, Core creates the existing scoped data
   RPC frame, sends `Admit` with the exact data-frame digest and numeric request
   ID, receives `Admitted`, then sends exactly that frame over the data channel.
   The helper matches bytes, digest, method, request ID, and current lifetime,
   consumes the reservation once, and rechecks the live proof while holding the
   registry read gate through the provider-list projection.

No simultaneous publication pipeline exists. Only one publication and one
receipt are pending. A newer valid publication supersedes the prior one; the
old acknowledgement, receipt, and proof cannot be used. A duplicate identity is
refused even when the payload is unchanged. Duplicate, out-of-order, crossed, or
replayed `Ack`, `Bind`, or `Bound` records revoke the session; they are not
idempotent retries and are never answered from retained state.

### Bounds, queues, and deadlines

The exact constants are owned by the pure contract and the AI-owned mechanism
page. The cross-project policy is:

- frame and payload: at most 256 KiB decrypted record bytes excluding the outer
  four-byte length; canonical payload at most `frame - 512`; validate lengths
  with checked arithmetic before allocation;
- inflight: at most 512 KiB per direction, including decoder, queued records,
  and partially decrypted records;
- TLS buffering: at most 64 KiB per direction; the wrapper must not assume one
  application frame fits one TLS record;
- small records: at most 4 KiB for establishment, invalidation, bind, permits,
  and errors;
- queues: at most two records per direction; no drop-oldest for
  acknowledgement, invalidation, lifetime, or proof records;
- pending state: one publication, one acknowledgement, one receipt, one strict
  reservation, and one current plus one immediately retired lifetime identifier;
- deadlines: five seconds from spawn for establishment, five seconds for a
  whole publication transaction (not renewed per partial byte), and sixty
  seconds of absolute publication-authority age;
- rates: 100 records per second sustained, burst 200 in one second; excess
  revokes rather than retaining a backlog.

Every limit is a policy constant defined once by the wire contract and covered
by shared tests. Exhaustion, queue overflow, blocked writes, an undeliverable
invalidation, and checked overflow revoke and close publication control. They
must not drop an acknowledgement or invalidation and continue strict serving.
No timeout is extended by activity, and all deadlines are monotonic.

### Compatibility and unknown-version refusal

Only version `1` and the exact profile string are accepted. Unknown bootstrap
format, control protocol, record version, kind, sender, reason, error code,
key-material profile, or key type is refused; no downgrade, best-effort
interpretation, or forward-compatible extension is allowed within version `1`.
A future version requires a new reviewed decision, a new ALPN profile, new
golden vectors, and new consumer pins. It must not silently reuse the version
`1` parser or weaken an existing bound.

The control stream begins with TLS, never with a bitty IPC frame. Never sniff an
RPC payload to auto-enable control or `ai.*`. Bytes on the wrong stream revoke
before acknowledgement, proof, handler, provider, credential, or tool contact.

## Replay protection

### Transport and session replay

TLS 1.3 record protection and sequence numbers reject modified or replayed
ciphertext. They do not replace application state order. On top of TLS:

- each direction has an expected sequence starting at `1`; duplicate, stale,
  skipped, reordered, or zero sequences revoke;
- the `session_id` must equal the established launch nonce; a record from
  another launch, session, or channel revokes;
- the sender byte must match the fixed direction of the kind; role reflection
  revokes;
- the record must decode exactly, with no unknown tag, trailing byte, or
  contradictory establishment nonce;
- the current lifetime ID and feed revision must match; older revisions and
  older lifetimes are refused even when their bytes are identical.

Sequence numbers are not authority and never reset on lifetime rotation,
publication replacement, or key update.

### Publication and lifetime replay

Core owns a monotonic publication version per control session. The version
starts at `1`, strictly increases on every republish, and never wraps. It is
carried in the `publication_id` together with the launch nonce, so an identity
never repeats within a Core run and does not repeat across fresh launches
except with negligible random-nonce collision probability. The control session
owns the version high-water mark outside the replaceable publication-state
object.

Core also owns the independent source-view `snapshot_version`: it starts at `1`
for the first adopted projection, advances only when Core adopts a replacement
projection, and never resets on a publication-only re-mint. Neither version is
inferred from the helper feed revision, the generic IPC `snapshot_version`
field, MCP `list_version`, or a caller value.

The helper creates the private lifetime capability and the non-secret lifetime ID.
The capability includes a fresh OS-random `LIFETIME_SECRET_BYTES` value that is
never serialized and is not reconstructible from the protocol-visible tuple. A proof
references the shared revocation cell and that private capability; it does not
merely compare the public ID or publication fields.

### State reconstruction with identical inputs (AI-0330)

The AI-0330 regression is a required acceptance case, not an optional test. In
the same live process, control connection, data channel, and session, an
implementation must be able to reconstruct publication state and replay
identical `Publish`, `Ack`, and `Bind` inputs. The old proof must refuse even
when all of the following repeat:

- exact canonical publication bytes and digest;
- protocol-visible identity and publication version;
- registry feed revision and current snapshot version;
- local epoch, process, channel, and session identifiers.

The refusal must hold against both the old endpoint object and the newly
constructed endpoint object. A guessed process-global counter, ephemeral
pointer, caller boolean, self-asserted field, timestamp, fixed seed, or copied
protocol-visible tuple is not Core authority and does not satisfy this case. The
distinguishing mechanism is the fresh private lifetime capability plus the
permanently revoked old cell. Production replay is separately rejected by the
session sequence, lifetime, and version high-water checks before
acknowledgement. The offline fixture does not create a production replay
exception and does not establish authenticated Core origin.

No durable replay history is required, and an ever-growing replay or receipt
history is not permitted: session ordering and publication versions reject
older messages, and revoked cells remain unusable through bounded existing
endpoint handles. Endpoint-handle creation
must reserve from the bounded per-helper allowance; exhaustion refuses the new
handle without copying authority.

## Proof lifetime, rotation, and revocation

### Helper-owned authority object

The helper creates one private authority owner per established control session,
separate from the replaceable `PublicationState`. It owns:

- the serialized revocation gate;
- the current lifetime capability and non-secret lifetime ID;
- one current proof slot and one receipt;
- session, sequence, and publication-version high-water marks;
- the current feed revision and the absolute deadline state.

Only the helper's authenticated-session authority owner may create a lifetime
or a proof. An exposed constructor, deserializer, caller boolean, pointer
identity, or process-global counter cannot mint one. The private lifetime
capability authenticates local provenance and revocability only; authorized
Core origin comes separately from the trusted bootstrap, TLS, and manifest
checks.

A receipt is useful only through a live proof on the established control
session. It is useless from normal IPC, Lua, another launch, or without an
authenticated `Admit`. The receipt is not a general credential and must never
enter caller params, logs, traces, or error text.

### Rotation and invalidation sequences

| Event                                                                                                                                                     | Required sequence                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core-origin invalidation for source-view mutation or supersession of current `L1/R1`                                                                      | Helper revokes `L1` and sends `Lifetime(L2,R1)` then `Projection(L2,R1)`; no registry mutation or refresh request is needed. Core adopts and publishes a fresh greater version.                                                                                                                                                                                             |
| Core source-view mutation (not policy withdrawal)                                                                                                         | Core invalidates local state first, sends `Invalidate(L1,R1)`, and waits for the matching `Lifetime`/`Projection`; no old proof or reservation survives.                                                                                                                                                                                                                    |
| Core policy withdrawal, grant loss, or shutdown                                                                                                           | Core revokes locally first, sends `Invalidate(L1,R1)` with the `grant loss` or `shutdown` reason, and closes control. The helper revokes and sends no `Lifetime` or `Projection`; strict stays disabled and a fresh launch is required.                                                                                                                                     |
| Helper reset, clone, reconstruction, or supersession without mutation                                                                                     | Helper revokes before the operation and sends `Invalidate(L1,R1)`, `Lifetime(L2,R1)`, `Projection(L2,R1)` on the existing authenticated session; no Core refresh request.                                                                                                                                                                                                   |
| Helper registry, model, capability, context/cost, or alias mutation                                                                                       | Under one mutation gate: revoke all shared lifetimes, acknowledgements, proofs, receipts, and reservations; send `Invalidate(L1,R1)` before changing the registry; apply the atomic mutation and increment the checked feed revision to `R2`; then send `Lifetime(L2,R2)` and `Projection(L2,R2)`. If the invalidation cannot be queued, revoke and close without mutating. |
| Supersession by a newer valid publication                                                                                                                 | Revoke the prior pending acknowledgement, receipt, and proof before accepting the replacement; the old tuple cannot be reused.                                                                                                                                                                                                                                              |
| Absolute authority expiry, timeout, crash, closure, shutdown, grant loss, digest/version change, restart, process/endpoint/generation/channel replacement | Revoke the authoritative slot, all pending state, and every old endpoint proof; close control where applicable; no live rebootstrap.                                                                                                                                                                                                                                        |

The helper retains exactly one immediately retired predecessor `L1/R1` for a
crossed invalidation. If Core's `Invalidate(L1,R1)` arrives after the helper has
already rotated to `L2`, consume it once as correlation only, without rotating
`L2` again or duplicating its announcement. A second duplicate, an unrelated
older predecessor, or more than one outrun rotation closes publication control
and leaves strict disabled. Never guess or revive a lifetime.

A valid Core-origin invalidation for source-view mutation or supersession of
the current lifetime is the only Core-origin case that lets the helper rotate
without a registry mutation. Policy withdrawal, grant loss, and shutdown are
not rotation cases: they close control and disable strict. A helper-origin
reset, clone, or reconstruction announces the new lifetime unsolicited. Every
`Projection` is legal only immediately after its matching `Lifetime` or the
initial `Established`, exactly once. All such announcements are helper
authority over the publication lifetime, not Core authority, and Core must
adopt the view and issue a fresh tuple.

### Revocation triggers

Revocation is irreversible and precedes any replacement. It is required on:

- any reset, semantic clone, reconstruction, or supersession;
- any source-view, registry, model, capability, context/cost, or alias mutation;
- authorization loss, policy withdrawal, grant loss, shutdown, or operator
  teardown;
- establishment, transaction, or absolute-authority timeout;
- any framing, authentication, manifest, sequence, version, lifetime, or
  digest failure;
- control or data EOF, crash, kill, or observed peer death;
- executable digest or descriptor version replacement;
- process, endpoint, generation, or channel replacement;
- restart or fresh launch.

Revocation makes the shared cell irreversibly unusable before any cooperative
cleanup. Old proofs hold no independent secret copies; a drop of a live owner
revokes its cells and closes control. Copying secret-bearing state or deriving
an ordinary value `Clone` is forbidden. A requested state clone revokes its
source before returning a fresh unbound state. A read-only endpoint handle may
share the owner cell, but cannot copy a live proof into a new independent owner.
If ownership cannot be preserved, the operation fails closed.

### Expiry versus tolerant lifecycle

The initial policy is no live control rebootstrap. At the 60-second authority
deadline, or at a transaction or budget expiry, both sides permanently disable
provider-publication authority for that resident launch, revoke all old cells,
receipts, and strict reservations, and close control. Do not reissue launch key
material, reset TLS counters, reuse a session/channel ID, or attach a fresh TLS
session to the existing helper. That would require a separately reviewed
secondary bootstrap/rekey protocol.

The data stream and tolerant requests keep their existing scopes, deadlines,
response correlation, and supervisor lifecycle. A tolerant operation submitted
before authority expiry may finish under its own deadline after authority
expires; no routine authority timer kills it, resets helper registry or session
state, or triggers respawn. Strict requests not yet admitted fail closed; an
already admitted bounded provider-list read may finish with its pre-expiry
linearization. No post-expiry acknowledgement, proof, or new handler entry is
allowed. Publication authority returns only on an independently safe fresh
launch; publication expiry does not request a restart.

### Disposal and residual risk

Revocation and disposal are separate obligations. Logical invalidation does not
wait for erasure and does not depend on its success. Cooperative cleanup covers
only owned accessible buffers, revocation-cell storage, and library key storage
for which the approved library provides reviewed zeroization support. It does
not guarantee erasure of compiler copies, registers, stack remnants,
kernel/pipe buffers, core dumps, snapshots, or inaccessible internal
allocations. Crash export and key logging remain disabled; deployment dump and
debug restrictions remain necessary. A process killed abruptly cannot run
destructors; the surviving side must fence old slots and receipts and require a
new trusted launch.

## Fail-closed behavior

The required order is:

1. Validate stream identity, TLS role, ALPN, session, record version, sender,
   sequence, and exact decoding.
2. Validate the establishment echo against the private manifest, including the
   instance, launch, component, descriptor, executable digest, channel nonces,
   purpose, and profile.
3. Validate the current lifetime, feed revision, publication identity, version,
   snapshot version, domain, schema, canonical bytes, digest, and bounds.
4. Consume the exact pending acknowledgement once, compare retained bytes with
   the current authoritative registry under the registry read gate, and issue
   the proof only on exact equality.
5. For strict admission, validate the live receipt, request ID, exact data-frame
   digest, method, and current lifetime; reserve once; recheck the live proof
   while holding the registry read gate through the projection.
6. Only then contact the scoped handler.

Authority failures refuse before publication acknowledgement or proof issuance.
Strict admission failures refuse before handler, provider implementation,
provider I/O, credential resolver, tool, or extension contact. Publication and
schema validation are pure metadata work; they do not call a provider.

Additional requirements:

- Refusal is local and immediate. A failed authority check closes the session
  or launch; it does not wait for a diagnostic write.
- An authenticated `Error` record is best effort and never a blocking
  dependency of local revocation. Fixed local diagnostic text must not echo
  payloads, identifiers, paths, model strings, secrets, certificates, keys, or
  parser details.
- No failure falls back to tolerant publication for the strict target, to a
  different channel, to a weaker profile, to an unauthenticated endpoint, or to
  ambient provider access. Tolerant non-strict behavior continues under its own
  contract.
- Safe mode and standalone startup do not depend on the control session. The
  absence of bootstrap or TLS support disables strict publication only.
- Malformed, truncated, oversized, or trailing-byte input is rejected before
  allocation or conversion. Unknown versions, kinds, senders, reasons, and
  error codes revoke rather than being ignored.
- Queue overflow, blocked write, undeliverable invalidation, rate excess,
  checked overflow, RNG failure, and duplicate random identifier all revoke;
  none retries with a timestamp, pointer, counter, fixed seed, or guessed value.
- A caller cannot set or override authority with a boolean, identity field,
  version, digest, projection, receipt, or generic snapshot parameter.

## Metadata source mapping

Two source options were considered:

| Option                                   | Disposition and reason                                                                                                                                                                                                                                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Independent shared registration metadata | Rejected. It creates a second registry population path, duplicate semantics, and drift between Core and the helper's authoritative `ProviderRegistry`; it also widens the metadata trust boundary without improving exact equality.                                                                      |
| Helper-to-Core read-only projection feed | Selected. The helper constructs `Projection` from the same populated registry read view used by `ai.provider_list`, grouped and sorted under R1's exact rules. Core parses the bounded feed, derives canonical bytes itself, adopts a typed read-only view, and assigns Core-owned identity and version. |

Ownership remains split as follows:

| Owner      | Owns                                                                                                                                                                                                             | Does not own                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Core       | Core publication identity and version, source-view snapshot version, the accepted read-only source view, invalidation on its own view mutation, acknowledgement and receipt handling                             | Helper lifetime, helper proof or receipt, the authoritative populated `ProviderRegistry`              |
| The helper | Helper lifetime, proof and receipt, the authoritative populated `ProviderRegistry`, aliases, selection, provider I/O, credentials, the registry read/mutation gate, retained exact bytes, and the equality proof | Core publication identity or version, Core source-view snapshot version, Core's read-only source view |

The helper feed is not independent evidence that a malicious helper supplied
truthful registration data; the trusted helper and its registration policy
remain inside that semantic trust boundary. Neither side may include provider
display names, free-form routing facts, aliases, selection results, provider
clients, request data, credentials, implementation state, or model
prompt/content in the projection. The projection is credential-free metadata.

Current baseline: the helper launch entrypoint uses `ControlOnlyRegistry`, a
fixed empty projection at feed revision `1` with no provider or credential
integration. Helper ownership of a populated `ProviderRegistry` is therefore the
target contract, not current integrated evidence; real registry integration
remains Q8.

Every provider, model, capability, context/cost, or alias mutation follows the
mutation sequence in [Rotation and invalidation sequences](#rotation-and-invalidation-sequences).
An alias-only mutation still increments the feed revision and forces a fresh
publication and lifetime, even though aliases are excluded from the initial
provider-list projection. A mutator serialized after an admitted strict read
may run only after that bounded read finishes; its response belongs to the
pre-mutation revision. A mutator serialized first prevents handler entry. No
check-then-unlocked-read window is permitted.

Existing generic `ServiceMetadata` and its local acknowledgement are not this
source. MCP `list_version`, generic AI `snapshot_version`, and other domains are
not provider-routing authority. The accepted R1 projection and this feed remain
the only source for strict `ai.provider_list`.

## Audit evidence

Audit evidence here means two separate things, and neither is a compliance
ledger:

1. **Runtime decision records**: bounded, typed local records that show which
   authority decision was made, in which order, and why it was refused.
2. **Delivery evidence**: CI, adversarial, platform, and independent-review
   artifacts that prove the control behavior and are recorded in CarryCtx.

### Runtime decision record contract

A proposed minimum event set, emitted at the decision point and never on the
control or data stream. Every record carries the common fields `schema_version`,
`event`, `actor`, `outcome`, and `local_ordinal`; the table lists only
event-specific fields.

| ID     | Event                      | Event-specific fields                                                  |
| ------ | -------------------------- | ---------------------------------------------------------------------- |
| AUD-1  | `launch_refused`           | fixed reason class, platform class                                     |
| AUD-2  | `session_established`      | profile version, component class                                       |
| AUD-3  | `projection_adopted`       | feed revision, snapshot version, canonical digest                      |
| AUD-4  | `publication_published`    | publication version, snapshot version, feed revision, canonical digest |
| AUD-5  | `publication_acknowledged` | publication version, feed revision                                     |
| AUD-6  | `proof_bound`              | publication version, feed revision                                     |
| AUD-7  | `strict_admitted`          | request ordinal, publication version, data-frame digest                |
| AUD-8  | `strict_refused`           | fixed reason class, request ordinal when available                     |
| AUD-9  | `lifetime_rotated`         | fixed reason class, feed revision                                      |
| AUD-10 | `authority_revoked`        | fixed reason class                                                     |
| AUD-11 | `resource_refused`         | fixed limit class                                                      |
| AUD-12 | `platform_unsupported`     | platform class                                                         |
| AUD-13 | `audit_dropped`            | drop count                                                             |

The record must not carry launch nonces, lifetime IDs, receipt or
acknowledgement IDs, certificates, keys, key material, paths, usernames,
hostnames, addresses, provider or model strings, capability labels, payload
bytes, or free-form error text. Canonical digests are permitted only as bounded
correlation handles over credential-free, non-secret provider-routing metadata;
they are not authority. A digest can confirm an observer's guess about that
metadata, so a caller or sink that must not learn that confirmation must not
receive audit records.

No audit data is added to the control record family. Adding an audit record kind
or a data-stream field would change the wire contract and is out of scope.

### Sink, retention, and access

The recommended default is exactly one bounded in-memory audit ring per
process: the Core publication-control owner holds the Core ring and the helper
authority owner holds the helper ring. Records never cross the control or data
stream; tests read each side's ring locally. Proposed bounds are
`AUDIT_RING_MAX_RECORDS = 256` per process and `AUDIT_RECORD_MAX_BYTES = 512`,
with drop-oldest and an explicit drop counter. Q2 may refine the values, but
per-process isolation and non-crossing are not optional. No file, export, or
remote sink is enabled by default. An opt-in local file, if later approved, must
reuse the observability boundary's user-only permissions, typed redaction,
export preview, and capability/consent gate; it must not be invented here.
Publication audit records are not exposed to plugins, Lua, external IPC, MCP, or
the component broker. A future external observation kind requires the
observability owner's contract and review.

Security acceptance evidence is retained in CI output, test fixtures, and
CarryCtx review records, not read from product logs. Runtime records support
diagnosis and test assertions; they are not a tamper-evident ledger and make no
non-repudiation claim.

### Failure policy and review use

Audit recording is not an authorization input. Failure to allocate or record an
audit event must not fail open, and must not fail closed by denying an otherwise
authorized local operation; it increments the bounded drop counter. A requirement
for fail-closed audit writes would be a separate availability decision with a
new denial-of-service analysis, not an implied control here.

Refusal evidence must show zero side effects: instrumented counters for
handler, provider implementation, provider I/O, credential resolver, tool, and
extension entry must remain zero for every authority refusal. A reviewer samples
the event schema, checks the forbidden-field list, and confirms that seeded
secrets, keys, model strings, and payloads never appear. P0-AC-026 and the
observability redaction rules apply unchanged.

## Component broker boundary

### Current component shapes

| Path                              | Role                                                                                                                                                                                                                                     | Publication authority                                                                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bitty_runtime::component` broker | DIR-030 request/response broker: resolves and verifies a component, spawns it, completes native-component wire v1, multiplexes requests by ID, idle-stops after the component timeout, handles crashes, and computes per-request grants. | None. It is not a publication authority, parser, relay, cache, or policy point.                                                                                                        |
| `bitty_runtime::ai_helper`        | Resident-singleton AI helper supervisor; no idle stop; reuses broker resolution, digest verification, crash tracking, cleared environment, and stderr ring; speaks bitty-ipc framing over stdio.                                         | It owns the data path and supervision only; it does not own publication state.                                                                                                         |
| `ai_publication_launch`           | Feature-gated Core launch seam: generates launch material, encodes the bootstrap record, creates the one-shot bootstrap channel and duplex control channel, and establishes the TLS 1.3 client.                                          | It owns the Core side of the launch/control session, not provider or registry authority.                                                                                               |
| `bitty-ai-helper`                 | Helper launch entrypoint: adopts the inherited bootstrap/control descriptors, runs the TLS server, and drives the helper publication state machine.                                                                                      | It owns the helper lifetime, proof, and authoritative populated registry (currently `ControlOnlyRegistry`); it does not own Core publication identity or Core's read-only source view. |

At this baseline the Core launch seam is not wired to the AI helper spawn. The
two sides are separately testable but are not integrated evidence.

### Boundary rules

- **CB-1.** The broker stays generic. It exposes no publication-specific method,
  record parser, state machine, key material, control handle, or authority
  decision. Adding such a surface would require a separate DIR-030 decision.
- **CB-2.** The broker may own process lifecycle, but publication authority is
  owned by the launch/control owner. A broker stop, crash restart, backoff, or
  replacement must revoke publication authority and require a fresh launch with
  fresh material; the broker must never restart a helper into an old lifetime or
  replay an old session.
- **CB-3.** Broker grants are not publication delegation. The publication
  control channel is Core-internal, is not a `[components]` manifest
  declaration, is not a Lua/IPC/MCP capability, and cannot be requested,
  widened, or observed by a plugin or project file.
- **CB-4.** The control channel is a separate inherited descriptor. It is never
  multiplexed into native-component wire v1, bitty-ipc stdio framing, external
  IPC, or a broker request. The broker never sees control records or key
  material.
- **CB-5.** The strict data channel remains the existing AI data RPC, not a
  broker request. `Admit` binds the exact data-frame digest and numeric request
  ID; it does not add a broker-level admission table or a second request
  multiplexer.
- **CB-6.** Broker descriptor and digest verification is necessary but not
  sufficient for publication authority. The launch material, manifest echo, TLS
  pins, lifetime, and proof are additional. The executable verification-to-
  execution race is a shared open gate, not something the publication pin
  closes.
- **CB-7.** Platform support is independent. Broker Windows or WSL support does
  not imply publication support; the publication path fails closed on non-Unix
  targets until native evidence lands.
- **CB-8.** Failure isolation: broker unavailability, crash, or backoff leaves
  strict publication disabled and preserves tolerant behavior; there is no
  fallback to direct provider access, ambient credentials, or a different
  channel.
- **CB-9.** One active publication control session per supervised helper; no
  cross-instance sharing, no shared daemon, and no unbounded endpoint-handle
  table. Handle creation reserves from the bounded allowance.

### Capability, grant, and trust-level separation

The AI helper is an out-of-process native component under DIR-030. Publication
control does not promote it to L0 and does not grant filesystem, network,
process, clipboard, environment, credential, terminal, IPC, or GPU authority
beyond its existing accepted contract. Registry and credential resolution
remain helper-owned under the provider and credential contracts; this design
never asks the helper to expose credentials, and Core never receives provider
credentials. The `Admit` path authorizes one scoped provider-list read, not a
general capability grant. Ordinary scopes and consent checks remain necessary;
control delegation grants none of them.

## Extension publication and R-015 signature-depth boundary

The extension/package publication trust domain is separate from this ingress:

- [R-015](risk-register.md) covers a malicious or compromised plugin update or
  dependency entering the trusted runtime. Its required controls are exact lock,
  checksum, manifest hash, no post-install execution, transactional activation,
  and rollback. It remains `Open`.
- The [package manager boundary](../development/package-manager-boundary.md)
  parks signature and provenance depth to the Package Follow-up RFC owners: the
  accepted OQ-022 contract fixes verifiability direction, while real signature
  verification and the split between install-time and startup verification
  depth remain draft.
- The Package Lifecycle and Follow-up RFCs own publisher trust options,
  registry attestation, key enrollment and rotation, revocation fail-closed, and
  freshness/downgrade resistance (for example PLF-AC-006, PLF-AC-008,
  PLF-AC-009, and PLF-AC-010).
- The plugin manifest capability-authority contract, the plugin store, and the
  package resolver remain separate publication boundaries; no manifest field,
  capability grant, or store record conveys provider-publication delegation.
- This ingress uses ephemeral, per-launch, self-signed leaves pinned by digest.
  Those leaves are not publisher signatures, package provenance, binary
  signing, or a product trust root. They must not be reused for package or
  component install trust, and package publisher keys must not be reused as the
  Core ingress root.
- The control profile has no PKI, no external PSK, no resumption, no session
  tickets, no 0-RTT, and no directory, OCSP, or registry contact. It closes no
  R-015 evidence and creates no cross-domain revocation list.
- A future product signing or attestation root would require a separate
  reviewed decision; the current design does not assert one and does not
  substitute a digest check for publisher identity.

No extension publication contract is changed, weakened, or consumed by this
page. Extension publication remains a separate owner boundary even though both
domains use the words "publication" and "proof".

## Security review

This is a local threat-model extension submitted for review. It changes no
canonical register and marks no mitigation verified.

| Threat or risk trace                                                                       | Required control and test                                                                                                                                                        | Residual trust assumption                                                                                                                                 |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same-user publication injection; T-09, R-011, P0-AC-021/022                                | Restricted per-launch bootstrap, mutual TLS with exact manifest, session sequence, lifetime/version binding; deny a peer with only a data/control handle before acknowledgement. | Kernel, supervisor/helper code, and process-memory protections are trusted. External IPC authentication is unchanged and is not replaced by this control. |
| Replay, clone, reconstruction, old proof; R-011                                            | TLS record protection, application sequence, publication high-water marks, fresh private lifetime, shared irreversible revocation; old/new endpoint refusal in the AI-0330 case. | Protocol-visible tuples may repeat in offline fixtures; arbitrary memory rollback is outside the cryptographic boundary.                                  |
| Feed drift, alias mutation, confused deputy; R-011, R-013                                  | Atomic mutation gate, invalidation before mutation, revision/lifetime match, registry read gate, retained-byte equality, strict-only provider-list scope.                        | The authoritative helper registry and its registration policy are trusted; a feed echo is not independent truth.                                          |
| Credential or child-scope leakage; R-012, P0-AC-023                                        | Credential-free projection, no credentials in control records or Core, cleared allowlisted child environment, no bootstrap in argv/env/files, bounded handles.                   | A stolen launch key can impersonate its delegated bearer until revocation or expiry; detection triggers teardown, not harmlessness.                       |
| Audit or diagnostic exposure; R-014, P0-AC-026                                             | Typed audit schema, forbidden-field list, no default file or export, in-memory bounds, redaction at emission, seeded-secret tests.                                               | Runtime audit is not tamper-evident and not a compliance ledger; durable evidence lives in CI/CarryCtx.                                                   |
| Exhaustion, malformed or unknown protocol; overview invariant 7                            | Pre-allocation size/depth/count limits, byte/record/rate/deadline budgets, checked overflow, bounded fuzz corpus, zero side effects on refusal.                                  | Bounded local denial of service remains possible; tolerant startup and non-strict paths stay usable.                                                      |
| Supply chain, platform adapter, unsafe handle code; R-015, R-018, R-019, P0-AC-028/033/034 | Separate dependency review and audit, narrow audited unsafe adapters, native platform matrices, exact pins.                                                                      | No code-signing or complete same-user isolation is asserted. Unsupported adapters keep strict disabled.                                                   |
| Extension publication confusion; R-015, R-022                                              | Explicit separation from package publisher signatures, registry attestation, revocation, and freshness; no shared keys or trust root.                                            | R-015 remains Open; this design neither mitigates nor worsens package update trust.                                                                       |

Refusal precedes publication acknowledgement or proof issuance on authority
failures and precedes handler, provider implementation, provider I/O,
credential, tool, or extension contact on strict admission failures. Control
authority is not a provider API key, credential reference, login token, or
runtime-administrator grant and must never enter a credential resolver. Safe
mode and standalone startup do not depend on the control session.

## Verification plan

No row is reported passing by this draft. Each implementation or review task
records exact revisions, platform, command, and independent evidence.

| Test group                                     | Required cases and observable pass condition                                                                                                                                                                                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exact positive flow                            | Trusted launch, bootstrap, TLS/manifest echo, real registry feed, Core acceptance, publish/ack/bind/bound/admit, exact data frame, provider-list projection. All tuples and bytes agree; only the scoped handler runs.                                                                                 |
| Unauthorized same-user caller                  | A same-user process with only a data/control handle, a duplicated handle, a wrong bootstrap, a fake manifest, wrong key, wrong role, or wrong descriptor cannot establish; no ack, proof, reservation, or handler entry.                                                                               |
| Wrong channel and stream                       | Control bytes on data, RPC on control, wrong ALPN, wrong sender, wrong session, wrong descriptor, crossed data/control nonce, or a record from another launch is refused before body acceptance.                                                                                                       |
| Stale, future, replay, duplicate, supersession | Stale/future publication versions, duplicate identity, older lifetime, older feed revision, duplicate or out-of-order Ack/Bind/Bound records, and a newer publication superseding a pending one are refused or revoke; old receipt and proof cannot be reused.                                         |
| Reconstruction with identical inputs           | In one live process/channel/session, reconstruct state and replay identical publish/ack/bind bytes and protocol-visible tuple; old proof refuses against both old and new endpoint objects. Production sequence/version checks separately refuse before ack.                                           |
| Source and registry mutation                   | Mutate provider/model/capability/context/cost or alias before, between, and after each step; verify invalidation precedes mutation, feed revision increments, old proof is revoked, and a strict read is bounded by the registry read gate.                                                            |
| Reset and replacement                          | Reset, clone, reconstruction, crash, kill, restart, shutdown, grant loss, timeout, expiry, digest/version change, and process/endpoint/generation/channel replacement revoke all pending state; fresh authority needs a fresh launch and fresh material.                                               |
| Malformed and oversized                        | Every named bound at limit and limit-plus-one; incomplete header, huge length, unknown version/kind/reason/error, trailing bytes, invalid TLS, zero-length records, rate burst, queue saturation, blocked write, RNG failure, and checked overflow cause refusal without allocation or side effects.   |
| Fail-closed ordering                           | Instrument handler, provider, credential, tool, and extension counters at zero for every refusal; assert no ack/proof before authority validation and no handler before live-proof recheck.                                                                                                            |
| Audit evidence                                 | Schema and closed enums match; forbidden fields never appear; seeded secrets, keys, model strings, and payloads are absent; drop counter is bounded; audit failure does not change an authorization decision.                                                                                          |
| Broker boundary                                | Broker exposes no publication API or record path; a broker stop/restart/crash revokes publication authority; a plugin, Lua, IPC, MCP, or `[components]` request cannot obtain the control channel or delegation.                                                                                       |
| Tolerant and standalone                        | No bootstrap, no helper, no provider, safe mode, other `ai.*` methods, MCP `list_version`, generic snapshot version, context/session/tool/extension domains, and a long-lived tolerant helper after authority expiry keep their existing behavior. Strict stays disabled.                              |
| Platform matrix                                | Native Linux, each supported BSD, macOS, and Windows runners cover concurrent spawn, descendant/exec/raw-fork restrictions, fd/handle duplication and leakage, endpoint/process replacement, executable race, environment dump, and shutdown/restart. Unsupported platforms report strict unavailable. |

Property and fuzz coverage checks arbitrary record sequences against the small
state machine, irreversible revocation, bounded storage, and no-contact
invariants. Cryptographic tests use real library vectors and tampered
Finished/ciphertext cases; never a mock that sets an `authenticated` boolean.
Instrumented counters, not prose, are the acceptance evidence for refusal
ordering.

## Alternatives considered

| Alternative                                                             | Disposition and reason                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A: ordinary inherited stdio or private pipe alone                       | Insufficient. Possession of a duplicated handle is not explicit supervisor delegation; add the restricted bootstrap and standard authentication.                                                                                                         |
| B: OS-attested socket or named-pipe endpoint                            | Rejected for this scope. UID/SID/ACL and process identity do not identify the authorized Core delegation; it still needs equivalent bootstrap/authentication plus discoverability, replacement/TOCTOU, per-OS peer APIs, and broader lifecycle handling. |
| B plus binary identity or signing attestation                           | Not selected. No product signing or attestation delivery exists; a future trust root would need a separate decision.                                                                                                                                     |
| Caller metadata, generic version, pointer, or global epoch as authority | Rejected. Repeatable correlators and local identity do not authenticate Core or revoke every old endpoint lifetime.                                                                                                                                      |
| Handwritten challenge/HMAC protocol                                     | Rejected. Standard TLS supplies transcript, role, key schedule, record integrity, and replay properties without inventing cryptography; dependency approval remains a hard gate.                                                                         |
| External-PSK TLS profile                                                | Superseded. No released dependency demonstrated the required profile for both roles; retained as historical record.                                                                                                                                      |
| Launch-scoped mutual certificates                                       | Selected by the AI-owned mechanism ruling. Per-launch self-signed leaves pinned by digest; no PKI; adds certificate generation and validation without removing trusted bootstrap.                                                                        |
| Independent shared registration source                                  | Rejected. Duplicate registry population semantics and drift; the selected feed trusts the authoritative helper and uses exact equality for freshness, not independent truth.                                                                             |
| Serialize a helper proof or persist replay history                      | Rejected. An opaque receipt refers to one live authoritative slot; session ordering, high-water marks, and irreversible revocation give bounded volatile state.                                                                                          |
| New `ai.publish` method or legacy JSON schema expansion                 | Rejected. A separate internal control profile keeps the existing 13 `ai.*` method schemas and bitty-ipc framing intact; no strict enablement is implied.                                                                                                 |
| Broker-owned publication authority                                      | Rejected. The broker stays generic; publication authority belongs to the launch/control owner and the helper lifetime.                                                                                                                                   |
| Live control rebootstrap or seamless strict refresh                     | Rejected for the initial policy. It would require a reviewed secondary bootstrap/rekey protocol; expiry disables strict only and preserves tolerant work.                                                                                                |
| Audit fail-closed or remote audit sink                                  | Rejected for the initial policy. Fail-closed audit turns a local write failure into denial of service; a remote sink adds network and a new trust boundary. An opt-in local file may be added later under the observability contract.                    |
| Reuse package publisher keys or registry trust for ingress              | Rejected. Package publication is long-lived, publisher-scoped, and owner-separate; the ingress is ephemeral, launch-scoped, and not a provenance claim. R-015 remains Open.                                                                              |

## Affected contracts

| Contract                             | Effect of this draft                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 provider/routing contract         | No change to the accepted projection, ownership, or strict admission. This page supplies the residual ingress, replay, and lifetime decision.                                                                                                                                                                                                                                                                                    |
| AI-owned authenticated publication   | Exact records, manifest, certificate profile, constants, and carried gates stay owned there. This page must be cross-linked and must not diverge; conflicts are defects. The registry-mutation ordering here sends `Invalidate(L1,R1)` before the registry changes, which is stricter than that page's current step list; the AI commander must correct it before either page is accepted, and strict stays disabled until then. |
| `bitty-ipc-api` provider-publication | No schema or placement change requested. The merged pure module at `e6a2c0c` stays in `bitty-ipc-api`; it is consumed by Core at `9493674` and by the AI endpoint/helper at `e6a2c0c`. Cross-pin golden vectors remain required before integration.                                                                                                                                                                              |
| Core publication-control feature     | No new public API promised. The feature stays default-off; launch wiring, real registry integration, `Admit`, and strict handler remain separately scoped.                                                                                                                                                                                                                                                                       |
| AI helper control crate              | No new public surface promised. Real registry source, `Admit`, data channel, and provider contact remain pending; strict stays `Unbound`.                                                                                                                                                                                                                                                                                        |
| DIR-030 native component boundary    | The broker remains generic; no broker API, grant, or wire change. Any future broker participation requires a separate decision.                                                                                                                                                                                                                                                                                                  |
| Extension/package publication        | Unchanged. No shared keys, revocation list, trust root, or publisher identity; R-015 and OQ-028/OQ-029 remain owner-separate.                                                                                                                                                                                                                                                                                                    |
| Security corpus                      | This page is a proposed synchronization artifact, not an accepted control. It moves no risk, P0 criterion, evidence row, or open question.                                                                                                                                                                                                                                                                                       |
| Observability and audit              | No new public observation kind or file writer. An opt-in local audit file, if approved later, must reuse the observability boundary.                                                                                                                                                                                                                                                                                             |

This draft assigns no crate placement, dependency change, pin upgrade, or
implementation task. Core, AI, and IPC owners retain their task allocation and
delivery timelines.

## Open points

Each point records alternatives and a recommendation. None is silently decided
by this draft.

| ID  | Open point                                       | Alternatives and recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Core TLS and certificate dependency adoption     | Current evidence: Core's default-off feature pins released `rustls 0.23.46` with `aws-lc-rs` and `bitty-network-publication` at `c8710e0`; that transport crate pins `rcgen 0.13.2` with `aws_lc_rs`. Recommend accepting those exact pins for the feature after the rcgen supply-chain/maturity review, Core dependency audit, MSRV/platform checks, and per-step work bounds. Alternative: switch to `ring`; rejected for now because it would add a second provider family and require revalidation, not reduce the review.                                                    |
| Q2  | Audit sink and retention                         | Recommend one bounded in-memory ring per process (Core publication-control owner and helper authority owner), never crossing the control/data stream, with `AUDIT_RING_MAX_RECORDS = 256`, `AUDIT_RECORD_MAX_BYTES = 512`, and drop counters. Confirm or refine those bounds here; no default file or export. Opt-in local file only through the observability contract. Alternatives: always-on local file (rejected: default persistence and redaction surface), remote sink (rejected: new network and trust boundary), fail-closed audit (rejected: local denial of service). |
| Q3  | Audit tamper-evidence                            | Recommend deferring. No requirement demands a tamper-evident ledger; acceptance evidence is CI/CarryCtx. Alternatives: hash-chained local log, signed audit export; both need a separate threat model and key-management decision.                                                                                                                                                                                                                                                                                                                                                |
| Q4  | Broker ownership of AI helper lifecycle          | Recommend keeping the broker generic and the publication launch/lifetime owner separate. If a future broker owns AI helper lifecycle, it must call publication revocation on stop/restart/backoff and never restart into an old lifetime; that is a new DIR-030 decision.                                                                                                                                                                                                                                                                                                         |
| Q5  | Executable verification-to-execution race        | Recommend a reviewed stable-file/launch binding or equivalent platform enforcement before strict enablement. The current digest check alone does not close the race; a signature is not required by this design and would be a separate trust-root decision.                                                                                                                                                                                                                                                                                                                      |
| Q6  | Per-platform enablement                          | Recommend strict disabled on every platform until its native handle-inheritance, leakage, replacement, and shutdown tests pass. Linux-local evidence does not enable BSD, macOS, or Windows. No cross-platform promise is made by this draft.                                                                                                                                                                                                                                                                                                                                     |
| Q7  | Authority lifetime and renewal                   | Recommend the 60-second absolute publication-authority age with no live rebootstrap; fresh authority requires an independently safe fresh launch. Alternatives: longer lifetime, in-place renewal, or reconnect; all need a reviewed secondary protocol and are not selected.                                                                                                                                                                                                                                                                                                     |
| Q8  | Core-helper integration and real registry source | Pending. The Core launch seam is not wired to the AI helper, and the helper uses `ControlOnlyRegistry`. The merged AI-0327 exact-byte binding is a prerequisite; equal digests alone are not equality evidence. Recommend completing integration, real registry projection, the AI-0330 regression, and cross-pin vectors before AI-0329 enables only `ai.provider_list`.                                                                                                                                                                                                         |
| Q9  | Audit exposure to external observers             | Recommend no plugin, Lua, IPC, MCP, or broker access to publication audit records. A future observation kind is an observability contract change, not a publication-control change.                                                                                                                                                                                                                                                                                                                                                                                               |
| Q10 | Product signing or attestation root              | Not selected. A future root could strengthen binary identity, but no delivery exists and it would not replace the launch key or proof lifetime. Record as a separate future trust-root decision, not an implied control.                                                                                                                                                                                                                                                                                                                                                          |

The carried gates from the AI-owned mechanism ruling remain open and are not
discharged here: certificate-pin shape (resolved as DER in the current draft
but still requiring review acceptance), key-generation cost and bounds, launch
key-material zeroization limits, rcgen supply chain, rustls crypto-provider
choice, per-platform bootstrap-handle evidence, per-step work accounting,
handshake bound revalidation with real certificate sizes, and launch material
ownership/bootstrap direction (drafted, not accepted).

## Acceptance criteria

- Independent architecture, security, and documentation reviewers accept or
  conditionally accept D1 through D10, with no blocking finding and no implicit
  strict enablement.
- The identity model distinguishes the authorized Core component, instance, and
  channel from another same-user process without relying on UID/SID/ACL
  equality, pipe possession, caller echoes, or process-global counters.
- Replay protection covers TLS, session sequence, publication version, snapshot
  version, lifetime, feed revision, and the AI-0330 reconstruction case against
  both old and new endpoint objects.
- Proof lifetime, rotation, revocation, expiry, and the tolerant-path boundary
  are explicit; no old proof survives reset, clone, reconstruction, mutation,
  replacement, authorization loss, timeout, crash, or restart.
- Refusal precedes acknowledgement, proof, reservation, handler, provider,
  credential, tool, and extension contact; instrumented counters prove it.
- The metadata source is the helper projection feed; Core and helper ownership
  remains split; generic `ServiceMetadata`, MCP `list_version`, and generic
  snapshot versions are not authority.
- The audit evidence contract defines bounded records, forbidden fields, sink,
  retention, failure policy, and review use without inventing a compliance
  ledger or a remote trust boundary.
- The DIR-030 broker remains generic and cannot parse, relay, mint, cache, or
  authorize publication authority; lifecycle restart revokes authority.
- Extension/package publication and R-015 signature-depth separation is
  explicit; no shared keys, revocation, freshness, or publisher identity.
- Strict publication remains disabled and scoped to `ai.provider_list`; no
  completion, context, MCP, tools, extensions, or other `ai.*` method is
  enabled.
- Every carried gate has a named owner and recorded evidence before strict
  enablement; documentation alone satisfies none of them.

## P0 Review Sign-off

No sign-off is recorded for this page. The prior conditional approvals on the
AI-owned mechanism page apply to that page only and do not transfer here.

| Lens                              | Status  | Required focus                                                                                                         |
| --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| Independent architecture owner    | Pending | Ingress model, record ordering, source mapping, broker boundary, and cross-project ownership.                          |
| Independent security reviewer     | Pending | Threat boundaries, replay and lifetime isolation, fail-closed ordering, audit evidence, dependency and platform gates. |
| Independent documentation curator | Pending | Status, spine, terminology, links, routes, English-only content, and no implementation claim.                          |
| Core commander                    | Pending | Core launch/lifetime ownership, broker boundary, platform/dependency gates, and strict scope fence.                    |
| AI commander                      | Pending | Helper lifetime/proof, registry source, AI-0330/AI-0329 sequencing, and AI-owned page synchronization.                 |
| IPC owner                         | Pending | Pure record contract placement, cross-pin compatibility, and no schema/dependency change.                              |

## References

- [Core #2199](https://github.com/bitty-terminal/bitty/issues/2199), the design
  request; [Core #2330](https://github.com/bitty-terminal/bitty/pull/2330),
  provider-publication control state machine; [Core #2286](https://github.com/bitty-terminal/bitty/pull/2286),
  feature-gated launch seam.
- [Core main `f246dc55`](https://github.com/bitty-terminal/bitty/tree/f246dc5589c779f652d13125bfa79b2dffd64ec8)
  and [Core #2330 squash `3171f4f5`](https://github.com/bitty-terminal/bitty/commit/3171f4f5d054d6d864aa743e59581a2b013f8420).
- [IPC #35 `e6a2c0c`](https://github.com/bitty-terminal/bitty-ipc/pull/35),
  provider-publication control-record contract; [IPC `9493674`](https://github.com/bitty-terminal/bitty-ipc/commit/9493674),
  current Core pin.
- [bitty-network #95 `c8710e0`](https://github.com/bitty-terminal/bitty-network/pull/95),
  launch material and mutual-certificate control client.
- [AI-0327 / PR #523 `a2bb62a`](https://github.com/bitty-terminal/bitty-ai/pull/523),
  exact-byte offline binding; [AI-0330 / #522](https://github.com/bitty-terminal/bitty-ai/issues/522),
  lifetime isolation; [AI-0329 / #521](https://github.com/bitty-terminal/bitty-ai/issues/521),
  strict `ai.provider_list` enablement.
- [AI #526 `8a11c47`](https://github.com/bitty-terminal/bitty-ai/pull/526),
  proof lifetime binding; [AI #529 `6c0832d`](https://github.com/bitty-terminal/bitty-ai/pull/529),
  helper TLS server; [AI #536 `5fd49b8`](https://github.com/bitty-terminal/bitty-ai/pull/536),
  helper state machine; [AI #539 `44d0c9d`](https://github.com/bitty-terminal/bitty-ai/pull/539),
  launch entrypoint.
- [Authenticated provider publication](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/architecture/authenticated-provider-publication.md)
  and [Execution ownership R1](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/architecture/execution-ownership-r1.md#providerrouting-snapshot-binding-contract-accepted-2026-10-17).
- [Security overview](overview.md), [threat model](threat-model.md),
  [P0 acceptance criteria](p0-acceptance-criteria.md),
  [risk register](risk-register.md), and [evidence matrix](evidence-matrix.md).
- [Native component boundary](../development/native-component-boundary.md),
  [Package manager boundary](../development/package-manager-boundary.md),
  [Observability boundary](../development/observability-boundary.md), and
  [ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md).
- [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md),
  [Package Lifecycle RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-lifecycle-rfc.md),
  and [Package Follow-up RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-followup-rfc.md).
