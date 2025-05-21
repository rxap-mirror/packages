import {
  ElementNamespace,
  getElementNamespaceMetadata,
  hasElementNamespaceMetadata,
} from './element-namespace';

describe('@rxap/xml-parser', () => {

  describe('@ElementNamespace', () => {

    it('should add namespace to element', () => {

      @ElementNamespace('test:https://test.domain')
      class Test {}

      expect(hasElementNamespaceMetadata(Test)).toBe(true);
      expect(getElementNamespaceMetadata(Test)).toEqual({
        test: 'https://test.domain',
      });

    });

    it('should support multiple namespaces', () => {

      @ElementNamespace('test:https://test.domain', 'test2:https://test2.domain')
      class Test {}

      expect(hasElementNamespaceMetadata(Test)).toBe(true);
      expect(getElementNamespaceMetadata(Test)).toEqual({
        test: 'https://test.domain',
        test2: 'https://test2.domain',
      });

    });

    it('should support multiple namespaces form map', () => {

      @ElementNamespace({
        test: 'https://test.domain',
        test2: 'https://test2.domain',
      })
      class Test {}

      expect(hasElementNamespaceMetadata(Test)).toBe(true);
      expect(getElementNamespaceMetadata(Test)).toEqual({
        test: 'https://test.domain',
        test2: 'https://test2.domain',
      });

    });

    it('should remove unscoped namespace in string mode', () => {

      @ElementNamespace('test')
      class Test {}

      expect(hasElementNamespaceMetadata(Test)).toBe(false);

    });

    it('should support unscoped namespace in map mode', () => {

      @ElementNamespace({
        '': 'https://test.domain',
      })
      class Test {}

      expect(hasElementNamespaceMetadata(Test)).toBe(true);
      expect(getElementNamespaceMetadata(Test)).toEqual({
        '': 'https://test.domain',
      });

    });

  });

});
