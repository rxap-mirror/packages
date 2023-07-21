import { OPEN_API_SERVER_ID_META_DATA_KEY } from './tokens';

export function OpenApiServerId(serverId: string) {
  return function (target: any) {
    Reflect.defineMetadata(OPEN_API_SERVER_ID_META_DATA_KEY, serverId, target);
  };
}
