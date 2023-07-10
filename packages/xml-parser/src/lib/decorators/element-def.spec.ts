import {ElementDef} from './element-def';
import {XmlElementMetadata} from './utilities';
import {getMetadata, getMetadataKeys} from '@rxap/reflect-metadata';

describe('@rxap/xml-parser', () => {

  describe('@ElementDef', () => {

    it('should set element tag as static member', () => {

      @ElementDef('my-element')
      class MyElement {

        public static TAG: string;

      }

      expect(MyElement.TAG).toEqual('my-element');

      expect(getMetadataKeys(MyElement)).toEqual([
        XmlElementMetadata.NAME,
        XmlElementMetadata.PARSER,
      ]);
      expect(getMetadata(XmlElementMetadata.NAME, MyElement)).toEqual('my-element');


    });

  });

});
