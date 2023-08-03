import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EachDirSync } from '@rxap/node-utilities';
import { deepMerge } from '@rxap/utilities';
import { watch } from 'chokidar';
import {
  existsSync,
  mkdirSync,
  readFileSync,
} from 'fs';
import { relative } from 'path';
import {
  Observable,
  Subscription,
} from 'rxjs';
import { valid } from 'semver';

@Injectable()
export class LoadConfigurationService implements OnApplicationBootstrap, OnApplicationShutdown {

  public readonly generalConfiguration = new Map<string, Record<string, unknown>>();
  public readonly applicationConfiguration = new Map<string, Map<string, Record<string, unknown>>>();
  private _changeSubscription?: Subscription;
  private readonly dataDir: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
  ) {
    this.dataDir = this.config.getOrThrow('DATA_DIR');
  }

  load() {
    this.logger.log('Load configurations from: ' + this.dataDir, 'ConfigurationService');
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
    this.watchForFileSystemChanges();
    for (const filePath of EachDirSync(this.dataDir)) {
      this.loadFile(filePath);
    }
    this.print();
  }

  print() {
    this.logger.verbose('==== GENERAL CONFIGURATION ====', 'ConfigurationService');
    for (const [ version, configuration ] of this.generalConfiguration.entries()) {
      this.logger.verbose('version: ' + version, 'ConfigurationService');
      this.logger.verbose(JSON.stringify(configuration, null, 2), 'ConfigurationService');
    }
    this.logger.verbose('==== APPLICATION CONFIGURATION ====', 'ConfigurationService');
    for (const [ application, map ] of this.applicationConfiguration.entries()) {
      this.logger.verbose('==== ' + application + ' ====', 'ConfigurationService');
      for (const [ version, configuration ] of map.entries()) {
        this.logger.verbose('version: ' + version, 'ConfigurationService');
        this.logger.verbose(JSON.stringify(configuration, null, 2), 'ConfigurationService');
      }
    }
    this.logger.verbose('Configuration Loaded', 'ConfigurationService');
  }

  onApplicationBootstrap(): void {
    this.load();
  }

  onApplicationShutdown(): void {
    this._changeSubscription?.unsubscribe();
  }

  private getConfigurationMap(application?: string): Map<string, Record<string, unknown>> {
    if (application) {
      if (!this.applicationConfiguration.has(application)) {
        this.applicationConfiguration.set(application, new Map<string, Record<string, unknown>>());
      }
      return this.applicationConfiguration.get(application)!;
    }
    return this.generalConfiguration;
  }

  private watchForFileSystemChanges() {
    this._changeSubscription = new Observable<string>(subscriber => {
      const watcher = watch(this.dataDir).on(
        'change',
        (filename: string) => {
          this.logger.verbose('file change event for: ' + filename, 'ConfigurationService');
          this.loadFile(filename);
          subscriber.next(filename);
        },
      );
      subscriber.add(() => watcher.close());
    }).subscribe();
  }

  private validatedConfigurationFilePath(relativePath: string) {
    const fragments = relativePath.split('/');
    if (fragments.length !== 2 && fragments.length !== 3) {
      this.logger.error(
        'invalid configuration file path: ' + relativePath + ' nested configuration is not supported',
        'ConfigurationService',
      );
      return false;
    }
    const version = fragments.shift();
    if (!valid(version) && version !== 'latest') {
      this.logger.error(
        `invalid version: '${ version }' for loaded file path ${ relativePath }`,
        'ConfigurationService',
      );
      return false;
    }
    const name = fragments.pop();
    if (!name.match(/config\..*\.json/) && name !== 'config.json') {
      this.logger.error('invalid configuration file path: ' +
        relativePath +
        ' file name does not match the expected pattern', 'ConfigurationService');
      return false;
    }
    return true;
  }

  private extractConfigurationLoadingProperties(relativePath: string) {
    const fragments = relativePath.split('/');
    const version = fragments.shift();
    const name = fragments.pop();
    const application = fragments.shift();
    return {
      version,
      name,
      application,
    };
  }

  private loadFile(filePath: string) {
    const relativePath = relative(this.dataDir, filePath);
    if (relativePath.includes('.gitkeep')) {
      return false;
    }
    this.logger.debug('load configuration: ' + relativePath, 'ConfigurationService');
    if (!this.validatedConfigurationFilePath(relativePath)) {
      return;
    }
    const {
      version,
      name,
      application,
    } = this.extractConfigurationLoadingProperties(relativePath);
    const configurationMap = this.getConfigurationMap(application);
    const partialConfiguration = this.loadConfigurationFromFileSystem(filePath);
    let configuration = configurationMap.get(version) ?? {};
    if (name === 'config.json') {
      configuration = deepMerge(configuration, partialConfiguration);
    } else {
      const match = name.match(/config\.(.*)\.json/);
      if (!match) {
        this.logger.error('invalid configuration file path: ' +
          relativePath +
          ' file name does not match the expected pattern', 'ConfigurationService');
        return;
      }
      this.applyConfiguration(configuration, partialConfiguration, match[1]);
    }
    configurationMap.set(version, configuration);
  }

  private loadConfigurationFromFileSystem(filePath: string) {
    if (!existsSync(filePath)) {
      throw new InternalServerErrorException('file not found: ' + filePath);
    }
    let content = readFileSync(filePath, 'utf-8');
    content = this.replaceEnvironmentVariablesInString(content);
    try {
      return JSON.parse(content);
    } catch (e: any) {
      throw new InternalServerErrorException('invalid json file: ' + filePath + ' ' + e.message);
    }
  }

  private applyConfiguration(
    configuration: Record<string, unknown>,
    partialConfiguration: Record<string, unknown>,
    propertyPath: string,
  ) {
    const propertyPathFragments = propertyPath.split('.');
    let property = configuration;
    for (let i = 0; i < propertyPathFragments.length; i++) {
      const fragment = propertyPathFragments[i];
      if (!property[fragment]) {
        property[fragment] = {};
      }
      if (i === propertyPathFragments.length - 1) {
        property[fragment] = deepMerge(property[fragment], partialConfiguration);
      } else {
        property = property[fragment] as Record<string, unknown>;
      }

    }

  }

  private replaceEnvironmentVariablesInString(value: string) {
    return value.replace(/\$\{(.*?)}/g, (match: string, p1: string) => {
      let variableName = p1;
      let optional = false;
      if (p1.endsWith('?')) {
        variableName = p1.substring(0, p1.length - 1);
        optional = true;
      }
      let value = process.env[variableName];
      if (value === undefined || value === null) {
        if (optional) {
          this.logger.debug('optional environment variable not found: ' + p1, 'ConfigurationService');
          value = '';
        } else {
          throw new InternalServerErrorException('environment variable not found: ' + p1);
        }
      }
      return value;
    });
  }

}
