import { setMetadata } from '@rxap/reflect-metadata';
import { ElementSerializer } from '../element.serializer';
import { ElementParserMetaData } from '../metadata-keys';
import {
  GetAllElementSerializer,
  GetAllElementSerializerInstances,
} from '../utilities';

export function AddSerializerToMetadata(serializer: ElementSerializer, target: any) {

  // TODO : test overwrite functionality

  const addedSerializer = GetAllElementSerializer(target.constructor)
    .filter(p => {
      const propertyKey = Reflect.get(p, 'propertyKey');
      return !propertyKey || propertyKey !== serializer.propertyKey;
    });

  setMetadata(
    ElementParserMetaData.SERIALIZER,
    [ ...addedSerializer, serializer.serialize ],
    target.constructor,
  );

  const addedElementSerializer = GetAllElementSerializerInstances(target.constructor)
    .filter(p => p.propertyKey !== serializer.propertyKey);

  setMetadata(
    ElementParserMetaData.SERIALIZER_INSTANCE,
    [ ...addedElementSerializer, serializer ],
    target,
  );

}
