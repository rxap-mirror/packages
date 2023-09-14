import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EachDirSync } from '@rxap/node-utilities';
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
export class LoadChangelogService implements OnApplicationBootstrap, OnApplicationShutdown {

  public readonly generalChangelog = new Map<string, string>();
  public readonly applicationChangelog = new Map<string, Map<string, string>>();
  private _changeSubscription?: Subscription;
  private readonly dataDir: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
  ) {
    this.dataDir = this.config.getOrThrow('DATA_DIR');
  }

  load() {
    this.logger.log('Load changelogs from: ' + this.dataDir, 'LoadChangelogService');
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
    this.logger.verbose('==== GENERAL CONFIGURATION ====', 'LoadChangelogService');
    for (const [ version, changelog ] of this.generalChangelog.entries()) {
      this.logger.verbose('version: ' + version, 'LoadChangelogService');
      this.logger.verbose(JSON.stringify(changelog, null, 2), 'LoadChangelogService');
    }
    this.logger.verbose('==== APPLICATION CONFIGURATION ====', 'LoadChangelogService');
    for (const [ application, map ] of this.applicationChangelog.entries()) {
      this.logger.verbose('==== ' + application + ' ====', 'LoadChangelogService');
      for (const [ version, changelog ] of map.entries()) {
        this.logger.verbose('version: ' + version, 'LoadChangelogService');
        this.logger.verbose(JSON.stringify(changelog, null, 2), 'LoadChangelogService');
      }
    }
    this.logger.verbose('Changelog Loaded', 'LoadChangelogService');
  }

  onApplicationBootstrap(): void {
    this.load();
  }

  onApplicationShutdown(): void {
    this._changeSubscription?.unsubscribe();
  }

  private getChangelogMap(application?: string): Map<string, string> {
    if (application) {
      if (!this.applicationChangelog.has(application)) {
        this.applicationChangelog.set(application, new Map<string, string>());
      }
      return this.applicationChangelog.get(application)!;
    }
    return this.generalChangelog;
  }

  private watchForFileSystemChanges() {
    this._changeSubscription = new Observable<string>(subscriber => {
      const watcher = watch(this.dataDir).on(
        'change',
        (filename: string) => {
          this.logger.verbose('file change event for: ' + filename, 'LoadChangelogService');
          this.loadFile(filename);
          subscriber.next(filename);
        },
      );
      subscriber.add(() => watcher.close());
    }).subscribe();
  }

  private validatedChangelogFilePath(relativePath: string) {
    const fragments = relativePath.split('/');
    if (fragments.length !== 2 && fragments.length !== 3) {
      this.logger.error(
        'invalid changelog file path: ' + relativePath + ' nested changelog is not supported',
        'LoadChangelogService',
      );
      return false;
    }
    const version = fragments.shift();
    if (!valid(version) && version !== 'latest') {
      this.logger.error(
        `invalid version: '${ version }' for loaded file path ${ relativePath }`,
        'LoadChangelogService',
      );
      return false;
    }
    const name = fragments.pop();
    if (name !== 'changelog.md') {
      this.logger.error('invalid changelog file path: ' +
        relativePath +
        ' file name is not equal to "changelog.md"', 'LoadChangelogService');
      return false;
    }
    return true;
  }

  private extractChangelogLoadingProperties(relativePath: string) {
    const fragments = relativePath.split('/');
    const version = fragments.shift();
    const name = fragments.pop();
    const application = fragments.shift();
    if (!version) {
      this.logger.error(
        'Invalid changelog file could not extract version from path: ' + relativePath,
        undefined,
        'LoadChangelogService',
      );
      throw new InternalServerErrorException(`Invalid changelog file could not extract version from path`);
    }
    if (!name) {
      this.logger.error(
        'Invalid changelog file could not extract name from path: ' + relativePath,
        undefined,
        'LoadChangelogService',
      );
      throw new InternalServerErrorException(`Invalid changelog file could not extract name from path`);
    }
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
    this.logger.debug('load changelog: ' + relativePath, 'LoadChangelogService');
    if (!this.validatedChangelogFilePath(relativePath)) {
      return;
    }
    const {
      version,
      name,
      application,
    } = this.extractChangelogLoadingProperties(relativePath);
    const changelogMap = this.getChangelogMap(application);
    if (name !== 'changelog.md') {
      throw new InternalServerErrorException('Currently only changelog.md is supported');
    }
    changelogMap.set(version, this.loadChangelogFromFileSystem(filePath));
  }

  private loadChangelogFromFileSystem(filePath: string) {
    if (!existsSync(filePath)) {
      throw new InternalServerErrorException('file not found: ' + filePath);
    }
    let content = readFileSync(filePath, 'utf-8');
    content = this.replaceEnvironmentVariablesInString(content);
    return content;
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
          this.logger.debug('optional environment variable not found: ' + p1, 'LoadChangelogService');
          value = '';
        } else {
          throw new InternalServerErrorException('environment variable not found: ' + p1);
        }
      }
      return value;
    });
  }

}
