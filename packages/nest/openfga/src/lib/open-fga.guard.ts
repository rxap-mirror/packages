import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CheckRequestTupleKey } from '@openfga/sdk/dist/apiModel';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
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
    const object = check.object;
    let objectLeft: string;
    let objectRight: string;
    if (!Array.isArray(object)) {
      [objectLeft, objectRight] = object(req);
    } else {
      objectLeft = object[0];
      if (typeof object[1] !== 'string') {
        objectRight = object[1](req);
      } else {
        objectRight = object[1];
      }
    }
    tuple.object = `${objectLeft}:${objectRight}`;
    // endregion

    // region user
    const user = check.user;
    let userLeft: string;
    let userRight: string;
    let userModifier: string | null = null;
    if (!user) {
      if (req.user && 'sub' in req.user && typeof req.user.sub === 'string') {
        [userLeft, userRight] = ['user', req.user.sub];
      } else {
        [userLeft, userRight] = ['user', '*'];
      }
    } else if (!Array.isArray(user)) {
      [userLeft, userRight] = user(req);
    } else {
      userLeft = user[0];
      if (user.length === 3) {
        if (typeof user[2] !== 'string') {
          userModifier = user[2](req);
        } else {
          userModifier = user[2];
        }
      }
      if (typeof user[1] !== 'string') {
        const response = user[1](req);
        if (Array.isArray(response)) {
          [userRight, userModifier] = [response[0], response[1]];
        } else {
          userRight = response;
        }
      } else {
        userRight = user[1];
      }
    }
    if (userModifier) {
      tuple.user = `${userLeft}:${userRight}#${userModifier}`;
    } else {
      tuple.user = `${userLeft}:${userRight}`;
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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const fgaChecks = this.reflector.get<OpenFgaCheck[]>(
      OPEN_FGA_METADATA,
      context.getHandler()
    );

    if (!fgaChecks?.length) {
      this.logger.verbose(`Route does not require any fga checks`, 'FgaGuard');
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
