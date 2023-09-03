import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
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
    let url = body.url;
    if (!url) {
      const port = body.port ?? 3000;
      const match = req.ip.match(/(\d+\.\d+\.\d+\.\d+)$/);
      if (match && match[1]) {
        url = `http://${ match[1] }:${ port }`;
      } else {
        throw new InternalServerErrorException(`Can't determine ip address from request: ${ req.ip }`);
      }
    }
    this.logger.log(`Register service: ${ body.name } at url: ${ url }`, 'StatusController');

    this.serviceRegistryService.register(body.name, url);

    return this.health.check([ () => this.serviceHealthIndicator.isHealthy(body.name) ]);

  }

}
