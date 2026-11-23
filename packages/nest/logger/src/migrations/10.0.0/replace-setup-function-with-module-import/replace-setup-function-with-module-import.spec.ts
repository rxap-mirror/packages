import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import update from './replace-setup-function-with-module-import';

describe('replace-setup-function-with-module-import migration', () => {

  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write('apps/api/src/main.ts', [
      'const app = await NestFactory.create(AppModule);',
      'app.useLogger(new RxapLogger());',
      'await app.listen(3000);',
    ].join('\n'));
    tree.write('apps/api/src/app/app.module.ts', [
      `import { Module, Logger } from '@nestjs/common';`,
      `@Module({ imports: [], providers: [ Logger ] })`,
      `export class AppModule {}`,
    ].join('\n'));
    tree.write('apps/api/src/app/other.module.ts', [
      `import { Module, Logger } from '@nestjs/common';`,
      `@Module({ providers: [ Logger, Other ] })`,
      `export class OtherModule {}`,
    ].join('\n'));
    tree.write('apps/api/src/app/plain.module.ts', 'export const x = 1;');
  });

  it('should remove the useLogger call from the main.ts', () => {
    update(tree);
    const main = tree.read('apps/api/src/main.ts', 'utf-8')!;
    expect(main).not.toContain('useLogger');
    expect(main).toContain('NestFactory.create(AppModule)');
    expect(main).toContain('app.listen(3000)');
  });

  it('should leave a main.ts without the useLogger call untouched', () => {
    tree.write('apps/api/src/main.ts', 'const a = 1;');
    update(tree);
    expect(tree.read('apps/api/src/main.ts', 'utf-8')).toBe('const a = 1;');
  });

  it('should import the LoggerModule in the app.module.ts and remove the Logger provider', () => {
    update(tree);
    const appModule = tree.read('apps/api/src/app/app.module.ts', 'utf-8')!;
    expect(appModule).toContain('LoggerModule');
    expect(appModule).toContain('@rxap/nest-logger');
    expect(appModule).toMatch(/imports:\s*\[\s*LoggerModule\s*\]/);
    expect(appModule).not.toMatch(/providers:\s*\[\s*Logger\s*\]/);
  });

  it('should add the LoggerModule to the app.module.ts even if the SentryModule is already imported', () => {
    tree.write('apps/api/src/app/app.module.ts', [
      `import { Module } from '@nestjs/common';`,
      `import { SentryModule } from '@rxap/nest-sentry';`,
      `@Module({ imports: [ SentryModule.register() ] })`,
      `export class AppModule {}`,
    ].join('\n'));
    update(tree);
    const appModule = tree.read('apps/api/src/app/app.module.ts', 'utf-8')!;
    expect(appModule).toContain('LoggerModule');
    expect(appModule).toContain('SentryModule');
  });

  it('should not add the LoggerModule to the app.module.ts twice', () => {
    update(tree);
    const once = tree.read('apps/api/src/app/app.module.ts', 'utf-8')!;
    update(tree);
    const twice = tree.read('apps/api/src/app/app.module.ts', 'utf-8')!;
    expect(twice).toBe(once);
    expect(twice.match(/LoggerModule/g)!.length).toBe(once.match(/LoggerModule/g)!.length);
  });

  it('should only remove the Logger provider from other modules', () => {
    update(tree);
    const other = tree.read('apps/api/src/app/other.module.ts', 'utf-8')!;
    expect(other).not.toContain('LoggerModule');
    expect(other).toContain('Other');
    expect(other).not.toMatch(/providers:\s*\[\s*Logger\b/);
  });

  it('should not touch modules that are not nest modules', () => {
    update(tree);
    expect(tree.read('apps/api/src/app/plain.module.ts', 'utf-8')).toBe('export const x = 1;');
  });

});
