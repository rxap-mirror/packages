import { LOCALE_ID } from '@angular/core';
import { loadI18nBootstrapHook } from './load-i18n-bootstrap-hook';

describe('loadI18nBootstrapHook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('provides the loaded LOCALE_ID', async () => {
    const hook = loadI18nBootstrapHook(vi.fn().mockResolvedValue(null), vi.fn(), 'de');
    const options: any = {};
    await hook(null, options);
    expect(options.providers).toEqual([{ provide: LOCALE_ID, useValue: 'de' }]);
  });

  it('appends to existing providers', async () => {
    const hook = loadI18nBootstrapHook(vi.fn().mockResolvedValue(null), vi.fn(), 'de');
    const options: any = { providers: [1] };
    await hook(null, options);
    expect(options.providers).toHaveLength(2);
  });

  it('logs when loading fails', async () => {
    const hook = loadI18nBootstrapHook(vi.fn().mockRejectedValue(new Error('boom')), vi.fn(), 'de');
    const options: any = {};
    await hook(null, options);
    expect(options.providers).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });
});
