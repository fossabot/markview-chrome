# Badge setup guides

Step-by-step for every integration that needs an account signup.

## Codecov — already live, no action needed

The CI `coverage` job uploads `lcov.info` automatically on each push. Public
repos don't need a Codecov account. The badge populates after the first
successful upload:

```markdown
[![codecov](https://codecov.io/github/davidcforbes/markview-chrome/branch/main/graph/badge.svg)](https://codecov.io/github/davidcforbes/markview-chrome)
```

If the badge stays grey after 24 hours:

1. Sign in at https://codecov.io with GitHub.
2. Find the repo — it should auto-discover from the uploads.
3. No configuration required.

## OpenSSF Scorecard — already live, populates within 24h

Workflow runs on every push. First score publishes at:
https://scorecard.dev/viewer/?uri=github.com/davidcforbes/markview-chrome

No signup required.

## OpenSSF Best Practices (Passing badge) — requires self-assessment

See [`openssf-answers.md`](openssf-answers.md) for every answer pre-filled.

Time: 20–30 minutes.

1. https://www.bestpractices.dev/en/projects/new
2. Sign in with GitHub (davidcforbes)
3. Paste repo URL: `https://github.com/davidcforbes/markview-chrome`
4. Walk through the form using the answers doc
5. Submit

Add the returned badge to README:

```markdown
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/<PROJECT_ID>/badge)](https://www.bestpractices.dev/projects/<PROJECT_ID>)
```

## Snyk — free for public repos

Time: ~15 minutes.

1. https://app.snyk.io/login — click **Sign up** → GitHub
2. Authorize Snyk to read your public repos
3. Projects → **Add project** → GitHub → select
   `davidcforbes/markview-chrome`
4. Snyk auto-imports `package.json` and `tests/package.json`
5. Go to **Settings → General → Integrations → GitHub** and enable:
   - **Pull request checks** (Snyk comments on PRs for new vulnerable deps)
   - **Fix PRs** (Snyk opens a PR when there's a fixable vuln)
6. Copy the badge from **Projects → markview-chrome → Settings →
   Embed a badge**:

   ```markdown
   [![Known Vulnerabilities](https://snyk.io/test/github/davidcforbes/markview-chrome/badge.svg)](https://snyk.io/test/github/davidcforbes/markview-chrome)
   ```

No repo changes required — Snyk reads directly from GitHub.

## FOSSA — free for open source (MIT project qualifies)

Time: ~15 minutes.

1. https://app.fossa.com/signup/github — sign up with GitHub
2. Authorize FOSSA to read public repos
3. Dashboard → **Add Project** → pick `davidcforbes/markview-chrome`
4. Run "Full Scan" — usually completes in <2 min
5. FOSSA lists detected licenses: should show **MIT** for project + MIT
   for marked, Apache-2.0 or MPL-2.0 for DOMPurify, MIT for CodeMirror
6. From **Project Settings → Repository → Embed a badge**, copy the
   License Status badge:

   ```markdown
   [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdavidcforbes%2Fmarkview-chrome.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdavidcforbes%2Fmarkview-chrome?ref=badge_shield)
   ```

FOSSA also produces an SBOM (CycloneDX or SPDX) — download from
**Reports** tab. Useful for enterprise buyers who ask for one.

## Updating the README badge row

After earning a badge, add it to the existing row at the top of `README.md`.
Recommended order (highest value first, right-aligned):

```markdown
[![CI](...)](...) [![CodeQL](...)](...) [![Semgrep](...)](...)
[![OpenSSF Scorecard](...)](...) [![OpenSSF Best Practices](...)](...)
[![codecov](...)](...) [![Snyk](...)](...) [![FOSSA](...)](...)
[![License: MIT](...)](...) [![Contributor Covenant 2.1](...)](...)
[![GitHub release](...)](...) [![Last commit](...)](...)
```

Group related badges on one line in the README for cleaner rendering on
narrow viewports.

## Final badge row A+ preview

After all integrations complete, the row reads:

- **Green:** CI, CodeQL, Semgrep, Scorecard (numeric score 8+), OpenSSF
  Best Practices (Passing), Codecov (numeric coverage), Snyk (0 vulns),
  FOSSA (green, MIT project), License, CoC, Release, Last commit.
- **Yellow / advisory:** none expected if the plan above is executed.
- **Red:** none.

That's the A+ landing page.
