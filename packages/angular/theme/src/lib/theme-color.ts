import {
  CorePalette,
  TonalPalette
} from '@material/material-color-utilities';
import { ConfigService } from '@rxap/config';

/**
 * Represents the tone scale numbers used in Material Design palettes.
 * Includes standard tones and specific neutral tones used for surfaces.
 */
type Tone =
  | 0
  | 4
  | 6
  | 10
  | 12
  | 17
  | 20
  | 22
  | 24
  | 25
  | 30
  | 35
  | 40
  | 50
  | 60
  | 70
  | 80
  | 87
  | 90
  | 92
  | 94
  | 95
  | 96
  | 98
  | 99
  | 100;

/**
 * Represents a color value, typically a hex string.
 */
type ColorValue = string;

/**
 * Represents a palette mapping tones to color values.
 */
type TonePalette = Partial<Record<Tone, ColorValue>>;

/**
 * Represents the full structure of a Material Design base palette,
 * including primary tones and nested palettes for secondary, neutral,
 * neutral-variant, and error colors.
 */
interface BasePalette extends TonePalette {
  secondary: TonePalette;
  tertiary: TonePalette;
  neutral: TonePalette;
  neutralVariant: TonePalette;
  error: TonePalette;
}

/**
 * Defines the possible theme types.
 */
type ThemeType = 'light' | 'dark';

/**
 * Represents the output map of CSS variable names to their color values.
 * e.g., { '--mat-sys-primary': '#6750A4', ... }
 */
type CssVariables = Record<string, ColorValue>;

// --- Mappings from System Roles to Reference Palette Keys ---

const lightRoleToRefKeyMap: Record<string, string> = {
  background: 'neutral98',
  error: 'error40',
  'error-container': 'error90',
  'inverse-on-surface': 'neutral95',
  'inverse-primary': 'primary80',
  'inverse-surface': 'neutral20',
  'on-background': 'neutral10',
  'on-error': 'error100',
  'on-error-container': 'error10',
  'on-primary': 'primary100',
  'on-primary-container': 'primary10',
  'on-primary-fixed': 'primary10',
  'on-primary-fixed-variant': 'primary30',
  'on-secondary': 'secondary100',
  'on-secondary-container': 'secondary10',
  'on-secondary-fixed': 'secondary10',
  'on-secondary-fixed-variant': 'secondary30',
  'on-surface': 'neutral10',
  'on-surface-variant': 'neutral-variant30',
  'on-tertiary': 'tertiary100',
  'on-tertiary-container': 'tertiary10',
  'on-tertiary-fixed': 'tertiary10',
  'on-tertiary-fixed-variant': 'tertiary30',
  outline: 'neutral-variant50',
  'outline-variant': 'neutral-variant80',
  primary: 'primary40',
  'primary-container': 'primary90',
  'primary-fixed': 'primary90',
  'primary-fixed-dim': 'primary80',
  scrim: 'neutral0',
  secondary: 'secondary40',
  'secondary-container': 'secondary90',
  'secondary-fixed': 'secondary90',
  'secondary-fixed-dim': 'secondary80',
  shadow: 'neutral0',
  surface: 'neutral98',
  'surface-bright': 'neutral98',
  'surface-container': 'neutral94',
  'surface-container-high': 'neutral92',
  'surface-container-highest': 'neutral90',
  'surface-container-low': 'neutral96',
  'surface-container-lowest': 'neutral100',
  'surface-dim': 'neutral87',
  'surface-tint': 'primary40',
  'surface-variant': 'neutral-variant90',
  tertiary: 'tertiary40',
  'tertiary-container': 'tertiary90',
  'tertiary-fixed': 'tertiary90',
  'tertiary-fixed-dim': 'tertiary80',
};

const darkRoleToRefKeyMap: Record<string, string> = {
  background: 'neutral6',
  error: 'error80',
  'error-container': 'error30',
  'inverse-on-surface': 'neutral20',
  'inverse-primary': 'primary40',
  'inverse-surface': 'neutral90',
  'on-background': 'neutral90',
  'on-error': 'error20',
  'on-error-container': 'error90',
  'on-primary': 'primary20',
  'on-primary-container': 'primary90',
  'on-primary-fixed': 'primary10',
  'on-primary-fixed-variant': 'primary30',
  'on-secondary': 'secondary20',
  'on-secondary-container': 'secondary90',
  'on-secondary-fixed': 'secondary10',
  'on-secondary-fixed-variant': 'secondary30',
  'on-surface': 'neutral90',
  'on-surface-variant': 'neutral-variant90',
  'on-tertiary': 'tertiary20',
  'on-tertiary-container': 'tertiary90',
  'on-tertiary-fixed': 'tertiary10',
  'on-tertiary-fixed-variant': 'tertiary30',
  outline: 'neutral-variant60',
  'outline-variant': 'neutral-variant30',
  primary: 'primary80',
  'primary-container': 'primary30',
  'primary-fixed': 'primary90',
  'primary-fixed-dim': 'primary80',
  scrim: 'neutral0',
  secondary: 'secondary80',
  'secondary-container': 'secondary30',
  'secondary-fixed': 'secondary90',
  'secondary-fixed-dim': 'secondary80',
  shadow: 'neutral0',
  surface: 'neutral6',
  'surface-bright': 'neutral24',
  'surface-container': 'neutral12',
  'surface-container-high': 'neutral17',
  'surface-container-highest': 'neutral24',
  'surface-container-low': 'neutral10',
  'surface-container-lowest': 'neutral4',
  'surface-dim': 'neutral6',
  'surface-tint': 'primary80',
  'surface-variant': 'neutral-variant30',
  tertiary: 'tertiary80',
  'tertiary-container': 'tertiary30',
  'tertiary-fixed': 'tertiary90',
  'tertiary-fixed-dim': 'tertiary80',
};

export interface ThemeColors {
  primary: string;
  secondary?: string;
  tertiary?: string;
  neutral?: string;
  neutralVariant?: string;
  error?: string;
}

export class ThemeColor {
  static apply(
    document: Document,
    {
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      error,
    }: ThemeColors
  ) {
    const themeColor = new ThemeColor();
    themeColor.apply(
      document,
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      error
    );
  }

  private generateSystemLevelColors(
    primaryPalette: BasePalette,
    themeType: ThemeType,
    tertiaryPalette?: BasePalette,
    cssVarPrefix = '--mat-sys-'
  ): CssVariables {
    const tertiary = tertiaryPalette ?? primaryPalette; // Default tertiary to primary
    const output: CssVariables = {};

    // 1. Create the flattened reference palette (md-ref-palette equivalent)
    // We use kebab-case for keys like 'neutral-variant' to match the role maps.
    const refPalette: Record<string, ColorValue> = {};

    const palettesToFlatten: Record<string, TonePalette> = {
      primary: primaryPalette,
      secondary: primaryPalette.secondary,
      tertiary: tertiary, // Use the resolved tertiary palette (just tones)
      neutral: primaryPalette.neutral,
      'neutral-variant': primaryPalette.neutralVariant,
      error: primaryPalette.error,
    };

    for (const [name, palette] of Object.entries(palettesToFlatten)) {
      if (!palette) {
        console.warn(
          `Warning: Palette source '${name}' is missing or undefined.`
        );
        continue;
      }
      for (const [tone, value] of Object.entries(palette)) {
        // Check if the key is a valid tone number (string representation) and value is a string color
        if (!isNaN(Number(tone)) && typeof value === 'string') {
          const key = `${name}${tone}`; // e.g., primary40, neutral98, neutral-variant30
          refPalette[key] = value;
        }
      }
    }

    // 2. Select the correct role mapping based on theme type
    const roleToRefKeyMap =
      themeType === 'light' ? lightRoleToRefKeyMap : darkRoleToRefKeyMap;

    // 3. Generate CSS variables from the mapping
    for (const [role, refKey] of Object.entries(roleToRefKeyMap)) {
      const colorValue = refPalette[refKey];
      if (colorValue === undefined) {
        // Log a warning if a required reference color is missing in the provided palettes
        console.warn(
          `Warning: Reference color key '${refKey}' not found in generated reference palette for CSS variable role '${role}'. Skipping variable '${cssVarPrefix}${role}'.`
        );
        continue; // Skip this variable if the color isn't found
      }
      output[`${cssVarPrefix}${role}`] = colorValue;
    }

    // 4. Add the extra manually inserted colors (as per _m3-system.scss logic)
    // These seem to be directly used sometimes instead of going through roles.
    const extraRefKeys: Record<string, string> = {
      'neutral-variant20': 'neutral-variant20', // Role name maps directly to ref key
      neutral10: 'neutral10',
    };
    for (const [role, refKey] of Object.entries(extraRefKeys)) {
      const colorValue = refPalette[refKey];
      if (colorValue !== undefined) {
        // Check if it wasn't already added via the main mapping (unlikely but safe)
        if (!output[`${cssVarPrefix}${role}`]) {
          output[`${cssVarPrefix}${role}`] = colorValue;
        }
      } else {
        console.warn(
          `Warning: Extra color key '${refKey}' not found in generated reference palette for role '${role}'.`
        );
      }
    }

    return output;
  }

  /**
   * Helper function to convert a TonalPalette to a TonePalette.
   * @param tonalPalette TonalPalette instance
   * @returns TonePalette object
   */
  private convertTonalPalette(tonalPalette: TonalPalette): TonePalette {
    const tones: Tone[] = [
      0, 4, 6, 10, 12, 17, 20, 22, 24, 25, 30, 35, 40, 50, 60, 70, 80, 87, 90,
      92, 94, 95, 96, 98, 99, 100,
    ];
    const result: TonePalette = {};

    for (const tone of tones) {
      result[tone] = tonalPalette.tone(tone).toString(16).replace(/^ff/i, '#'); // Convert ARGB to HEX
    }

    return result;
  }

  /**
   * Converts a CorePalette into a BasePalette structure.
   * @param corePalette CorePalette instance
   * @returns BasePalette object
   */
  private convertCorePaletteToBasePalette(
    corePalette: CorePalette
  ): BasePalette {
    return {
      ...this.convertTonalPalette(corePalette.a1), // Primary tones
      secondary: this.convertTonalPalette(corePalette.a2),
      tertiary: this.convertTonalPalette(corePalette.a3),
      neutral: this.convertTonalPalette(corePalette.n1),
      neutralVariant: this.convertTonalPalette(corePalette.n2),
      error: this.convertTonalPalette(corePalette.error),
    };
  }

  private mergeLightAndDarkVars(
    lightVars: CssVariables,
    darkVars: CssVariables
  ): CssVariables {
    const output: CssVariables = {};
    for (const [key, value] of Object.entries(lightVars)) {
      output[key] = value;
    }
    for (const [key, value] of Object.entries(darkVars)) {
      output[key] = `light-dark(${output[key]}, ${value})`;
    }
    return output;
  }

  private convertBasePaletteToCss(lightDarkVars: CssVariables) {
    return `:root {
  ${Object.entries(lightDarkVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ')}
}
`;
  }

  apply(
    document: Document,
    primary: string,
    secondary?: string,
    tertiary?: string,
    neutral?: string,
    neutralVariant?: string,
    error?: string
  ) {
    const corePalette = CorePalette.fromColors({
      primary: parseInt(primary.replace('#', 'FF'), 16),
      secondary: secondary
        ? parseInt(secondary.replace('#', 'FF'), 16)
        : undefined,
      tertiary: tertiary
        ? parseInt(tertiary.replace('#', 'FF'), 16)
        : undefined,
      neutral: neutral ? parseInt(neutral.replace('#', 'FF'), 16) : undefined,
      neutralVariant: neutralVariant
        ? parseInt(neutralVariant.replace('#', 'FF'), 16)
        : undefined,
      error: error ? parseInt(error.replace('#', 'FF'), 16) : undefined,
    });

    const basePalette = this.convertCorePaletteToBasePalette(corePalette);

    const lightVars = this.generateSystemLevelColors(basePalette, 'light');
    const darkVars = this.generateSystemLevelColors(basePalette, 'dark');
    const lightDarkVars = this.mergeLightAndDarkVars(lightVars, darkVars);

    for (const [key, value] of Object.entries(lightDarkVars)) {
      document.documentElement.style.setProperty(key, value);
    }
  }
}

export function applyThemeColorBootstrapHook(defaultThemeControls?: ThemeColors) {
  return (config: ConfigService) => {
    const themeColors = config.get('theme.colors', defaultThemeControls);
    if (themeColors) {
      ThemeColor.apply(window.document, themeColors);
    }
  };
}
