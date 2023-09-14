import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { classTransformOptions } from '@rxap/nest-utilities';
import { plainToInstance } from 'class-transformer';
import {
  lte,
  sort,
  valid,
} from 'semver';
import { ChangelogDto } from './changelog.dto';
import { LoadChangelogService } from './load-changelog.service';

@Injectable()
export class ChangelogService {

  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(LoadChangelogService)
  private readonly config!: LoadChangelogService;

  getLatest(application?: string): ChangelogDto {
    this.logger.log(`Get latest changelog`, 'ChangelogService');
    const changelog: ChangelogDto = {
      general: [ this.getLatestChangelog(this.config.generalChangelog) ],
      application: [],
    };
    if (application && this.config.applicationChangelog.has(application)) {
      this.logger.log(`Get latest changelog for application: ${ application }`, 'ChangelogService');
      const applicationChangelog = this.config.applicationChangelog.get(application);
      if (applicationChangelog) {
        changelog.application = [ this.getLatestChangelog(applicationChangelog) ];
      }
    }
    return plainToInstance(ChangelogDto, changelog, classTransformOptions);
  }

  getVersion(version: string, application?: string): ChangelogDto {
    if (!valid(version)) {
      throw new InternalServerErrorException(`Invalid version: ${ version }`);
    }
    this.logger.log(`Get changelog for version: ${ version }`, 'ChangelogService');
    const changelog: ChangelogDto = {
      general: [ this.getLatestCompatibleChangelog(version, this.config.generalChangelog) ],
      application: [],
    };
    if (application && this.config.applicationChangelog.has(application)) {
      this.logger.log(
        `Get changelog for application: ${ application } and version: ${ version }`,
        'ChangelogService',
      );
      const applicationChangelog = this.config.applicationChangelog.get(application);
      if (applicationChangelog) {
        changelog.application = [ this.getLatestCompatibleChangelog(version, applicationChangelog) ];
      }
    }
    return changelog;
  }

  list() {
    return Array.from(this.config.generalChangelog.keys());
  }

  private hasLatestCompatibleVersion(version: string, map: Map<string, string>): boolean {
    const versions = sort(Array.from(map.keys()));
    const latestCompatibleVersion = this.getLatestCompatibleVersion(versions, version);
    return !!latestCompatibleVersion;
  }

  private getLatestCompatibleChangelog(version: string, map: Map<string, string>) {
    const versions = sort(Array.from(map.keys()));
    const latestCompatibleVersion = this.getLatestCompatibleVersion(versions, version);
    if (!latestCompatibleVersion) {
      throw new InternalServerErrorException(`No latest compatible changelog found for version ${ version }`);
    }
    this.logger.log(
      `Latest compatible version for ${ version } is ${ latestCompatibleVersion }`,
      'ChangelogService',
    );
    return map.get(latestCompatibleVersion)!;
  }

  private getLatestChangelog(map: Map<string, string>) {
    const availableVersions = Array.from(map.keys());
    if (availableVersions.includes('latest')) {
      return map.get('latest')!;
    }
    const versions = sort(availableVersions.filter(v => v !== 'latest'));
    const latestVersion = versions.pop();
    if (!latestVersion) {
      throw new InternalServerErrorException('No changelog found');
    }
    return map.get(latestVersion)!;
  }

  private getLatestCompatibleVersion(versions: string[], version: string): string | null {
    this.logger.debug(`Get latest compatible version for ${ version }`, 'ChangelogService');
    let possibleVersion: string | null = null;
    for (const v of versions) {
      this.logger.debug(`Check version ${ v }`, 'ChangelogService');
      if (lte(v, version)) {
        this.logger.debug(
          `Version ${ v } is less then or equal and possible the latest compatible version`,
          'ChangelogService',
        );
        possibleVersion = v;
      } else {
        this.logger.debug(`Version ${ v } is greater then ${ version }`, 'ChangelogService');
        return possibleVersion;
      }
    }
    return possibleVersion;
  }
}
