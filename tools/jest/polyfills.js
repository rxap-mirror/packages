// Nx 21's project-graph plugin loader (loadSpecifiedNxPlugins) calls
// performance.mark()/measure(). Jest's sandboxed Node test environment provides
// a `performance` global that lacks these methods, so generators that build the
// project graph (e.g. @nx/angular library -> @nx/eslint init) throw
// "performance.mark is not a function". Back the global with Node's real
// perf_hooks implementation.
const { performance } = require('node:perf_hooks');

if (
  typeof globalThis.performance === 'undefined' ||
  typeof globalThis.performance.mark !== 'function' ||
  typeof globalThis.performance.measure !== 'function'
) {
  globalThis.performance = performance;
}

// Nx 23 formats generated files with oxfmt (ESM-only, not loadable by the CommonJS jest runtime) when the tree
// contains an `.oxfmtrc.json`. Generator specs only care about the unformatted content.
process.env.NX_SKIP_FORMAT = 'true';
