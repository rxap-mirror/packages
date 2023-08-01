import { EnvironmentInjector } from '@angular/core';
import {
  ConfigLoadOptions,
  ConfigService,
} from '@rxap/config';
import {
  Environment,
  UpdateEnvironment,
} from '@rxap/environment';
import { NGXLogger } from 'ngx-logger';

/**
 * @param ...args Arbitrary arguments
 */
export type ApplicationBeforeFunction<Config extends object> = (
  config: ConfigService,
  options: Config,
) => any | Promise<any>;

/**
 * The common interface of ApplicationRef and ModuleRef
 */
export interface RefWithInjector {
  readonly injector: EnvironmentInjector;
}

export type ApplicationAfterFunction<Ref extends RefWithInjector> = (
  app: Ref,
  config: ConfigService,
  logger: NGXLogger,
) => any | Promise<any>;

export abstract class Application<Config extends object, Ref extends RefWithInjector> {

  public app: Ref | null = null;
  public logger: NGXLogger | null = null;
  public config: ConfigService | null = null;
  private _beforeList: ApplicationBeforeFunction<Config>[] = [];
  private _afterList: ApplicationAfterFunction<Ref>[] = [];

  constructor(
    public readonly environment: Environment,
    public readonly options: Config = {} as any,
    public readonly configLoadOptions?: ConfigLoadOptions,
  ) {}

  public async bootstrap() {

    await this.prepareEnvironment(this.environment);

    await this.loadConfig(this.environment);

    this.prepareConfig(this.options);

    await this.handleBefore(new ConfigService(ConfigService.Config), this.options);

    try {
      this.app = await this.create();
    } catch (e: any) {
      throw new Error(`Angular app creation failed: ${ e.message }`);
    }

    if (!this.app) {
      throw new Error('Angular app creation failed');
    }

    this.logger = this.app.injector.get(NGXLogger);
    this.config = this.app.injector.get(ConfigService);

    if (!this.logger) {
      throw new Error('Could not inject a NGXLogger instance');
    }

    if (!this.config) {
      throw new Error('Could not inject a ConfigService instance');
    }

    await this.handleAfter(this.app, this.logger, this.config);

  }

  public before(fnc: ApplicationBeforeFunction<Config>) {
    this._beforeList.push(fnc);
  }

  public after(fnc: ApplicationAfterFunction<Ref>) {
    this._afterList.push(fnc);
  }

  protected async handleBefore(config: ConfigService, options: Config) {
    for (const before of this._beforeList) {
      await before(config, options);
    }
  }

  protected async handleAfter(app: Ref, logger: NGXLogger, config: ConfigService) {
    for (const after of this._afterList) {
      await after(app, config, logger);
    }
  }

  protected async loadConfig(environment: Environment) {
    await ConfigService.Load(this.configLoadOptions, environment);
  }

  protected async prepareEnvironment(environment: Environment) {
    await UpdateEnvironment(environment);
  }

  protected abstract prepareConfig(config: Config): void;

  protected abstract create(): Promise<Ref>;

}
