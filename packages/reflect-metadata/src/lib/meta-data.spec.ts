import {getMetadata, setMetadataMap, setMetadataMapMap, setMetadataMapSet} from './meta-data';

describe('@rxap/utilities', () => {

  describe('meta-data', () => {

    describe('setMetadataMap', () => {

      it('BUG: the parent class metadata map is changed from child classes', () => {

        class Parent {
        }

        class Child extends Parent {
        }

        setMetadataMap('parent', 'value', 'map', Parent);
        setMetadataMap('child', 'value', 'map', Child);

        const parentMap = getMetadata<Map<string, string>>('map', Parent);
        const childMap = getMetadata<Map<string, string>>('map', Child);

        expect(parentMap).toBeInstanceOf(Map);
        expect(childMap).toBeInstanceOf(Map);
        expect(parentMap).not.toBe(childMap);

        expect(Array.from(parentMap!.keys())).toEqual(['parent']);
        expect(Array.from(childMap!.keys())).toEqual(['parent', 'child']);

      });

    });

    describe('setMetadataMapSet', () => {

      it('BUG: the parent class metadata map is changed from child classes', () => {

        class Parent {
        }

        class Child extends Parent {
        }

        setMetadataMapSet('parent', 'value', 'map', Parent);
        setMetadataMapSet('child', 'value', 'map', Child);

        const parentMap = getMetadata<Map<string, string>>('map', Parent);
        const childMap = getMetadata<Map<string, string>>('map', Child);

        expect(parentMap).toBeInstanceOf(Map);
        expect(childMap).toBeInstanceOf(Map);
        expect(parentMap).not.toBe(childMap);

        expect(Array.from(parentMap!.keys())).toEqual(['parent']);
        expect(Array.from(childMap!.keys())).toEqual(['parent', 'child']);

      });

    });

    describe('setMetadataMapMap', () => {

      it('BUG: the parent class metadata map is changed from child classes', () => {

        class Parent {
        }

        class Child extends Parent {
        }

        setMetadataMapMap('parent', 'key', 'value', 'map', Parent);
        setMetadataMapMap('child', 'key', 'value', 'map', Child);

        const parentMap = getMetadata<Map<string, string>>('map', Parent);
        const childMap = getMetadata<Map<string, string>>('map', Child);

        expect(parentMap).toBeInstanceOf(Map);
        expect(childMap).toBeInstanceOf(Map);
        expect(parentMap).not.toBe(childMap);

        expect(Array.from(parentMap!.keys())).toEqual(['parent']);
        expect(Array.from(childMap!.keys())).toEqual(['parent', 'child']);

      });

    });

  });

});
