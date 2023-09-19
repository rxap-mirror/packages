import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OpenApiConfigService,
  OpenApiOperationCommand,
  OperationCommand,
} from '@rxap/nest-open-api';
import { readFileSync } from 'fs';

@Injectable()
export class ProfileService<T = unknown> {


  private readonly getUserProfileCommand: OpenApiOperationCommand<T, { userId: string }>;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly openApiConfigService: OpenApiConfigService,
    private readonly logger: Logger,
  ) {

    const operationMetadata = JSON.parse(readFileSync(
      this.config.getOrThrow('GET_USER_PROFILE_OPERATION_FILE_PATH'),
      'utf-8',
    ));

    @OperationCommand(operationMetadata)
    class Operation extends OpenApiOperationCommand {}

    this.getUserProfileCommand = new Operation(
      this.http,
      this.openApiConfigService,
      this.logger,
    );
  }

  async get(userId: string): Promise<T> {
    let profile: T | undefined;
    try {
      profile = await this.getUserProfileCommand.execute({
        parameters: {
          userId,
        },
      });
    } catch (e: any) {
      console.error('Failed to request user profile: ' + e.message, e.stack);
    }
    if (!profile) {
      throw new Error('Failed to request user profile');
    }
    return profile;
  }

}
