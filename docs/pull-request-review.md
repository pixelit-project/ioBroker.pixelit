# Individual pull request review — 2026-11-01

All 31 open PRs were reviewed against their recorded head revisions and the consolidated maintenance changes. Package/lockfile diffs were inspected, and resolved versions were compared with the final lockfile. CI results below are historical results for each original PR, not results for the consolidated changes. Cancelled jobs are not considered passes.

| PR | Original CI | Decision |
| --- | --- | --- |
| [#814](https://github.com/pixelit-project/ioBroker.pixelit/pull/814) | Failed: adapter-tests (20.x, ubuntu-latest) | Included: release-script 5.2.1, with matching release plugins. |
| [#813](https://github.com/pixelit-project/ioBroker.pixelit/pull/813) | Failed: adapter-tests (20.x, ubuntu-latest) | Included: proxy-addr 2.0.8 in the regenerated lockfile. |
| [#812](https://github.com/pixelit-project/ioBroker.pixelit/pull/812) | Failed: adapter-tests (20.x, windows-latest) | Included: fast-uri 3.1.9 in the regenerated lockfile. |
| [#811](https://github.com/pixelit-project/ioBroker.pixelit/pull/811) | Failed: check-and-lint | Declined as proposed: ESLint 10 alone breaks the legacy config and its CI fails. Replaced with the shared ioBroker ESLint 9 setup and passing lint. |
| [#810](https://github.com/pixelit-project/ioBroker.pixelit/pull/810) | Failed: adapter-tests (20.x, ubuntu-latest) | Included: follow-redirects 1.16.2 in the regenerated lockfile. |
| [#809](https://github.com/pixelit-project/ioBroker.pixelit/pull/809) | Failed: adapter-tests (20.x, ubuntu-latest) | Included: testing-action-check v2. Also enabled its type-checking input so CI runs the verified npm run check. |
| [#808](https://github.com/pixelit-project/ioBroker.pixelit/pull/808) | Failed: adapter-tests (20.x, macos-latest) | Included: axios 1.21.0. |
| [#807](https://github.com/pixelit-project/ioBroker.pixelit/pull/807) | Failed: adapter-tests (20.x, macos-latest) | Included: actions/stale v11; official release notes retain the existing inputs and behavior. |
| [#806](https://github.com/pixelit-project/ioBroker.pixelit/pull/806) | Failed: adapter-tests (20.x, ubuntu-latest) | Superseded: Node 14 tsconfig is removed; @tsconfig/node22 22.0.6 matches the approved runtime baseline. |
| [#805](https://github.com/pixelit-project/ioBroker.pixelit/pull/805) | Failed: adapter-tests (20.x, ubuntu-latest) | Declined: @types/node 26 exposes APIs unavailable on Node 22. Keep @types/node 22.20.5 and block future automatic major bumps. |
| [#804](https://github.com/pixelit-project/ioBroker.pixelit/pull/804) | Failed: adapter-tests (20.x, ubuntu-latest) | Included: release-script-plugin-iobroker 5.2.0. |
| [#803](https://github.com/pixelit-project/ioBroker.pixelit/pull/803) | Failed: adapter-tests (20.x, macos-latest) | Included: @iobroker/testing 6.3.1. Requires Node >=22.19.0; redundant direct test-library declarations were removed. |
| [#802](https://github.com/pixelit-project/ioBroker.pixelit/pull/802) | Failed: adapter-tests (20.x, ubuntu-latest) | Included: actions/checkout v7 for CodeQL; workflow triggers use the actual master branch. |
| [#801](https://github.com/pixelit-project/ioBroker.pixelit/pull/801) | Passed | Superseded: Node 20 configuration is obsolete for the approved Node 22 baseline. Both the package and extends now use Node 22. |
| [#800](https://github.com/pixelit-project/ioBroker.pixelit/pull/800) | Passed | Included: Dependabot ignores @types/node major updates. |
| [#798](https://github.com/pixelit-project/ioBroker.pixelit/pull/798) | Passed | Included: js-controller >=6.0.11 plus the missing admin >=7.6.20 dependency. |
| [#787](https://github.com/pixelit-project/ioBroker.pixelit/pull/787) | Failed: adapter-tests (18.x, ubuntu-latest) | Included with corrections: Node >=22.19.0, CI matrix [22.x, 24.x]. The original diff accidentally retained 18.x and duplicated the WIP changelog heading. |
| [#783](https://github.com/pixelit-project/ioBroker.pixelit/pull/783) | Passed | Included: lodash 4.18.1 in the regenerated lockfile. |
| [#779](https://github.com/pixelit-project/ioBroker.pixelit/pull/779) | Passed | Included: seven-day npm cooldown, retaining the existing schedule and assignee. |
| [#777](https://github.com/pixelit-project/ioBroker.pixelit/pull/777) | Passed | Included: picomatch 2.3.2; other chains use patched 4.0.7. |
| [#776](https://github.com/pixelit-project/ioBroker.pixelit/pull/776) | Passed | Superseded by newer patch: flatted 3.4.4. |
| [#774](https://github.com/pixelit-project/ioBroker.pixelit/pull/774) | Passed | Superseded by newer patch: immutable 3.8.4. |
| [#773](https://github.com/pixelit-project/ioBroker.pixelit/pull/773) | Passed | Included: minimatch 3.1.5 and 9.0.9; newer test tooling uses 10.2.6. Removed dependency chains no longer require 5.x. |
| [#765](https://github.com/pixelit-project/ioBroker.pixelit/pull/765) | Passed | Superseded: current @iobroker/testing supplies sinon 22.1.0 and matching types. No separate direct Sinon dependency is needed. |
| [#729](https://github.com/pixelit-project/ioBroker.pixelit/pull/729) | Failed: adapter-tests (18.x, ubuntu-latest) | Included: @iobroker/adapter-dev 1.5.0. |
| [#728](https://github.com/pixelit-project/ioBroker.pixelit/pull/728) | Failed: adapter-tests (18.x, macos-latest) | Included: @iobroker/dev-server 0.8.0. Its remaining legacy vulnerabilities are documented separately; this update does not eliminate them. |
| [#719](https://github.com/pixelit-project/ioBroker.pixelit/pull/719) | Failed: adapter-tests (22.x, ubuntu-latest), check-and-lint | Declined as proposed: sinon-chai 4 is ESM-only and incompatible with the existing require setup. Use the CommonJS-compatible version supplied by @iobroker/testing; its regression tests pass. |
| [#692](https://github.com/pixelit-project/ioBroker.pixelit/pull/692) | No complete passing suite | Declined as proposed: direct Chai 5 plus types is unnecessary and changes the test interface. Use the compatible Chai 4 package supplied by current @iobroker/testing. |
| [#686](https://github.com/pixelit-project/ioBroker.pixelit/pull/686) | Not retrieved (public API rate limit); no passing status assumed | Superseded: adapter-dev 1.5.0 and esbuild 0.25.12 cover the requested 1.4.0/0.25.3 updates. A separate legacy esbuild 0.11.23 remains through dev-server and is not misrepresented as fixed. |
| [#685](https://github.com/pixelit-project/ioBroker.pixelit/pull/685) | Not retrieved (public API rate limit); no passing status assumed | Superseded: dev-server 0.8.0 includes serve-static 1.16.3 and send 0.19.2, newer than the proposed patches. |
| [#682](https://github.com/pixelit-project/ioBroker.pixelit/pull/682) | Not retrieved (public API rate limit); no passing status assumed | Superseded: identical source changes to #685; dev-server 0.8.0 already resolves send 0.19.2. |

## Action compatibility checks

- [testing-action-check v2 definition](https://github.com/ioBroker/testing-action-check/blob/v2/action.yml): existing node-version/lint inputs remain supported; type-checking runs npm run check.
- [checkout v7 release notes](https://github.com/actions/checkout/tree/v7): safer fork checkout defaults do not affect CodeQL push/pull_request events. No unsafe checkout override was added.
- [stale v11 release notes](https://github.com/actions/stale/tree/v11): ESM migration, with unchanged action inputs and behavior.

## Consolidated validation

Node.js 22 and 24 pass all 12 command regression tests, 61 package/schema tests, TypeScript checking, ESLint and startup/shutdown integration testing. A clean lockfile install and npm pack dry run also pass. GitHub CI for the consolidated PR must pass before merging.

The remaining development dependency vulnerabilities and the unverified physical device/npm publishing checks are recorded in [maintenance.md](maintenance.md). No release is triggered by the maintenance branch.

## GitHub disposition

The original PRs will only be closed as superseded after the consolidated maintenance PR lands. Decisions that reject an incompatible upgrade are recorded individually above; compatible changes are included in the consolidated PR rather than merging stale lockfile snapshots.
