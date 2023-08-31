import {
  ApplicationConfig,
  ApplicationRef,
  importProvidersFrom,
  ImportProvidersSource,
  Type,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ConfigLoadOptions } from '@rxap/config';
import { Environment } from '@rxap/environment';
import { Application } from './application';

export class StandaloneApplication<O extends ApplicationConfig> extends Application<O, ApplicationRef> {

  constructor(
    environment: Environment,
    private readonly rootComponent: Type<unknown>,
    options?: O,
    configLoadOptions: ConfigLoadOptions = {
      url: `/api/configuration/${ environment.tag ??
      'latest' }/${ environment.app }`,
    },
  ) {
    super(environment, options, configLoadOptions);
  }

  public importProvidersFrom(...sources: ImportProvidersSource[]) {
    this.options.providers ??= [];
    this.options.providers.push(importProvidersFrom(...sources));
  }

  protected create(): Promise<ApplicationRef> {
    return bootstrapApplication(this.rootComponent, this.options);
  }

  protected override prepareConfig(config: O) {
    config.providers ??= [];
  }

}
