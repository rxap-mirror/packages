import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import {
  ENVIRONMENT,
  Environment,
} from '@rxap/nest-utilities';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { BaseDataSourceOptions } from 'typeorm/data-source/BaseDataSourceOptions';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import { BetterSqlite3DataSourceOptions } from 'typeorm/driver/better-sqlite3/BetterSqlite3DataSourceOptions';
import { PostgresDataSourceOptions } from 'typeorm/driver/postgres/PostgresDataSourceOptions';

@Injectable()
export abstract class BaseTypeOrmModuleOptionsFactory implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  @Inject(Logger)
  protected readonly logger!: Logger;

  @Inject(ENVIRONMENT)
  protected readonly environment!: Environment;

  createTypeOrmOptions(): TypeOrmModuleOptions {
    if (this.environment.swagger) {
      return this.swaggerConfig();
    }
    const type = this.config.get('TYPEORM_TYPE');
    this.logger.debug(`Building typeorm config for '${type}' database'`);
    switch (type) {
      case 'postgres':
        return this.postgresConfig();
      default:
      case 'sqlite':
        return this.sqliteConfig();
    }
  }

  protected swaggerConfig(): TypeOrmModuleOptions {
    this.logger.debug('Using sqlite database');
    return {
      ...this.sqliteConfig(),
      database: ':memory:',
      dropSchema: true,
      synchronize: true,
    };
  }

  protected migrationConfig(): Pick<TypeOrmModuleOptions, 'migrations' | 'migrationsRun' | 'migrationsTransactionMode' | 'migrationsTableName'> {
    const migrationsRun = this.config.get('TYPEORM_MIGRATIONS_RUN', false);
    if (!migrationsRun) {
      return { migrationsRun };
    }
    const migrations = this.config.get('TYPEORM_MIGRATIONS', 'migrations');
    const migrationsFolder = migrations.startsWith('/') ? migrations : join(process.cwd(), migrations);
    if (!existsSync(migrationsFolder)) {
      throw new Error(`Migrations folder '${migrationsFolder}' does not exist`);
    }
    return {
      migrationsRun,
      migrations: [ migrationsFolder + '/*.js' ],
      migrationsTableName: this.config.get('TYPEORM_MIGRATION_TABLE_NAME'),
      migrationsTransactionMode: this.config.get('TYPEORM_MIGRATIONS_TRANSACTION_MODE'),
    };
  }

  protected baseConfig(): Omit<TypeOrmModuleOptions, keyof DataSourceOptions> &
    Partial<Omit<BaseDataSourceOptions, 'poolSize'>> {
    return {
      ...this.migrationConfig(),
      synchronize: this.config.get(
        'POSTGRES_SYNCHRONIZE',
        this.config.getOrThrow('TYPEORM_SYNCHRONIZE')
      ),
      logging: this.config.get(
        'POSTGRES_LOGGING',
        this.config.getOrThrow('TYPEORM_LOGGING')
      ),
      entities: this.getEntities(),
    };
  }

  protected sqliteConfig(): TypeOrmModuleOptions & BetterSqlite3DataSourceOptions {
    return {
      ...this.baseConfig(),
      // typeorm >= 1 removed the `sqlite` (sqlite3) driver: the TYPEORM_TYPE=sqlite setting now uses better-sqlite3
      type: 'better-sqlite3',
      database: this.config.get(
        'SQLITE_DATABASE',
        this.environment.production
          ? `backend.sqlite`
          : join(tmpdir(), `backend.sqlite`)
      ),
    };
  }

  protected postgresConfig(): TypeOrmModuleOptions & PostgresDataSourceOptions {
    let credentials: PostgresConnectionCredentialsOptions;
    if (this.config.get('POSTGRES_URL')) {
      credentials = {
        url: this.config.getOrThrow('POSTGRES_URL'),
      };
      this.logger.debug(
        `Connection string: ${credentials.url!.replace(/^([^:/@]+:\/\/[^:/@]+):.+@/, '$1:******@')}`
      );
    } else {
      credentials = {
        host: this.config.getOrThrow('POSTGRES_HOST'),
        port: this.config.getOrThrow('POSTGRES_PORT'),
        username: this.config.getOrThrow('POSTGRES_USER'),
        password: this.config.getOrThrow('POSTGRES_PASSWORD'),
        database: this.config.getOrThrow('POSTGRES_DB'),
      };
      this.logger.debug(
        `Composed connection string: postgres://${credentials.username}:${
          credentials.password ? '******' : '<empty>'
        }@${credentials.host}:${credentials.port}/${credentials.database}`
      );
    }
    const config: TypeOrmModuleOptions & PostgresDataSourceOptions = {
      ...this.baseConfig(),
      ...credentials,
      type: 'postgres',
      uuidExtension: 'uuid-ossp',
    };

    if (config.synchronize) {
      this.logger.warn(
        'Using synchronize option. This is not recommended in production!'
      );
    }
    if (config.logging) {
      this.logger.warn(
        'Using logging option. This is not recommended in production!'
      );
    }
    return config;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-wrapper-object-types
  protected abstract getEntities(): BaseDataSourceOptions['entities'];
}
