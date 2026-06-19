import * as ts from 'typescript';

export interface TypeScriptSyntaxDiagnostic {
  path: string;
  message: string;
  line: number;
  character: number;
}

/**
 * Transpiles every generated `.ts` file (single-file, no type checking, no
 * module resolution) and returns any **syntactic** diagnostics.
 *
 * This is the interim stand-in for the full "does generated code compile"
 * e2e: it catches the realistic generator breakage from a framework
 * migration — malformed output, broken template interpolation, dangling
 * braces — without fighting module/type resolution (which the real-workspace
 * e2e covers). Pass it the `{ path: content }` map produced by
 * {@link SnapshotGeneratedTree} (devkit Tree) or `diffTreeContent` (schematic
 * Tree) so it composes with the golden-master specs:
 *
 * ```ts
 * await myGenerator(tree, options);
 * expect(CollectTypeScriptSyntaxDiagnostics(SnapshotGeneratedTree(tree))).toEqual([]);
 * ```
 */
export function CollectTypeScriptSyntaxDiagnostics(
  files: Record<string, string>,
): TypeScriptSyntaxDiagnostic[] {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    jsx: ts.JsxEmit.Preserve,
  };

  const diagnostics: TypeScriptSyntaxDiagnostic[] = [];

  for (const [ path, content ] of Object.entries(files)) {
    if (!path.endsWith('.ts') || path.endsWith('.d.ts')) {
      continue;
    }
    const { diagnostics: fileDiagnostics = [] } = ts.transpileModule(content, {
      compilerOptions,
      reportDiagnostics: true,
      fileName: path,
    });
    for (const diagnostic of fileDiagnostics) {
      // transpileModule only surfaces syntactic + options diagnostics; keep errors.
      if (diagnostic.category !== ts.DiagnosticCategory.Error) {
        continue;
      }
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      let line = 0;
      let character = 0;
      if (diagnostic.file && diagnostic.start !== undefined) {
        ({ line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start));
      }
      diagnostics.push({ path, message, line: line + 1, character: character + 1 });
    }
  }

  return diagnostics.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
}
