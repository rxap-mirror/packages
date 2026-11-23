import { loadTranslations } from '@angular/localize';
import { LOCALE_STORAGE_KEY } from './const';
import { defaultLoadModule, loadLanguages } from './load-languages';

vi.mock('@angular/localize', () => ({ loadTranslations: vi.fn() }));

describe('load-languages', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  describe('defaultLoadModule', () => {
    it('loads the en locale', async () => {
      await expect(defaultLoadModule('en-US')).resolves.toBeUndefined();
    });

    it('ignores unknown locales', async () => {
      await defaultLoadModule('xx');
      expect(console.error).not.toHaveBeenCalled();
    });

    it('logs errors', async () => {
      await defaultLoadModule(null as any);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadLanguages', () => {
    it('fetches translations, loads the module and stores the locale', async () => {
      const fetch = vi.fn().mockResolvedValue({ json: { translations: {} }, locale: 'de' });
      const loadModule = vi.fn().mockResolvedValue(undefined);
      const result = await loadLanguages(fetch, loadModule, 'de', ['de', 'en'], 'fb');
      expect(result).toBe('de');
      expect(fetch).toHaveBeenCalledWith('de', ['de', 'en'], 'fb');
      expect(loadTranslations).toHaveBeenCalledWith({ translations: {} });
      expect(loadModule).toHaveBeenCalledWith('de');
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de');
    });

    it('stores the locale even without translations', async () => {
      const loadModule = vi.fn();
      const result = await loadLanguages(vi.fn().mockResolvedValue(null), loadModule, 'fr');
      expect(result).toBe('fr');
      expect(loadModule).not.toHaveBeenCalled();
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
    });

    it('defaults the locale to the stored one', async () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'it');
      const fetch = vi.fn().mockResolvedValue(null);
      expect(await loadLanguages(fetch)).toBe('it');
      expect(fetch).toHaveBeenCalledWith('it', expect.any(Array), 'messages');
    });

    it('defaults to the navigator language', async () => {
      expect(await loadLanguages(vi.fn().mockResolvedValue(null))).toBe(navigator.language || 'en');
    });
  });
});
