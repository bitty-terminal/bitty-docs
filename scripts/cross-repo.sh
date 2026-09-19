#!/usr/bin/env bash
# cross-repo.sh — corpus-level cross-repository link validation and submodule
# pin status for the bitty-docs aggregator.
#
# Modes:
#   check    Scan owned Markdown for absolute
#            `https://github.com/<org>/<repo>/(blob|tree)/<ref>/<path>` links
#            and verify every target path against the owning sibling
#            repository's current main. Local workspace checkouts are consulted
#            first, materialized submodules second, and the GitHub API
#            (`gh api .../contents/<path>`) last. With `--offline` the network
#            is never used and unresolved targets are reported as skipped
#            (never silently passed). Any dead link exits 1 and is listed with
#            every occurrence; `--fetch` refreshes a local sibling's
#            `origin/<ref>` before resolving; `--include-submodules` extends
#            the scan to the three project-docs working trees (report-only for
#            this repo).
#   status   Print, per docs sibling, the aggregator submodule pin, the
#            upstream docs-repo main, the commits between them, and the
#            code-repo `docs/` mount when a workspace sibling carries one.
#
# Everything is derived: the organization and repository names come from this
# checkout's `origin` remote, sibling locations from `--workspace` (default
# `$BITTY_WORKSPACE`, then the parent of the main checkout) and `.gitmodules`.
# No host path or repository URL is hardcoded.
#
# Usage:
#   scripts/cross-repo.sh check [--offline] [--include-submodules] [--fetch]
#                               [--workspace DIR] [--root DIR] [--help]
#   scripts/cross-repo.sh status [--fetch] [--workspace DIR] [--root DIR]
#                                [--help]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE=""
OFFLINE=0
INCLUDE_SUBMODULES=0
FETCH=0
ROOT_OVERRIDE=""
WORKSPACE_OVERRIDE=""
CLEANUP_DIR=""

usage() {
  sed -n '2,/^set -euo/p' "${BASH_SOURCE[0]}" | sed '$d'
}

log() { printf 'cross-repo: %s\n' "$1"; }
warn() { printf 'cross-repo: WARN: %s\n' "$1" >&2; }
fail() {
  printf 'cross-repo: FAIL: %s\n' "$1" >&2
  exit 1
}

shorten() { printf '%s\n' "${1:0:7}"; }

url_to_slug() { # remote URL -> "<org> <repo>" (no .git suffix)
  local url="$1" rest
  url="${url%.git}"
  url="${url#git@}"
  url="${url#ssh://}"
  url="${url#https://}"
  url="${url#http://}"
  rest="${url%/*}"
  printf '%s %s\n' "${rest##*[:/]}" "${url##*/}"
}

if [[ $# -eq 0 ]]; then
  usage >&2
  exit 2
fi
case "$1" in
check | status) MODE="$1" ;;
--help | -h)
  usage
  exit 0
  ;;
*) fail "unknown mode $1 (see --help)" ;;
esac
shift

while [[ $# -gt 0 ]]; do
  case "$1" in
  --offline)
    OFFLINE=1
    shift
    ;;
  --include-submodules)
    INCLUDE_SUBMODULES=1
    shift
    ;;
  --fetch)
    FETCH=1
    shift
    ;;
  --workspace)
    WORKSPACE_OVERRIDE="${2:?--workspace requires a directory}"
    shift 2
    ;;
  --workspace=*)
    WORKSPACE_OVERRIDE="${1#--workspace=}"
    shift
    ;;
  --root)
    ROOT_OVERRIDE="${2:?--root requires a directory}"
    shift 2
    ;;
  --root=*)
    ROOT_OVERRIDE="${1#--root=}"
    shift
    ;;
  --help | -h)
    usage
    exit 0
    ;;
  *) fail "unknown flag $1 (see --help)" ;;
  esac
done

if [[ "$MODE" == "status" ]]; then
  [[ "$OFFLINE" == 0 && "$INCLUDE_SUBMODULES" == 0 ]] || fail "--offline/--include-submodules are check-mode flags"
elif [[ "$OFFLINE" == 1 && "$FETCH" == 1 ]]; then
  fail "--offline and --fetch are mutually exclusive"
fi

if [[ -n "$ROOT_OVERRIDE" ]]; then
  ROOT="$(cd "$ROOT_OVERRIDE" && pwd)" || fail "root directory $ROOT_OVERRIDE not found"
fi

command -v git >/dev/null || fail "git not on PATH"

REMOTE_URL="$(git -C "$ROOT" config --get remote.origin.url || true)"
[[ -n "$REMOTE_URL" ]] || fail "cannot derive the organization from the origin remote of $ROOT"
read -r ORG SELF <<<"$(url_to_slug "$REMOTE_URL")"
[[ -n "$ORG" && -n "$SELF" ]] || fail "cannot parse the origin remote URL"

GIT_COMMON="$(git -C "$ROOT" rev-parse --path-format=absolute --git-common-dir)"
MAIN_CHECKOUT="$(dirname "$GIT_COMMON")"

# Sibling documentation checkouts are discovered by repository name; the
# workspace defaults to $BITTY_WORKSPACE, then to the parent of the main
# checkout (a worktree resolves to its primary checkout's parent).
WORKSPACE=""
if [[ -n "$WORKSPACE_OVERRIDE" ]]; then
  WORKSPACE="$(cd "$WORKSPACE_OVERRIDE" && pwd)" || fail "workspace directory $WORKSPACE_OVERRIDE not found"
elif [[ -n "${BITTY_WORKSPACE:-}" && -d "${BITTY_WORKSPACE}" ]]; then
  WORKSPACE="$(cd "${BITTY_WORKSPACE}" && pwd)"
else
  WORKSPACE="$(dirname "$MAIN_CHECKOUT")"
fi

declare -A SUB_PATH=()
declare -A SUB_URL=()
load_submodules() {
  [[ -f "$ROOT/.gitmodules" ]] || return 0
  local key value name
  while read -r key value; do
    name="${key#submodule.}"
    case "$name" in
    *.path) SUB_PATH["${name%.path}"]="$value" ;;
    *.url) SUB_URL["${name%.url}"]="$value" ;;
    esac
  done < <(git -C "$ROOT" config -f "$ROOT/.gitmodules" --get-regexp '^submodule\..*\.(path|url)$')
}
load_submodules

is_git_dir() { [[ -e "$1/.git" ]] && git -C "$1" rev-parse --git-dir >/dev/null 2>&1; }

repo_dir_for() { # repository name -> local checkout directory, or nothing
  local repo="$1" name candidate
  if [[ "$repo" == "$SELF" ]]; then
    printf '%s\n' "$ROOT"
    return 0
  fi
  candidate="$WORKSPACE/$repo"
  if is_git_dir "$candidate"; then
    printf '%s\n' "$candidate"
    return 0
  fi
  for name in "${!SUB_PATH[@]}"; do
    local url="${SUB_URL[$name]:-}"
    [[ -n "$url" ]] || continue
    [[ "$(url_to_slug "$url")" == "$ORG $repo" ]] || continue
    candidate="$ROOT/${SUB_PATH[$name]}"
    if is_git_dir "$candidate"; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

# Resolve the upstream commit for <ref> inside a local checkout. `main` prefers
# the remote-tracking ref, so resolution is against upstream current main even
# when the checkout itself sits on an older pin.
upstream_commit() {
  local dir="$1" ref="$2" cand commit
  case "$ref" in
  main | master)
    for cand in "refs/remotes/origin/$ref" "refs/heads/$ref" "$ref"; do
      if commit="$(git -C "$dir" rev-parse --verify --quiet "${cand}^{commit}")"; then
        printf '%s\n' "$commit"
        return 0
      fi
    done
    ;;
  *)
    if commit="$(git -C "$dir" rev-parse --verify --quiet "${ref}^{commit}")"; then
      printf '%s\n' "$commit"
      return 0
    fi
    ;;
  esac
  return 1
}

api_verdict() { # repo ref path -> 0 exists, 1 GitHub says 404, 2 unknown
  local repo="$1" ref="$2" path="$3" err
  if err="$(gh api "repos/$ORG/$repo/contents/$path?ref=$ref" --silent 2>&1 >/dev/null)"; then
    return 0
  fi
  case "$err" in
  *404* | *"Not Found"*) return 1 ;;
  *) return 2 ;;
  esac
}

# Emit one record per absolute cross-repo link:
#   repo|ref|path|<file>:<line>|<url>
URL_RE="https?://github\\.com/${ORG}/([A-Za-z0-9_.-]+)/(blob|tree)/([^/[:space:]\"'<>|]+)/([^)[:space:]\"'<>|#]+)"
emit_links() { # <file to read> <display path> <output file>
  local file="$1" disp="$2" out="$3" hit line url
  while IFS= read -r hit; do
    line="${hit%%:*}"
    url="${hit#*:}"
    while :; do
      case "${url: -1}" in
      . | , | ';' | :) url="${url%?}" ;;
      *) break ;;
      esac
    done
    [[ "$url" =~ $URL_RE ]] || continue
    printf '%s|%s|%s|%s:%s|%s\n' \
      "${BASH_REMATCH[1]}" "${BASH_REMATCH[3]}" "${BASH_REMATCH[4]}" \
      "$disp" "$line" "$url" >>"$out"
  done < <(grep -noE "$URL_RE" "$file" 2>/dev/null || true)
}

declare -A FETCHED=()
fetch_dir() { # dir ref — refresh the local upstream ref once per run
  local dir="$1" ref="$2"
  [[ -n "${FETCHED[$dir | $ref]:-}" ]] && return 0
  FETCHED["$dir|$ref"]=1
  case "$ref" in
  main | master)
    git -C "$dir" fetch --quiet origin "+refs/heads/$ref:refs/remotes/origin/$ref" ||
      warn "$dir: cannot refresh origin/$ref; using local refs"
    ;;
  *)
    git -C "$dir" fetch --quiet origin "$ref" ||
      warn "$dir: cannot fetch $ref; falling back to local refs or the GitHub API"
    ;;
  esac
}

RESOLVE_DETAIL=""
# Verdict: 0 resolved, 1 dead, 2 skipped; RESOLVE_DETAIL explains dead/skipped.
resolve_target() { # repo ref path
  local repo="$1" ref="$2" path="$3" dir commit verdict=0
  RESOLVE_DETAIL=""
  if dir="$(repo_dir_for "$repo")"; then
    if [[ "$repo" == "$SELF" && "$ref" == "main" ]]; then
      # The aggregator itself resolves against this checkout's HEAD: a link
      # added and used in the same pull request must not read as dead before
      # the merge.
      commit="$(git -C "$dir" rev-parse --verify --quiet "HEAD^{commit}")"
    else
      [[ "$FETCH" == 1 ]] && fetch_dir "$dir" "$ref"
      commit="$(upstream_commit "$dir" "$ref" || true)"
    fi
    if [[ -n "$commit" ]]; then
      if git -C "$dir" cat-file -e "$commit:$path" 2>/dev/null; then
        return 0
      fi
      RESOLVE_DETAIL="missing at $repo@$(shorten "$commit")"
      return 1
    fi
    RESOLVE_DETAIL="cannot resolve $repo@$ref locally"
  else
    RESOLVE_DETAIL="no local checkout for $repo"
  fi

  if [[ "$OFFLINE" == 1 ]]; then
    RESOLVE_DETAIL+=" (offline)"
    return 2
  fi
  command -v gh >/dev/null || {
    RESOLVE_DETAIL+=" (gh not on PATH)"
    return 2
  }
  api_verdict "$repo" "$ref" "$path" || verdict=$?
  case "$verdict" in
  0) return 0 ;;
  1)
    RESOLVE_DETAIL="missing at $repo@$ref (GitHub API)"
    return 1
    ;;
  *)
    RESOLVE_DETAIL+=" and the GitHub API check failed"
    return 2
    ;;
  esac
}

check_mode() {
  local tmp occ targets files=0 links=0 targets_count=0
  local ok=0 dead=0 skipped=0
  tmp="$(mktemp -d "${TMPDIR:-/tmp}/cross-repo.XXXXXX")"
  CLEANUP_DIR="$tmp"
  trap '[[ -n "${CLEANUP_DIR:-}" ]] && rm -rf "$CLEANUP_DIR"' EXIT
  occ="$tmp/occurrences"
  targets="$tmp/targets"
  : >"$occ"

  local rel disp
  while IFS= read -r -d '' rel; do
    emit_links "$ROOT/$rel" "$rel" "$occ"
    files=$((files + 1))
  done < <(git -C "$ROOT" ls-files -z '*.md')

  if [[ "$INCLUDE_SUBMODULES" == 1 ]]; then
    local name subdir
    for name in $(printf '%s\n' "${!SUB_PATH[@]}" | sort); do
      subdir="$ROOT/${SUB_PATH[$name]}"
      is_git_dir "$subdir" || {
        warn "submodule ${SUB_PATH[$name]} not initialized; skipped"
        continue
      }
      while IFS= read -r -d '' rel; do
        emit_links "$subdir/$rel" "${SUB_PATH[$name]}/$rel" "$occ"
        files=$((files + 1))
      done < <(git -C "$subdir" ls-files -z '*.md')
    done
  fi

  cut -d'|' -f1-3 "$occ" | sort -u >"$targets"
  links="$(wc -l <"$occ")"
  targets_count="$(wc -l <"$targets")"

  local repo ref path
  while IFS='|' read -r repo ref path; do
    [[ -n "$repo" ]] || continue
    local rc=0
    resolve_target "$repo" "$ref" "$path" || rc=$?
    case "$rc" in
    0) ok=$((ok + 1)) ;;
    2)
      skipped=$((skipped + 1))
      log "SKIP $repo@$ref:$path — $RESOLVE_DETAIL"
      ;;
    *)
      dead=$((dead + 1))
      printf 'DEAD %s@%s:%s — %s\n' "$repo" "$ref" "$path" "$RESOLVE_DETAIL"
      grep -F "$repo|$ref|$path|" "$occ" | cut -d'|' -f4 | sed 's/^/  - /'
      ;;
    esac
  done <"$targets"

  local scope="owned Markdown"
  [[ "$INCLUDE_SUBMODULES" == 1 ]] && scope="owned + submodule Markdown"
  log "scanned $files files ($scope): $links links, $targets_count unique targets"
  log "resolved $ok, dead $dead, skipped $skipped"
  if [[ "$dead" -gt 0 ]]; then
    printf 'cross-repo: FAIL: %s dead cross-repository link target(s)\n' "$dead" >&2
    exit 1
  fi
  log "PASS: no dead cross-repository links"
}

mount_for_url() { # docs repository URL -> "<code repo dir> <submodule path>"
  local url="$1" dir key value name
  for dir in "$WORKSPACE"/*/; do
    dir="${dir%/}"
    [[ -f "$dir/.gitmodules" ]] || continue
    [[ "$(basename "$dir")" == "$SELF" ]] && continue
    while read -r key value; do
      [[ "${value%.git}" == "${url%.git}" ]] || continue
      name="${key#submodule.}"
      name="${name%.url}"
      printf '%s %s\n' "$dir" "$(git -C "$dir" config -f "$dir/.gitmodules" --get "submodule.$name.path")"
      return 0
    done < <(git -C "$dir" config -f "$dir/.gitmodules" --get-regexp '^submodule\..*\.url$' || true)
  done
  return 1
}

status_mode() {
  local head branch
  head="$(shorten "$(git -C "$ROOT" rev-parse HEAD)")"
  branch="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)"
  log "submodule pin positions (aggregator $head on $branch, workspace $WORKSPACE)"
  printf '%-22s %-11s %-11s %-7s %-11s %-7s %s\n' \
    "sibling" "aggregator" "docs-main" "behind" "docs-mount" "behind" "mount-repo"

  [[ -d "$WORKSPACE" ]] || warn "workspace $WORKSPACE not found; upstream positions unavailable"

  local name url pin dir main_sha behind mount_line mount_dir mount_path mount_pin mount_behind
  for name in $(printf '%s\n' "${!SUB_PATH[@]}" | sort); do
    url="${SUB_URL[$name]:-}"
    [[ -n "$url" ]] || continue
    read -r _ repo <<<"$(url_to_slug "$url")"
    pin="$(git -C "$ROOT" ls-tree HEAD "${SUB_PATH[$name]}" | awk '{print $3}')"
    dir="$(repo_dir_for "$repo" || true)"
    main_sha=""
    behind="n/a"
    if [[ -n "$dir" ]]; then
      [[ "$FETCH" == 1 ]] && fetch_dir "$dir" main
      main_sha="$(upstream_commit "$dir" main || true)"
      if [[ -n "$main_sha" ]] && git -C "$dir" cat-file -e "$pin^{commit}" 2>/dev/null; then
        behind="$(git -C "$dir" rev-list --count "$pin..$main_sha")"
      fi
    fi
    mount_line="$(mount_for_url "$url" || true)"
    mount_dir="${mount_line%% *}"
    mount_path="${mount_line#* }"
    mount_pin="n/a"
    mount_behind="n/a"
    if [[ -n "$mount_dir" && -n "$mount_path" && "$mount_line" == *" "* ]]; then
      mount_pin="$(git -C "$mount_dir" ls-tree HEAD "$mount_path" 2>/dev/null | awk '{print $3}')"
      [[ -n "$mount_pin" ]] || mount_pin="n/a"
      if [[ -n "$main_sha" && "$mount_pin" != "n/a" ]] &&
        git -C "$dir" cat-file -e "$mount_pin^{commit}" 2>/dev/null; then
        mount_behind="$(git -C "$dir" rev-list --count "$mount_pin..$main_sha")"
      fi
    fi
    printf '%-22s %-11s %-11s %-7s %-11s %-7s %s\n' \
      "$repo" \
      "$(shorten "$pin")" \
      "$([[ -n "$main_sha" ]] && shorten "$main_sha" || printf 'n/a')" \
      "$behind" \
      "$([[ "$mount_pin" != "n/a" ]] && shorten "$mount_pin" || printf 'n/a')" \
      "$mount_behind" \
      "$([[ -n "$mount_dir" ]] && basename "$mount_dir" || printf 'n/a')"
  done
  log "behind = commits on docs-main not reachable from the pin (rev-list --count <pin>..<main>)"
}

case "$MODE" in
check) check_mode ;;
status) status_mode ;;
esac
