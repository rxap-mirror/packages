import {
  getMetadata,
  getMetadataKeys,
} from '@rxap/reflect-metadata';
import { ElementParserMetaData } from '@rxap/xml-parser';
import { ElementDef } from './element-def';

describe('@rxap/xml-parser', () => {

  describe('@ElementDef', () => {

    it('should set element tag as static member', () => {

      @ElementDef('my-element')
      class MyElement {

        public static TAG: string;

      }

      expect(MyElement.TAG).toEqual('my-element');

      expect(getMetadataKeys(MyElement)).toEqual([
        ElementParserMetaData.NAME,
        ElementParserMetaData.PARSER,
      ]);
      expect(getMetadata(ElementParserMetaData.NAME, MyElement)).toEqual('my-element');


    });

  });

});
