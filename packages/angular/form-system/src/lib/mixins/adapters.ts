import { ControlOption } from '@rxap/utilities';

export function ResolveByUuidParameter({value}: { value: string }) {
  return {
    parameters: {
      uuid: value,
    },
  };
}

export function ResolveByUuidResultFactory<Entity>(transformer: (entity: Entity) => ControlOption) {
  return (entity: Entity) => {
    return transformer(entity);
  };
}
