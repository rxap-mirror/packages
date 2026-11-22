import { CreateProject } from '../create-project';
import { CoerceComponentInput } from './coerce-component-input';

describe('CoerceComponentInput', () => {
  const create = (body = '') => CreateProject().createSourceFile('a.ts', `@Component({}) export class XComponent { ${ body } }`);

  it('adds optional property input', () => {
    const sf = create();
    const p = CoerceComponentInput(sf, 'name', 'string');
    expect(p.getText()).toContain('@Input()');
    expect(sf.getText()).toMatch(/name\?: string;/);
    expect(sf.getText()).toContain(`import { Input } from '@angular/core';`);
  });

  it('adds required, alias and initializer', () => {
    const sf = create();
    CoerceComponentInput(sf.getClassOrThrow('XComponent'), 'a', 'number', { isRequired: true, alias: 'b' });
    expect(sf.getText()).toMatch(/@Input\(\{\s*alias: 'b',\s*required: true\s*\}\)/);
    expect(sf.getText()).toContain('a!: number');
    CoerceComponentInput(sf, 'c', 'number', { initializer: '1' });
    expect(sf.getText()).toContain('c: number = 1');
  });

  it('adds set accessor input', () => {
    const sf = create();
    CoerceComponentInput(sf, 'v', 'string', { asSetAccessor: true });
    const text = sf.getText();
    expect(text).toContain('set v(v: string)');
    expect(text).toContain('this._v = v;');
    expect(text).toContain('private _v');
    expect(text).toContain('@Input()');
  });

  it('is idempotent and rejects constructor member clash', () => {
    const sf = create();
    CoerceComponentInput(sf, 'n', 'string');
    CoerceComponentInput(sf, 'n', 'string');
    expect(sf.getText().match(/@Input\(\)/g)).toHaveLength(1);
    const sf2 = create('constructor(private readonly n: string) {}');
    expect(() => CoerceComponentInput(sf2, 'n', 'string')).toThrow('constructor parameter');
  });
});
