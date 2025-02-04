import { Inject, Injectable } from '@nestjs/common';
import { OpenFgaClient } from '@openfga/sdk';
import { OpenFgaOptions } from './open-fga.options';
import { OPEN_FGA_CLIENT_OPTIONS } from './tokens';

@Injectable()
export class OpenFgaService extends OpenFgaClient {
  constructor(
    @Inject(OPEN_FGA_CLIENT_OPTIONS)
    options: OpenFgaOptions
  ) {
    super(options);
  }
}
