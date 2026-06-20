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
