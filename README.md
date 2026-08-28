# bitty-docs

`bitty-docs` is the canonical design and governance repository for the Bitty
terminal project. The project is currently in a **documentation-first,
pre-implementation phase**: these documents describe intent, accepted working
directions, normative requirements, candidates, and open questions. They do
not claim that product code exists or that a proposed design has shipped.

## Start here

- [Documentation map](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/README.md) — topic-oriented navigation and authority
  rules.
- [User guide](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/user-guide/README.md) — an honest pre-implementation plan
  for future user tasks, without invented commands.
- [Development](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/development/README.md) — contributor entry point and
  delivery expectations.
- [Reference](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/reference/README.md) — planned factual interface reference,
  clearly separated from design proposals.
- [Product vision](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/product/vision.md) — the user problem, scope, and
  product principles.
- [Architecture overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/architecture/overview.md) — current system model
  and architectural status.
- [Security overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/overview.md) — normative security
  requirements for future implementation.
- [Decision register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/index.md) — accepted directions,
  normative contracts, and candidate decisions.
- [Open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md) — unresolved work
  that must not be silently treated as decided.
- [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/isolation-resource-rfc.md) — accepted isolation boundaries, resource ceilings, and failure semantics with adversarial tests for OQ-014 (2026-08-28).
- [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/ipc-agent-rfc.md) — draft bounded framing, wire/auth/scopes and Agent bounded messages, auth/consent/streaming for OQ-018.
- [CLI Contract RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/cli-contract-rfc.md) — draft top-level commands, dynamic `bitty x` namespace, action/output schemas, aliases, and exit codes 0-8 for OQ-017.
- [Governance RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/governance-rfc.md) — draft licenses, branch protections, ownership, compatibility policy, and cross-repository release flow for OQ-024.
- [Risk Evidence RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/risk-evidence-rfc.md) — draft risk-to-P0-AC traceability, evidence taxonomy, and review gates for OQ-025.
- [Docs-first TODO](https://github.com/bitty-terminal/bitty-docs/blob/main/TODO.md) — documentation and initialization work before
  product implementation.
- [Shared-conversation coverage](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/sources/chatgpt-share-coverage.md) —
  traceability from the 20-turn historical design conversation to canonical
  documents.

## Documentation system

English is the only canonical documentation language. Internationalization,
translations, locale directories, and multilingual routing are deferred until a
reviewed cross-repository decision defines their ownership and synchronization.

Every document under `docs/` uses a flat validated metadata schema. Metadata
controls audience, type, status, publication eligibility, and navigation order;
it never turns a proposal into implementation evidence. See the normative
[documentation workflow](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/development/documentation-workflow.md).

No website content consumer exists yet. A future independent `bitty-website`
integration must consume only eligible documents from an immutable pinned
`bitty-docs` revision and must present canonical content without copying
specifications. The ownership, validation, link, redirect, and cross-repository
rules live in the
[website content contract](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/website-content-contract.md).

## Status and authority

Each document should distinguish among these states:

- **Normative requirement**: a constraint future implementations must satisfy.
- **Accepted working direction**: current intent, still subject to an ADR or RFC
  where the mechanism or compatibility contract is not settled.
- **Candidate**: a proposal retained for evaluation, not a decision.
- **Open**: an unresolved question or risk.
- **Implemented**: requires evidence from a product repository and must not be
  inferred from design prose.

When statements conflict, normative security documents take precedence over
historical source notes. Accepted direction and decision status live in the
[decision register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/index.md); unresolved matters live in the
[open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md). Source records are
provenance, not an alternative specification.

## Repository role

`bitty-docs` is one of the independent repositories under the
[`bitty-terminal`](https://github.com/bitty-terminal) organization. The local
umbrella directory only groups repositories; repository boundaries and current
remote state are documented in the
[repository map](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/repository-map.md).

Contributors should make documentation changes through the target repository's
CarryCtx task and scope, preserve provenance, and update affected navigation,
decision, open-question, and source records together. See the workspace
`AGENTS.md` and this repository's `AGENTS.md` before working.

The normal delivery lifecycle is Issue, CarryCtx task, branch/worktree, commit,
pull request, independent review plus CI, merge, and final task checkpoint. The
current unborn repository uses a strictly scoped shared-checkout exception until
the first commit. Documentation synchronization is part of the definition of
done for every affected product or governance change.
