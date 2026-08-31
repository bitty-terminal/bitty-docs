import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..", "..");
const SNAPSHOT = resolve(ROOT, "docs/project/project-state.json");

const CANONICAL_FILES = [
  "README.md",
  "TODO.md",
  "docs/README.md",
  "docs/security/risk-register.md",
  "docs/security/evidence-matrix.md",
  "docs/product/release-ladder.md",
];

function fail(message) {
  console.error(`error: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function loadSnapshot() {
  let raw;
  try {
    raw = await readFile(SNAPSHOT, "utf8");
  } catch {
    fail(`missing snapshot at ${SNAPSHOT}`);
    return null;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    fail(`snapshot is not valid JSON: ${error.message}`);
    return null;
  }
  return data;
}

function validateSnapshot(data) {
  const failures = [];

  if (data.schema_version !== 1) {
    failures.push("schema_version must be 1");
  }

  if (
    typeof data.snapshot_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.snapshot_date)
  ) {
    failures.push("snapshot_date must be YYYY-MM-DD");
  }

  const impl = data.implementation;
  if (!impl || typeof impl !== "object") {
    failures.push("implementation is required");
  } else {
    if (!/^[0-9a-f]{40}$/.test(impl.revision ?? "")) {
      failures.push("implementation.revision must be 40-char hex");
    }
    if (!/^[0-9a-f]{7,12}$/.test(impl.short ?? "")) {
      failures.push("implementation.short must be hex short");
    }
    if (impl.revision && impl.short && !impl.revision.startsWith(impl.short)) {
      failures.push("implementation.short must be prefix of revision");
    }
    if (!/^[0-9a-f]{40}$/.test(impl.baseline_revision ?? "")) {
      failures.push("implementation.baseline_revision must be 40-char hex");
    }
    if (!/^[0-9a-f]{7,12}$/.test(impl.baseline_short ?? "")) {
      failures.push("implementation.baseline_short must be hex short");
    }
    if (!/^[0-9a-f]{40}$/.test(impl.previous_revision ?? "")) {
      failures.push("implementation.previous_revision must be 40-char hex");
    }
    if (typeof impl.crates !== "number" || impl.crates !== 16) {
      failures.push("implementation.crates must be 16");
    }
  }

  const maturity = data.maturity;
  if (!maturity || maturity.label !== "Pre-alpha / M1 Hardening") {
    failures.push('maturity.label must be "Pre-alpha / M1 Hardening"');
  }
  if (maturity?.date !== "2026-08-29") {
    failures.push('maturity.date must be "2026-08-29"');
  }
  if (maturity?.oqs_accepted !== 32) {
    failures.push("maturity.oqs_accepted must be 32");
  }

  if (!Array.isArray(data.risks) || data.risks.length !== 22) {
    failures.push("risks must be array of 22 entries");
  } else {
    const ids = data.risks.map((r) => r.id);
    for (let i = 1; i <= 22; i += 1) {
      const expected = `R-${String(i).padStart(3, "0")}`;
      if (!ids.includes(expected)) failures.push(`missing risk ${expected}`);
    }
    const r004 = data.risks.find((r) => r.id === "R-004");
    if (!r004) failures.push("R-004 missing");
    else {
      if (r004.state !== "Open") failures.push("R-004 must remain Open");
      if (r004.stage !== "P0") failures.push("R-004 stage must be P0");
      if (!r004.evidence || r004.evidence.revision !== "7a4ee41") {
        failures.push("R-004 evidence.revision must be 7a4ee41");
      }
      if (!r004.evidence || r004.evidence.baseline !== "de134ec") {
        failures.push("R-004 evidence.baseline must be de134ec");
      }
      if (
        !r004.evidence ||
        !r004.evidence.audit?.includes("7a4ee41") ||
        !r004.evidence.audit?.includes("clipboard-2026-09.md")
      ) {
        failures.push(
          "R-004 evidence.audit must reference 7a4ee41 clipboard audit",
        );
      }
    }
    // R-005/006/007 are Mitigated at d4d75e9 per CTX-0114 with RS-1..RS-7 evidence;
    // all other risks remain Open at M1 Hardening.
    // Experimental implementations c0aadd2, 7e3104d, a8735d0 are Implemented,
    // not Verified — they do not change risk state.
    const mitigatedExpected = new Set(["R-005", "R-006", "R-007"]);
    for (const risk of data.risks) {
      if (!["Open", "Mitigated", "Accepted"].includes(risk.state)) {
        failures.push(`${risk.id} has invalid state ${risk.state}`);
      }
      if (mitigatedExpected.has(risk.id)) {
        if (risk.state !== "Mitigated") {
          failures.push(`${risk.id} must be Mitigated at d4d75e9 per CTX-0114`);
        }
        if (!risk.evidence || !risk.evidence.revision) {
          failures.push(`${risk.id} Mitigated requires evidence.revision`);
        }
      } else {
        if (risk.state !== "Open") {
          failures.push(
            `${risk.id} must remain Open at M1 Hardening (no auto-accept)`,
          );
        }
      }
      if (!["P0", "P1"].includes(risk.stage)) {
        failures.push(`${risk.id} has invalid stage`);
      }
    }
    // Validate per-risk evidence for Mitigated set
    const r005 = data.risks.find((r) => r.id === "R-005");
    if (r005 && r005.state === "Mitigated") {
      if (r005.evidence?.revision !== "5bdcdbd")
        failures.push("R-005 evidence.revision must be 5bdcdbd");
      if (r005.evidence?.baseline !== "de134ec")
        failures.push("R-005 evidence.baseline must be de134ec");
    }
    const r006 = data.risks.find((r) => r.id === "R-006");
    if (r006 && r006.state === "Mitigated") {
      if (r006.evidence?.revision !== "0afc94d")
        failures.push("R-006 evidence.revision must be 0afc94d");
    }
    const r007 = data.risks.find((r) => r.id === "R-007");
    if (r007 && r007.state === "Mitigated") {
      if (r007.evidence?.revision !== "d4d75e9")
        failures.push("R-007 evidence.revision must be d4d75e9");
    }
  }

  const provenance = data.sync_provenance;
  if (!provenance || provenance.synchronized_revision !== "a8735d0") {
    failures.push("sync_provenance.synchronized_revision must be a8735d0");
  }
  if (!provenance || provenance.carryctx_task !== "CTX-0116") {
    failures.push("sync_provenance.carryctx_task must be CTX-0116");
  }
  if (!provenance || !provenance.github_issue?.includes("bitty-docs/issues")) {
    failures.push(
      "sync_provenance.github_issue must reference bitty-docs/issues",
    );
  }

  const ownership = data.ownership;
  if (!ownership || !ownership.owner?.includes("security-auditor")) {
    failures.push("ownership.owner must include security-auditor");
  }
  if (!ownership || !ownership.update_protocol?.includes("CarryCtx")) {
    failures.push("ownership.update_protocol must mention CarryCtx");
  }
  if (
    !ownership ||
    !ownership.source_of_truth?.includes("canonical machine-readable")
  ) {
    failures.push("ownership.source_of_truth must state canonical source");
  }

  if (data.notes && data.notes.includes("Mitigated")) {
    // notes may mention Mitigated in explanation but must not claim auto Mitigated
    if (data.notes.includes("auto-accept") === false) {
      // still check that notes warns not to auto-accept
      failures.push("notes must warn against auto-accept");
    }
  }
  if (!data.notes || !data.notes.includes("Must not auto-accept")) {
    failures.push("notes must contain 'Must not auto-accept'");
  }

  return failures;
}

async function checkCanonicalSummaries(data) {
  const failures = [];
  const requiredTokens = [
    data.maturity.label,
    data.implementation.short,
    data.implementation.baseline_short,
    data.implementation.previous_short,
    "R-004",
    "Open",
  ];

  for (const rel of CANONICAL_FILES) {
    const path = resolve(ROOT, rel);
    let content;
    try {
      content = await readFile(path, "utf8");
    } catch {
      failures.push(`${rel}: cannot read canonical file`);
      continue;
    }

    for (const token of requiredTokens) {
      if (!content.includes(token)) {
        failures.push(
          `${rel}: missing required token "${token}" (drift from snapshot)`,
        );
      }
    }

    // Ensure R-004 is not marked Mitigated/Verified in these summaries (Open is required)
    // Allow "not Mitigated/Verified" phrasing but forbid positive claim.
    const mitigatedPattern = /R-004[^]*Mitigated/i;
    const hasMitigatedClaim = mitigatedPattern.test(content);
    const hasNotMitigated =
      content.includes("not `Mitigated`") || content.includes("not Mitigated");
    if (hasMitigatedClaim && !hasNotMitigated) {
      // check if file actually claims R-004 is Mitigated (without negation)
      // crude: if it says "R-004 ... Mitigated" without "remains Open" nearby, flag
      if (
        content.includes("R-004") &&
        content.includes("Mitigated") &&
        !content.includes("remains `Open`") &&
        !content.includes("remains **Open**")
      ) {
        failures.push(
          `${rel}: contradictory R-004 Mitigated claim without Open qualifier`,
        );
      }
    }

    // Snapshot date or maturity date should appear somewhere
    if (
      !content.includes(data.snapshot_date) &&
      !content.includes(data.maturity.date)
    ) {
      failures.push(
        `${rel}: missing snapshot_date ${data.snapshot_date} or maturity date ${data.maturity.date}`,
      );
    }
  }

  return failures;
}

function generateSummary(data) {
  // Deterministic canonical status summary derived from snapshot; use to compare or regenerate docs
  const lines = [];
  lines.push(
    `Snapshot: ${data.snapshot_date} | bitty ${data.implementation.short} (baseline ${data.implementation.baseline_short}, previous ${data.implementation.previous_short})`,
  );
  lines.push(
    `Maturity: ${data.maturity.label} (${data.maturity.date}, ${data.maturity.oqs_accepted} OQs Accepted, ${data.implementation.crates} crates)`,
  );
  lines.push(
    `R-004: ${data.risks.find((r) => r.id === "R-004").state} at ${data.risks.find((r) => r.id === "R-004").evidence.revision} baseline ${data.risks.find((r) => r.id === "R-004").evidence.baseline} per ${data.risks.find((r) => r.id === "R-004").evidence.audit}`,
  );
  lines.push(
    `Provenance: ${data.sync_provenance.carryctx_task} / ${data.sync_provenance.github_issue} (audit ${data.sync_provenance.audit_task})`,
  );
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--generate")) {
    const data = await loadSnapshot();
    if (!data || process.exitCode) process.exit(process.exitCode ?? 1);
    const failures = validateSnapshot(data);
    if (failures.length) {
      for (const f of failures) console.error(`error: snapshot invalid: ${f}`);
      process.exit(1);
    }
    console.log(generateSummary(data));
    return;
  }

  if (args.includes("--self-test")) {
    // Deterministic self-test using fixtures without duplicating test counts
    const data = await loadSnapshot();
    const snapshotFailures = validateSnapshot(data);
    if (snapshotFailures.length) {
      console.error("self-test: snapshot validation failed");
      for (const f of snapshotFailures) console.error(`  - ${f}`);
      process.exit(1);
    }
    const summary = generateSummary(data);
    if (
      !summary.includes("a8735d0") ||
      !summary.includes("Pre-alpha / M1 Hardening")
    ) {
      console.error("self-test: generated summary missing expected tokens");
      process.exit(1);
    }
    const canonicalFailures = await checkCanonicalSummaries(data);
    if (canonicalFailures.length) {
      console.error("self-test: canonical summaries drift");
      for (const f of canonicalFailures) console.error(`  - ${f}`);
      process.exit(1);
    }
    // Validate fixtures deterministically: valid must pass, invalid must fail
    const validRaw = await readFile(
      resolve(ROOT, ".github/scripts/fixtures/project-state.valid.json"),
      "utf8",
    );
    const valid = JSON.parse(validRaw);
    const validFailures = validateSnapshot(valid);
    if (validFailures.length) {
      console.error("self-test: valid fixture should pass");
      for (const f of validFailures) console.error(`  - ${f}`);
      process.exit(1);
    }
    const invalidRaw = await readFile(
      resolve(ROOT, ".github/scripts/fixtures/project-state.invalid.json"),
      "utf8",
    );
    const invalid = JSON.parse(invalidRaw);
    const invalidFailures = validateSnapshot(invalid);
    if (invalidFailures.length === 0) {
      console.error("self-test: invalid fixture should fail");
      process.exit(1);
    }
    console.log(
      "self-test: snapshot, fixtures, and canonical summaries are consistent",
    );
    return;
  }

  const data = await loadSnapshot();
  if (!data || process.exitCode) process.exit(process.exitCode ?? 1);

  const snapshotFailures = validateSnapshot(data);
  if (snapshotFailures.length) {
    for (const f of snapshotFailures) console.error(`error: snapshot: ${f}`);
    process.exitCode = 1;
  }

  const canonicalFailures = await checkCanonicalSummaries(data);
  if (canonicalFailures.length) {
    for (const f of canonicalFailures)
      console.error(`error: canonical summary: ${f}`);
    process.exitCode = 1;
  }

  if (process.exitCode) {
    console.error(
      `\nChecked snapshot at docs/project/project-state.json and ${CANONICAL_FILES.length} canonical files`,
    );
    process.exit(process.exitCode);
  }

  console.log(
    `Validated snapshot ${data.snapshot_date} at ${data.implementation.short} and ${CANONICAL_FILES.length} canonical summaries without drift`,
  );
}

await main();
