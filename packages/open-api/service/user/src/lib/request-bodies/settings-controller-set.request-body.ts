export type SettingsControllerSetRequestBody<T = unknown> = {
  darkMode: boolean;
  language: string;
} & T;
