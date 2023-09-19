import { HttpModule } from '@nestjs/axios';
import {
  Logger,
  Module,
} from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ ProfileController ],
  providers: [ Logger, ProfileService ],
  imports: [ HttpModule ],
})
export class ProfileModule {}
