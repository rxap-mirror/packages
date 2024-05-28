export type ThemeControllerSetRequestBody<T = unknown> = {
  density?: number;
  typography?: string;
  preset: string;
} & T;
