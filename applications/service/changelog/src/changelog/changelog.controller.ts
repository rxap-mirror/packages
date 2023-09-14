import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '@rxap/nest-utilities';
import { valid } from 'semver';
import { ChangelogDto } from './changelog.dto';
import { ChangelogService } from './changelog.service';

@Controller()
@Public()
@UseInterceptors(CacheInterceptor)
export class ChangelogController {

  @Inject(ChangelogService)
  private readonly changelogService!: ChangelogService;

  @Get('available-versions')
  list(): string[] {
    return this.changelogService.list();
  }

  @Get('latest/:application')
  getLatest(@Param('application') application: string): ChangelogDto {
    return this.changelogService.getLatest(application);
  }

  @Get(':version/:application')
  getVersion(@Param('version') version: string, @Param('application') application: string): ChangelogDto {
    if (!valid(version)) {
      throw new BadRequestException(`Invalid version: ${ version }`);
    }
    return this.changelogService.getVersion(version, application);
  }

}
