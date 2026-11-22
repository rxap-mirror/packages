import { applyThemeColorBootstrapHook, ThemeColor } from './theme-color';

function fakeDocument() {
  const props: Record<string, string> = {};
  const doc = { documentElement: { style: { setProperty: (k: string, v: string) => (props[k] = v) } } } as unknown as Document;
  return { doc, props };
}

describe('ThemeColor', () => {
  it('sets light-dark system colors', () => {
    const { doc, props } = fakeDocument();
    ThemeColor.apply(doc, { primary: '#6750A4' });
    expect(Object.keys(props).length).toBeGreaterThan(30);
    for (const [key, value] of Object.entries(props)) {
      expect(key.startsWith('--mat-sys-')).toBe(true);
      expect(value).toMatch(/^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/i);
    }
    expect(props['--mat-sys-primary']).toBeDefined();
    expect(props['--mat-sys-neutral10']).toBeDefined();
  });

  it('is deterministic and depends on the primary color', () => {
    const a = fakeDocument();
    const b = fakeDocument();
    const c = fakeDocument();
    ThemeColor.apply(a.doc, { primary: '#6750A4' });
    ThemeColor.apply(b.doc, { primary: '#6750A4' });
    ThemeColor.apply(c.doc, { primary: '#00AA33' });
    expect(a.props).toEqual(b.props);
    expect(a.props['--mat-sys-primary']).not.toEqual(c.props['--mat-sys-primary']);
  });

  it('accepts all optional colors', () => {
    const { doc, props } = fakeDocument();
    ThemeColor.apply(doc, {
      primary: '#6750A4', secondary: '#625B71', tertiary: '#7D5260',
      neutral: '#939094', neutralVariant: '#8E8E9A', error: '#B3261E',
    });
    expect(props['--mat-sys-error']).toBeDefined();
  });
});

describe('applyThemeColorBootstrapHook', () => {
  const originalWindow = (globalThis as any).window;
  afterEach(() => { (globalThis as any).window = originalWindow; });

  it('applies the configured colors', () => {
    const { doc, props } = fakeDocument();
    (globalThis as any).window = { document: doc };
    const get = jest.fn().mockReturnValue({ primary: '#6750A4' });
    applyThemeColorBootstrapHook()({ get });
    expect(get).toHaveBeenCalledWith('theme.colors', undefined);
    expect(Object.keys(props).length).toBeGreaterThan(0);
  });

  it('uses the default and does nothing without colors', () => {
    const { doc, props } = fakeDocument();
    (globalThis as any).window = { document: doc };
    const get = jest.fn().mockReturnValue(undefined);
    applyThemeColorBootstrapHook({ primary: '#fff000' })({ get });
    expect(get).toHaveBeenCalledWith('theme.colors', { primary: '#fff000' });
    expect(Object.keys(props)).toHaveLength(0);
  });
});
