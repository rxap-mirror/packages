import { ColorPaletteAlgorithm, ComputeColorPalette } from './compute-color-palette';

const KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];

describe('ComputeColorPalette', () => {
  it.each([undefined, ColorPaletteAlgorithm.CONSTANTIN, ColorPaletteAlgorithm.BUCKNER, 'unknown'])(
    'computes a full palette for algorithm %s',
    (algorithm) => {
      const palette = ComputeColorPalette('#3f51b5', {}, algorithm);
      expect(Object.keys(palette).sort()).toEqual([...KEYS].sort());
      for (const value of Object.values(palette)) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/i);
      }
    },
  );

  it('uses the plain base color as 500 by default', () => {
    expect(ComputeColorPalette('#3f51b5')[500]).toBe('#3f51b5');
  });

  it('keeps predefined values and does not mutate the input', () => {
    const preset = { 500: '#000000' };
    const palette = ComputeColorPalette('#3f51b5', preset, ColorPaletteAlgorithm.CONSTANTIN);
    expect(palette[500]).toBe('#000000');
    expect(preset).toEqual({ 500: '#000000' });
  });

  it('algorithms produce different accent colors', () => {
    const a = ComputeColorPalette('#3f51b5', {}, ColorPaletteAlgorithm.CONSTANTIN);
    const b = ComputeColorPalette('#3f51b5', {}, ColorPaletteAlgorithm.BUCKNER);
    expect(a.A100).not.toBe(b.A100);
  });
});
