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
      // if (p.hasOwnProperty('propertyKey')) {
      //   return p.propertyKey !== parser.propertyKey;
      // }
      return true;
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
