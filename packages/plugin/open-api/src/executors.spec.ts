const runGenerator = jest.fn();
jest.mock('@rxap/plugin-library', () => ({ RunGenerator: (...a: any[]) => runGenerator(...a) }));

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import copyExecutor from './executors/copy-open-api-sdk/executor';
import generateExecutor from './executors/generate/executor';

describe('plugin-open-api executors', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation());

  it('generate delegates to RunGenerator dropping undefined options', async () => {
    runGenerator.mockResolvedValue({ success: true });
    const ctx: any = {};
    await generateExecutor({ path: 'a', url: undefined } as any, ctx);
    expect(runGenerator).toHaveBeenCalledWith({ generator: '@rxap/plugin-open-api:generate', options: { path: 'a' } }, ctx);
  });

  describe('copy-open-api-sdk', () => {
    let root: string;
    let ctx: any;
    beforeEach(() => {
      root = mkdtempSync(join(tmpdir(), 'copy-sdk-'));
      for (const folder of [ 'parameters', 'responses', 'components', 'data-sources', 'remote-methods', 'directives', 'commands' ]) {
        mkdirSync(join(root, 'sdk/src/lib', folder), { recursive: true });
        writeFileSync(join(root, 'sdk/src/lib', folder, 'index.ts'), folder);
      }
      mkdirSync(join(root, 'app/src/lib/sdk'), { recursive: true });
      writeFileSync(join(root, 'app/src/lib/sdk/stale.ts'), '');
      ctx = {
        root,
        projectName: 'app',
        projectsConfigurations: {
          projects: {
            app: { root: 'app', sourceRoot: 'app/src' },
            sdk: { root: 'sdk', sourceRoot: 'sdk/src' },
          },
        },
      };
    });

    it('throws for unknown sdk project', async () => {
      await expect(copyExecutor({ clientSdkProject: 'nope', outputDir: 'sdk' } as any, ctx)).rejects.toThrow("Could not find project 'nope'");
    });

    it('copies generic, angular and nest folders', async () => {
      const cwd = process.cwd();
      process.chdir(root);
      try {
        const result = await copyExecutor({ clientSdkProject: 'sdk', outputDir: 'sdk', angular: true, nestjs: true } as any, ctx);
        expect(result).toEqual({ success: true });
        const out = readdirSync(join(root, 'app/src/lib/sdk')).sort();
        expect(out).toEqual([ 'commands', 'components', 'data-sources', 'directives', 'parameters', 'remote-methods', 'responses' ]);
        expect(existsSync(join(root, 'app/src/lib/sdk/stale.ts'))).toBe(false);
      } finally {
        process.chdir(cwd);
      }
    });

    it('respects skip flags (remote methods forced when directives kept)', async () => {
      const cwd = process.cwd();
      process.chdir(root);
      try {
        await copyExecutor({ clientSdkProject: 'sdk', outputDir: 'a', angular: true, skipRemoteMethods: true, skipDataSources: true } as any, ctx);
        expect(readdirSync(join(root, 'app/src/lib/a')).sort()).toEqual([ 'components', 'directives', 'parameters', 'remote-methods', 'responses' ]);
        await copyExecutor({ clientSdkProject: 'sdk', outputDir: 'b', angular: true, skipRemoteMethods: true, skipDirectives: true } as any, ctx);
        expect(readdirSync(join(root, 'app/src/lib/b'))).not.toContain('remote-methods');
      } finally {
        process.chdir(cwd);
      }
    });
  });
});
