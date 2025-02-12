export type ThemeControllerGetResponse<T = unknown> = {
  density?: number;
  typography?: string;
  preset: string;
} & T;
