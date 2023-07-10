import {Test} from '@nestjs/testing';
import {Controller, Get, INestApplication, Logger, Module} from '@nestjs/common';
import {TestingLogger} from '@nestjs/testing/services/testing-logger.service';
import {APP_GUARD} from '@nestjs/core';
import * as request from 'supertest';
import {GetFirebaseUser} from './firebase-user.decorator';
import {FirebaseUser} from './types';
import {FirebaseAuthGuard} from './firebase-auth.guard';
import {ALLOW_UNVERIFIED_EMAIL, FIREBASE_AUTH_HEADER} from './tokens';

describe('FirebaseAuthGuard', () => {

  let guard: FirebaseAuthGuard;
  let validateIdTokenSpy: jest.SpyInstance;
  let app: INestApplication;
  const logUser: jest.Mock = jest.fn();

  @Controller('app')
  class TestAppController {

    @Get('')
    public test(@GetFirebaseUser() user: FirebaseUser) {
      console.log(user);
      logUser(user);
    }

  }

  @Module({
    controllers: [TestAppController],
  })
  class TestAppModule {
  }

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestAppModule],
      providers: [
        FirebaseAuthGuard,
        {
          provide: Logger,
          useClass: TestingLogger,
        },
        {
          provide: ALLOW_UNVERIFIED_EMAIL,
          useValue: false,
        },
        {
          provide: FIREBASE_AUTH_HEADER,
          useValue: 'idToken',
        },
        {
          provide: APP_GUARD,
          useExisting: FirebaseAuthGuard,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();

    guard = module.get(FirebaseAuthGuard);
    validateIdTokenSpy = jest.spyOn(guard, 'validateIdToken');
  });

  it('should pass the FirebaseUser to the request object', async () => {

    validateIdTokenSpy.mockResolvedValue({FirebaseUser: 'value'});

    await request(app.getHttpServer())
      .get('/app')
      .set({'idToken': 'token'});

    expect(validateIdTokenSpy).toBeCalledTimes(1);
    expect(logUser).toBeCalledTimes(1);
    expect(logUser).toBeCalledWith({FirebaseUser: 'value'});

  });

});
