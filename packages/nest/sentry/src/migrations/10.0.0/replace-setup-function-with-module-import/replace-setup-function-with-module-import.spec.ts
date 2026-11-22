import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import update from './replace-setup-function-with-module-import';

describe('replace-setup-function-with-module-import migration', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write('apps/api/src/main.ts', [
      'const server = createServer();',
      'server.after(SetupSentryLogger());',
      'server.run();',
    ].join('\n'));
    tree.write('apps/api/src/app/app.module.ts', [
      `import { Module } from '@nestjs/common';`,
      `import { LoggerModule } from '@rxap/nest-logger';`,
      `@Module({ imports: [ LoggerModule ], providers: [ Logger ] })`,
      `export class AppModule {}`,
    ].join('\n'));
    tree.write('apps/api/src/app/other.module.ts', [
      `import { Module, Logger } from '@nestjs/common';`,
      `@Module({ providers: [ Logger, Other ] })`,
      `export class OtherModule {}`,
    ].join('\n'));
    tree.write('apps/api/src/app/plain.module.ts', 'export const x = 1;');
  });

  it('should remove the setup call and import the SentryModule', () => {
    update(tree);
    expect(tree.read('apps/api/src/main.ts', 'utf-8')).not.toContain('SetupSentryLogger');
    const appModule = tree.read('apps/api/src/app/app.module.ts', 'utf-8')!;
    expect(appModule).toContain('SentryModule.register()');
    expect(appModule).toContain('@rxap/nest-sentry');
    expect(appModule).not.toMatch(/imports: \[[^\]]*LoggerModule/);
    expect(appModule).not.toMatch(/providers:\s*\[\s*Logger\s*\]/);
  });

  it('should only remove the Logger provider from other modules', () => {
    update(tree);
    const other = tree.read('apps/api/src/app/other.module.ts', 'utf-8')!;
    expect(other).not.toContain('SentryModule');
    expect(other).toContain('Other');
    expect(tree.read('apps/api/src/app/plain.module.ts', 'utf-8')).toBe('export const x = 1;');
  });

  it('should not add the SentryModule without a setup call', () => {
    tree.write('apps/api/src/main.ts', 'const a = 1;');
    update(tree);
    expect(tree.read('apps/api/src/app/app.module.ts', 'utf-8')).not.toContain('SentryModule');
  });

});
