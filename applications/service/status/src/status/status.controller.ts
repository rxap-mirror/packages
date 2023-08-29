import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import {
  Internal,
  Public,
} from '@rxap/nest-utilities';
import type { Request } from 'express';
import { RegisterDto } from './register.dto';
import { ServiceRegistryService } from './service-registry.service';

@Controller()
@Public()
export class StatusController {

  constructor(
    @Inject(HealthCheckService) private readonly health: HealthCheckService,
    private readonly serviceRegistryService: ServiceRegistryService,
    private readonly logger: Logger,
  ) {
  }

  @Get('all')
  @HealthCheck()
  public healthCheck(): Promise<HealthCheckResult> {
    return this.health.check(this.serviceRegistryService.checkAll());
  }

  @Get(':name')
  @HealthCheck()
  public healthCheckService(@Param('name') name: string): Promise<HealthCheckResult> {
    if (!this.serviceRegistryService.has(name)) {
      throw new NotFoundException(`Service with name: ${ name } not found`);
    }
    return this.health.check([ () => this.serviceRegistryService.check(name) ]);
  }

  @Post('register')
  @Internal()
  public async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
  ) {
    let url = body.url;
    if (!url) {
      const port = body.port ?? 3000;
      url = `http://${ req.ip }:${ port }`;
    }
    this.logger.log(`Register service: ${ body.name } at url: ${ url }`, 'StatusController');

    this.serviceRegistryService.register(body.name, url);

    const status = await this.serviceRegistryService.check(body.name);

    const indicator = status[body.name];

    if (!indicator) {
      throw new InternalServerErrorException(`Indicator for service: ${ body.name } not found`);
    }

    const isHealthy = indicator.status === 'up';

    if (!isHealthy) {
      this.serviceRegistryService.unregister(body.name);
      throw new BadRequestException(`Service with name: ${ body.name } is unhealthy`);
    }

  }

}
