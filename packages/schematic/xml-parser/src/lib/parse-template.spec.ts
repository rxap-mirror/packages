/** @jest-environment node */
import { HostTree } from '@angular-devkit/schematics';
import {
  ElementChildTextContent,
  ElementDef,
  ParsedElement,
} from '@rxap/xml-parser';
import { JSDOM } from 'jsdom';
import {
  FindTemplate,
  ParseTemplate,
} from './parse-template';

@ElementDef('definition')
class RootElement implements ParsedElement {
  @ElementChildTextContent()
  public name!: string;
  public toValue() {
    return this.name;
  }
}

const DOMParser = new JSDOM('').window.DOMParser as any;

describe('parse-template', () => {
  let tree: HostTree;
  beforeEach(() => {
    tree = new HostTree();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('FindTemplate', () => {
    it('finds a template without base path', () => {
      tree.create('/templates/a.xml', '<definition/>');
      expect(FindTemplate('a.xml', tree, undefined)).toBe('/templates/a.xml');
    });
    it('finds a template with base path', () => {
      tree.create('/templates/feature/a.xml', '<definition/>');
      expect(FindTemplate('a.xml', tree, 'feature')).toBe('/templates/feature/a.xml');
    });
    it('falls back to the shared folder', () => {
      tree.create('/templates/shared/a.xml', '<definition/>');
      expect(FindTemplate('a.xml', tree, 'feature')).toBe('/templates/shared/a.xml');
      expect(FindTemplate('a.xml', tree, undefined)).toBe('/templates/shared/a.xml');
    });
    it('returns null if not found and warns', () => {
      expect(FindTemplate('a.xml', tree, 'x')).toBeNull();
      expect(FindTemplate('a.xml', tree, undefined)).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('ParseTemplate', () => {
    it('parses an inline xml string', () => {
      const result = ParseTemplate<any>(DOMParser, tree, '<definition><name>inline</name></definition>', undefined, RootElement);
      expect(result).toBeInstanceOf(RootElement);
      expect(result.name).toBe('inline');
    });
    it('parses a template file by path', () => {
      tree.create('/some/file.xml', '<definition><name>file</name></definition>');
      const result = ParseTemplate<any>(DOMParser, tree, '/some/file.xml', undefined, RootElement);
      expect(result.name).toBe('file');
    });
    it('searches in base paths', () => {
      tree.create('/templates/b/x/view.xml', '<definition><name>found</name></definition>');
      const result = ParseTemplate<any>(DOMParser, tree, 'view.xml', [ 'a', 'b/x' ], RootElement);
      expect(result.name).toBe('found');
    });
    it('throws if the file cannot be found', () => {
      expect(() => ParseTemplate(DOMParser, tree, 'missing.xml', 'x', RootElement)).toThrow("Could not find template file for 'missing.xml'");
    });
    it('throws for an empty inline template', () => {
      expect(() => ParseTemplate(DOMParser, tree, '', undefined, RootElement)).toThrow('not defined');
    });
  });
});
