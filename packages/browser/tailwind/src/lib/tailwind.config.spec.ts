import { RXAP_TAILWIND_CONFIG } from './tailwind.config';

describe('RXAP_TAILWIND_CONFIG', () => {
  const colors = RXAP_TAILWIND_CONFIG.theme.extend.colors;

  it('uses selector dark mode', () => {
    expect(RXAP_TAILWIND_CONFIG.darkMode).toBe('selector');
  });

  it.each(['primary', 'accent', 'warn', 'contrast'] as const)('maps %s shades to css variables', (name) => {
    const palette: Record<string, string> = colors[name];
    expect(Object.keys(palette)).toEqual(
      ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'a100', 'a200', 'a400', 'a700'],
    );
    for (const [shade, value] of Object.entries(palette)) {
      expect(value).toBe(`var(--${name}-${shade})`);
    }
  });

  it('overrides font families but keeps the defaults', () => {
    const ff = RXAP_TAILWIND_CONFIG.theme.fontFamily;
    expect(ff.sans).toBe('var(--font-family-sans)');
    expect(ff.serif).toBe('var(--font-family-serif)');
    expect(ff.mono).toBe('var(--font-family-mono)');
  });

  it('registers the typography plugin', () => {
    expect(RXAP_TAILWIND_CONFIG.plugins).toHaveLength(1);
  });
});
