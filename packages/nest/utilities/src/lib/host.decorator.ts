import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * A custom parameter decorator that extracts the host information
 * from the HTTP request object in the current execution context.
 *
 * @example
 * ```TypeScript
 * @Get('/hello')
 * getHello(@Host() host: string): string {
 *   return `Hello from ${host}!`;
 * }
 * ````
 *
 * @param data - An optional parameter that can be used to provide additional
 *               metadata or information (not utilized in this implementation).
 * @param ctx - The execution context from which the HTTP request is accessed.
 *              Typically represents the current context of the HTTP request.
 * @returns The host value extracted from the HTTP request object.
 */
export const Host = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.host;
  },
);
