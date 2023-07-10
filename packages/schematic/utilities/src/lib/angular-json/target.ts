import { AppShell } from './app-shell';
import { Browser } from './browser';
import { DevServer } from './dev-server';
import { Extracti18n } from './extracti18n';
import { Karma } from './karma';
import { NgPackagr } from './ng-packagr';
import { Protractor } from './protractor';
import { Server } from './server';
import { Tslint } from './tslint';

export type Target = {
  /** The builder used for this package. */
  builder: string;
  options?: any;
  /** A map of alternative target options. */
  configurations?: Record<string, any>;
} | {
  builder?: '@angular-devkit/build-angular:app-shell';
  options?: AppShell;
  configurations?: Record<string, AppShell>;
} | {
  builder?: '@angular-devkit/build-angular:browser';
  options?: Browser;
  configurations?: Record<string, Browser>;
} | {
  builder?: '@angular-devkit/build-angular:dev-server';
  options?: DevServer;
  configurations?: Record<string, DevServer>;
} | {
  builder?: '@angular-devkit/build-angular:extract-i18n';
  options?: Extracti18n;
  configurations?: Record<string, Extracti18n>;
} | {
  builder?: '@angular-devkit/build-angular:karma';
  options?: Karma;
  configurations?: Record<string, Karma>;
} | {
  builder?: '@angular-devkit/build-angular:protractor';
  options?: Protractor;
  configurations?: Record<string, Protractor>;
} | {
  builder?: '@angular-devkit/build-angular:server';
  options?: Server;
  configurations?: Record<string, Server>;
} | {
  builder?: '@angular-devkit/build-angular:tslint';
  options?: Tslint;
  configurations?: Record<string, Tslint>;
} | {
  builder?: '@angular-devkit/build-angular:ng-packagr';
  options?: NgPackagr;
  configurations?: Record<string, NgPackagr>;
};
