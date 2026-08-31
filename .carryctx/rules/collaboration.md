# Collaboration and workspace rules

1. CarryCtx is the durable coordination record. Use named sessions, task claims,
   declared scopes, progress/risk/block notes, decisions, and checkpoints.
2. Subagents perform scoped implementation. The commander dispatches independent
   work, reads results back from CarryCtx, verifies diffs, and owns integration.
3. Prefer one Git worktree per implementation task. In a shared checkout, work
   only within explicitly disjoint scopes and preserve unrelated/untracked files.
4. Run Git and CarryCtx inside the named child repository; the umbrella workspace
   root is not a Git repository.
5. For source analysis use ctxctl in this order: `outline`, targeted `symbol` or
   narrow `read`, then `deps`; compress verbose commands with `ctxctl exec`.
6. Use the persistent workspace `../recordings/`, never `/tmp`. Reference clones belong
   only in `../recordings/references/` and remain untrusted until reviewed.
7. Avoid `rm` and `rmdir`. Move obsolete files to a collision-safe task path
   under `../.trash/bitty-docs/` and record the move.
8. Do not commit, merge, publish, install external code, or broaden task scope
   without explicit authority. Implementers hand off at `in_review`; a separate
   reviewer completes verified tasks.
