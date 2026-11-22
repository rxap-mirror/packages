import { CreateProject } from '../create-project';
import {
  CoerceDataSourceClass,
  CoerceExtendsBaseDataSource,
  CoerceRxapDataSourceDecorator,
} from './coerce-data-source-class';

describe('CoerceDataSourceClass', () => {
  const create = () => CreateProject().createSourceFile('a.ts', '');

  it('creates default data source', () => {
    const sf = create();
    const cls = CoerceDataSourceClass(sf, { name: 'user' });
    expect(cls.getName()).toBe('UserDataSource');
    expect(cls.getExtends()?.getText()).toBe('BaseDataSource');
    const text = sf.getText();
    expect(text).toContain(`@RxapDataSource('user')`);
    expect(text).toContain('@Injectable(');
    expect(text).not.toContain('providedIn');
    expect(text).toContain(`from '@angular/core'`);
    expect(text).toContain(`from '@rxap/data-source'`);
  });

  it('providedInRoot and suffix handling', () => {
    const sf = create();
    const cls = CoerceDataSourceClass(sf, { name: 'UserDataSource', providedInRoot: true });
    expect(cls.getName()).toBe('UserDataSource');
    expect(sf.getText()).toContain(`providedIn: 'root'`);
  });

  it('custom decorator/extends and hooks', () => {
    const sf = create();
    const coerceDecorator = jest.fn(CoerceRxapDataSourceDecorator);
    const coerceExtends = jest.fn(CoerceExtendsBaseDataSource);
    CoerceDataSourceClass(sf, {
      name: 'x',
      decorator: { name: 'Custom', moduleSpecifier: './custom', argument: `'abc'` },
      extends: { name: 'Base', moduleSpecifier: './base' },
      coerceDecorator,
      coerceExtends,
    });
    expect(coerceDecorator).toHaveBeenCalled();
    expect(coerceExtends).toHaveBeenCalled();
    expect(sf.getText()).toContain(`@Custom('abc')`);
    expect(sf.getText()).toContain('extends Base');
    expect(sf.getText()).toContain(`from './base'`);
  });

  it('does not override existing extends', () => {
    const sf = CreateProject().createSourceFile('a.ts', `export class XDataSource extends Other {}`);
    const cls = CoerceDataSourceClass(sf, { name: 'x' });
    expect(cls.getExtends()?.getText()).toBe('Other');
  });
});
