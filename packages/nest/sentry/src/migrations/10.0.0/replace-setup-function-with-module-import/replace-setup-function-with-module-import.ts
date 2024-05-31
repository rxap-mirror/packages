import { Tree } from '@nx/devkit';
import {
  CoerceNestModuleImport,
  CreateProject,
  RemoveNestModuleImport,
  RemoveNestModuleProvider,
} from '@rxap/ts-morph';
import { VisitTree } from '@rxap/workspace-utilities';

export default function update(tree: Tree) {

  for (const { isFile, path } of VisitTree(tree, '/')) {

    if (isFile) {

      let hasSetupSentryLoggerFunction = false;

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
            moduleName: 'SentryLoggerModule',
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
