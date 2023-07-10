import { ElementRequired } from './required-element.parser.mixin';
import { FindElementParserInstanceForPropertyKey } from '../utilities';
import { ElementAttribute } from '../element-attribute';
import { ElementChild } from '../element-child';
import { ElementChildTextContent } from '../element-child-text-content';
import { ElementChildren } from '../element-children';
import { ElementTextContent } from '../element-text-content';
import { ParsedElement } from '../../elements/parsed-element';

describe('@rxap/xml-parser', () => {

  describe('Mixins', () => {

    describe('RequiredElementParserMixin', () => {

      describe('@RequiredElement', () => {

        it('should set options.required for @ElementAttribute to true', () => {

          class MyElement implements ParsedElement {

            @ElementAttribute()
            @ElementRequired()
            public name!: string;

            public validate(): boolean {
              return true;
            }

          }

          const parser = FindElementParserInstanceForPropertyKey(MyElement, 'name')!;

          expect(parser).toBeDefined();
          expect(parser.options.required).toBe(true);

        });

        it('should set options.required for @ElementChild to true', () => {

          class MyElement implements ParsedElement {

            @ElementChild({} as any)
            @ElementRequired()
            public name!: string;

            public validate(): boolean {
              return true;
            }

          }

          const parser = FindElementParserInstanceForPropertyKey(MyElement, 'name')!;

          expect(parser).toBeDefined();
          expect(parser.options.required).toBe(true);

        });

        it('should set options.required for @ElementChildTextContent to true', () => {

          class MyElement implements ParsedElement {

            @ElementChildTextContent()
            @ElementRequired()
            public name!: string;

            public validate(): boolean {
              return true;
            }

          }

          const parser = FindElementParserInstanceForPropertyKey(MyElement, 'name')!;

          expect(parser).toBeDefined();
          expect(parser.options.required).toBe(true);

        });

        it('should set options.required for @ElementChildren to true', () => {

          class MyElement implements ParsedElement {

            @ElementChildren({} as any)
            @ElementRequired()
            public name!: string;

            public validate(): boolean {
              return true;
            }

          }

          const parser = FindElementParserInstanceForPropertyKey(MyElement, 'name')!;

          expect(parser).toBeDefined();
          expect(parser.options.required).toBe(true);

        });

        it('should set options.required for @ElementTextContent to true', () => {

          class MyElement implements ParsedElement {

            @ElementTextContent()
            @ElementRequired()
            public name!: string;

            public validate(): boolean {
              return true;
            }

          }

          const parser = FindElementParserInstanceForPropertyKey(MyElement, 'name')!;

          expect(parser).toBeDefined();
          expect(parser.options.required).toBe(true);

        });

      });

    });

  });

});
