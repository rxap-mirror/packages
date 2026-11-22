import {
  callRule,
  HostTree,
  Tree,
} from '@angular-devkit/schematics';
import { CreateProject } from '@rxap/ts-morph';
import { lastValueFrom } from 'rxjs';
import { Project } from 'ts-morph';

jest.mock('../ts-morph-transform', () => ({
  TsMorphAngularProjectTransformRule: (_o: any, cb: any, filePaths?: string[]) => () => {
    const project = (globalThis as any).__project;
    const files = filePaths?.map(f => {
      const p = f.replace(/\?$/, '');
      return project.getSourceFile(p) ?? project.createSourceFile(p, '');
    });
    return cb(project, files, _o);
  },
}));

const hasComponent = jest.fn();
jest.mock('./has-component', () => ({ HasComponent: (...a: any[]) => hasComponent(...a) }));
jest.mock('./build-angular-base-path', () => ({ BuildAngularBasePath: () => '/base' }));
jest.mock('@rxap/workspace-utilities', () => ({
  ...jest.requireActual('@rxap/workspace-utilities'),
  GetProjectPrefix: () => 'app',
}));

import { CoerceComponentRule } from './coerce-component';

describe('CoerceComponentRule', () => {
  let project: Project;
  let tree: Tree;
  let templateTree: Tree;
  const exec = (rule: any) => lastValueFrom(callRule(rule, tree, {
    logger: { info: jest.fn() },
    engine: { createSourceFromUrl: () => () => templateTree },
  } as any));

  beforeEach(() => {
    project = CreateProject();
    (globalThis as any).__project = project;
    tree = new HostTree();
    templateTree = new HostTree();
    jest.spyOn(console, 'log').mockImplementation();
    hasComponent.mockReset();
  });
  afterEach(() => jest.restoreAllMocks());

  it('creates a new component with html and scss files', async () => {
    hasComponent.mockReturnValue(false);
    const transform = jest.fn();
    await exec(CoerceComponentRule({ project: 'p', name: 'my-cmp', tsMorphTransform: transform }));
    expect(project.getSourceFileOrThrow('my-cmp/my-cmp.component.ts').getText()).toContain('MyCmpComponent');
    expect(tree.exists('/base/my-cmp/my-cmp.component.html')).toBe(true);
    expect(tree.exists('/base/my-cmp/my-cmp.component.scss')).toBe(true);
    expect(transform).toHaveBeenCalledTimes(1);
    expect(transform.mock.calls[0][2][0].getName()).toBe('MyCmpComponent');
  });

  it('uses a flat structure when the directory ends with the name', async () => {
    hasComponent.mockReturnValue(false);
    await exec(CoerceComponentRule({ project: 'p', name: 'x', directory: 'a/x' }));
    expect(tree.exists('/base/x.component.html')).toBe(true);
  });

  it('renders the handlebars template for a new component', async () => {
    hasComponent.mockReturnValue(false);
    templateTree.create('/__name__.txt.hbs', [
      '{{dasherize "FooBar"}}|{{classify "foo-bar"}}|{{decamelize "fooBar"}}|{{camelize "foo-bar"}}|{{underscore "foo-bar"}}|{{capitalize "foo"}}',
      '{{propertyValue "s"}}|{{propertyValue 3}}|{{indent "a\nb" 2}}|{{#ifeq a 1}}eq{{/ifeq}}|{{#ifnoteq a 1}}ne{{else}}same{{/ifnoteq}}|{{greet}}|{{> part}}|{{prefix}}',
    ].join('\n'));
    templateTree.create('/plain.txt', 'plain');
    await exec(CoerceComponentRule({
      project: 'p', name: 'cmp', flat: true,
      template: { url: './tpl', options: { a: 1 } },
      handlebars: {
        helpers: { greet: () => 'hello' },
        partials: { part: (() => 'PARTIAL') as any },
      },
    }));
    const out = tree.read('/base/cmp.txt')!.toString();
    expect(out).toContain('foo-bar|FooBar|foo_bar|fooBar|foo_bar|Foo');
    expect(out).toContain(`&#x27;s&#x27;|3|a\n  b|eq|same|hello|PARTIAL|app`);
    expect(tree.exists('/base/plain.txt')).toBe(true);
  });

  it('only overwrites the template of an existing component when requested', async () => {
    hasComponent.mockReturnValue(true);
    templateTree.create('/file.txt.hbs', 'x');
    await exec(CoerceComponentRule({ project: 'p', name: 'cmp', flat: true, template: { url: './tpl' } }));
    expect(tree.exists('/base/file.txt')).toBe(false);
    expect(project.getSourceFile('cmp.component.ts')).toBeUndefined();

    await exec(CoerceComponentRule({ project: 'p', name: 'cmp', flat: true, template: { url: './tpl' }, overwrite: [ 'template' ] }));
    expect(tree.read('/base/file.txt')!.toString()).toBe('x');
  });

  it('uses the default template url and overwrite=true', async () => {
    hasComponent.mockReturnValue(true);
    templateTree.create('/f.txt.hbs', 'y{{componentName}}');
    process.env['RXAP_GENERATOR_DEBUG'] = 'true';
    try {
      await exec(CoerceComponentRule({ project: 'p', name: 'cmp', template: {}, overwrite: true }));
    } finally {
      delete process.env['RXAP_GENERATOR_DEBUG'];
    }
    expect(tree.read('/base/cmp/f.txt')!.toString()).toBe('ycmp');
  });

  it('runs tsMorphTransform for an existing component', async () => {
    hasComponent.mockReturnValue(true);
    project.createSourceFile('/cmp.component.ts', 'export class CmpComponent {}');
    const transform = jest.fn();
    await exec(CoerceComponentRule({ project: 'p', name: 'cmp', flat: true, tsMorphTransform: transform }));
    expect(transform).toHaveBeenCalled();
  });
});
