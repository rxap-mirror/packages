import * as fs from 'fs';
import * as Joi from 'joi';
import { join } from 'path';
import { tmpdir } from 'os';
import { BaseTypeOrmModuleOptionsFactory } from './base-type-orm-module-options.factory';
import { postgresValidationSchema } from './postgres-validation-schema';
import { sqliteValidationSchema } from './sqlite-validation-schema';
import { typeOrmValidationSchema } from './typeorm-validation-schema';

jest.mock('fs', () => ({ ...jest.requireActual('fs'), existsSync: jest.fn() }));

class Entity {}
class Factory extends BaseTypeOrmModuleOptionsFactory {
  protected getEntities() {
    return [Entity];
  }
}

describe('BaseTypeOrmModuleOptionsFactory', () => {
  let values: Record<string, any>;
  let logger: any;
  const build = (environment: any = { production: false }) => {
    const f = new Factory();
    Object.assign(f as any, {
      environment,
      logger,
      config: {
        get: jest.fn((k: string, d?: any) => values[k] ?? d),
        getOrThrow: jest.fn((k: string) => {
          if (!(k in values)) throw new Error(`missing ${k}`);
          return values[k];
        }),
      },
    });
    return f;
  };

  beforeEach(() => {
    values = { TYPEORM_SYNCHRONIZE: false, TYPEORM_LOGGING: false };
    logger = { debug: jest.fn(), warn: jest.fn() };
    (fs.existsSync as jest.Mock).mockReset();
  });

  it('defaults to sqlite in tmpdir for development', () => {
    const o: any = build().createTypeOrmOptions();
    expect(o).toMatchObject({
      type: 'better-sqlite3',
      database: join(tmpdir(), 'backend.sqlite'),
      entities: [Entity],
      synchronize: false,
      logging: false,
      migrationsRun: false,
    });
  });

  it('uses a relative sqlite file in production and honors SQLITE_DATABASE', () => {
    expect((build({ production: true }).createTypeOrmOptions() as any).database).toBe('backend.sqlite');
    values['SQLITE_DATABASE'] = 'x.db';
    expect((build().createTypeOrmOptions() as any).database).toBe('x.db');
  });

  it('uses an in-memory database for swagger generation', () => {
    const o: any = build({ swagger: true }).createTypeOrmOptions();
    expect(o).toMatchObject({ type: 'better-sqlite3', database: ':memory:', dropSchema: true, synchronize: true });
  });

  it('prefers POSTGRES_ synchronize/logging overrides', () => {
    values['POSTGRES_SYNCHRONIZE'] = true;
    values['POSTGRES_LOGGING'] = true;
    const o: any = build().createTypeOrmOptions();
    expect(o).toMatchObject({ synchronize: true, logging: true });
  });

  describe('postgres', () => {
    beforeEach(() => {
      values['TYPEORM_TYPE'] = 'postgres';
    });

    it('builds from individual settings and masks the password in logs', () => {
      Object.assign(values, {
        POSTGRES_HOST: 'h',
        POSTGRES_PORT: 5432,
        POSTGRES_USER: 'u',
        POSTGRES_PASSWORD: 'secret',
        POSTGRES_DB: 'd',
      });
      const o: any = build().createTypeOrmOptions();
      expect(o).toMatchObject({ type: 'postgres', host: 'h', port: 5432, username: 'u', password: 'secret', database: 'd', uuidExtension: 'uuid-ossp' });
      const logged = logger.debug.mock.calls.map((c: any[]) => c[0]).join('\n');
      expect(logged).toContain('postgres://u:******@h:5432/d');
      expect(logged).not.toContain('secret');
    });

    it('shows <empty> for an empty password', () => {
      Object.assign(values, { POSTGRES_HOST: 'h', POSTGRES_PORT: 1, POSTGRES_USER: 'u', POSTGRES_PASSWORD: '', POSTGRES_DB: 'd' });
      build().createTypeOrmOptions();
      expect(logger.debug.mock.calls.map((c: any[]) => c[0]).join()).toContain('<empty>');
    });

    it('builds from POSTGRES_URL and masks credentials', () => {
      values['POSTGRES_URL'] = 'postgres://user:pw@host:5432/db';
      const o: any = build().createTypeOrmOptions();
      expect(o.url).toBe('postgres://user:pw@host:5432/db');
      expect(logger.debug.mock.calls.map((c: any[]) => c[0]).join()).toContain('postgres://user:******@host');
    });

    it('requires connection settings', () => {
      expect(() => build().createTypeOrmOptions()).toThrow('missing POSTGRES_HOST');
    });

    it('warns when synchronize or logging is enabled', () => {
      Object.assign(values, { POSTGRES_URL: 'postgres://u:p@h/d', TYPEORM_SYNCHRONIZE: true, TYPEORM_LOGGING: true });
      build().createTypeOrmOptions();
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('migrations', () => {
    beforeEach(() => {
      values['TYPEORM_MIGRATIONS_RUN'] = true;
    });

    it('resolves relative folders from cwd', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      values['TYPEORM_MIGRATION_TABLE_NAME'] = 'mig';
      values['TYPEORM_MIGRATIONS_TRANSACTION_MODE'] = 'each';
      const o: any = build().createTypeOrmOptions();
      expect(o.migrations).toEqual([join(process.cwd(), 'migrations') + '/*.js']);
      expect(o).toMatchObject({ migrationsRun: true, migrationsTableName: 'mig', migrationsTransactionMode: 'each' });
    });

    it('keeps absolute folders', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      values['TYPEORM_MIGRATIONS'] = '/abs/mig';
      expect((build().createTypeOrmOptions() as any).migrations).toEqual(['/abs/mig/*.js']);
    });

    it('throws when the folder is missing', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      expect(() => build().createTypeOrmOptions()).toThrow('does not exist');
    });
  });
});

describe('validation schemas', () => {
  const env: any = { production: false };

  it('postgres defaults', () => {
    expect(Joi.object(postgresValidationSchema(env)).validate({}).value).toEqual({
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: 5432,
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
      POSTGRES_DB: 'postgres',
    });
  });

  it('sqlite defaults', () => {
    expect(Joi.object(sqliteValidationSchema(env)).validate({}).value).toEqual({ SQLITE_DATABASE: 'database.sqlite' });
  });

  describe('typeOrmValidationSchema', () => {
    const validate = (e: any, o?: any) => Joi.object(typeOrmValidationSchema(e, o)).validate({}).value;

    it('derives synchronize from the environment', () => {
      expect(validate({ production: false })).toMatchObject({ TYPEORM_TYPE: 'sqlite', TYPEORM_SYNCHRONIZE: true });
      expect(validate({ production: true })).toMatchObject({ TYPEORM_SYNCHRONIZE: false });
    });

    it('applies migration defaults only when given', () => {
      const v = validate(env, {
        migrationsRun: true,
        migrationsTableName: 't',
        migrationsTransactionMode: 'all',
        migrations: 'm',
        type: 'postgres',
        logging: true,
      });
      expect(v).toMatchObject({
        TYPEORM_MIGRATIONS_RUN: true,
        TYPEORM_MIGRATION_TABLE_NAME: 't',
        TYPEORM_MIGRATIONS_TRANSACTION_MODE: 'all',
        TYPEORM_MIGRATIONS: 'm',
        TYPEORM_TYPE: 'postgres',
        TYPEORM_LOGGING: true,
      });
      expect(validate(env)).not.toHaveProperty('TYPEORM_MIGRATIONS_RUN');
    });

    it('defaults logging from LOG_LEVEL', () => {
      const prev = process.env['LOG_LEVEL'];
      process.env['LOG_LEVEL'] = 'verbose';
      expect(validate(env).TYPEORM_LOGGING).toBe(true);
      if (prev === undefined) delete process.env['LOG_LEVEL'];
      else process.env['LOG_LEVEL'] = prev;
    });
  });
});
