export const RXAP_TOPICS = {
  theme: {
    /**
     * restore is used by the UserSettingsThemeService after the theme is loaded and then used by the ThemeService to
     * set the restored theme properties
     *
     * changed is used by the ThemeService to notify the UserSettingsThemeService that the theme properties have changed
     */
    density: {
      restore: 'rxap:theme:density:restore',
      changed: 'rxap:theme:density:changed',
    },
    preset: {
      restore: 'rxap:theme:preset:restore',
      changed: 'rxap:theme:preset:changed',
    },
    typography: {
      restore: 'rxap:theme:typography:restore',
      changed: 'rxap:theme:typography:changed',
    },
    darkMode: {
      restore: 'rxap:theme:darkMode:restore',
      changed: 'rxap:theme:darkMode:changed',
    }
  },
  authentication: {
    logout: 'authentication.logout',
    login: 'rxap:authentication:login',
  }
};
