import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import {
  existsSync,
  readdirSync,
} from 'fs';
import { join } from 'path';
import { valid } from 'semver';

@Injectable()
export class ConfigurationHealthIndicator extends HealthIndicator {

  private readonly dataDir: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: Logger,
  ) {
    super();
    this.dataDir = this.config.getOrThrow('DATA_DIR');
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {

    if (!existsSync(this.dataDir)) {
      this.logger.error(
        `The given data directory '${ this.dataDir }' does not exists`,
        undefined,
        'ConfigurationHealthIndicator',
      );
      throw new HealthCheckError(
        `The given data directory does not exists`,
        this.getStatus('configuration', false),
      );
    }

    const rootDirContent = readdirSync(this.dataDir);

    if (rootDirContent.length === 0) {
      this.logger.error(
        `The given data directory '${ this.dataDir }' is empty`,
        undefined,
        'ConfigurationHealthIndicator',
      );
      throw new HealthCheckError(
        `The given data directory is empty`,
        this.getStatus('configuration', false),
      );
    }

    const semverVersions = rootDirContent.filter((file) => valid(file));

    if (semverVersions.length === 0 && !rootDirContent.includes('latest')) {
      this.logger.error(
        `The given data directory '${ this.dataDir }' does not contain any folder with a valid semver version or latest version code`,
        undefined,
        'ConfigurationHealthIndicator',
      );
      throw new HealthCheckError(
        `The given data directory does not contain any folder with a valid semver version`,
        this.getStatus('configuration', false),
      );
    }

    if (
      !semverVersions.some(version => readdirSync(join(this.dataDir, version)).some(file => file.endsWith('.json'))) &&
      (rootDirContent.includes('latest') &&
        !readdirSync(join(this.dataDir, 'latest')).some(file => file.endsWith('.json')))
    ) {
      this.logger.error(
        `Some of the version in the given data directory '${ this.dataDir }' does not contain any configuration files`,
        undefined,
        'ConfigurationHealthIndicator',
      );
      throw new HealthCheckError(
        `The given data directory does not contain any configuration files`,
        this.getStatus('configuration', false),
      );
    }

    return this.getStatus('configuration', true);
  }


}
