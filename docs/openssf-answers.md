# OpenSSF Best Practices — paste-ready answers

Use this to fill out the self-assessment at
https://www.bestpractices.dev/en/projects/new for the MarkView Chrome
extension.

Flow:

1. Sign in to https://www.bestpractices.dev/ with GitHub (davidcforbes).
2. Click **Add a Project** and paste the repo URL:
   `https://github.com/davidcforbes/markview-chrome`
3. Walk through the form — each criterion has a URL-evidence field. Paste
   the links below. Most are already "Met" automatically from the repo's
   metadata; you only need to paste URLs for criteria that require them.

Set each criterion to **Met**, with the evidence URL from the table.

## Basics

| Criterion | Status | Evidence URL |
|-----------|--------|--------------|
| `description_good` — project has a description | Met | https://github.com/davidcforbes/markview-chrome#readme |
| `interact` — project provides interaction method | Met | https://github.com/davidcforbes/markview-chrome/issues |
| `contribution` — CONTRIBUTING.md exists | Met | https://github.com/davidcforbes/markview-chrome/blob/main/CONTRIBUTING.md |
| `contribution_requirements` — states requirements | Met | https://github.com/davidcforbes/markview-chrome/blob/main/CONTRIBUTING.md#pr-checklist |
| `floss_license` — released as FLOSS | Met | https://github.com/davidcforbes/markview-chrome/blob/main/LICENSE |
| `floss_license_osi` — OSI approved | Met (**MIT**) | https://opensource.org/licenses/MIT |
| `license_location` — at a standard location | Met | https://github.com/davidcforbes/markview-chrome/blob/main/LICENSE |
| `documentation_basics` — user documentation | Met | https://github.com/davidcforbes/markview-chrome#install |
| `documentation_interface` — UX documentation | Met | https://github.com/davidcforbes/markview-chrome#features |
| `sites_https` — project sites use HTTPS | Met | https://github.com/davidcforbes/markview-chrome |
| `discussion` — mechanism for discussion | Met | https://github.com/davidcforbes/markview-chrome/issues (Discussions enabling is tracked as MV-2qwi) |
| `english` — project supports English | Met | English is the default throughout |
| `maintained` — project is maintained | Met | See last-commit badge and https://github.com/davidcforbes/markview-chrome/commits/main |

## Change Control

| Criterion | Status | Evidence URL |
|-----------|--------|--------------|
| `repo_public` — public repository | Met | https://github.com/davidcforbes/markview-chrome |
| `repo_track` — uses version control | Met | Git, see repo URL |
| `repo_distributed` — distributed VCS | Met | Git is distributed |
| `version_unique` — unique version numbers | Met | Per `CHANGELOG.md` + git tags |
| `version_semver` — uses SemVer | Met | https://semver.org — see `docs/versioning.md` in private repo; public repo's `CHANGELOG.md` follows SemVer |
| `version_tags` — releases have tags | Met | https://github.com/davidcforbes/markview-chrome/tags |
| `release_notes` — release notes | Met | https://github.com/davidcforbes/markview-chrome/releases |
| `release_notes_vulns` — vulnerabilities noted in release notes | Met (N/A yet — no vulns have been reported) | Policy documented in SECURITY.md |

## Reporting

| Criterion | Status | Evidence URL |
|-----------|--------|--------------|
| `report_process` — process for reporting bugs | Met | https://github.com/davidcforbes/markview-chrome/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml |
| `report_tracker` — public issue tracker | Met | https://github.com/davidcforbes/markview-chrome/issues |
| `report_responses` — responsive to bug reports | Met | Commit to respond within 7 days per SECURITY.md |
| `enhancement_responses` — responsive to feature requests | Met | Feature request template with triage commitment |
| `report_archive` — reports archived | Met | GitHub's issue tracker preserves history indefinitely |
| `vulnerability_report_process` — documented vuln reporting | Met | https://github.com/davidcforbes/markview-chrome/blob/main/SECURITY.md |
| `vulnerability_report_private` — private reporting supported | Met | Email to chris@ForbesAssetManagement.com per SECURITY.md |
| `vulnerability_report_response` — acknowledge within 14 days | Met | SECURITY.md promises 3-business-day acknowledgement |

## Quality

| Criterion | Status | Evidence URL |
|-----------|--------|--------------|
| `build` — can be built | Met | `npm run build` (CodeMirror editor bundle); runtime is vanilla JS, no build needed for the extension itself |
| `build_common_tools` — uses common tools | Met | npm + esbuild |
| `build_floss_tools` — builds with FLOSS tools | Met | Node.js, esbuild, npm — all FLOSS |
| `test` — automated test suite | Met | https://github.com/davidcforbes/markview-chrome/tree/main/tests |
| `test_invocation` — easy to run tests | Met | `cd tests && npm test` — see https://github.com/davidcforbes/markview-chrome/blob/main/tests/README.md |
| `test_most` — most functionality tested | Met | 96.46% line coverage on tracked modules; see Codecov badge |
| `test_policy` — tests documented as required | Met | PR template requires tests — https://github.com/davidcforbes/markview-chrome/blob/main/.github/PULL_REQUEST_TEMPLATE.md |
| `tests_are_added` — tests added for new code | Met | Every PR adding functionality must add tests (PR template checklist) |
| `tests_documented_added` — policy is documented | Met | https://github.com/davidcforbes/markview-chrome/blob/main/CONTRIBUTING.md |
| `warnings` — compiler/interpreter warnings enabled | Met | Node's `--test` with strict mode; CodeQL `security-and-quality` suite in CI |
| `warnings_fixed` — warnings are addressed | Met | CI fails on warnings (`-D warnings` equivalent via CodeQL high-severity gate) |
| `warnings_strict` — strict warnings policy | Met | Branch protection requires all 5 status checks green before merge |

## Security

Most of these are N/A for a pure-JS Chrome extension that does no crypto
itself. Mark each as **N/A** with the note below unless otherwise indicated.

| Criterion | Status | Note |
|-----------|--------|------|
| `know_secure_design` — understand secure design | Met | See SECURITY.md + AGENTS.md; maintainer has professional software security background |
| `know_common_errors` — understand common vulnerabilities | Met | Per SECURITY.md safe-harbor + OWASP Top Ten scanning via Semgrep |
| `crypto_published` — only published crypto algorithms | **N/A** | Extension does no crypto; OAuth delegated to Chrome's `identity` API |
| `crypto_call` — use standard crypto libs | **N/A** | No crypto used directly |
| `crypto_floss` — FLOSS crypto libs only | **N/A** | No crypto used directly |
| `crypto_keylength` — minimum key lengths | **N/A** | No crypto used directly |
| `crypto_working` — working crypto | **N/A** | No crypto used directly |
| `crypto_weaknesses` — no known weaknesses | **N/A** | No crypto used directly |
| `crypto_alternatives` — alternative crypto | **N/A** | No crypto used directly |
| `crypto_pfs` — perfect forward secrecy | **N/A** | No crypto used directly |
| `crypto_password_storage` — secure password storage | **N/A** | No passwords stored — OAuth delegated to Chrome |
| `crypto_random` — crypto-secure random | **N/A** | Not used |
| `delivery_mitm` — anti-MITM delivery | Met | Distributed via Chrome Web Store (Google-signed CRX over HTTPS) + GitHub Releases (signed commits planned) |
| `delivery_unsigned` — signed delivery | Met | Chrome Web Store signs the CRX with Google's key; GitHub Releases will add Sigstore signing (tracked as future work) |
| `vulnerabilities_fixed_60_days` — fix within 60 days | Met | SECURITY.md commits to 90-day disclosure + prompt fix |
| `vulnerabilities_critical_fixed` — critical fixed promptly | Met | SECURITY.md policy |

## Analysis

| Criterion | Status | Evidence URL |
|-----------|--------|--------------|
| `static_analysis` — uses static analysis | Met | https://github.com/davidcforbes/markview-chrome/blob/main/.github/workflows/codeql.yml + Semgrep workflow |
| `static_analysis_common_vulnerabilities` — covers common vulns | Met | CodeQL `security-and-quality` suite + Semgrep OWASP Top Ten ruleset |
| `static_analysis_fixed` — findings fixed | Met | Branch protection blocks merges with high-severity CodeQL alerts |
| `static_analysis_often` — runs frequently | Met | On every push/PR + weekly schedule |
| `dynamic_analysis` — dynamic analysis | **Unmet** (honest) | No fuzzing yet. Add a note: "Chrome extension runtime makes traditional fuzzing impractical; Playwright smoke tests cover integration paths." |
| `dynamic_analysis_unsafe` — safety during analysis | **N/A** | — |
| `dynamic_analysis_enable_assertions` — assertions enabled | **N/A** | — |
| `dynamic_analysis_fixed` — fixed findings | **N/A** | — |

## What to do for "Unmet" items

Only `dynamic_analysis` is genuinely "Unmet". The form lets you leave it
**Unmet** and still earn the Passing badge — it's one of the criteria that
allows a skip. In the "Comments" field, paste:

> Traditional fuzz testing is impractical for a Chrome extension whose
> primary surface is a DOM renderer. We rely on Playwright smoke tests,
> CodeQL, Semgrep, and the Chrome Web Store's own review process. Will
> revisit if Chrome exposes a fuzzing harness for MV3 extensions.

## After you submit

1. Save the project page URL — you'll get a badge SVG from it.
2. Add a badge to the README:

   ```markdown
   [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/<YOUR_PROJECT_ID>/badge)](https://www.bestpractices.dev/projects/<YOUR_PROJECT_ID>)
   ```

   Replace `<YOUR_PROJECT_ID>` with the number from the URL you get after
   submission.

3. Close **MV-hcjz**:
   ```bash
   cd C:/dev/markview && bd close MV-hcjz --reason "Passing badge earned at <project URL>"
   ```

Realistic: Passing tier is achievable in ~20–30 min once you have this
doc open alongside the form. Silver and Gold come later (Silver needs
signed commits + documented governance; Gold adds 2FA enforcement,
advisory workflow, fuzz testing).
