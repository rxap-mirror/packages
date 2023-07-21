import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import {
  existsSync,
  readdirSync,
} from 'fs';
import { valid } from 'semver';
import { join } from 'path';

@Injectable()
export class ConfigurationHealthIndicator extends HealthIndicator {

  private readonly dataDir: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.dataDir = this.config.getOrThrow('DATA_DIR');
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {

    if (!existsSync(this.dataDir)) {
      throw new HealthCheckError(
        `The given data directory does not exists`,
        this.getStatus('configuration', false),
      );
    }

    const rootDirContent = readdirSync(this.dataDir);

    if (rootDirContent.length === 0) {
      throw new HealthCheckError(
        `The given data directory is empty`,
        this.getStatus('configuration', false),
      );
    }

    const semverVersions = rootDirContent.filter((file) => valid(file));

    if (semverVersions.length === 0) {
      throw new HealthCheckError(
        `The given data directory does not contain any folder with a valid semver version`,
        this.getStatus('configuration', false),
      );
    }

    if (!semverVersions.some(version => readdirSync(join(this.dataDir, version))
      .some(file => file.endsWith('.json')))) {
      throw new HealthCheckError(
        `The given data directory does not contain any configuration files`,
        this.getStatus('configuration', false),
      );
    }

    return this.getStatus('configuration', true);
  }


}
