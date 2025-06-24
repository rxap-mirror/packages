import { EnvironmentInjector } from '@angular/core';
import {
  ConfigLoadOptions,
  ConfigService,
} from '@rxap/config';
import {
  Environment,
  UpdateEnvironment,
} from '@rxap/environment';

/**
 * @param ...args Arbitrary arguments
 */
export type ApplicationBeforeFunction<Config extends object, Ref extends RefWithInjector, Env extends Environment = Environment> = (
  this: Application<Config, Ref, Env>,
  config: ConfigService,
  options: Config,
  environment: Env,
) => any | Promise<any>;

/**
 * The common interface of ApplicationRef and ModuleRef
 */
export interface RefWithInjector {
  readonly injector: EnvironmentInjector;
}

export type ApplicationAfterFunction<Config extends object, Ref extends RefWithInjector, Env extends Environment = Environment> = (
  this: Application<Config, Ref, Env>,
  app: Ref,
  config: ConfigService,
  logger: Console,
  options: Config,
  environment: Env,
) => any | Promise<any>;

export abstract class Application<Config extends object, Ref extends RefWithInjector, Env extends Environment> {

  public app: Ref | null = null;
  public logger: Console | null = null;
  public config: ConfigService | null = null;
  private _beforeList: ApplicationBeforeFunction<Config, Ref, Env>[] = [];
  private _afterList: ApplicationAfterFunction<Config, Ref, Env>[] = [];

  constructor(
    public readonly environment: Env,
    public readonly options: Config = {} as any,
    public readonly configLoadOptions?: ConfigLoadOptions,
  ) {}

  public async bootstrap() {

    await this.prepareEnvironment(this.environment);

    await this.loadConfig(this.environment);

    this.prepareConfig(this.options);

    await this.handleBefore(new ConfigService(ConfigService.Config), this.options, this.environment);

    try {
      this.app = await this.create();
    } catch (e: any) {
      throw new Error(`Angular app creation failed: ${ e.message }`);
    }

    if (!this.app) {
      throw new Error('Angular app creation failed');
    }

    this.logger = console;
    this.config = this.app.injector.get(ConfigService);

    if (!this.logger) {
      throw new Error('Could not inject a NGXLogger instance');
    }

    if (!this.config) {
      throw new Error('Could not inject a ConfigService instance');
    }

    await this.handleAfter(this.app, this.logger, this.config, this.options, this.environment);

  }

  public before(fnc: ApplicationBeforeFunction<Config, Ref, Env>) {
    this._beforeList.push(fnc);
  }

  public after(fnc: ApplicationAfterFunction<Config, Ref, Env>) {
    this._afterList.push(fnc);
  }

  protected async handleBefore(config: ConfigService, options: Config, environment: Env) {
    for (const before of this._beforeList) {
      await before.call(this, config, options, environment);
    }
  }

  protected async handleAfter(app: Ref, logger: Console, config: ConfigService, options: Config, environment: Env) {
    for (const after of this._afterList) {
      await after.call(this, app, config, logger, options, environment);
    }
  }

  protected async loadConfig(environment: Env) {
    await ConfigService.Load(this.configLoadOptions, environment);
  }

  protected async prepareEnvironment(environment: Env) {
    await UpdateEnvironment(environment);
  }

  protected abstract prepareConfig(config: Config): void;

  protected abstract create(): Promise<Ref>;

}
