import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import { LOCALE_STORAGE_KEY } from './const';
import { LanguageSelectorService } from './language-selector.service';

describe('LanguageSelectorService', () => {
  function create(config: Record<string, any>) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: { get: (path: string, def: any) => config[path] ?? def },
        },
      ],
    });
    return TestBed.inject(LanguageSelectorService);
  }

  beforeEach(() => localStorage.clear());

  it('uses the first language as default', () => {
    const s = create({ 'i18n.languages': { de: 'Deutsch', en: 'English' } });
    expect(s.defaultLanguage()).toBe('de');
    expect(s.selectedLanguage()).toBe('de');
    expect(s.hasLanguages()).toBe(true);
  });

  it('falls back to en without languages', () => {
    const s = create({});
    expect(s.defaultLanguage()).toBe('en');
    expect(s.hasLanguages()).toBe(false);
  });

  it('reads the selected language from storage', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    expect(create({ 'i18n.languages': { de: '', en: '' } }).selectedLanguage()).toBe('en');
  });

  it('stores a supported language', async () => {
    const s = create({ 'i18n.languages': { de: '', en: '' } });
    await s.setLanguage('en');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
  });

  it('stores the default for unsupported languages', async () => {
    const s = create({ 'i18n.languages': { de: '', en: '' } });
    await s.setLanguage('xx');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de');
  });

  it('removes the key when there is no default', async () => {
    const s = create({ 'i18n.languages': { de: '' } });
    localStorage.setItem(LOCALE_STORAGE_KEY, 'zz');
    (s.defaultLanguage as any) = () => '';
    await s.setLanguage('xx');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('does nothing when the language is unchanged', async () => {
    const s = create({ 'i18n.languages': { de: '', en: '' } });
    await s.setLanguage('de');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
  });
});
