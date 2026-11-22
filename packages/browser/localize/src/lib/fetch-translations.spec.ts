import { fetchTranslations } from './fetch-translations';

jest.mock('./xliff-to-json', () => ({ xliffToJson: jest.fn(async (xml: string) => ({ parsed: xml })) }));
import { xliffToJson } from './xliff-to-json';

const xlf = (id: string) => `<?xml version="1.0"?><xliff>${id}</xliff>`;

function mockFetch(files: Record<string, string>) {
  const calls: string[] = [];
  global.fetch = jest.fn(async (url: string) => {
    calls.push(url);
    if (url in files) return { text: async () => files[url] };
    return { text: async () => '<html>not found</html>' };
  }) as any;
  return calls;
}

describe('fetchTranslations', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); });

  it('loads the requested locale', async () => {
    mockFetch({ '/i18n/de.xlf': xlf('de') });
    await expect(fetchTranslations('de', [], 'en')).resolves.toEqual({ json: { parsed: xlf('de') }, locale: 'de' });
  });

  it('strips the region before trying preferred languages', async () => {
    const calls = mockFetch({ '/i18n/de.xlf': xlf('de') });
    const result = await fetchTranslations('de-AT', ['fr'], 'en');
    expect(calls).toEqual(['/i18n/de-AT.xlf', '/i18n/de.xlf']);
    expect(result?.locale).toBe('de');
  });

  it('walks the preferred languages', async () => {
    const calls = mockFetch({ '/i18n/fr.xlf': xlf('fr') });
    const result = await fetchTranslations('de', ['it', 'fr'], 'en');
    expect(calls).toEqual(['/i18n/de.xlf', '/i18n/it.xlf', '/i18n/fr.xlf']);
    expect(result?.locale).toBe('fr');
  });

  it('uses the fallback file and reports the requested locale', async () => {
    mockFetch({ '/i18n/en.xlf': xlf('en') });
    const result = await fetchTranslations('de', [], 'en');
    expect(result).toEqual({ json: { parsed: xlf('en') }, locale: 'de' });
  });

  it('returns null if nothing can be fetched', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as any;
    await expect(fetchTranslations('de', [], 'en')).resolves.toBeNull();
  });

  it('returns null if parsing fails', async () => {
    mockFetch({ '/i18n/de.xlf': xlf('de') });
    (xliffToJson as jest.Mock).mockRejectedValueOnce(new Error('bad'));
    await expect(fetchTranslations('de', [], 'en')).resolves.toBeNull();
  });
});
