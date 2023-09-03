import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ServiceHealthIndicator } from './service.health-indicator';
import { StatusModule } from './status.module';

describe('StatusModule', () => {

  let app: INestApplication;
  const serviceHealthIndicator = {
    isHealthy: (serviceName: string) => ({
      [serviceName]: {
        status: 'up',
      },
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
                                  imports: [ StatusModule ],
                                })
                                .overrideProvider(ServiceHealthIndicator)
                                .useValue(serviceHealthIndicator)
                                .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('GET /many', () => {
    return request(app.getHttpServer())
      .get('/many')
      .expect(400);
  });

  it('GET /many?service=testA', () => {
    return request(app.getHttpServer())
      .get('/many?service=testA')
      .expect(200)
      .expect({
        details: { testA: { status: 'up' } },
        error: {},
        info: { testA: { status: 'up' } },
        status: 'ok',
      });
  });

  it('GET /many?service=testA&service=testB', () => {
    return request(app.getHttpServer())
      .get('/many?service=testA&service=testB')
      .expect(200)
      .expect({
        details: { testA: { status: 'up' }, testB: { status: 'up' } },
        error: {},
        info: { testA: { status: 'up' }, testB: { status: 'up' } },
        status: 'ok',
      });
  });

  it('GET /many?service=testA,testB', () => {
    return request(app.getHttpServer())
      .get('/many?service=testA&service=testB')
      .expect(200)
      .expect({
        details: { testA: { status: 'up' }, testB: { status: 'up' } },
        error: {},
        info: { testA: { status: 'up' }, testB: { status: 'up' } },
        status: 'ok',
      });
  });

});
