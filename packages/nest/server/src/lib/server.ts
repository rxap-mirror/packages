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
export type MainBeforeFunction<O extends object> = (options: O) => any | Promise<any>;

/**
 * @template T The instance of the nest application
 * @template B The options object build by the Server bootstrap logic
 */
export type MainAfterFunction<T extends INestApplicationContext, B extends object> = (
  app: T,
  config: ConfigService<unknown>,
  logger: Logger,
  options: B,
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
  ) {
  }

  public async bootstrap() {

    this.prepareEnvironment(this.environment);

    await this.handleBefore();

    this.app = await this.create();

    if (!this.app) {
      throw new Error('Nest app creation failed');
    }

    const options = this.prepareOptions(this.app);

    this.logger = this.app.get(Logger);
    this.config = this.app.get(ConfigService);

    if (!this.logger) {
      throw new Error('Could not inject a Logger instance');
    }

    if (!this.config) {
      throw new Error('Could not inject a ConfigService instance');
    }

    await this.handleAfter(this.app, this.logger, this.config, options);

    await this.listen(this.app, this.logger, options);

    await this.handleReady(this.app, this.logger, this.config, options);

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

  protected abstract prepareOptions(app: T): B;

  protected abstract listen(app: T, logger: Logger, options: B): Promise<any>;

  protected async handleBefore() {
    for (const before of this._beforeList) {
      await before(this.options);
    }
  }

  protected async handleAfter(app: T, logger: Logger, config: ConfigService, options: B) {
    for (const after of this._afterList) {
      await after(app, config, logger, options);
    }
  }

  protected async handleReady(app: T, logger: Logger, config: ConfigService, options: B) {
    for (const ready of this._readyList) {
      await ready(app, config, logger, options);
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
