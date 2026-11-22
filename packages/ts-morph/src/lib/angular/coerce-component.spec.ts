import { CreateProject } from '../create-project';
import { CoerceComponent } from './coerce-component';

describe('CoerceComponent', () => {
  const create = () => CreateProject().createSourceFile('a.ts', '');

  it('creates default component with external files', () => {
    const sf = create();
    const { classDeclaration, componentDecoratorObject } = CoerceComponent(sf, 'my-test');
    expect(classDeclaration.getName()).toBe('MyTestComponent');
    expect(classDeclaration.isExported()).toBe(true);
    const text = componentDecoratorObject.getText();
    expect(text).toContain(`selector: 'my-test'`);
    expect(text).toContain(`templateUrl: './my-test.component.html'`);
    expect(text).toContain(`styleUrls: ['./my-test.component.scss']`);
    expect(text).toContain('standalone: true');
  });

  it('uses prefix, changeDetection and inline template/styles', () => {
    const sf = create();
    const { componentDecoratorObject } = CoerceComponent(sf, 'foo-component', {
      prefix: 'app', changeDetection: 'OnPush', template: '<p></p>', styles: ':host{}', templateUrl: undefined, styleUrls: undefined,
    });
    const text = componentDecoratorObject.getText();
    expect(text).toContain(`selector: 'app-foo-component'`);
    expect(text).toContain('changeDetection: ChangeDetectionStrategy.OnPush');
    expect(sf.getText()).toContain(`ChangeDetectionStrategy`);
    expect(sf.getText()).toContain(`from '@angular/core'`);
  });

  it('templateUrl true and styleUrls array/string', () => {
    const sf = create();
    const r = CoerceComponent(sf, 'a', { templateUrl: true, styleUrls: ['./a.css', './b.css'], styles: 'x' });
    expect(r.componentDecoratorObject.getText()).toContain(`'./a.css'`);
    const sf2 = create();
    const r2 = CoerceComponent(sf2, 'a', { styleUrls: `'./x.css'`, styles: 'x', selector: false });
    expect(r2.componentDecoratorObject.getText()).toContain(`styleUrls: ['./x.css']`);
    expect(r2.componentDecoratorObject.getText()).not.toContain('selector');
  });

  it('replaces {{prefix}} in selector', () => {
    const sf = create();
    const r = CoerceComponent(sf, 'a', { selector: '{{prefix}}-x', prefix: 'rxap' });
    expect(r.componentDecoratorObject.getText()).toContain(`selector: 'rxap-x'`);
  });

  it('throws on prefix template without prefix or invalid template', () => {
    expect(() => CoerceComponent(create(), 'a', { selector: '{{prefix}}-x' })).toThrow('no prefix');
    expect(() => CoerceComponent(create(), 'a', { selector: '{{other}}-x' })).toThrow('invalid');
  });

  it('is idempotent', () => {
    const sf = create();
    CoerceComponent(sf, 'a');
    CoerceComponent(sf, 'a');
    expect(sf.getClasses()).toHaveLength(1);
    expect(sf.getText().match(/@Component/g)).toHaveLength(1);
  });
});
