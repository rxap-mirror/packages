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
import { tmpdir } from 'os';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { BaseDataSourceOptions } from 'typeorm/data-source/BaseDataSourceOptions';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

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

  protected baseConfig(): Omit<TypeOrmModuleOptions, keyof DataSourceOptions> &
    Partial<Omit<BaseDataSourceOptions, 'poolSize'>> {
    return {
      migrationsRun: this.config.get(
        'TYPEORM_MIGRATIONS_RUN',
        false
      ),
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

  protected sqliteConfig(): TypeOrmModuleOptions & SqliteConnectionOptions {
    return {
      ...this.baseConfig(),
      type: 'sqlite',
      database: this.config.get(
        'SQLITE_DATABASE',
        this.environment.production
          ? `backend.sqlite`
          : join(tmpdir(), `backend.sqlite`)
      ),
    };
  }

  protected postgresConfig(): TypeOrmModuleOptions & PostgresConnectionOptions {
    let credentials: PostgresConnectionCredentialsOptions;
    if (this.config.get('POSTGRES_URL')) {
      credentials = {
        url: this.config.getOrThrow('POSTGRES_URL'),
      };
      this.logger.debug(
        `Connection string: ${credentials.url!.replace(/:.+@/g, ':******@')}`
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
    const config: TypeOrmModuleOptions & PostgresConnectionOptions = {
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  protected abstract getEntities(): BaseDataSourceOptions['entities'];
}
