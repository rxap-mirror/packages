import { Test } from '@nestjs/testing';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheckError } from '@nestjs/terminus';
import * as fs from 'fs';
import { MinioHealthIndicator } from './minio.health-indicator';
import { MinioModuleOptionsLoader } from './minio-module-options-loader';
import { minioValidationSchema } from './minio-validation-schema';
import { MinioModule } from './minio.module';
import { MinioService } from './minio.service';
import { MINIO_OPTIONS } from './tokens';
import * as Joi from 'joi';

describe('MinioService', () => {
  it('exposes the endpoint', () => {
    const s = new MinioService({ endPoint: 'host', accessKey: 'a', secretKey: 'b' });
    expect(s.endPoint).toBe('host');
  });
});

describe('MinioHealthIndicator', () => {
  let indicator: MinioHealthIndicator;
  let listBuckets: jest.Mock;
  let logger: { error: jest.Mock };

  beforeEach(() => {
    listBuckets = jest.fn();
    logger = { error: jest.fn() };
    indicator = new MinioHealthIndicator();
    indicator.minioService = { listBuckets } as any;
    indicator.logger = logger as any;
  });

  it('is healthy when buckets are listed', async () => {
    listBuckets.mockResolvedValue([]);
    await expect(indicator.isHealthy()).resolves.toEqual({ minio: { status: 'up' } });
  });

  it('throws when the response is not an array', async () => {
    listBuckets.mockResolvedValue(undefined);
    await expect(indicator.isHealthy()).rejects.toBeInstanceOf(HealthCheckError);
  });

  it('logs and throws on errors with message', async () => {
    listBuckets.mockRejectedValue(Object.assign(new Error('down'), { code: 'X' }));
    await expect(indicator.isHealthy()).rejects.toBeInstanceOf(HealthCheckError);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('down'), expect.anything(), 'MinioHealthIndicator');
  });

  it('logs and throws on non-error rejections', async () => {
    listBuckets.mockRejectedValue({});
    await expect(indicator.isHealthy()).rejects.toBeInstanceOf(HealthCheckError);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to list minio buckets'), undefined, 'MinioHealthIndicator');
  });
});

describe('MinioModuleOptionsLoader', () => {
  let env: Record<string, any>;
  let logger: any;
  const create = () => {
    const l = new MinioModuleOptionsLoader();
    Object.assign(l as any, {
      config: { get: jest.fn((k: string, d?: any) => env[k] ?? d) },
      logger,
    });
    return l.create();
  };

  beforeEach(() => {
    env = {};
    logger = { verbose: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn() };
  });
  afterEach(() => jest.restoreAllMocks());

  it('uses defaults and warns without SSL', () => {
    expect(create()).toEqual({
      endPoint: 'minio',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
      transportAgent: undefined,
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('uses default CA with SSL and no cert path', () => {
    env['MINIO_USE_SSL'] = true;
    expect(create().transportAgent).toBeUndefined();
    expect(logger.debug).toHaveBeenCalled();
  });

  it('loads the CA certificate into an agent', () => {
    env['MINIO_USE_SSL'] = true;
    env['MINIO_CA_CERTS'] = '/ca.pem';
    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('cert'));
    expect(create().transportAgent).toBeDefined();
    expect(logger.verbose).toHaveBeenCalled();
  });

  it('falls back to NODE_EXTRA_CA_CERTS', () => {
    env['MINIO_USE_SSL'] = true;
    env['NODE_EXTRA_CA_CERTS'] = '/extra.pem';
    const spy = jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('cert'));
    create();
    expect(spy).toHaveBeenCalledWith('/extra.pem');
  });

  it('logs when the CA cannot be read', () => {
    env['MINIO_USE_SSL'] = true;
    env['MINIO_CA_CERTS'] = '/missing.pem';
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('ENOENT');
    });
    expect(create().transportAgent).toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });
});

describe('minioValidationSchema', () => {
  const validate = (opts?: any) =>
    Joi.object(minioValidationSchema({ app: 'x' } as any, opts)).validate({}).value;

  it('uses plain defaults', () => {
    expect(validate()).toEqual({
      MINIO_END_POINT: 'minio',
      MINIO_PORT: 9000,
      MINIO_USE_SSL: false,
      MINIO_ACCESS_KEY: 'minioadmin',
      MINIO_SECRET_KEY: 'minioadmin',
    });
  });

  it('derives SSL and port from a custom endpoint', () => {
    expect(validate({ endPoint: 's3.example.com' })).toMatchObject({
      MINIO_END_POINT: 's3.example.com',
      MINIO_USE_SSL: true,
      MINIO_PORT: 443,
    });
  });
});

describe('MinioModule', () => {
  it('register adds the MINIO_OPTIONS alias', () => {
    const m = MinioModule.register({ endPoint: 'h', accessKey: 'a', secretKey: 's' });
    expect(m.providers!.some((p: any) => p.provide === MINIO_OPTIONS)).toBe(true);
  });

  it('registerAsync adds the MINIO_OPTIONS alias', () => {
    const m = MinioModule.registerAsync({ useFactory: () => ({ endPoint: 'h' }) as any });
    expect(m.providers!.some((p: any) => p.provide === MINIO_OPTIONS)).toBe(true);
  });

  it('resolves MinioService through DI', async () => {
    @Global()
    @Module({
      providers: [
        { provide: ConfigService, useValue: {} },
        { provide: Logger, useValue: {} },
      ],
      exports: [ConfigService, Logger],
    })
    class GlobalDeps {}
    const ref = await Test.createTestingModule({
      imports: [GlobalDeps, MinioModule.register({ endPoint: 'h', accessKey: 'a', secretKey: 's' })],
    }).compile();
    expect(ref.get(MinioService).endPoint).toBe('h');
  });
});
