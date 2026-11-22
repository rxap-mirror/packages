// CJS stub for `@ng-prism/core`. The package is ESM-only, so jest (CJS) cannot parse it
// from node_modules. Library components only import the `@Showcase` decorator, which does
// nothing at runtime: it is read statically by the ng-prism builder.
function Showcase() {
  return function () {};
}

module.exports = { Showcase };
