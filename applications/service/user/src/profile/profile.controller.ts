import {
  Controller,
  Get,
  Inject,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserSub } from '@rxap/nest-jwt';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {

  @Inject(ProfileService)
  private readonly profileService!: ProfileService;

  @ApiOkResponse({
    schema: {},
  })
  @Get()
  get(@UserSub() userId: string): Promise<unknown> {
    return this.profileService.get(userId);
  }

}
