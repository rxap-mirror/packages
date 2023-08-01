import {
  BootstrapOptions,
  CompilerOptions,
  NgModuleRef,
  StaticProvider,
  Type,
} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ConfigLoadOptions } from '@rxap/config';
import { Environment } from '@rxap/environment';
import { Application } from './application';

export interface ModuleApplicationConfig {
  extraProviders?: StaticProvider[] | undefined;
  compilerOptions?: (CompilerOptions & BootstrapOptions) | Array<CompilerOptions & BootstrapOptions>;
}

export class ModuleApplication<M, O extends ModuleApplicationConfig> extends Application<O, NgModuleRef<M>> {

  constructor(
    environment: Environment,
    private readonly moduleType: Type<M>,
    options?: O,
    configLoadOptions?: ConfigLoadOptions,
  ) {
    super(environment, options, configLoadOptions);
  }

  protected create(): Promise<NgModuleRef<M>> {
    return platformBrowserDynamic(this.options.extraProviders)
      .bootstrapModule(this.moduleType, this.options.compilerOptions);
  }

  protected override prepareConfig(config: O) {
    config.extraProviders ??= [];
    config.compilerOptions ??= [];
  }

}
