import {
  INestApplicationContext,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ENVIRONMENT,
  Environment,
  ENVIRONMENT_PREPARED,
  RXAP_GLOBAL_STATE,
} from '@rxap/nest-utilities';
import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import * as process from 'process';

/**
 * @template O The options object passed to the server create function
 */
export type MainBeforeFunction<Options extends object> = (
  this: Server<Options, any, any, any>,
  options: Options,
  environment: Environment,
) => any | Promise<any>;

/**
 * @template T The instance of the nest application
 * @template B The options object build by the Server bootstrap logic
 */
export type MainAfterFunction<NestApplicationContext extends INestApplicationContext, BootstrapOptions extends object, Logger extends LoggerService> = (
  this: Server<any, NestApplicationContext, BootstrapOptions, Logger>,
  app: NestApplicationContext,
  config: ConfigService<unknown>,
  logger: Logger,
  options: BootstrapOptions,
  environment: Environment,
) => any | Promise<any>;

export type LoggerFactory<NestApplicationContext extends INestApplicationContext, B extends object, Logger extends LoggerService> = (
  this: Server<any, NestApplicationContext, B, Logger>,
  app: NestApplicationContext,
  config: ConfigService<unknown>,
  environment: Environment,
) => Logger | Promise<Logger>;

declare const module: { hot?: { accept: () => any, dispose: (cb: () => any) => any } };

export abstract class Server<Options extends object, NestApplicationContext extends INestApplicationContext, BootstrapOptions extends object, Logger extends LoggerService> {

  public app: NestApplicationContext | null = null;
  public logger: Logger | null = null;
  public config: ConfigService | null = null;
  private _beforeList: MainBeforeFunction<Options>[] = [];
  private _afterList: MainAfterFunction<NestApplicationContext, BootstrapOptions, Logger>[] = [];
  private _readyList: MainAfterFunction<NestApplicationContext, BootstrapOptions, Logger>[] = [];

  private _loggerFactory: LoggerFactory<NestApplicationContext, BootstrapOptions, Logger> = (app) => app.get(Logger);

  constructor(
    public readonly module: any,
    public readonly environment: Environment,
    public readonly options: Options = {} as any,
    public readonly bootstrapOptions: Partial<BootstrapOptions> = {},
  ) {
  }

  public async bootstrap() {

    Logger.log('Server bootstrap started', 'Bootstrap');
    Logger.debug('Initial environment', JSON.stringify(this.environment, undefined, this.environment.production ? undefined : 2), 'Bootstrap');

    this.printPackageVersions();

    this.prepareEnvironment(this.environment);

    Logger.debug('Handle before bootstrap hooks', 'Bootstrap');

    await this.handleBefore();

    Logger.debug('Create application', 'Bootstrap');

    this.app = await this.create();

    if (!this.app) {
      throw new Error('Nest app creation failed');
    }

    this.config = this.app.get(ConfigService);

    if (!this.config) {
      throw new Error('Could not inject a ConfigService instance');
    }

    this.logger = await this._loggerFactory.call(this, this.app, this.config, this.environment);

    if (!this.logger) {
      throw new Error('Could not inject a Logger instance');
    }

    this.logger.log(`Logger instance name: ${ this.logger.constructor.name }`, 'Bootstrap');

    this.app.useLogger(this.logger);

    if (this.config.get('ENVIRONMENT_NAME') && this.config.get('ENVIRONMENT_NAME') !== this.environment.name) {
      this.logger.warn(
        'The config value ENVIRONMENT_NAME is not equal to the environment name. Only the process.env.ENVIRONMENT_NAME is used to set a custom environment name. If the config value ENVIRONMENT_NAME is set, this value will not be used.',
        'Bootstrap',
      );
    }

    this.logger.log('Prepare options', 'Bootstrap');

    const options = this.prepareOptions(this.app, this.logger, this.config);

    this.logger.log('Handle after bootstrap hooks', 'Bootstrap');

    await this.handleAfter(this.app, this.logger, this.config, options);

    this.logger.log('Listen', 'Bootstrap');

    await this.listen(this.app, this.logger, options);

    this.logger.log('Handle ready bootstrap hooks', 'Bootstrap');

    await this.handleReady(this.app, this.logger, this.config, options);

    this.logger.log('Server bootstrap completed', 'Bootstrap');

    if (module && module.hot) {
      module.hot.accept();
      module.hot.dispose(() => this.app?.close());
    }

    return this.app;
  }

  public close() {
    this.app?.close();
  }

  public useLogger(loggerFactory: LoggerFactory<NestApplicationContext, BootstrapOptions, Logger>): void;
  public useLogger(logger: Logger): void;
  public useLogger(loggerOrFactory: Logger | LoggerFactory<NestApplicationContext, BootstrapOptions, Logger>): void {
    if (typeof loggerOrFactory !== 'function') {
      this._loggerFactory = () => loggerOrFactory;
    } else {
      this._loggerFactory = loggerOrFactory;
    }
  }

  public before(fnc: MainBeforeFunction<Options>) {
    this._beforeList.push(fnc);
  }

  public after(fnc: MainAfterFunction<NestApplicationContext, BootstrapOptions, Logger>) {
    this._afterList.push(fnc);
  }

  public ready(fnc: MainAfterFunction<NestApplicationContext, BootstrapOptions, Logger>) {
    this._readyList.push(fnc);
  }

  protected abstract create(): Promise<NestApplicationContext>;

  protected prepareEnvironment(environment: Environment): Environment {
    return Server.prepareEnvironment(environment);
  }

  static prepareEnvironment<E extends Environment>(environment: E): E {
    if (environment[ENVIRONMENT_PREPARED]) {
      Logger.debug(`[Bootstrap] The environment has already been prepared. Skipping the environment preparation. The environment is: ${ JSON.stringify(environment, undefined, environment.production ? undefined : 2) }`)
      return environment;
    }

    this.loadBuildJson(environment);

    if (process.env['ENVIRONMENT']) {
      Logger.log(`Set environment name from process.env.ENVIRONMENT to '${ process.env['ENVIRONMENT'] }'`, 'Bootstrap');
      environment.name = process.env['ENVIRONMENT'];
    }

    if (process.env['ENVIRONMENT_NAME']) {
      Logger.log(`Set environment name from process.env.ENVIRONMENT_NAME to '${ process.env['ENVIRONMENT_NAME'] }'`, 'Bootstrap');
      environment.name = process.env['ENVIRONMENT_NAME'];
    }

    if (process.env['ENVIRONMENT_TIER']) {
      Logger.log(`Set environment tier from process.env.ENVIRONMENT_TIER to '${ process.env['ENVIRONMENT_TIER'] }'`, 'Bootstrap');
      environment.tier = process.env['ENVIRONMENT_TIER'];
    }

    if (process.env['PRODUCTION']) {
      Logger.log(`Set production from process.env.PRODUCTION to '${ process.env['PRODUCTION'] }'`, 'Bootstrap');
      if (typeof process.env['PRODUCTION'] === 'boolean') {
        environment.production = process.env['PRODUCTION'];
      } else {
        environment.production = process.env['PRODUCTION'] === 'true';
      }
    }

    if (!process.env['NODE_ENV']) {
      if (environment.production) {
        Logger.log(`Set NODE_ENV to 'production'`, 'Bootstrap');
        process.env['NODE_ENV'] = 'production';
      } else {
        Logger.log(`Set NODE_ENV to 'development'`, 'Bootstrap');
        process.env['NODE_ENV'] = 'development';
      }
    } else {
      Logger.log(`NODE_ENV is already set to '${ process.env['NODE_ENV'] }'`, 'Bootstrap');
    }

    if (process.env['CI'] === 'true') {
      Logger.log(`Set ci to true as process.env.CI is set to 'true'`, 'Bootstrap');
      environment.ci = true;
    }

    RXAP_GLOBAL_STATE.environment = environment;
    Logger.log('Final environment', JSON.stringify(environment, undefined, environment.production ? undefined : 2), 'Bootstrap');

    environment[ENVIRONMENT_PREPARED] = true;
    return environment;
  }

  protected abstract prepareOptions(app: NestApplicationContext, logger: Logger, config: ConfigService): BootstrapOptions;

  protected abstract listen(app: NestApplicationContext, logger: Logger, options: BootstrapOptions): Promise<any>;

  protected async handleBefore() {
    for (const before of this._beforeList) {
      await before.call(this, this.options, this.environment);
    }
  }

  protected async handleAfter(app: NestApplicationContext, logger: Logger, config: ConfigService, options: BootstrapOptions) {
    for (const after of this._afterList) {
      await after.call(this, app, config, logger, options, this.environment);
    }
  }

  protected async handleReady(app: NestApplicationContext, logger: Logger, config: ConfigService, options: BootstrapOptions) {
    for (const ready of this._readyList) {
      await ready.call(this, app, config, logger, options, this.environment);
    }
  }

  protected static loadBuildJson(environment: Environment) {
    const buildJsonFilePath = join(process.cwd(), 'build.json');

    if (existsSync(buildJsonFilePath)) {
      try {
        const buildJson = JSON.parse(readFileSync(buildJsonFilePath).toString('utf-8'));
        Object.assign(environment, buildJson);
      } catch (e) {
        Logger.warn(`Could not parse build.json in the path '${ buildJsonFilePath }'`, 'Bootstrap');
      }
    } else {
      Logger.warn(`The build.json file does not exists in the path '${ buildJsonFilePath }'`, 'Bootstrap');
    }
  }

  protected printPackageVersions() {
    const packageJsonFilePath = join(process.cwd(), 'package.json');
    if (existsSync(packageJsonFilePath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonFilePath).toString('utf-8'));
        Logger.debug(`Package versions: ${ JSON.stringify(packageJson.dependencies, undefined, this.environment.production ? undefined : 2) }`, 'Bootstrap');
      } catch (e) {
        Logger.warn(`Could not parse package.json in the path '${ packageJsonFilePath }'`, 'Bootstrap');
      }
    } else {
      Logger.warn(`The package.json file does not exists in the path '${ packageJsonFilePath }'`, 'Bootstrap');
    }
  }

}
