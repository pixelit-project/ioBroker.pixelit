# Maintenance review — 2026-11-01

The initial review covered 5 open issues and 21 open pull requests. The follow-up [individual PR review](pull-request-review.md) covers all 31 PRs open at the start of the follow-up. Changes are local and unreleased; GitHub issues and pull requests have not been closed or merged.

## Open issues

| Issue | Local result | Remaining verification |
| --- | --- | --- |
| [#799 Repository checker](https://github.com/pixelit-project/ioBroker.pixelit/issues/799) | Updated release tools and dependencies; set js-controller >=6.0.11 and admin >=7.6.20; aligned Node types and tsconfig with Node 22; added all responsive sizes, shared ESLint configuration, Dependabot cooldown and type-major ignore; removed unused tools and obsolete workflow backup. | Run the repository checker against the published branch after these changes land. Historic release provenance cannot be added retroactively. |
| [#700 Node.js 24](https://github.com/pixelit-project/ioBroker.pixelit/issues/700) | Tests target Node 22 and 24. Minimum Node version is 22.19.0, matching the current testing tools. | Physical PixelIt communication still needs a device smoke test. |
| [#668 ESLint migration](https://github.com/pixelit-project/ioBroker.pixelit/issues/668) | Migrated to ESLint 9 and @iobroker/eslint-config, including formatting and test linting. Removed the old configuration. | None for the local migration. ESLint stays on the compatible 9.x line of the shared configuration. |
| [#661 Responsive jsonConfig](https://github.com/pixelit-project/ioBroker.pixelit/issues/661) | IP field uses xs=12, sm=12, md=6, lg=4, xl=4. Configuration passes the official JSON schema. | Visual check in a running ioBroker admin at mobile and desktop sizes; no admin UI was available for this review. |
| [#736 Trusted Publishing](https://github.com/pixelit-project/ioBroker.pixelit/issues/736) | Existing deployment already grants id-token:write and does not pass an npm token. | Confirm the trusted publisher in npm package settings: owner `pixelit-project`, repository `ioBroker.pixelit`, workflow `test-and-release.yml`. Account settings and an actual publication were not tested. |

## Pull requests

The maintenance changes cover the intent of #801, #800, #798, #794, #787, #779, #770, #729 and #728, and refresh transitive dependency versions relevant to the dependency/security PRs. #801's suggested Node 20 configuration is superseded by the approved Node 22 baseline. The ESLint 10 proposal (#796) is superseded by migration to the compatible shared ESLint 9 configuration. Standalone Chai/Sinon major upgrades (#765, #719, #692) are replaced by the versions supplied together by @iobroker/testing, preserving CommonJS compatibility.

Security PRs involving dev-server's legacy dependencies cannot all be resolved by upgrading dev-server: 0.8.0 is the current published version and still carries those dependencies. No PR was automatically merged merely because a newer version exists.

## Runtime fixes

- Ignore deleted brightness states before accessing their value.
- Ignore unrelated state changes instead of sending an undefined screen payload.
- Resolve extended bitmap and animation IDs to the actual RGB565 pixel/frame arrays.
- Use the correct `sizeY` property for the 8×8 fallback bitmap.
- Decode WebSocket data explicitly as text and remove obsolete TypeScript suppressions.

The former placeholder unit test is replaced with 12 command regression tests, including clock, brightness, acknowledgement, text, bitmap/animation IDs, invalid JSON and failed HTTP requests.

## Validation

- Clean dependency installation: `npm ci --ignore-scripts`.
- Node.js 22.23.4 and 24.22.2: `npm test` (12 command tests and 61 package/schema tests), `npm run check`, and `npm run lint`.
- ioBroker startup integration test under Node.js 22 and 24. The test harness uses its default development controller (8.0.0-alpha.9 during this review). Startup uses the default empty device address; this verifies loading and shutdown, not a physical display connection or every supported controller version.
- `git diff --check`.
- `npm audit --omit=dev`: zero reported vulnerabilities.

The full development dependency tree still reports **41 vulnerabilities: 1 low, 36 moderate, 1 high and 3 critical**. The high/critical findings are inherited through @iobroker/dev-server (request, form-data, xmldom and its older testing/Mocha/serialize-javascript chain). The latest dev-server retains these packages. This review preserves the existing developer workflow and does not force incompatible dependency overrides or misleading downgrades suggested by `npm audit fix --force`. These packages are not runtime dependencies of the published adapter.
