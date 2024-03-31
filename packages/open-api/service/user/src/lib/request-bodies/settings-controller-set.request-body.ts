export type SettingsControllerSetRequestBody<T = unknown> = {
  darkMode?: boolean;
  language?: string;
  theme?: {
    preset?: string;
    density?: number;
    typography?: string;
  } & Record<string, Record<string, unknown>>;
} & T;
