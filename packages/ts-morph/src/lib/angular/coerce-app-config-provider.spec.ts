import { CreateProject } from '../create-project';
import { CoerceAppConfigProvider } from './coerce-app-config-provider';

describe('CoerceAppConfigProvider', () => {
  const create = (text = '') => CreateProject().createSourceFile('app.config.ts', text);

  it('creates appConfig with providers', () => {
    const sf = create();
    CoerceAppConfigProvider(sf, { providers: [ 'provideRouter(routes)' ] });
    expect(sf.getText()).toContain('const appConfig: ApplicationConfig');
    expect(sf.getText()).toContain('provideRouter(routes)');
    expect(sf.getText()).toContain(`import { ApplicationConfig } from '@angular/core';`);
  });

  it('adds http interceptors without duplicates', () => {
    const sf = create();
    CoerceAppConfigProvider(sf, { httpInterceptors: [ 'authInterceptor' ] });
    CoerceAppConfigProvider(sf, { httpInterceptors: [ 'authInterceptor', 'logInterceptor' ] });
    const text = sf.getText();
    expect(text.match(/provideHttpClient\(/g)).toHaveLength(1);
    expect(text.match(/authInterceptor/g)).toHaveLength(1);
    expect(text).toContain('logInterceptor');
    expect(text).toContain('withInterceptors');
    expect(text).toContain(`from '@angular/common/http'`);
  });

  it('adds importProvidersFrom entries without duplicates', () => {
    const sf = create();
    CoerceAppConfigProvider(sf, { importProvidersFrom: [ 'AModule' ] });
    CoerceAppConfigProvider(sf, { importProvidersFrom: [ 'AModule', 'BModule' ] });
    const text = sf.getText();
    expect(text.match(/importProvidersFrom\(/g)).toHaveLength(1);
    expect(text.match(/AModule/g)).toHaveLength(1);
    expect(text).toContain('BModule');
  });
});
