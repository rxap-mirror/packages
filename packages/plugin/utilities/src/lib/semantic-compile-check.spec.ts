import { existsSync } from 'fs';
import {
  dirname,
  join,
} from 'path';
import { CompileGeneratedFiles } from './semantic-compile-check';

function findTsconfigBase(start: string): string {
  let dir = start;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = join(dir, 'tsconfig.base.json');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error('Could not locate tsconfig.base.json above ' + start);
    }
    dir = parent;
  }
}

describe('CompileGeneratedFiles', () => {

  const tsconfigBasePath = findTsconfigBase(__dirname);

  it('reports no diagnostics for type-correct code', () => {
    const diagnostics = CompileGeneratedFiles({
      'app/src/foo.ts': 'export const answer: number = 42;\n',
    }, { tsconfigBasePath });
    expect(diagnostics).toEqual([]);
  });

  it('catches a real type error in the generated code (has teeth)', () => {
    const diagnostics = CompileGeneratedFiles({
      'app/src/bad.ts': 'export const answer: number = \'not a number\';\n',
    }, { tsconfigBasePath });
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].path).toBe('app/src/bad.ts');
    expect(diagnostics[0].code).toBe(2322); // Type 'string' is not assignable to type 'number'.
  });

  it('resolves @rxap/* imports to workspace source (no spurious cannot-find-module)', () => {
    const diagnostics = CompileGeneratedFiles({
      'app/src/uses-rxap.ts': 'import { classify } from \'@rxap/utilities\';\nexport const x: string = classify(\'foo-bar\');\n',
    }, { tsconfigBasePath, ignoreCodes: [] });
    expect(diagnostics).toEqual([]);
  });

});
