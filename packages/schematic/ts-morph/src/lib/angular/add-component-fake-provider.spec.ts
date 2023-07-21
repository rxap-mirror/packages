import { Project } from 'ts-morph';
import { AddComponentFakeProvider } from './add-component-fake-provider';

describe('Helpers', () => {

  describe('AddComponentFakeProvider', () => {

    let project: Project;

    beforeEach(() => {
      project = new Project();
    });

    it('should create all required variable declaration and imports', () => {

      const sourceFile = project.createSourceFile('test.ts', `
@Component({})
export class Module {}
`);

      AddComponentFakeProvider(
        sourceFile,
        {
          provide: 'FAKE_PROVIDE',
          useValue: 'test',
        },
        {
          provide: 'REAL_PROVIDE',
          useValue: 'test',
        },
        'testing',
      );

      sourceFile.organizeImports();

      expect(sourceFile.getFullText()).toEqual(`import { Provider } from "@angular/core";
import { IsFaked } from "@rxap/fake";
export const FAKE_PROVIDERS: Provider[] = [{
        provide: FAKE_PROVIDE,
        useValue: test
    }];
export const REAL_PROVIDERS: Provider[] = [{
        provide: REAL_PROVIDE,
        useValue: test
    }];
export const FAKE_PROVIDER_FACTORY = IsFaked('testing') ? FAKE_PROVIDERS : REAL_PROVIDERS;

@Component({
    providers: [FAKE_PROVIDER_FACTORY]
})
export class Module {}`);

    });

    it('should add provider to existing', () => {

      const sourceFile = project.createSourceFile('test.ts', `import { Provider } from "@angular/core";
import { IsFaked } from "@rxap/fake";

export const FAKE_PROVIDERS: Provider[] = [{
        provide: FAKE_PROVIDE,
        useValue: test
    }];
export const REAL_PROVIDERS: Provider[] = [{
        provide: REAL_PROVIDE,
        useValue: test
    }];
export const FAKE_PROVIDER_FACTORY = IsFaked('testing') ? FAKE_PROVIDERS : REAL_PROVIDERS;

@Component({
        providers: [FAKE_PROVIDER_FACTORY]
    })
export class Module {}
`);

      AddComponentFakeProvider(
        sourceFile,
        {
          provide: 'FAKE_PROVIDE2',
          useValue: 'test2',
        }, {
          provide: 'REAL_PROVIDE2',
          useValue: 'test2',
        },
        'testing',
      );

      sourceFile.organizeImports();

      expect(sourceFile.getFullText()).toEqual(`import { Provider } from "@angular/core";
import { IsFaked } from "@rxap/fake";

export const FAKE_PROVIDERS: Provider[] = [{
        provide: FAKE_PROVIDE,
        useValue: test
    },
    {
        provide: FAKE_PROVIDE2,
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
export const FAKE_PROVIDER_FACTORY = IsFaked('testing') ? FAKE_PROVIDERS : REAL_PROVIDERS;

@Component({
        providers: [FAKE_PROVIDER_FACTORY]
    })
export class Module {}
`);

    });

  });

});
