import { Tree } from '@nx/devkit';
import {
  CoerceNestModuleImport,
  CreateProject,
  RemoveNestModuleImport,
  RemoveNestModuleProvider,
} from '@rxap/ts-morph';
import { VisitTree } from '@rxap/workspace-utilities';

export default function update(tree: Tree) {

  // the flag must be shared between files, because the setup call is removed from the main.ts file
  // while the module import has to be added to the app.module.ts file
  let hasSetupSentryLoggerFunction = false;

  // visit the main.ts files first, so the flag is set before the app.module.ts files are processed
  const entries = [ ...VisitTree(tree, '/') ].sort((a, b) =>
    Number(b.path.endsWith('main.ts')) - Number(a.path.endsWith('main.ts')));

  for (const { isFile, path } of entries) {

    if (isFile) {

      if (path.endsWith('main.ts')) {
        let content = tree.read(path, 'utf-8')!;

        const lineIndex = content.split('\n').findIndex(line => line.includes('server.after(SetupSentryLogger())'));

        if (lineIndex !== -1) {
          hasSetupSentryLoggerFunction = true;
          // remove the line from content
          content = content.split('\n').filter((_, index) => index !== lineIndex).join('\n');
          tree.write(path, content);
        }
      }

      if (hasSetupSentryLoggerFunction && path.endsWith('app.module.ts')) {
        let content = tree.read(path, 'utf-8')!;

        if (content.includes('@nestjs/common') && content.includes('@Module')) {
          const project = CreateProject();
          const sourceFile = project.createSourceFile('app.module.ts', content);
          CoerceNestModuleImport(sourceFile, {
            moduleName: 'SentryModule',
            importWriter: w => w.write('SentryModule.register()'),
            moduleSpecifier: '@rxap/nest-sentry'
          });
          RemoveNestModuleImport(sourceFile, { moduleName: 'LoggerModule' });
          content = sourceFile.getFullText();
          tree.write(path, content);
        }
      }

      if (path.endsWith('module.ts')) {
        let content = tree.read(path, 'utf-8')!;
        if (content.includes('@nestjs/common') && content.includes('@Module')) {
          const project = CreateProject();
          const sourceFile = project.createSourceFile('app.module.ts', content);
          RemoveNestModuleProvider(sourceFile, { providerObject: 'Logger' });
          content = sourceFile.getFullText();
          tree.write(path, content);
        }
      }

    }

  }

}
