import { CreateProject } from '../create-project';
import { RemoveComponentImport } from './remove-component-import';

describe('RemoveComponentImport', () => {
  const code = (imports: string) => `${imports}
@Component({ imports: [ AComponent, BComponent ] })
export class XComponent {}
`;

  it('removes element and import declaration', () => {
    const sf = CreateProject().createSourceFile('a.ts', code(`import { AComponent } from './a';\nimport { BComponent } from './b';`));
    RemoveComponentImport(sf, 'AComponent');
    expect(sf.getText()).not.toContain('AComponent');
    expect(sf.getText()).toContain('BComponent');
  });

  it('accepts class declaration and TypeImport', () => {
    const sf = CreateProject().createSourceFile('a.ts', code(`import { AComponent } from './a';\nimport { BComponent } from './b';`));
    RemoveComponentImport(sf.getClassOrThrow('XComponent'), { name: 'BComponent', moduleSpecifier: './b' });
    expect(sf.getText()).not.toContain('BComponent');
    expect(sf.getText()).toContain('AComponent');
  });

  it('keeps other named imports sharing the declaration', () => {
    const sf = CreateProject().createSourceFile('a.ts', code(`import { AComponent, BComponent } from './ab';`));
    RemoveComponentImport(sf, 'AComponent');
    expect(sf.getText()).toContain(`import { BComponent } from './ab';`);
    expect(sf.getText()).not.toContain('AComponent');
  });
});
