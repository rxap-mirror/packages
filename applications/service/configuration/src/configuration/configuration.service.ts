import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { deepMerge } from '@rxap/utilities';
import {
  lte,
  sort,
  valid,
} from 'semver';
import { LoadConfigurationService } from './load-configuration.service';

@Injectable()
export class ConfigurationService {

  @Inject(Logger)
  private readonly logger: Logger;

  @Inject(LoadConfigurationService)
  private readonly config: LoadConfigurationService;

  getLatest(application?: string) {
    this.logger.log(`Get latest configuration`, 'ConfigurationService');
    const generalConfiguration = this.getLatestConfiguration(this.config.generalConfiguration);
    if (application && this.config.applicationConfiguration.has(application)) {
      this.logger.log(`Get latest configuration for application: ${ application }`, 'ConfigurationService');
      const applicationConfiguration = this.config.applicationConfiguration.get(application);
      if (applicationConfiguration) {
        return deepMerge(generalConfiguration, this.getLatestConfiguration(applicationConfiguration));
      }
    }
    return generalConfiguration;
  }

  getVersion(version: string, application?: string) {
    if (!valid(version)) {
      throw new InternalServerErrorException(`Invalid version: ${ version }`);
    }
    this.logger.log(`Get configuration for version: ${ version }`, 'ConfigurationService');
    const generalConfiguration = this.getLatestCompatibleConfiguration(version, this.config.generalConfiguration);
    if (application && this.config.applicationConfiguration.has(application)) {
      this.logger.log(
        `Get configuration for application: ${ application } and version: ${ version }`,
        'ConfigurationService',
      );
      const applicationConfiguration = this.config.applicationConfiguration.get(application);
      if (applicationConfiguration) {
        return deepMerge(
          generalConfiguration,
          this.getLatestCompatibleConfiguration(version, applicationConfiguration),
        );
      }
    }
    return generalConfiguration;
  }

  private hasLatestCompatibleVersion(version: string, map: Map<string, Record<string, unknown>>): boolean {
    const versions = sort(Array.from(map.keys()));
    const latestCompatibleVersion = this.getLatestCompatibleVersion(versions, version);
    return !!latestCompatibleVersion;
  }

  private getLatestCompatibleConfiguration(version: string, map: Map<string, Record<string, unknown>>) {
    const versions = sort(Array.from(map.keys()));
    const latestCompatibleVersion = this.getLatestCompatibleVersion(versions, version);
    if (!latestCompatibleVersion) {
      throw new InternalServerErrorException(`No latest compatible configuration found for version ${ version }`);
    }
    this.logger.log(
      `Latest compatible version for ${ version } is ${ latestCompatibleVersion }`,
      'ConfigurationService',
    );
    return map.get(latestCompatibleVersion)!;
  }

  private getLatestConfiguration(map: Map<string, Record<string, unknown>>) {
    const availableVersions = Array.from(map.keys());
    if (availableVersions.includes('latest')) {
      return map.get('latest')!;
    }
    const versions = sort(availableVersions.filter(v => v !== 'latest'));
    const latestVersion = versions.pop();
    if (!latestVersion) {
      throw new InternalServerErrorException('No configuration found');
    }
    return map.get(latestVersion)!;
  }

  private getLatestCompatibleVersion(versions, version): string | null {
    this.logger.debug(`Get latest compatible version for ${ version }`, 'ConfigurationService');
    let possibleVersion: string | null = null;
    for (const v of versions) {
      this.logger.debug(`Check version ${ v }`, 'ConfigurationService');
      if (lte(v, version)) {
        this.logger.debug(
          `Version ${ v } is less then or equal and possible the latest compatible version`,
          'ConfigurationService',
        );
        possibleVersion = v;
      } else {
        this.logger.debug(`Version ${ v } is greater then ${ version }`, 'ConfigurationService');
        return possibleVersion;
      }
    }
    return possibleVersion;
  }

}
