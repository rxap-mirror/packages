// Minimal jest transformer that converts ESM-only dependencies (e.g. magic-string >= 1, pulled in by
// @angular-devkit/schematics >= 22) to CommonJS so they can be loaded by the (CommonJS) jest runtime.
const ts = require('typescript');

module.exports = {
  process(sourceText, sourcePath) {
    const { outputText } = ts.transpileModule(sourceText, {
      // a .mjs file name would make typescript keep the ESM syntax
      fileName: sourcePath.replace(/\.m?js$/, '.js'),
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        allowJs: true,
        esModuleInterop: true,
        sourceMap: false,
      },
    });
    return { code: outputText };
  },
};
