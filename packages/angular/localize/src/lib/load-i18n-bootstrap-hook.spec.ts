import { LOCALE_ID } from '@angular/core';
import { loadI18nBootstrapHook } from './load-i18n-bootstrap-hook';

describe('loadI18nBootstrapHook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('provides the loaded LOCALE_ID', async () => {
    const hook = loadI18nBootstrapHook(jest.fn().mockResolvedValue(null), jest.fn(), 'de');
    const options: any = {};
    await hook(null, options);
    expect(options.providers).toEqual([{ provide: LOCALE_ID, useValue: 'de' }]);
  });

  it('appends to existing providers', async () => {
    const hook = loadI18nBootstrapHook(jest.fn().mockResolvedValue(null), jest.fn(), 'de');
    const options: any = { providers: [1] };
    await hook(null, options);
    expect(options.providers).toHaveLength(2);
  });

  it('logs when loading fails', async () => {
    const hook = loadI18nBootstrapHook(jest.fn().mockRejectedValue(new Error('boom')), jest.fn(), 'de');
    const options: any = {};
    await hook(null, options);
    expect(options.providers).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });
});
