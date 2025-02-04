import { SetMetadata } from '@nestjs/common';
import { Request } from 'express';

export const OPEN_FGA_METADATA = Symbol('open-fga');

export type OpenFgaCheckRequestFnc<R extends string | [string, string] | [string, string, string]> = (
  req: Request
) => R;

export interface OpenFgaCheck {
  user?: [string, string] |
    [string, OpenFgaCheckRequestFnc<string | [string, string]>] |
    [string, string, string] |
    [string, string, OpenFgaCheckRequestFnc<string>] |
    OpenFgaCheckRequestFnc<[string, string] | [string, string, string]>;
  relation: string;
  object: [string, string] | [string, OpenFgaCheckRequestFnc<string>] | OpenFgaCheckRequestFnc<[string, string]>;
}

export const OpenFGA = (...checks: OpenFgaCheck[]) =>
  SetMetadata(OPEN_FGA_METADATA, checks);
