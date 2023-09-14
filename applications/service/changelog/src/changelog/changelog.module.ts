import {
  Logger,
  Module,
} from '@nestjs/common';
import { ChangelogController } from './changelog.controller';
import { ChangelogService } from './changelog.service';
import { LoadChangelogService } from './load-changelog.service';

@Module({
  controllers: [ ChangelogController ],
  providers: [
    ChangelogService,
    LoadChangelogService,
    Logger,
  ],
})
export class ChangelogModule {}
