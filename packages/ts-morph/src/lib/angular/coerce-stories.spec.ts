import { CreateProject } from '../create-project';
import { CoerceStories } from './coerce-stories';

describe('CoerceStories', () => {
  const create = () => CreateProject().createSourceFile('a.stories.ts', '');

  it('creates meta and Primary story', () => {
    const sf = create();
    CoerceStories(sf, { componentName: 'my-button' });
    const text = sf.getText();
    expect(text).toContain(`import { Meta, StoryObj } from '@storybook/angular';`);
    expect(text).toContain(`import { MyButtonComponent } from './my-button.component';`);
    expect(text).toContain(`title: 'MyButton'`);
    expect(text).toContain('component: MyButtonComponent');
    expect(text).toContain('const meta: Meta<MyButtonComponent>');
    expect(text).toContain('export default meta;');
    expect(text).toContain('type Story = StoryObj<MyButtonComponent>;');
    expect(text).toContain('export const Primary: Story');
  });

  it('uses feature and parentTitle', () => {
    const a = create();
    CoerceStories(a, { componentName: 'x', feature: 'my-feature' });
    expect(a.getText()).toContain(`title: 'MyFeature / X'`);
    const b = create();
    CoerceStories(b, { componentName: 'x', feature: 'f', parentTitle: 'Parent' });
    expect(b.getText()).toContain(`title: 'Parent / X'`);
  });

  it('applies moduleMetadata callback and is idempotent', () => {
    const sf = create();
    const cb = jest.fn(obj => obj.addPropertyAssignment({ name: 'imports', initializer: '[]' }));
    CoerceStories(sf, { componentName: 'x', moduleMetadata: cb });
    expect(cb).toHaveBeenCalled();
    expect(sf.getText()).toContain('moduleMetadata');
    expect(sf.getText()).toContain('imports: []');
    CoerceStories(sf, { componentName: 'x' });
    expect(sf.getText().match(/export default meta;/g)).toHaveLength(1);
    expect(sf.getText().match(/type Story/g)).toHaveLength(1);
  });
});
