import { InjectionToken } from '@angular/core';
import { Method } from '@rxap/pattern';
import { UserSettings } from './user-settings';

export const RXAP_GET_USER_SETTINGS_METHOD = new InjectionToken<Method<UserSettings>>('rxap/get-user-settings-method');
export const RXAP_SET_USER_SETTINGS_METHOD = new InjectionToken<Method<UserSettings, { requestBody: UserSettings }>>(
  'rxap/get-user-settings-method');
export const RXAP_GET_USER_SETTINGS_LANGUAGE_METHOD = new InjectionToken<Method<string>>(
  'rxap/get-user-settings-language-method');
export const RXAP_SET_USER_SETTINGS_LANGUAGE_METHOD = new InjectionToken<Method<string, {
  parameters: { language: string }
}>>('rxap/set-user-settings-language-method');
export const RXAP_GET_USER_SETTINGS_DARK_MODE_METHOD = new InjectionToken<Method<boolean>>(
  'rxap/get-user-settings-dark-mode-method');
export const RXAP_TOGGLE_USER_SETTINGS_DARK_MODE_METHOD = new InjectionToken<Method<boolean>>(
  'rxap/get-user-settings-dark-mode-method');
export const RXAP_DISABLE_USER_SETTINGS_DARK_MODE_METHOD = new InjectionToken<Method<boolean>>(
  'rxap/get-user-settings-dark-mode-method');
export const RXAP_ENABLE_USER_SETTINGS_DARK_MODE_METHOD = new InjectionToken<Method<boolean>>(
  'rxap/get-user-settings-dark-mode-method');
