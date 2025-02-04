import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_METADATA = Symbol('permissions');

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_METADATA, permissions);
