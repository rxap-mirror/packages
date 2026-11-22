import { CreateProject } from '../create-project';
import { BuildRouteObject } from './build-route-object';

const render = (route: Parameters<typeof BuildRouteObject>[0]) => {
  const file = CreateProject().createSourceFile('r.ts', '');
  file.addVariableStatement({ declarations: [{ name: 'r', initializer: BuildRouteObject(route) }] });
  return file.getFullText().replace(/\s+/g, ' ');
};

describe('BuildRouteObject', () => {
  it('writes the path and component', () => {
    expect(render({ path: 'a', component: 'AComponent' })).toContain("{ path: 'a', component: AComponent }");
  });

  it('writes lazy loaded children and components', () => {
    expect(render({ path: 'a', loadChildren: './a.routes' })).toContain("loadChildren: () => import('./a.routes')");
    expect(render({ path: 'a', loadChildren: { import: './a.routes', then: 'routes' } })).toContain(
      "loadChildren: () => import('./a.routes').then((m) => m.routes)",
    );
    expect(render({ path: 'a', loadComponent: './a.component' })).toContain("loadComponent: () => import('./a.component')");
    expect(render({ path: 'a', loadComponent: { import: './a', then: 'A' }, component: 'Ignored' })).toContain(
      "loadComponent: () => import('./a').then((m) => m.A)",
    );
    expect(render({ path: 'a', loadComponent: './a', component: 'Ignored' })).not.toContain('Ignored');
  });

  it('writes remote modules', () => {
    expect(render({ path: 'a', loadRemoteModule: 'remote' })).toContain("loadChildren: () => loadRemoteModule('remote', './routes')");
    expect(render({ path: 'a', loadRemoteModule: { name: 'remote', entry: './entry' } })).toContain(
      "loadRemoteModule('remote', './entry')",
    );
    expect(render({ path: 'a', loadRemoteModule: { name: 'remote' } })).toContain("loadRemoteModule('remote', './routes')");
  });

  it('writes the outlet', () => {
    expect(render({ path: 'a', outlet: 'side' })).toContain("outlet: 'side'");
    expect(render({ path: 'a', outlet: null })).not.toContain('outlet');
  });

  it('writes route data with typed values', () => {
    const text = render({ path: 'a', data: { title: 'Hello', flag: true, off: false, count: 3, strBool: 'true', numStr: '42' } });
    expect(text).toContain("title: 'Hello'");
    expect(text).toContain('flag: true');
    expect(text).toContain('off: false');
    expect(text).toContain('count: 3');
    expect(text).toContain("strBool: 'true'");
    expect(text).toContain('numStr: 42');
  });
});
