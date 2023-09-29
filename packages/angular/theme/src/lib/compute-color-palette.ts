import {
  ColorInput,
  Numberify,
  RGBA,
  TinyColor,
} from '@ctrl/tinycolor';

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  A100: string;
  A200: string;
  A400: string;
  A700: string;
}

export enum ColorPaletteAlgorithm {
  CONSTANTIN = 'constantin',
  BUCKNER = 'buckner',
}

export function ComputeColorPalette(
  color: ColorInput,
  colorPalette: Partial<ColorPalette> = {},
  algorithm?: ColorPaletteAlgorithm | string,
): ColorPalette {
  colorPalette = { ...colorPalette };

  const baseLight = new TinyColor('#ffffff');
  const baseDark = multiply(new TinyColor(color).toRgb(), new TinyColor(color).toRgb());
  const baseTriad = new TinyColor(color).tetrad();

  switch (algorithm) {

    case ColorPaletteAlgorithm.CONSTANTIN:
      colorPalette[50] ??= baseLight.mix(color, 12).toHexString();
      colorPalette[100] ??= baseLight.mix(color, 30).toHexString();
      colorPalette[200] ??= baseLight.mix(color, 50).toHexString();
      colorPalette[300] ??= baseLight.mix(color, 70).toHexString();
      colorPalette[400] ??= baseLight.mix(color, 85).toHexString();
      colorPalette[500] ??= baseLight.mix(color, 100).toHexString();
      colorPalette[600] ??= baseDark.mix(color, 87).toHexString();
      colorPalette[700] ??= baseDark.mix(color, 70).toHexString();
      colorPalette[800] ??= baseDark.mix(color, 54).toHexString();
      colorPalette[900] ??= baseDark.mix(color, 25).toHexString();
      colorPalette.A100 ??= baseDark.mix(baseTriad[4], 15).saturate(80).lighten(65).toHexString();
      colorPalette.A200 ??= baseDark.mix(baseTriad[4], 15).saturate(80).lighten(55).toHexString();
      colorPalette.A400 ??= baseDark.mix(baseTriad[4], 15).saturate(100).lighten(45).toHexString();
      colorPalette.A700 ??= baseDark.mix(baseTriad[4], 15).saturate(100).lighten(40).toHexString();
      break;

    case ColorPaletteAlgorithm.BUCKNER:
      colorPalette[50] ??= baseLight.mix(color, 12).toHexString();
      colorPalette[100] ??= baseLight.mix(color, 30).toHexString();
      colorPalette[200] ??= baseLight.mix(color, 50).toHexString();
      colorPalette[300] ??= baseLight.mix(color, 70).toHexString();
      colorPalette[400] ??= baseLight.mix(color, 85).toHexString();
      colorPalette[500] ??= baseLight.mix(color, 100).toHexString();
      colorPalette[600] ??= baseDark.mix(color, 87).toHexString();
      colorPalette[700] ??= baseDark.mix(color, 70).toHexString();
      colorPalette[800] ??= baseDark.mix(color, 54).toHexString();
      colorPalette[900] ??= baseDark.mix(color, 25).toHexString();
      colorPalette.A100 ??= baseDark.mix(baseTriad[3], 15).saturate(80).lighten(48).toHexString();
      colorPalette.A200 ??= baseDark.mix(baseTriad[3], 15).saturate(80).lighten(36).toHexString();
      colorPalette.A400 ??= baseDark.mix(baseTriad[3], 15).saturate(100).lighten(31).toHexString();
      colorPalette.A700 ??= baseDark.mix(baseTriad[3], 15).saturate(100).lighten(28).toHexString();
      break;

    default:
      colorPalette[50] ??= new TinyColor(color).lighten(52).toHexString();
      colorPalette[100] ??= new TinyColor(color).lighten(37).toHexString();
      colorPalette[200] ??= new TinyColor(color).lighten(26).toHexString();
      colorPalette[300] ??= new TinyColor(color).lighten(12).toHexString();
      colorPalette[400] ??= new TinyColor(color).lighten(6).toHexString();
      colorPalette[500] ??= new TinyColor(color).toHexString();
      colorPalette[600] ??= new TinyColor(color).darken(6).toHexString();
      colorPalette[700] ??= new TinyColor(color).darken(12).toHexString();
      colorPalette[800] ??= new TinyColor(color).darken(18).toHexString();
      colorPalette[900] ??= new TinyColor(color).darken(24).toHexString();
      colorPalette.A100 ??= new TinyColor(color).lighten(50).saturate(30).toHexString();
      colorPalette.A200 ??= new TinyColor(color).lighten(30).saturate(30).toHexString();
      colorPalette.A400 ??= new TinyColor(color).lighten(10).saturate(15).toHexString();
      colorPalette.A700 ??= new TinyColor(color).lighten(5).saturate(5).toHexString();
      break;

  }

  return colorPalette as ColorPalette;
}

function multiply(rgb1: Numberify<RGBA>, rgb2: Numberify<RGBA>) {
  rgb1.b = Math.floor(rgb1.b * rgb2.b / 255);
  rgb1.g = Math.floor(rgb1.g * rgb2.g / 255);
  rgb1.r = Math.floor(rgb1.r * rgb2.r / 255);
  return new TinyColor('rgb ' + rgb1.r + ' ' + rgb1.g + ' ' + rgb1.b);
}
