import { HttpService } from '@nestjs/axios';
import {
  Inject,
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

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  @Inject(HttpService)
  private readonly http!: HttpService;

  @Inject(OpenApiConfigService)
  private readonly openApiConfigService!: OpenApiConfigService;

  @Inject(Logger)
  private readonly logger!: Logger;

  private readonly getUserProfileCommand: OpenApiOperationCommand<T, { userId: string }>;

  constructor() {

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
    return this.getUserProfileCommand.execute({
      parameters: {
        userId,
      },
    });
  }

}
