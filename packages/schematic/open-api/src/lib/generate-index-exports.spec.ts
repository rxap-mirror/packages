import { CreateProject } from '@rxap/ts-morph';
import {
  IndentationText,
  Project,
  QuoteKind,
} from 'ts-morph';
import { GenerateIndexExports } from './generate-index-exports';

describe('@rxap/schematics-open-api', () => {

  describe('GenerateIndexExports', () => {

    it('should create for each source file a library export', () => {

      const project = CreateProject();

      project.createSourceFile('components/user.dto.ts');
      project.createSourceFile('components/car.dto.ts');
      project.createSourceFile('remote-method/user-controller-get-by-id.remote-method.ts');

      const indexExports = GenerateIndexExports(project);

      expect(indexExports).toEqual([
        `export * from './lib/components/car.dto';`,
        `export * from './lib/components/user.dto';`,
        `export * from './lib/remote-method/user-controller-get-by-id.remote-method';`,
      ].join('\n'));

    });

  });

});
