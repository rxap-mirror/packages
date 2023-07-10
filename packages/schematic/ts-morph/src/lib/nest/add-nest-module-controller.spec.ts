import {
  Project,
  PropertyAssignment,
  Writers,
} from 'ts-morph';
import { GetNestModuleMetadata } from './get-nest-module-metadata';
import { AddNestModuleController } from './add-nest-module-controller';

describe('@rxap/schematics-ts-morph', () => {

  describe('nest', () => {

    describe('AddNestModuleController', () => {

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

        AddNestModuleController(sourceFile, 'TestController');

        const metadata = GetNestModuleMetadata(sourceFile);

        expect(metadata.getProperties()).toHaveLength(1);
        expect((metadata.getProperties()[0] as PropertyAssignment).getInitializer()?.getFullText().trim())
          .toEqual('[TestController]');


      });

    });

  });

});
