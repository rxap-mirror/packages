import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CheckRequestTupleKey } from '@openfga/sdk/dist/apiModel';
import { Request } from 'express';
import { OPEN_FGA_METADATA, OpenFgaCheck } from './open-fga.decorator';
import { OpenFgaService } from './open-fga.service';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function ResolveFgaChecks(req: Request) {
  return (check: OpenFgaCheck): CheckRequestTupleKey => {
    const tuple: { user: string; relation: string; object: string } = {
      user: '',
      relation: '',
      object: '',
    };

    tuple.relation = check.relation;

    // region object
    let object = check.object;
    if (!Array.isArray(object)) {
      object = object(req);
    } else {
      if (typeof object[1] !== 'string') {
        object[1] = object[1](req);
      }
    }
    tuple.object = `${object[0]}:${object[1]}`;
    // endregion

    // region user
    let user = check.user;
    if (!user) {
      if (req.user && 'sub' in req.user && typeof req.user.sub === 'string') {
        user = ['user', req.user.sub];
      } else {
        user = ['user', '*'];
      }
    } else if (!Array.isArray(user)) {
      user = user(req);
    } else {
      if (user.length === 3) {
        if (typeof user[2] !== 'string') {
          user[2] = user[2](req);
        }
      } else if (typeof user[1] !== 'string') {
        const response = user[1](req);
        if (Array.isArray(response)) {
          user = [user[0], response[0], response[1]];
        } else {
          user[1] = response;
        }
      }
    }
    if (user.length === 3) {
      tuple.user = `${user[0]}:${user[1]}#${user[2]}`;
    } else {
      tuple.user = `${user[0]}:${user[1]}`;
    }
    // endregion

    return tuple;
  };
}

@Injectable()
export class OpenFgaGuard implements CanActivate {
  @Inject(Logger)
  private readonly logger!: Logger;

  @Inject(OpenFgaService)
  private readonly fga!: OpenFgaService;

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const fgaChecks = this.reflector.get<OpenFgaCheck[]>(
      OPEN_FGA_METADATA,
      context.getHandler()
    );

    if (!fgaChecks?.length) {
      this.logger.debug(`Route does not require any fga checks`, 'FgaGuard');
      return true;
    }
    this.logger.debug(
      `Route requires fga checks: %JSON`,
      fgaChecks,
      'FgaGuard'
    );

    const req = context.switchToHttp().getRequest<Request>();

    const tuples = fgaChecks.map(ResolveFgaChecks(req));

    this.logger.verbose(`FGA check: %JSON`, tuples, 'FgaGuard');

    const { result } = await this.fga.clientBatchCheck(tuples);

    if (result.every((item) => item.allowed)) {
      this.logger.verbose(`FGA check: all tuples are allowed`, 'FgaGuard');
      return true;
    } else {
      this.logger.warn(`FGA check: some tuples are not allowed`, 'FgaGuard');
      return false;
    }
  }
}
