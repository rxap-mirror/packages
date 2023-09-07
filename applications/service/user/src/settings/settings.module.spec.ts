import { INestApplication } from '@nestjs/common';
import {
  JwtModule,
  JwtService,
} from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { JwtGuardProvider } from '@rxap/nest-jwt';
import {
  clone,
  deepMerge,
  RemoveFromObject,
  SetToObject,
} from '@rxap/utilities';
import request from 'supertest';
import { SettingsModule } from './settings.module';
import { SettingsService } from './settings.service';

describe('SettingsModule', () => {

  let app: INestApplication;
  let token: string;

  const settingsService = {
    map: new Map(),
    get(userId: string) {
      return deepMerge(SettingsService.DefaultSettings, this.map.get(userId) ?? {});
    },
    set(userId: string, settings: any) {
      this.map.set(userId, clone(settings));
    },
  };
  const propertyPathList = [
    'dashboards',
    'feature.machine.company',
  ];

  beforeAll(async () => {
    const moduleRef = await Test
      .createTestingModule({
        imports: [
          SettingsModule,
          JwtModule.register({
            secretOrPrivateKey: 'secret',
          }),
        ],
        providers: [ JwtGuardProvider ],
      })
      .overrideProvider(SettingsService)
      .useValue(settingsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    const jwtService = moduleRef.get(JwtService);
    token = jwtService.sign({ sub: 'test' });
  });

  beforeEach(() => {
    settingsService.map.clear();
  });

  it('GET /settings', () => {
    return request(app.getHttpServer())
      .get('/settings')
      .set('Authorization', `Bearer ${ token }`)
      .expect(200)
      .expect(SettingsService.DefaultSettings);
  });

  it('POST /settings', () => {
    return request(app.getHttpServer())
      .post('/settings')
      .send({ hideRouter: true })
      .set('Authorization', `Bearer ${ token }`)
      .expect(201)
      .expect({
        ...SettingsService.DefaultSettings,
        hideRouter: true,
      });
  });

  it('PUT /settings/darkMode/toggle', () => {
    return request(app.getHttpServer())
      .put('/settings/darkMode/toggle')
      .set('Authorization', `Bearer ${ token }`)
      .expect(200)
      .expect({
        ...SettingsService.DefaultSettings,
        darkMode: false,
      });
  });

  for (const propertyPath of propertyPathList) {

    describe(`GET /settings/${ propertyPath }`, () => {

      it('should return the value of the property path that exists', () => {
        const existingValue = { test: true };
        const existingSettings = SettingsService.DefaultSettings;
        SetToObject(existingSettings, propertyPath, existingValue);
        settingsService.map.set(
          'test',
          existingSettings,
        );
        return request(app.getHttpServer())
          .get(`/settings/${ propertyPath }`)
          .send({ test: true })
          .set('Authorization', `Bearer ${ token }`)
          .expect(200)
          .expect(existingValue);
      });

    });

    describe(`PUT /settings/${ propertyPath }`, () => {

      it('should set the value of the property path that not exists', () => {
        const result = SettingsService.DefaultSettings;
        const value = { test: true };
        SetToObject(result, propertyPath, value);
        return request(app.getHttpServer())
          .put(`/settings/${ propertyPath }`)
          .send({ test: true })
          .set('Authorization', `Bearer ${ token }`)
          .expect(200)
          .expect(result);

      });

    });

    describe(`DELETE /settings/${ propertyPath }`, () => {

      it('should delete the value of the property path that exists', () => {
        const existingValue = { test: true };
        const existingSettings = SettingsService.DefaultSettings;
        SetToObject(existingSettings, propertyPath, existingValue);
        const result = clone(existingSettings);
        RemoveFromObject(result, propertyPath);
        settingsService.map.set(
          'test',
          existingSettings,
        );
        return request(app.getHttpServer())
          .delete(`/settings/${ propertyPath }`)
          .set('Authorization', `Bearer ${ token }`)
          .expect(200)
          .expect(result);
      });

    });

    describe(`PUT /settings/${ propertyPath }/push`, () => {

      it('should push the value to the property path that not exists', () => {
        const result = SettingsService.DefaultSettings;
        const value = { test: true };
        SetToObject(result, propertyPath, [ value ]);
        return request(app.getHttpServer())
          .put(`/settings/${ propertyPath }/push`)
          .send(value)
          .set('Authorization', `Bearer ${ token }`)
          .expect(200)
          .expect(result);
      });

    });

    describe(`DELETE /settings/${ propertyPath }/pop`, () => {

      it('should pop the value from the property path that exists', async () => {
        const existingValue = { test: true };
        const existingSettings = SettingsService.DefaultSettings;
        SetToObject(existingSettings, propertyPath, [ existingValue ]);
        const result = clone(existingSettings);
        SetToObject(result, propertyPath, []);
        settingsService.map.set(
          'test',
          existingSettings,
        );
        await request(app.getHttpServer())
          .delete(`/settings/${ propertyPath }/pop`)
          .set('Authorization', `Bearer ${ token }`)
          .expect(200)
          .expect(existingValue);
        expect(settingsService.map.get('test')).toEqual(result);
      });

    });

  }

});
