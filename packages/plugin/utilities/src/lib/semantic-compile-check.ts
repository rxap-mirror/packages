import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'fs';
import {
  dirname,
  join,
} from 'path';
import * as ts from 'typescript';

/**
 * Walks up from `start` (default: the current working directory) until it finds
 * the workspace `tsconfig.base.json`. Lets specs call {@link CompileGeneratedFiles}
 * without hard-coding a relative path to the workspace root.
 */
export function FindWorkspaceTsconfigBase(start: string = process.cwd()): string {
  let dir = start;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = join(dir, 'tsconfig.base.json');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`Could not locate tsconfig.base.json above ${ start }`);
    }
    dir = parent;
  }
}

export interface SemanticCompileDiagnostic {
  path: string;
  code: number;
  message: string;
  line: number;
}

export interface SemanticCompileOptions {
  /**
   * Absolute path to the workspace `tsconfig.base.json` — its `compilerOptions`
   * (notably `paths` and `baseUrl`) are used so generated `@rxap/*` imports
   * resolve to source and framework imports resolve from the workspace
   * `node_modules`. Defaults to {@link FindWorkspaceTsconfigBase} (walks up from
   * the current working directory).
   */
  tsconfigBasePath?: string;
  /**
   * Workspace root that owns `node_modules`. Defaults to the directory of
   * `tsconfigBasePath`.
   */
  workspaceRoot?: string;
  /**
   * Diagnostic codes to ignore. Defaults to `[ 2307 ]` (Cannot find module) so
   * imports to packages that are not installed/aliased in this isolated compile
   * do not masquerade as real type errors — the trade-off the "lighter"
   * semantic check accepts vs a full real-workspace install.
   */
  ignoreCodes?: number[];
}

/**
 * Semantically type-checks generated code against the workspace's real
 * framework types and `@rxap/*` sources.
 *
 * The `{ path: content }` map (from `SnapshotGeneratedTree` / `captureTree`) is
 * written to a throwaway directory under the workspace root, then compiled with
 * the workspace `tsconfig.base.json` compiler options. Only diagnostics located
 * **inside the generated files** are returned — transitive errors in
 * dependencies (`@angular/*`, `@rxap/*` source, `node_modules`) are ignored, so
 * the result reflects whether the *generated code itself* type-checks against
 * the real framework. This is the lighter stand-in for a full verdaccio
 * publish/install e2e: it catches a migration that makes a generator emit code
 * that no longer compiles (removed API, changed signature, wrong import path),
 * without the cost of a real install. Module-resolution misses (code 2307) are
 * ignored by default.
 */
export function CompileGeneratedFiles(
  files: Record<string, string>,
  options: SemanticCompileOptions = {},
): SemanticCompileDiagnostic[] {
  const tsconfigBasePath = options.tsconfigBasePath ?? FindWorkspaceTsconfigBase();
  const workspaceRoot = options.workspaceRoot ?? dirname(tsconfigBasePath);
  const ignoreCodes = new Set(options.ignoreCodes ?? [ 2307 ]);

  const configText = ts.sys.readFile(tsconfigBasePath);
  if (!configText) {
    throw new Error(`Cannot read tsconfig at ${ tsconfigBasePath }`);
  }
  const { config } = ts.parseConfigFileTextToJson(tsconfigBasePath, configText);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, workspaceRoot);

  const compilerOptions: ts.CompilerOptions = {
    ...parsed.options,
    baseUrl: workspaceRoot,
    noEmit: true,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    composite: false,
    declaration: false,
    incremental: false,
    tsBuildInfoFile: undefined,
  };

  const tmpRoot = mkdtempSync(join(workspaceRoot, 'tmp-semantic-check-'));
  const generatedAbsolutePaths = new Set<string>();
  try {
    const rootNames: string[] = [];
    for (const [ path, content ] of Object.entries(files)) {
      const absolute = join(tmpRoot, path);
      mkdirSync(dirname(absolute), { recursive: true });
      writeFileSync(absolute, content);
      const normalized = absolute.replace(/\\/g, '/');
      generatedAbsolutePaths.add(normalized);
      if (path.endsWith('.ts') && !path.endsWith('.d.ts') && !path.endsWith('.spec.ts')) {
        rootNames.push(absolute);
      }
    }

    const program = ts.createProgram(rootNames, compilerOptions);
    const diagnostics: SemanticCompileDiagnostic[] = [];
    for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
      if (!diagnostic.file) {
        continue;
      }
      const fileName = diagnostic.file.fileName.replace(/\\/g, '/');
      // Only report errors located in the generated files themselves.
      if (!generatedAbsolutePaths.has(fileName)) {
        continue;
      }
      if (ignoreCodes.has(diagnostic.code)) {
        continue;
      }
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      let line = 0;
      if (diagnostic.start !== undefined) {
        line = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1;
      }
      diagnostics.push({
        path: fileName.slice(tmpRoot.length + 1),
        code: diagnostic.code,
        message,
        line,
      });
    }
    return diagnostics.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
}
