import {
  INestApplicationContext,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Environment,
  RXAP_GLOBAL_STATE,
} from '@rxap/nest-utilities';
import {
  existsSync,
  readFileSync,
} from 'fs';
import { join } from 'path';

/**
 * @template O The options object passed to the server create function
 */
export type MainBeforeFunction<O extends object> = (
  this: Server<O, any, any>,
  options: O,
  environment: Environment,
) => any | Promise<any>;

/**
 * @template T The instance of the nest application
 * @template B The options object build by the Server bootstrap logic
 */
export type MainAfterFunction<T extends INestApplicationContext, B extends object> = (
  this: Server<any, T, B>,
  app: T,
  config: ConfigService<unknown>,
  logger: Logger,
  options: B,
  environment: Environment,
) => any | Promise<any>;

declare const module: { hot?: { accept: () => any, dispose: (cb: () => any) => any } };

export abstract class Server<O extends object, T extends INestApplicationContext, B extends object> {

  public app: T | null = null;
  public logger: Logger | null = null;
  public config: ConfigService | null = null;
  private _beforeList: MainBeforeFunction<O>[] = [];
  private _afterList: MainAfterFunction<T, B>[] = [];
  private _readyList: MainAfterFunction<T, B>[] = [];

  constructor(
    public readonly module: any,
    public readonly environment: Environment,
    public readonly options: O = {} as any,
    public readonly bootstrapOptions: Partial<B> = {},
  ) {
  }

  public async bootstrap() {

    console.log('Server bootstrap started');
    console.log('Initial environment', JSON.stringify(this.environment));

    this.prepareEnvironment(this.environment);

    console.log('Handle before bootstrap hooks');

    await this.handleBefore();

    console.log('Create application');

    this.app = await this.create();

    if (!this.app) {
      throw new Error('Nest app creation failed');
    }

    this.logger = this.app.get(Logger);

    if (!this.logger) {
      throw new Error('Could not inject a Logger instance');
    }

    this.config = this.app.get(ConfigService);

    if (!this.config) {
      throw new Error('Could not inject a ConfigService instance');
    }

    this.logger.log('Prepare options', 'Bootstrap');

    const options = this.prepareOptions(this.app, this.logger, this.config);

    this.logger.log('Handle after bootstrap hooks', 'Bootstrap');

    await this.handleAfter(this.app, this.logger, this.config, options);

    this.logger.log('Listen', 'Bootstrap');

    await this.listen(this.app, this.logger, options);

    this.logger.log('Handle read bootstrap hooks', 'Bootstrap');

    await this.handleReady(this.app, this.logger, this.config, options);

    this.logger.log('Server bootstrap completed', 'Bootstrap');

    if (module && module.hot) {
      module.hot.accept();
      module.hot.dispose(() => this.app?.close());
    }

  }

  public before(fnc: MainBeforeFunction<O>) {
    this._beforeList.push(fnc);
  }

  public after(fnc: MainAfterFunction<T, B>) {
    this._afterList.push(fnc);
  }

  public ready(fnc: MainAfterFunction<T, B>) {
    this._readyList.push(fnc);
  }

  protected abstract create(): Promise<T>;

  protected prepareEnvironment(environment: Environment) {
    this.loadBuildJson(environment);

    RXAP_GLOBAL_STATE.environment = environment;
  }

  protected abstract prepareOptions(app: T, logger: Logger, config: ConfigService): B;

  protected abstract listen(app: T, logger: Logger, options: B): Promise<any>;

  protected async handleBefore() {
    for (const before of this._beforeList) {
      await before.call(this, this.options, this.environment);
    }
  }

  protected async handleAfter(app: T, logger: Logger, config: ConfigService, options: B) {
    for (const after of this._afterList) {
      await after.call(this, app, config, logger, options, this.environment);
    }
  }

  protected async handleReady(app: T, logger: Logger, config: ConfigService, options: B) {
    for (const ready of this._readyList) {
      await ready.call(this, app, config, logger, options, this.environment);
    }
  }

  protected loadBuildJson(environment: Environment) {
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

}
