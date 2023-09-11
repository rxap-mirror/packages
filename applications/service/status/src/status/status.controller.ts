import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseArrayPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
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
import { ServiceHealthIndicator } from './service.health-indicator';

@Controller()
@Public()
export class StatusController {

  constructor(
    private readonly health: HealthCheckService,
    private readonly serviceHealthIndicator: ServiceHealthIndicator,
    private readonly serviceRegistryService: ServiceRegistryService,
    private readonly logger: Logger,
  ) {
  }

  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [ 'error', 'ok', 'shutting_down' ],
        },
        info: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: [ 'up', 'down' ],
              },
            },
            additionalProperties: {
              type: 'string',
            },
            required: [ 'status' ],
          },
        },
        error: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: [ 'up', 'down' ],
              },
            },
            additionalProperties: {
              type: 'string',
            },
            required: [ 'status' ],
          },
        },
        details: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: [ 'up', 'down' ],
              },
            },
            additionalProperties: {
              type: 'string',
            },
            required: [ 'status' ],
          },
        },
      },
      required: [ 'status', 'details' ],
    },
  })
  @ApiQuery({
    name: 'service',
    type: [ String ],
  })
  @Get('many')
  @HealthCheck()
  public healthCheck(@Query('service', ParseArrayPipe) serviceList: string[]): Promise<HealthCheckResult> {
    if (serviceList?.length) {
      const services = serviceList.map((name) => {
        return () => this.serviceHealthIndicator.isHealthy(name);
      });
      return this.health.check(services);
    }
    throw new BadRequestException('No service provided');
  }

  @Get(':name')
  @HealthCheck()
  public healthCheckService(@Param('name') name: string): Promise<HealthCheckResult> {
    return this.health.check([ () => this.serviceHealthIndicator.isHealthy(name) ]);
  }

  @Post('register')
  @HealthCheck()
  @Internal()
  public async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
  ) {
    const {
      name,
      url,
      port = 3000,
      domain,
      healthCheckPath = '/health',
      infoPath = '/info',
      ip = req.ip.match(/(\d+\.\d+\.\d+\.\d+)$/)?.[1],
      protocol = 'http',
    } = body;
    this.logger.log(
      `Register service '${ name }' with ::: url='${ url }' port='${ port }' domain='${ domain }' healthCheckPath='${ healthCheckPath }' infoPath='${ infoPath }' ip='${ ip }'`,
      'StatusController',
    );

    if (!url && !domain && !ip) {
      throw new BadRequestException('No url or domain provided and could not determine ip address');
    }

    if ([ 'http', 'https' ].includes(protocol)) {
      throw new BadRequestException(`Invalid protocol '${ protocol }'`);
    }

    await this.serviceRegistryService.register(name, url, port, domain, healthCheckPath, infoPath, ip, protocol);

    return this.health.check([ () => this.serviceHealthIndicator.isHealthy(body.name) ]);

  }

}
