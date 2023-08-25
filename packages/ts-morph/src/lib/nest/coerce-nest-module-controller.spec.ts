import {
  Project,
  PropertyAssignment,
  Writers,
} from 'ts-morph';
import { CoerceNestModuleController } from './coerce-nest-module-controller';
import { GetNestModuleMetadata } from './get-nest-module-metadata';

describe('@rxap/ts-morph', () => {

  describe('nest', () => {

    describe('CoerceNestModuleController', () => {

      it('should add module provider', () => {

        const project = new Project({ useInMemoryFileSystem: true });

        const sourceFile = project.createSourceFile('module.ts');

        sourceFile.addClass({
          isExported: true,
          name: 'MyModule',
          decorators: [
            {
              name: 'Module',
              arguments: [ Writers.object({}) ],
            },
          ],
        });

        sourceFile.addImportDeclaration({
          namedImports: [ 'Module' ],
          moduleSpecifier: '@nestjs/common',
        });

        CoerceNestModuleController(sourceFile, { name: 'TestController' });

        const metadata = GetNestModuleMetadata(sourceFile);

        expect(metadata.getProperties()).toHaveLength(1);
        expect((metadata.getProperties()[0] as PropertyAssignment).getInitializer()?.getFullText().trim())
          .toEqual('[TestController]');


      });

    });

  });

});
