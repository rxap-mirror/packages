import { ControlOption } from '@rxap/utilities';

export function ResolveByUuidParameter(uuid: string) {
  return {
    parameters: {
      uuid,
    },
  };
}

export function ResolveByUuidResultFactory<Entity>(transformer: (entity: Entity) => ControlOption) {
  return (entity: Entity) => {
    return transformer(entity);
  };
}
