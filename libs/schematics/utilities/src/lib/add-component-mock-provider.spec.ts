import { Project } from 'ts-morph';
import { AddComponentMockProvider } from './add-component-mock-provider';

describe('Helpers', () => {

  describe('AddComponentMockProvider', () => {

    let project: Project;

    beforeEach(() => {
      project = new Project();
    });

    it('should create all required variable declaration and imports', () => {

      const sourceFile = project.createSourceFile('test.ts', `
@Component({})
export class Module {}
`);

      AddComponentMockProvider(sourceFile, {
          provide:  'MOCK_PROVIDE',
          useValue: 'test'
        },
        {
          provide:  'REAL_PROVIDE',
          useValue: 'test'
        }
      );

      sourceFile.organizeImports();

      expect(sourceFile.getFullText()).toEqual(`import { isDevMode, Provider } from "@angular/core";

@Component({
        providers: [MOCK_PROVIDER_FACTORY]
    })
export class Module {}

export const MOCK_PROVIDER_FACTORY = isDevMode() ? MOCK_PROVIDERS : REAL_PROVIDERS;
export const MOCK_PROVIDERS: Provider[] = [{
        provide: MOCK_PROVIDE,
        useValue: test
    }];
export const REAL_PROVIDERS: Provider[] = [{
        provide: REAL_PROVIDE,
        useValue: test
    }];
`);

    });

    it('should add provider to existing', () => {

      const sourceFile = project.createSourceFile('test.ts', `import { isDevMode, Provider } from "@angular/core";

@Component({
        providers: [MOCK_PROVIDER_FACTORY]
    })
export class Module {}

export const MOCK_PROVIDER_FACTORY = isDevMode() ? MOCK_PROVIDERS : REAL_PROVIDERS;
export const MOCK_PROVIDERS: Provider[] = [{
        provide: MOCK_PROVIDE,
        useValue: test
    }];
export const REAL_PROVIDERS: Provider[] = [{
        provide: REAL_PROVIDE,
        useValue: test
    }];
`);

      AddComponentMockProvider(sourceFile, {
        provide:  'MOCK_PROVIDE2',
        useValue: 'test2'
      }, {
        provide:  'REAL_PROVIDE2',
        useValue: 'test2'
      });

      sourceFile.organizeImports();

      expect(sourceFile.getFullText()).toEqual(`import { isDevMode, Provider } from "@angular/core";

@Component({
        providers: [MOCK_PROVIDER_FACTORY]
    })
export class Module {}

export const MOCK_PROVIDER_FACTORY = isDevMode() ? MOCK_PROVIDERS : REAL_PROVIDERS;
export const MOCK_PROVIDERS: Provider[] = [{
        provide: MOCK_PROVIDE,
        useValue: test
    },
    {
        provide: MOCK_PROVIDE2,
        useValue: test2
    }
];
export const REAL_PROVIDERS: Provider[] = [{
        provide: REAL_PROVIDE,
        useValue: test
    },
    {
        provide: REAL_PROVIDE2,
        useValue: test2
    }
];
`);

    });

  });

});
