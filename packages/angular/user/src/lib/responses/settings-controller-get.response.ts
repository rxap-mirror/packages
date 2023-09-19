export type SettingsControllerGetResponse<T = unknown> = {
  darkMode: boolean;
  language: string;
} & T;
