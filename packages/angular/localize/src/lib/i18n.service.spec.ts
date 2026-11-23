import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserSettingsLanguageService } from '@rxap/ngx-user';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  const setLanguage = vi.fn().mockResolvedValue(undefined);
  let service: I18nService;

  beforeEach(() => {
    setLanguage.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'de-DE' },
        { provide: UserSettingsLanguageService, useValue: { setLanguage } },
      ],
    });
    service = TestBed.inject(I18nService);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('derives the current language from LOCALE_ID', () => {
    expect(service.currentLanguage()).toBe('de');
  });

  it('sets the language in the user settings (dev mode: no redirect)', async () => {
    const redirect = vi.spyOn(service, 'redirect').mockImplementation(() => undefined);
    await service.setLanguage('en');
    expect(setLanguage).toHaveBeenCalledWith('en');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('warns when the language is unchanged', () => {
    service.redirect('de');
    expect(console.warn).toHaveBeenCalled();
  });

  it('logs the redirect url', () => {
    history.pushState({}, '', '/de/home?a=1');
    // jsdom does not implement navigation: replace location with a stub that records the call
    const replace = vi.fn();
    vi.stubGlobal('location', { origin: location.origin, pathname: location.pathname, search: location.search, replace });
    try {
      service.redirect('en');
    } finally {
      vi.unstubAllGlobals();
    }
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('/en/home?a=1'));
    expect(replace).toHaveBeenCalledWith(expect.stringContaining('/en/home?a=1'));
  });
});
