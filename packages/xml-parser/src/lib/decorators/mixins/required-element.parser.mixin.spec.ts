import {ElementRequired} from './required-element.parser.mixin';
import {XmlElementMetadata} from '../utilities';
import {addToMetadata, getMetadata, getMetadataKeys} from '@rxap/reflect-metadata';

describe('@rxap/xml-parser', () => {

  describe('Mixins', () => {

    describe('RequiredElementParserMixin', () => {

      describe('@RequiredElement', () => {

        it('should throw if the decorator is used before the @Element* decorator', () => {

          function ElementDummy() {
            return function (target: any, propertyKey: string) {
              addToMetadata(XmlElementMetadata.PARSER_INSTANCE, {propertyKey}, target);
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

          expect(getMetadataKeys(MyElement.prototype, 'name')).toContain(XmlElementMetadata.OPTIONS);
          expect(getMetadata(XmlElementMetadata.OPTIONS, MyElement.prototype, 'name')).toEqual({required: true});

        });

      });

    });

  });

});
