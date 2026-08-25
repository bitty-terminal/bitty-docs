# Persona catalog

Choose the narrowest persona that matches the task. The commander coordinates;
specialists own scoped work; the reviewer independently verifies acceptance.
Do not combine similar personas merely to increase agent count.

## Core delivery roles

| Persona                                 | Use for                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| [Commander](commander.md)               | Task graph, teams, scopes, dispatch, integration, and final acceptance.         |
| [Architect](architect.md)               | Product and technical boundaries, alternatives, and versioned contracts.        |
| [Implementer](implementer.md)           | One approved feature or initialization change in an exact scope.                |
| [Reviewer](reviewer.md)                 | Independent correctness, contract, docs-sync, and evidence review.              |
| [Security auditor](security-auditor.md) | Trust boundaries, adversarial cases, capabilities, resources, and supply chain. |

## Documentation roles

| Persona                                                     | Use for                                                                           |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Docs curator](docs-curator.md)                             | Corpus-wide authority, status, terminology, provenance, and navigation coherence. |
| [Documentation architect](documentation-architect.md)       | Taxonomy, metadata, ownership, lifecycle, versioning, and migration design.       |
| [Technical writer](technical-writer.md)                     | Verified task-oriented user guides and troubleshooting.                           |
| [API reference editor](api-reference-editor.md)             | Exact versioned CLI, configuration, Lua, plugin, and protocol reference.          |
| [Developer guide maintainer](developer-guide-maintainer.md) | Reproducible contributor setup, build, test, debug, and delivery guidance.        |
| [Website content integrator](website-content-integrator.md) | Pinned publication, schema, paths, redirects, and cross-repository website work.  |
| [Release notes editor](release-notes-editor.md)             | Evidence-based version impact, migration, deprecation, and known-issue notes.     |

Use the docs curator when a change crosses several document types. Use a focused
persona when the authority and deliverable are narrow. Security-sensitive work
still requires the security auditor regardless of the writing persona.
