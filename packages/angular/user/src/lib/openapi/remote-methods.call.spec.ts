import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OpenApiConfigService } from '@rxap/open-api';
import { DarkModeControllerDisableRemoteMethod } from './remote-methods/dark-mode-controller-disable.remote-method';
import { DarkModeControllerEnableRemoteMethod } from './remote-methods/dark-mode-controller-enable.remote-method';
import { DarkModeControllerGetRemoteMethod } from './remote-methods/dark-mode-controller-get.remote-method';
import { DarkModeControllerToggleRemoteMethod } from './remote-methods/dark-mode-controller-toggle.remote-method';
import { LanguageControllerGetRemoteMethod } from './remote-methods/language-controller-get.remote-method';
import { LanguageControllerSetRemoteMethod } from './remote-methods/language-controller-set.remote-method';
import { ProfileControllerGetRemoteMethod } from './remote-methods/profile-controller-get.remote-method';
import { SettingsControllerClearPropertyRemoteMethod } from './remote-methods/settings-controller-clear-property.remote-method';
import { SettingsControllerDecrementPropertyRemoteMethod } from './remote-methods/settings-controller-decrement-property.remote-method';
import { SettingsControllerGetPropertyRemoteMethod } from './remote-methods/settings-controller-get-property.remote-method';
import { SettingsControllerGetRemoteMethod } from './remote-methods/settings-controller-get.remote-method';
import { SettingsControllerIncrementPropertyRemoteMethod } from './remote-methods/settings-controller-increment-property.remote-method';
import { SettingsControllerPopPropertyRemoteMethod } from './remote-methods/settings-controller-pop-property.remote-method';
import { SettingsControllerPushPropertyRemoteMethod } from './remote-methods/settings-controller-push-property.remote-method';
import { SettingsControllerRemoveAtPropertyRemoteMethod } from './remote-methods/settings-controller-remove-at-property.remote-method';
import { SettingsControllerRemovePropertyRemoteMethod } from './remote-methods/settings-controller-remove-property.remote-method';
import { SettingsControllerSetPropertyRemoteMethod } from './remote-methods/settings-controller-set-property.remote-method';
import { SettingsControllerSetRemoteMethod } from './remote-methods/settings-controller-set.remote-method';
import { SettingsControllerShiftPropertyRemoteMethod } from './remote-methods/settings-controller-shift-property.remote-method';
import { SettingsControllerTogglePropertyRemoteMethod } from './remote-methods/settings-controller-toggle-property.remote-method';
import { SettingsControllerUnshiftPropertyRemoteMethod } from './remote-methods/settings-controller-unshift-property.remote-method';
import { ThemeControllerGetRemoteMethod } from './remote-methods/theme-controller-get.remote-method';
import { ThemeControllerSetDensityRemoteMethod } from './remote-methods/theme-controller-set-density.remote-method';
import { ThemeControllerSetPresetRemoteMethod } from './remote-methods/theme-controller-set-preset.remote-method';
import { ThemeControllerSetTypographyRemoteMethod } from './remote-methods/theme-controller-set-typography.remote-method';
import { ThemeControllerSetRemoteMethod } from './remote-methods/theme-controller-set.remote-method';

const SERVER_URL = 'https://user.test';

interface RemoteMethodCase {
  name: string;
  method: Type<{ call: (...args: any[]) => Promise<any> }>;
  /** the argument passed to the remote method call */
  input?: Record<string, any>;
  httpMethod: 'GET' | 'PUT' | 'POST' | 'DELETE';
  path: string;
  /** the request body expected on the wire */
  body?: unknown;
  /** the response body returned by the backend */
  response: any;
}

const settings = {
  darkMode: true,
  language: 'de',
  theme: {
    preset: 'azure',
    density: -1,
    typography: 'roboto',
  },
};

const cases: RemoteMethodCase[] = [
  {
    name: 'DarkModeControllerDisable',
    method: DarkModeControllerDisableRemoteMethod,
    httpMethod: 'PUT',
    path: '/settings/dark-mode/disable',
    response: true,
  },
  {
    name: 'DarkModeControllerEnable',
    method: DarkModeControllerEnableRemoteMethod,
    httpMethod: 'PUT',
    path: '/settings/dark-mode/enable',
    response: true,
  },
  {
    name: 'DarkModeControllerGet',
    method: DarkModeControllerGetRemoteMethod,
    httpMethod: 'GET',
    path: '/settings/dark-mode',
    response: true,
  },
  {
    name: 'DarkModeControllerToggle',
    method: DarkModeControllerToggleRemoteMethod,
    httpMethod: 'PUT',
    path: '/settings/dark-mode/toggle',
    response: true,
  },
  {
    name: 'LanguageControllerGet',
    method: LanguageControllerGetRemoteMethod,
    httpMethod: 'GET',
    path: '/settings/language',
    response: 'de',
  },
  {
    name: 'LanguageControllerSet',
    method: LanguageControllerSetRemoteMethod,
    input: { parameters: { language: 'en' } },
    httpMethod: 'PUT',
    path: '/settings/language/en',
    response: { ok: true },
  },
  {
    name: 'ProfileControllerGet',
    method: ProfileControllerGetRemoteMethod,
    httpMethod: 'GET',
    path: '/profile',
    response: { name: 'John' },
  },
  {
    name: 'SettingsControllerClearProperty',
    method: SettingsControllerClearPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'theme' } },
    httpMethod: 'DELETE',
    path: '/settings/theme',
    response: { ok: true },
  },
  {
    name: 'SettingsControllerDecrementProperty',
    method: SettingsControllerDecrementPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'counter' } },
    httpMethod: 'PUT',
    path: '/settings/counter/decrement',
    response: { ok: true },
  },
  {
    name: 'SettingsControllerGetProperty',
    method: SettingsControllerGetPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'language' } },
    httpMethod: 'GET',
    path: '/settings/language',
    response: { value: 'de' },
  },
  {
    name: 'SettingsControllerGet',
    method: SettingsControllerGetRemoteMethod,
    httpMethod: 'GET',
    path: '/settings',
    response: settings,
  },
  {
    name: 'SettingsControllerIncrementProperty',
    method: SettingsControllerIncrementPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'counter' } },
    httpMethod: 'PUT',
    path: '/settings/counter/increment',
    response: { ok: true },
  },
  {
    name: 'SettingsControllerPopProperty',
    method: SettingsControllerPopPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'list' } },
    httpMethod: 'DELETE',
    path: '/settings/list/pop',
    response: { last: 1 },
  },
  {
    name: 'SettingsControllerPushProperty',
    method: SettingsControllerPushPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'list' } },
    httpMethod: 'PUT',
    path: '/settings/list/push',
    response: { ok: true },
  },
  {
    name: 'SettingsControllerRemoveAtProperty',
    method: SettingsControllerRemoveAtPropertyRemoteMethod,
    input: {
      parameters: {
        propertyPath: 'list',
        index: 2,
      },
    },
    httpMethod: 'DELETE',
    path: '/settings/list/removeAt/2',
    response: { ok: true },
  },
  {
    name: 'SettingsControllerRemoveProperty',
    method: SettingsControllerRemovePropertyRemoteMethod,
    input: { parameters: { propertyPath: 'list' } },
    httpMethod: 'DELETE',
    path: '/settings/list/remove',
    response: { ok: true },
  },
  {
    name: 'SettingsControllerSetProperty',
    method: SettingsControllerSetPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'language' } },
    httpMethod: 'PUT',
    path: '/settings/language',
    response: { ok: true },
  },
  {
    name: 'SettingsControllerSet',
    method: SettingsControllerSetRemoteMethod,
    input: { requestBody: { language: 'en' } },
    httpMethod: 'POST',
    path: '/settings',
    body: { language: 'en' },
    response: { ok: true },
  },
  {
    name: 'SettingsControllerShiftProperty',
    method: SettingsControllerShiftPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'list' } },
    httpMethod: 'DELETE',
    path: '/settings/list/shift',
    response: { first: 1 },
  },
  {
    name: 'SettingsControllerToggleProperty',
    method: SettingsControllerTogglePropertyRemoteMethod,
    input: { parameters: { propertyPath: 'flag' } },
    httpMethod: 'PUT',
    path: '/settings/flag/toggle',
    response: { ok: true },
  },
  {
    name: 'SettingsControllerUnshiftProperty',
    method: SettingsControllerUnshiftPropertyRemoteMethod,
    input: { parameters: { propertyPath: 'list' } },
    httpMethod: 'PUT',
    path: '/settings/list/unshift',
    response: 3,
  },
  {
    name: 'ThemeControllerGet',
    method: ThemeControllerGetRemoteMethod,
    httpMethod: 'GET',
    path: '/settings/theme',
    response: settings.theme,
  },
  {
    name: 'ThemeControllerSetDensity',
    method: ThemeControllerSetDensityRemoteMethod,
    input: { requestBody: { value: -2 } },
    httpMethod: 'PUT',
    path: '/settings/theme/density',
    body: { value: -2 },
    response: { ok: true },
  },
  {
    name: 'ThemeControllerSetPreset',
    method: ThemeControllerSetPresetRemoteMethod,
    input: { requestBody: { value: 'azure' } },
    httpMethod: 'PUT',
    path: '/settings/theme/preset',
    body: { value: 'azure' },
    response: { ok: true },
  },
  {
    name: 'ThemeControllerSet',
    method: ThemeControllerSetRemoteMethod,
    input: {
      requestBody: {
        preset: 'azure',
        density: 0,
      },
    },
    httpMethod: 'PUT',
    path: '/settings/theme',
    body: {
      preset: 'azure',
      density: 0,
    },
    response: { ok: true },
  },
  {
    name: 'ThemeControllerSetTypography',
    method: ThemeControllerSetTypographyRemoteMethod,
    input: { requestBody: { value: 'roboto' } },
    httpMethod: 'PUT',
    path: '/settings/theme/typography',
    body: { value: 'roboto' },
    response: { ok: true },
  },
];

describe('generated remote methods calls', () => {

  let httpMock: HttpTestingController;
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    OpenApiConfigService.InsertServer({ url: SERVER_URL }, 0, 'service-user');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('covers every generated remote method', () => {
    expect(cases).toHaveLength(26);
    expect(new Set(cases.map(c => c.method)).size).toBe(26);
  });

  it.each(cases)('$name sends the $httpMethod request to $path and returns the response', async (testCase) => {
    const remoteMethod = TestBed.inject(testCase.method);

    const result = testCase.input ? remoteMethod.call(testCase.input) : remoteMethod.call();

    const request = httpMock.expectOne(`${ SERVER_URL }${ testCase.path }`);
    expect(request.request.method).toBe(testCase.httpMethod);
    if (testCase.body !== undefined) {
      expect(request.request.body).toEqual(testCase.body);
    } else {
      expect(request.request.body).toBeNull();
    }
    request.flush(testCase.response);

    expect(await result).toEqual(testCase.response);
    expect(warn).not.toHaveBeenCalled();
  });

  it('SettingsControllerSetProperty returns null if the operation responds without content', async () => {
    const remoteMethod = TestBed.inject(SettingsControllerSetPropertyRemoteMethod);

    const result = remoteMethod.call({ parameters: { propertyPath: 'theme' } });

    httpMock.expectOne(`${ SERVER_URL }/settings/theme`).flush(null, {
      status: 200,
      statusText: 'OK',
    });

    // the response of the operation has no content
    expect(await result).toBeNull();
  });

});
