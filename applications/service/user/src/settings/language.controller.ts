import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Put,
} from '@nestjs/common';
import { UserSub } from '@rxap/nest-jwt';
import { SettingsService } from './settings.service';

@Controller('settings/language')
export class LanguageController {

  @Inject(SettingsService)
  private readonly userSettings: SettingsService;

  @Inject(Logger)
  private readonly logger: Logger;

  @Put(':language')
  public async set(
    @UserSub() userId: string,
    @Param('language') language: string,
  ) {
    this.logger.verbose(`set language for user '${ userId }'`, 'LanguageController');
    const settings = await this.userSettings.get(userId);
    settings.language = language;
    await this.userSettings.set(userId, settings);
    return this.userSettings.get(userId);
  }

  @Get()
  public async get(
    @UserSub() userId: string,
  ): Promise<string> {
    const settings = await this.userSettings.get(userId);
    return settings.language;
  }

}
