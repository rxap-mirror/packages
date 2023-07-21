import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { RegisterDto } from './register.dto';
import { ServiceRegistryService } from './service-registry.service';
import {
  Internal,
  Public,
} from '@rxap/nest-utilities';

@Controller()
@Public()
export class StatusController {

  constructor(
    @Inject(HealthCheckService) private readonly health: HealthCheckService,
    private readonly serviceRegistryService: ServiceRegistryService,
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
  public async register(@Body() body: RegisterDto) {
    if (this.serviceRegistryService.has(body.name)) {
      throw new ConflictException(`Service with name: ${ body.name } already registered`);
    }
    this.serviceRegistryService.register(body);

    const status = await this.serviceRegistryService.check(body.name);

    const indicator = status[body.name];

    if (!indicator) {
      throw new InternalServerErrorException(`Indicator for service: ${ body.name } not found`);
    }

    const isHealthy = indicator.status === 'up';

    if (!isHealthy) {
      this.serviceRegistryService.unregister(body.name);
      throw new BadRequestException(`Service with name: ${ body.name } is not unhealthy`);
    }

  }

}
