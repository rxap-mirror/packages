import { ConsoleLoggerOptions } from '@nestjs/common';
import {
  ModuleMetadata,
  Type,
} from '@nestjs/common/interfaces';
import {
  NodeOptions,
  SeverityLevel,
} from '@sentry/node';
import { AddRequestDataToEventOptions } from '@sentry/node/types/requestdata';
import { Integration } from '@sentry/types';

export interface SentryCloseOptions {
  enabled: boolean;
  // timeout – Maximum time in ms the client should wait until closing forcefully
  timeout?: number;
}

export type SentryModuleOptions = Omit<NodeOptions, 'integrations'> & {
  integrations?: Integration[];
  close?: SentryCloseOptions
} & ConsoleLoggerOptions;

export interface ISentryOptionsFactory {
  createSentryModuleOptions(): Promise<SentryModuleOptions> | SentryModuleOptions;
}

export interface SentryModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<ISentryOptionsFactory>;
  useExisting?: Type<ISentryOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<SentryModuleOptions> | SentryModuleOptions;
}

export interface SentryFilterFunction {
  (exception: any): boolean;
}

export interface SentryInterceptorOptionsFilter {
  type: any;
  filter?: SentryFilterFunction;
}

export type SentryInterceptorOptions = AddRequestDataToEventOptions['include'] & {
  filters?: SentryInterceptorOptionsFilter[];
  tags?: { [key: string]: string };
  extra?: { [key: string]: any };
  fingerprint?: string[];
  level?: SeverityLevel;
}
