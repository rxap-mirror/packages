import Joi from 'joi';

export interface UserSettings extends Record<string, any> {
  darkMode: boolean;
  language: string;
}

export const UserSettingsSchema = Joi.object({
  darkMode: Joi.boolean().required(),
  language: Joi.string().required(),
}).unknown(true);
