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
import {
  dirname,
  join,
  relative,
} from 'path';
import {
  Observable,
  Subscription,
} from 'rxjs';
import { valid } from 'semver';

export type Version = string;
export type Changelog = string;
export type Language = string | undefined;
export type Application = string;

@Injectable()
export class LoadChangelogService implements OnApplicationBootstrap, OnApplicationShutdown {

  public readonly generalChangelog = new Map<Version, Map<Language, Changelog>>();
  public readonly applicationChangelog = new Map<Application, Map<Version, Map<Language, Changelog>>>();
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
  }

  onApplicationBootstrap(): void {
    this.load();
  }

  onApplicationShutdown(): void {
    this._changeSubscription?.unsubscribe();
  }

  public loadFile(filePath: string) {
    const relativePath = relative(this.dataDir, filePath);
    if (relativePath.includes('.gitkeep')) {
      return false;
    }
    if (!relativePath.endsWith('changelog.md') && !relativePath.match(/changelog\.([a-zA-Z-_]+)\.md$/)) {
      return false;
    }
    this.logger.debug('load changelog: ' + relativePath, 'LoadChangelogService');
    if (!this.validatedChangelogFilePath(relativePath)) {
      throw new InternalServerErrorException('Invalid changelog file path: ' + relativePath);
      return;
    }
    const {
      version,
      name,
      application,
    } = this.extractChangelogLoadingProperties(relativePath);
    const changelogMap = this.getChangelogMap(application);
    const match = name.match(/^changelog\.([a-zA-Z-_]+)\.md$/);
    if (name !== 'changelog.md' && !match) {
      throw new InternalServerErrorException('Currently only changelog.md is supported');
    }
    let language: Language = undefined;
    if (match) {
      language = match[1];
    }
    if (!changelogMap.get(version)) {
      changelogMap.set(version, new Map<Language, Changelog>());
    }
    const map = changelogMap.get(version)!;
    map.set(language, this.loadChangelogFromFileSystem(filePath));
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

  private getChangelogMap(application?: string): Map<Version, Map<Language, Changelog>> {
    if (application) {
      if (!this.applicationChangelog.has(application)) {
        this.applicationChangelog.set(application, new Map<Version, Map<Language, Changelog>>());
      }
      return this.applicationChangelog.get(application)!;
    }
    return this.generalChangelog;
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
    if (!name || (name !== 'changelog.md' && !name.match(/^changelog\.([a-zA-Z-_]+)\.md$/))) {
      this.logger.error('invalid changelog file path: ' +
        relativePath +
        ' file name is not equal to "changelog.md"', 'LoadChangelogService');
      return false;
    }
    return true;
  }

  private loadChangelogFromFileSystem(filePath: string) {
    if (!existsSync(filePath)) {
      throw new InternalServerErrorException('file not found: ' + filePath);
    }
    let content = readFileSync(filePath, 'utf-8');
    content = this.replaceEnvironmentVariablesInString(content);
    content = this.replaceRelativeLinksInString(content, relative(this.dataDir, dirname(filePath)));
    return content;
  }

  private replaceEnvironmentVariablesInString(content: string) {
    return content.replace(/\$\{(.*?)}/g, (match: string, p1: string) => {
      let variableName = p1;
      let optional = false;
      if (p1.endsWith('?')) {
        variableName = p1.substring(0, p1.length - 1);
        optional = true;
      }
      let value = this.config.get(variableName, process.env[variableName]);
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

  private replaceRelativeLinksInString(content: string, relativeToDataRoot: string) {
    return content.replace(/!\[(.*?)]\((.*?)\)/g, (match: string, alt: string, path: string): string => {
      if (path.startsWith('http')) {
        return match;
      }
      let fullPath: string;
      if (path.startsWith('/')) {
        fullPath = path.substring(1);
      } else {
        fullPath = join(relativeToDataRoot, path);
        if (fullPath.startsWith('..')) {
          throw new InternalServerErrorException('asset path points outside of the allowed asset folder: ' + path);
        }
      }
      let publicUrl = this.config.getOrThrow('PUBLIC_URL');
      if (!publicUrl.endsWith('/')) {
        publicUrl += '/';
      }
      const url = publicUrl + 'data/' + fullPath;
      return `![${ alt }](${ url })`;
    });
  }

}
