// Regenerate docs/project/project-state.json from a local `bitty` checkout.
//
// The snapshot mixes mechanically derivable fields (synchronized revision,
// snapshot date, crate count, latest release tag/commit/date, provenance
// chain) with curated prose (engineering milestones, subsystem assessments,
// risk state, release summary, notes). This script owns the mechanical fields
// only: it reads them from the `bitty` repository with read-only git commands
// and preserves every curated field. Refresh a curated field in the same
// change, then run this script to update the mechanical fields.
//
// Usage:
//   bun .github/scripts/refresh-state.mjs [options]
//
// Options:
//   --bitty-repo <path>  Local `bitty` checkout (default: $BITTY_REPO,
//                        then $BITTY_WORKSPACE/bitty, then ../bitty)
//   --ref <git-ref>      Implementation ref to read (default: origin/main)
//   --date <YYYY-MM-DD>  Snapshot date (default: today, local calendar)
//   --task <CTX-XXXX>    Owning CarryCtx task; rotates carryctx_task,
//                        previous_task, and previous_issue
//   --by <name>          Value for sync_provenance.synchronized_by
//   --issue <url>        Owning Issue URL; empty string records no Issue
//   --check              Verify the snapshot is current and regeneration is a
//                        no-op without writing; exit 1 on any drift
//   --help               Print this help
//
// The script never fetches; run `git -C <bitty-repo> fetch` first to read a
// current origin/main. `latest_release.summary` stays curated: refresh it from
// the tagged CHANGELOG "Release highlights" when the release changes.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..", "..");
const SNAPSHOT = resolve(ROOT, "docs/project/project-state.json");
const SHORT_LENGTH = 7;
const CRATE_MANIFEST = /^crates\/[^/]+\/Cargo\.toml$/;
const RELEASE_TAG = /^v\d+\.\d+\.\d+$/;
const ISSUE_PATTERN = /bitty-docs\/issues/;

const USAGE = `Regenerate docs/project/project-state.json from a local bitty checkout.

Usage: bun .github/scripts/refresh-state.mjs [options]

Options:
  --bitty-repo <path>  Local bitty checkout (default: $BITTY_REPO, then
                       $BITTY_WORKSPACE/bitty, then ../bitty)
  --ref <git-ref>      Implementation ref to read (default: origin/main)
  --date <YYYY-MM-DD>  Snapshot date (default: today, local calendar)
  --task <CTX-XXXX>    Owning CarryCtx task; rotates carryctx_task,
                       previous_task, and previous_issue
  --by <name>          Value for sync_provenance.synchronized_by
  --issue <url>        Owning Issue URL; empty string records no Issue
  --check              Verify the snapshot is current and regeneration is a
                       no-op without writing; exit 1 on any drift
  --help               Print this help

The script never fetches; run \`git -C <bitty-repo> fetch\` first to read a
current origin/main. latest_release.summary stays curated: refresh it from the
tagged CHANGELOG "Release highlights" when the release changes.`;

function usage() {
  console.log(USAGE);
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    bittyRepo: null,
    ref: "origin/main",
    date: null,
    task: null,
    by: null,
    issue: undefined,
    check: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      index += 1;
      if (index >= argv.length) fail(`${arg} requires a value`);
      return argv[index];
    };
    switch (arg) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--check":
        options.check = true;
        break;
      case "--bitty-repo":
        options.bittyRepo = value();
        break;
      case "--ref":
        options.ref = value();
        break;
      case "--date":
        options.date = value();
        break;
      case "--task":
        options.task = value();
        break;
      case "--by":
        options.by = value();
        break;
      case "--issue":
        options.issue = value();
        break;
      default:
        fail(`unknown argument ${arg} (see --help)`);
    }
  }
  return options;
}

function resolveBittyRepo(flagValue) {
  if (flagValue) return resolve(flagValue);
  if (process.env.BITTY_REPO) return resolve(process.env.BITTY_REPO);
  if (process.env.BITTY_WORKSPACE)
    return resolve(process.env.BITTY_WORKSPACE, "bitty");
  return resolve(ROOT, "..", "bitty");
}

function git(repo, ...args) {
  try {
    return execFileSync("git", ["-C", repo, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    fail(`git ${args.join(" ")} failed in ${repo}: ${detail}`);
  }
}

function gitOptional(repo, ...args) {
  try {
    return execFileSync("git", ["-C", repo, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

function normalizeRemote(url) {
  let normalized = url.trim().replace(/\.git$/, "");
  const scp = /^[^@/]+@([^:]+):(.+)$/.exec(normalized);
  if (scp) normalized = `https://${scp[1]}/${scp[2]}`;
  return normalized.replace(/^ssh:\/\//, "https://");
}

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function derive(options) {
  const repo = resolveBittyRepo(options.bittyRepo);
  if (!existsSync(join(repo, ".git"))) {
    fail(`not a git checkout: ${repo} (pass --bitty-repo)`);
  }

  const revision = git(repo, "rev-parse", `${options.ref}^{commit}`);
  if (!/^[0-9a-f]{40}$/.test(revision)) {
    fail(`cannot resolve ${options.ref} in ${repo}`);
  }

  const originUrl = gitOptional(repo, "remote", "get-url", "origin");
  const origin = originUrl ? normalizeRemote(originUrl) : null;

  const crates = git(
    repo,
    "ls-tree",
    "-r",
    "--name-only",
    options.ref,
    "crates",
  )
    .split("\n")
    .filter((line) => CRATE_MANIFEST.test(line)).length;
  if (crates === 0) fail(`no crates/*/Cargo.toml found at ${options.ref}`);

  const tags = git(repo, "tag", "--list", "v*", "--sort=-v:refname").split(
    "\n",
  );
  const tag = tags.find((candidate) => RELEASE_TAG.test(candidate));
  if (!tag) fail(`no semver release tag found in ${repo}`);
  const commit = git(repo, "rev-list", "-n", "1", tag);
  const releaseDate = git(repo, "log", "-1", "--format=%cs", commit);

  return {
    repo,
    origin,
    revision,
    short: revision.slice(0, SHORT_LENGTH),
    crates,
    release: {
      tag,
      commit,
      short: commit.slice(0, SHORT_LENGTH),
      date: releaseDate,
    },
  };
}

function buildSnapshot(base, derived, options) {
  const next = structuredClone(base);
  const date = options.date ?? today();

  next.snapshot_date = date;
  next.implementation.revision = derived.revision;
  next.implementation.short = derived.short;
  if (base.implementation.revision !== derived.revision) {
    next.implementation.previous_revision = base.implementation.revision;
    next.implementation.previous_short = base.implementation.short;
  }
  next.implementation.crates = derived.crates;

  next.maturity.date = date;

  next.latest_release.tag = derived.release.tag;
  next.latest_release.commit = derived.release.commit;
  next.latest_release.short = derived.release.short;
  next.latest_release.date = derived.release.date;

  const provenance = next.sync_provenance;
  provenance.synchronized_at = date;
  provenance.synchronized_revision = derived.short;
  if (base.implementation.revision !== derived.revision) {
    provenance.previous_revision =
      base.sync_provenance.synchronized_revision ?? base.implementation.short;
  }
  if (options.task && options.task !== base.sync_provenance.carryctx_task) {
    provenance.previous_task = base.sync_provenance.carryctx_task;
    provenance.previous_issue = base.sync_provenance.github_issue;
    provenance.carryctx_task = options.task;
    provenance.github_issue = options.issue ? options.issue : null;
  }
  if (options.by) provenance.synchronized_by = options.by;

  if (options.issue && !ISSUE_PATTERN.test(options.issue)) {
    fail("--issue must reference a bitty-docs Issue, or be empty");
  }
  if (provenance.github_issue && !ISSUE_PATTERN.test(provenance.github_issue)) {
    fail("sync_provenance.github_issue must reference a bitty-docs Issue");
  }

  return next;
}

function collectDiff(left, right, prefix = "", diffs = []) {
  if (diffs.length >= 20) return diffs;
  const keys = new Set([
    ...Object.keys(left ?? {}),
    ...Object.keys(right ?? {}),
  ]);
  for (const key of keys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const a = left?.[key];
    const b = right?.[key];
    if (a && b && typeof a === "object" && typeof b === "object") {
      collectDiff(a, b, path, diffs);
    } else if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs.push(`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
    }
  }
  return diffs;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  let raw;
  try {
    raw = await readFile(SNAPSHOT, "utf8");
  } catch {
    fail(`missing snapshot at ${SNAPSHOT}`);
  }
  const base = JSON.parse(raw);
  const derived = derive(options);

  if (
    derived.origin &&
    base.implementation.repository &&
    normalizeRemote(base.implementation.repository) !== derived.origin
  ) {
    fail(
      `snapshot implementation.repository (${base.implementation.repository}) does not match ${derived.repo} origin (${derived.origin})`,
    );
  }

  const candidate = buildSnapshot(base, derived, {
    ...options,
    date: options.check ? base.snapshot_date : options.date,
  });
  const text = `${JSON.stringify(candidate, null, 2)}\n`;
  const diffs = collectDiff(base, candidate);

  if (options.check) {
    if (diffs.length) {
      console.error(
        `stale: ${SNAPSHOT} differs from the regenerated snapshot for ${derived.repo} at ${options.ref} (${derived.short}):`,
      );
      for (const line of diffs) console.error(`  ${line}`);
      console.error(
        "run `just state-refresh` with a current bitty checkout, review curated fields, and commit the refresh",
      );
      process.exit(1);
    }
    console.log(
      `snapshot is current: ${base.implementation.short} at ${base.snapshot_date}, regeneration is a no-op`,
    );
    return;
  }

  if (!diffs.length) {
    console.log(
      `no changes: snapshot already current at ${candidate.implementation.short} (${candidate.snapshot_date})`,
    );
    return;
  }

  await writeFile(SNAPSHOT, text, "utf8");
  console.log(
    `refreshed ${SNAPSHOT} to ${candidate.implementation.short} (${candidate.snapshot_date}):`,
  );
  for (const line of diffs) console.log(`  ${line}`);
  if (base.latest_release.tag !== candidate.latest_release.tag) {
    console.log(
      `  note: latest_release.summary is curated; refresh it from the tagged CHANGELOG "Release highlights"`,
    );
  }
}

await main();
