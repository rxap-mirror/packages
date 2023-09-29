import {
  INestApplication,
  Logger,
} from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import {
  JwtModule,
  JwtService,
} from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { JwtGuardProvider } from '@rxap/nest-jwt';
import {
  MockConfigServiceFactory,
  MockLoggerFactory,
} from '@rxap/nest-testing';
import {
  clone,
  RemoveFromObject,
  SetToObject,
} from '@rxap/utilities';
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import mockFs from 'mock-fs';
import { join } from 'path';
import request from 'supertest';
import { UserSettings } from './settings';
import { SettingsModule } from './settings.module';
import { SettingsService } from './settings.service';

describe('SettingsModule', () => {

  let app: INestApplication;
  let token: string;
  let settingsService: SettingsService;
  let configService: ConfigService;
  const userId = 'test';

  const propertyPathList = [
    'dashboards',
    'feature.machine.company',
  ];

  beforeEach(async () => {
    const moduleRef = await Test
      .createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          SettingsModule,
          JwtModule.register({
            secretOrPrivateKey: 'secret',
          }),
        ],
        providers: [ JwtGuardProvider, Logger ],
      })
      .overrideProvider(ConfigService)
      .useValue(MockConfigServiceFactory({
        SETTINGS_DEFAULT_FILE_PATH: '/tmp/settings.json',
        STORE_FILE_PATH: '/tmp/settings',
      }))
      .setLogger(MockLoggerFactory())
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const jwtService = moduleRef.get(JwtService);
    token = jwtService.sign({ sub: userId });
    settingsService = moduleRef.get(SettingsService);
    configService = moduleRef.get(ConfigService);
    mockFs();
    await settingsService.onApplicationBootstrap();
  });

  function getSettingsFromFileSystem(key: string = userId): UserSettings | null {
    const filePath = join(configService.get('STORE_FILE_PATH'), `user-settings.__.${ key }`);
    if (!existsSync(filePath)) {
      return null;
    }
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  }

  function setSettingsToFileSystem(settings: UserSettings, key: string = userId) {
    writeFileSync(
      join(configService.get('STORE_FILE_PATH'), `user-settings.__.${ key }`), JSON.stringify(settings), 'utf-8');
  }

  afterEach(() => {
    mockFs.restore();
  });

  describe('SettingsController', () => {

    describe('GET /settings', () => {

      it('should return the default settings', async () => {

        const response = await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${ token }`)
          .expect(SettingsService.DefaultSettings);

        expect(response.status).toEqual(200);

      });

      it('should use Accept-Language header to determine the default language', async () => {

        const response = await request(app.getHttpServer())
          .get('/settings')
          .set('Authorization', `Bearer ${ token }`)
          .set('Accept-Language', 'de')
          .expect({
            ...SettingsService.DefaultSettings,
            language: 'de',
          });

        expect(response.status).toEqual(200);

      });

    });

    describe('POST /settings', () => {

      it.skip('should set the settings', async () => {

        const response = await request(app.getHttpServer())
          .post('/settings')
          .send({ hideRouter: true })
          .set('Authorization', `Bearer ${ token }`)
          .set('Content-Type', 'application/json');

        expect(getSettingsFromFileSystem()).toEqual({
          hideRouter: true,
        });
        expect(response.status).toEqual(201);

      });

    });

    describe.each(propertyPathList)(`GET /settings/%s`, propertyPath => {

      it('should return the value of the property path that exists', async () => {

        const existingValue = { test: true };
        const existingSettings = SettingsService.DefaultSettings;
        SetToObject(existingSettings, propertyPath, existingValue);
        setSettingsToFileSystem(existingSettings);

        const response = await request(app.getHttpServer())
          .get(`/settings/${ propertyPath }`)
          .set('Authorization', `Bearer ${ token }`)
          .expect(existingValue);

        expect(response.status).toEqual(200);

      });

    });

    describe.each(propertyPathList)(`PUT /settings/%s`, propertyPath => {

      it.skip('should set the value of the property path that not exists', async () => {

        const result = SettingsService.DefaultSettings;
        const value = { test: true };
        SetToObject(result, propertyPath, value);

        const response = await request(app.getHttpServer())
          .put(`/settings/${ propertyPath }`)
          .send({ test: true })
          .set('Authorization', `Bearer ${ token }`);

        expect(getSettingsFromFileSystem()).toEqual(result);
        expect(response.status).toEqual(200);

      });

    });

    describe.each(propertyPathList)(`DELETE /settings/%s`, propertyPath => {

      it('should delete the value of the property path that exists', async () => {

        const existingValue = { test: true };
        const existingSettings = SettingsService.DefaultSettings;
        SetToObject(existingSettings, propertyPath, existingValue);
        const result = clone(existingSettings);
        RemoveFromObject(result, propertyPath);
        setSettingsToFileSystem(existingSettings);

        const response = await request(app.getHttpServer())
          .delete(`/settings/${ propertyPath }`)
          .set('Authorization', `Bearer ${ token }`);

        expect(response.status).toEqual(200);
        expect(getSettingsFromFileSystem()).toEqual(result);

      });

    });

    describe.each(propertyPathList)(`PUT /settings/%s/push`, propertyPath => {

      it.skip('should push the value to the property path that not exists', async () => {

        const result = SettingsService.DefaultSettings;
        const value = { test: true };
        SetToObject(result, propertyPath, [ value ]);

        const response = await request(app.getHttpServer())
          .put(`/settings/${ propertyPath }/push`)
          .send(value)
          .set('Authorization', `Bearer ${ token }`);

        expect(getSettingsFromFileSystem()).toEqual(result);

        expect(response.status).toEqual(200);

      });

    });

    describe.each(propertyPathList)(`DELETE /settings/%s/pop`, propertyPath => {

      it('should pop the value from the property path that exists', async () => {

        const existingValue = { test: true };
        const existingSettings = SettingsService.DefaultSettings;
        SetToObject(existingSettings, propertyPath, [ existingValue ]);
        const result = clone(existingSettings);
        SetToObject(result, propertyPath, []);
        setSettingsToFileSystem(existingSettings);

        const response = await request(app.getHttpServer())
          .delete(`/settings/${ propertyPath }/pop`)
          .set('Authorization', `Bearer ${ token }`)
          .expect(existingValue);

        expect(response.status).toEqual(200);

        expect(getSettingsFromFileSystem()).toEqual(result);

      });

    });

  });

  describe('DarkModeController', () => {

    it('PUT /settings/darkMode/toggle', async () => {

      const response = await request(app.getHttpServer())
        .put('/settings/darkMode/toggle')
        .set('Authorization', `Bearer ${ token }`);

      expect(response.status).toEqual(200);

      expect(getSettingsFromFileSystem()).toEqual({
        ...SettingsService.DefaultSettings,
        darkMode: false,
      });

    });

  });

});
