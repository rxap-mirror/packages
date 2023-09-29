import Joi from 'joi';

export enum ThemeDensity {
  Normal = 0,
  Compact = -1,
  Dense = -2,
  VeryDense = -3,
}

export interface ThemeSettings {
  preset: string;
  density?: ThemeDensity;
  typography?: string;
}

export interface UserSettings extends Record<string, any> {
  darkMode: boolean;
  language: string;
  theme: ThemeSettings;
}

export const UserSettingsSchema = Joi.object({
  darkMode: Joi.boolean().required(),
  language: Joi.string().required(),
  theme: Joi.object({
    preset: Joi.string().required(),
    density: Joi.number().optional().max(0).min(-3),
    typography: Joi.string().optional(),
  }).unknown(true).required(),
}).unknown(true);
