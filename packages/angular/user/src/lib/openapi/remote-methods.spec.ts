import { readdirSync } from 'fs';
import { join } from 'path';

import * as DarkModeControllerDisable from './remote-methods/dark-mode-controller-disable.remote-method';
import * as DarkModeControllerEnable from './remote-methods/dark-mode-controller-enable.remote-method';
import * as DarkModeControllerGet from './remote-methods/dark-mode-controller-get.remote-method';
import * as DarkModeControllerToggle from './remote-methods/dark-mode-controller-toggle.remote-method';
import * as LanguageControllerGet from './remote-methods/language-controller-get.remote-method';
import * as LanguageControllerSet from './remote-methods/language-controller-set.remote-method';
import * as ProfileControllerGet from './remote-methods/profile-controller-get.remote-method';
import * as SettingsControllerClearProperty from './remote-methods/settings-controller-clear-property.remote-method';
import * as SettingsControllerDecrementProperty from './remote-methods/settings-controller-decrement-property.remote-method';
import * as SettingsControllerGetProperty from './remote-methods/settings-controller-get-property.remote-method';
import * as SettingsControllerGet from './remote-methods/settings-controller-get.remote-method';
import * as SettingsControllerIncrementProperty from './remote-methods/settings-controller-increment-property.remote-method';
import * as SettingsControllerPopProperty from './remote-methods/settings-controller-pop-property.remote-method';
import * as SettingsControllerPushProperty from './remote-methods/settings-controller-push-property.remote-method';
import * as SettingsControllerRemoveAtProperty from './remote-methods/settings-controller-remove-at-property.remote-method';
import * as SettingsControllerRemoveProperty from './remote-methods/settings-controller-remove-property.remote-method';
import * as SettingsControllerSetProperty from './remote-methods/settings-controller-set-property.remote-method';
import * as SettingsControllerSet from './remote-methods/settings-controller-set.remote-method';
import * as SettingsControllerShiftProperty from './remote-methods/settings-controller-shift-property.remote-method';
import * as SettingsControllerToggleProperty from './remote-methods/settings-controller-toggle-property.remote-method';
import * as SettingsControllerUnshiftProperty from './remote-methods/settings-controller-unshift-property.remote-method';
import * as ThemeControllerGet from './remote-methods/theme-controller-get.remote-method';
import * as ThemeControllerSetDensity from './remote-methods/theme-controller-set-density.remote-method';
import * as ThemeControllerSetPreset from './remote-methods/theme-controller-set-preset.remote-method';
import * as ThemeControllerSetTypography from './remote-methods/theme-controller-set-typography.remote-method';
import * as ThemeControllerSet from './remote-methods/theme-controller-set.remote-method';

// The builder bundles the specs, so the generated modules cannot be loaded with a dynamic require.
// Every module is imported statically; the directory listing guards against a missing entry.
const modules: Record<string, Record<string, unknown>> = {
  'dark-mode-controller-disable.remote-method.ts': DarkModeControllerDisable,
  'dark-mode-controller-enable.remote-method.ts': DarkModeControllerEnable,
  'dark-mode-controller-get.remote-method.ts': DarkModeControllerGet,
  'dark-mode-controller-toggle.remote-method.ts': DarkModeControllerToggle,
  'language-controller-get.remote-method.ts': LanguageControllerGet,
  'language-controller-set.remote-method.ts': LanguageControllerSet,
  'profile-controller-get.remote-method.ts': ProfileControllerGet,
  'settings-controller-clear-property.remote-method.ts': SettingsControllerClearProperty,
  'settings-controller-decrement-property.remote-method.ts': SettingsControllerDecrementProperty,
  'settings-controller-get-property.remote-method.ts': SettingsControllerGetProperty,
  'settings-controller-get.remote-method.ts': SettingsControllerGet,
  'settings-controller-increment-property.remote-method.ts': SettingsControllerIncrementProperty,
  'settings-controller-pop-property.remote-method.ts': SettingsControllerPopProperty,
  'settings-controller-push-property.remote-method.ts': SettingsControllerPushProperty,
  'settings-controller-remove-at-property.remote-method.ts': SettingsControllerRemoveAtProperty,
  'settings-controller-remove-property.remote-method.ts': SettingsControllerRemoveProperty,
  'settings-controller-set-property.remote-method.ts': SettingsControllerSetProperty,
  'settings-controller-set.remote-method.ts': SettingsControllerSet,
  'settings-controller-shift-property.remote-method.ts': SettingsControllerShiftProperty,
  'settings-controller-toggle-property.remote-method.ts': SettingsControllerToggleProperty,
  'settings-controller-unshift-property.remote-method.ts': SettingsControllerUnshiftProperty,
  'theme-controller-get.remote-method.ts': ThemeControllerGet,
  'theme-controller-set-density.remote-method.ts': ThemeControllerSetDensity,
  'theme-controller-set-preset.remote-method.ts': ThemeControllerSetPreset,
  'theme-controller-set-typography.remote-method.ts': ThemeControllerSetTypography,
  'theme-controller-set.remote-method.ts': ThemeControllerSet,
};

describe('generated remote methods', () => {
  const dir = join(__dirname, 'remote-methods');
  const files = readdirSync(dir).filter((f) => f.endsWith('.remote-method.ts'));

  it('has remote methods', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('covers every generated remote method file', () => {
    expect(Object.keys(modules).sort()).toEqual([...files].sort());
  });

  it.each(Object.keys(modules))('%s exports an injectable remote method class', (file) => {
    const classes = Object.values(modules[file]).filter((v) => typeof v === 'function');
    expect(classes.length).toBeGreaterThan(0);
    for (const cls of classes as any[]) {
      expect(cls.prototype.call).toBeDefined();
    }
  });
});
