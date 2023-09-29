import {
  Body,
  Controller,
  Get,
  Inject,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { StringValueDto } from '@rxap/nest-dto';
import { UserSub } from '@rxap/nest-jwt';
import { SetDensityDto } from './dtos/set-density.dto';
import { ThemeSettings } from './settings';
import { SettingsService } from './settings.service';

@Controller('settings/theme')
export class ThemeController {

  @Inject(SettingsService)
  private readonly userSettings: SettingsService;

  @Put('density')
  public async setDensity(
    @UserSub() userId: string,
    @Body() { value }: SetDensityDto,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId);
    settings.theme.density = value;
    await this.userSettings.set(userId, settings);
  }

  @Put('typography')
  public async setTypography(
    @UserSub() userId: string,
    @Body() { value }: StringValueDto,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId);
    settings.theme.typography = value;
    await this.userSettings.set(userId, settings);
  }

  @Put('preset')
  public async setPreset(
    @UserSub() userId: string,
    @Body() { value }: StringValueDto,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId);
    settings.theme.preset = value;
    await this.userSettings.set(userId, settings);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        density: {
          type: 'number',
          enum: [
            -3,
            -2,
            -1,
            0,
          ],
        },
        typography: {
          type: 'string',
        },
        preset: {
          type: 'string',
        },
      },
      additionalProperties: true,
      required: [ 'preset' ],
    },
  })
  @Get()
  public async get(
    @UserSub() userId: string,
  ): Promise<ThemeSettings> {
    const settings = await this.userSettings.get(userId);
    return settings.theme;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        density: {
          type: 'number',
          enum: [
            -3,
            -2,
            -1,
            0,
          ],
        },
        typography: {
          type: 'string',
        },
        preset: {
          type: 'string',
        },
      },
      additionalProperties: true,
      required: [ 'preset' ],
    },
  })
  @Put()
  public async set(
    @UserSub() userId: string,
    @Body() theme: ThemeSettings,
  ): Promise<void> {
    const settings = await this.userSettings.get(userId);
    settings.theme = theme;
    await this.userSettings.set(userId, settings);
  }

}
