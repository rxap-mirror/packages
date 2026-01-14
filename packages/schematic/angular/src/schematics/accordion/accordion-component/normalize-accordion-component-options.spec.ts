import {
  AssertAngularOptionsNameProperty,
  NormalizeAccordion,
  NormalizeAngularOptions,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { normalizeAccordionComponentOptions } from './normalize-accordion-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeAccordion: jest.fn((o) => ({ ...o, items: [] })),
  AssertAngularOptionsNameProperty: jest.fn(),
}));

jest.mock('@rxap/schematics-ts-morph', () => ({
  BuildNestControllerName: jest.fn(() => 'NestController'),
}));

jest.mock('@rxap/schematics-utilities', () => ({
  CoerceSuffix: jest.fn((n, s) => n + s),
  dasherize: jest.fn((s) => s),
}));

describe('normalizeAccordionComponentOptions', () => {
  it('should normalize accordion component options', () => {
    const options = { };
    const result = normalizeAccordionComponentOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeAccordion).toHaveBeenCalledWith(options);
    expect(AssertAngularOptionsNameProperty).toHaveBeenCalled();
    expect(result.componentName).toBe('test-accordion');
    expect(result.controllerName).toBe('NestController');
    expect(result.directory).toBe('test-accordion');
  });
});
