import {
  ElementVirtual,
  ParsedElement,
} from '@rxap/xml-parser';
import { isVirtualElement } from './is-virtual-element';

describe('isVirtualElement', () => {

  @ElementVirtual()
  class Global implements ParsedElement {

    __tag?: string;

  }

  class Parent extends Global {}

  @ElementVirtual()
  class AbstractChild extends Parent {}

  class Child extends AbstractChild {}

  it('should return true for direct virtual elements', () => {

    expect(isVirtualElement(Global)).toBe(true);
    expect(isVirtualElement(new Global())).toBe(true);
    expect(isVirtualElement(AbstractChild)).toBe(true);
    expect(isVirtualElement(new AbstractChild())).toBe(true);

  });

  it('should return false for non virtual elements', () => {

    expect(isVirtualElement(Parent)).toBe(false);
    expect(isVirtualElement(new Parent())).toBe(false);
    expect(isVirtualElement(Child)).toBe(false);
    expect(isVirtualElement(new Child())).toBe(false);

  });

});
