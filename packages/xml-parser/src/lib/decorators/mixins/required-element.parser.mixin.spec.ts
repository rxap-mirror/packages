import {
  addToMetadata,
  getMetadata,
  getMetadataKeys,
} from '@rxap/reflect-metadata';
import { ElementParserMetaData } from '@rxap/xml-parser';
import { ElementRequired } from './required-element.parser.mixin';

describe('@rxap/xml-parser', () => {

  describe('Mixins', () => {

    describe('RequiredElementParserMixin', () => {

      describe('@RequiredElement', () => {

        it('should throw if the decorator is used before the @Element* decorator', () => {

          function ElementDummy() {
            return function (target: any, propertyKey: string) {
              addToMetadata(ElementParserMetaData.PARSER_INSTANCE, { propertyKey }, target);
            };
          }

          expect(() => {

            class MyElement {

              @ElementRequired()
              @ElementDummy()
              public name!: string;

            }

          }).toThrow();

        });

        it('should add required options to property metadata', () => {

          class MyElement {

            @ElementRequired()
            public name!: string;

          }

          expect(getMetadataKeys(MyElement.prototype, 'name')).toContain(ElementParserMetaData.OPTIONS);
          expect(getMetadata(ElementParserMetaData.OPTIONS, MyElement.prototype, 'name')).toEqual({ required: true });

        });

      });

    });

  });

});
