// CJS stub for `ora` (a terminal spinner). @angular-devkit/schematics 21 bundles
// ora v8 which is ESM-only; jest (CJS) cannot parse it in node_modules and it is
// never exercised in unit tests, so map it to this no-op chainable spinner.
function createSpinner() {
  const spinner = {
    start() { return spinner; },
    stop() { return spinner; },
    succeed() { return spinner; },
    fail() { return spinner; },
    warn() { return spinner; },
    info() { return spinner; },
    clear() { return spinner; },
    render() { return spinner; },
    stopAndPersist() { return spinner; },
    text: '',
    prefixText: '',
    color: 'cyan',
    isSpinning: false,
  };
  return spinner;
}

module.exports = createSpinner;
module.exports.default = createSpinner;
module.exports.oraPromise = async (action) => (typeof action === 'function' ? action(createSpinner()) : action);
