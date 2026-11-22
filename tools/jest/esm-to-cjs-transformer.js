// Minimal jest transformer that converts ESM-only dependencies (e.g. magic-string >= 1, pulled in by
// @angular-devkit/schematics >= 22) to CommonJS so they can be loaded by the (CommonJS) jest runtime.
const ts = require('typescript');

module.exports = {
  process(sourceText, sourcePath) {
    // `import.meta` and a top level `const require = createRequire(...)` (used by @nestjs/* 12) are not valid in CommonJS
    const source = sourceText
      .replace(/const require = /g, 'const __esmRequire = ')
      .replace(/import\.meta\.dirname/g, '__dirname')
      .replace(/import\.meta\.filename/g, '__filename')
      .replace(/import\.meta\.url/g, "require('url').pathToFileURL(__filename).href");
    const { outputText } = ts.transpileModule(source, {
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
