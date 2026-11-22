/** @jest-environment node */
jest.mock('prettier', () => ({ format: async (text: string) => text, resolveConfig: async () => null }));
import { HostTree } from '@angular-devkit/schematics';
import { ParsedElement, XmlParserService } from '@rxap/xml-parser';
import { JSDOM } from 'jsdom';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { ModuleElement } from './module.element';
import { Methods } from './methods/methods';
import {
  MethodElement,
  OpenApiRemoteMethodElement,
} from './methods';
import {
  StringTypeElement,
  TypeElement,
} from './type.element';

const DOMParser = new JSDOM('').window.DOMParser as any;

function parse<T extends ParsedElement>(xml: string, element: any): T {
  const parser = new XmlParserService(DOMParser);
  parser.setRootElement(element);
  return parser.parseFromXml<T>(xml, 'test', 'test.xml');
}

describe('xml-parser elements', () => {
  let project: Project;
  let sourceFile: SourceFile;
  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    sourceFile = project.createSourceFile('/a.ts', '');
  });

  describe('TypeElement', () => {
    it('returns the plain type', () => {
      const el = parse<TypeElement>('<type><name>Foo</name></type>', TypeElement);
      expect(el.type).toBe('Foo');
      expect(el.toValue({ sourceFile })).toBe('Foo');
      expect(sourceFile.getImportDeclarations()).toHaveLength(0);
    });
    it('adds an import and nullable union', () => {
      const el = parse<TypeElement>('<type nullable="true"><name>Foo</name><from>./foo</from></type>', TypeElement);
      expect(el.toValue({ sourceFile })).toBe('Foo | null');
      expect(sourceFile.getImportDeclarations()[0].getModuleSpecifierValue()).toBe('./foo');
    });
    it('StringTypeElement is always string', () => {
      const el = new StringTypeElement();
      expect(el.type).toBe('string');
      expect(el.toValue({ sourceFile })).toBe('string');
    });
  });

  describe('ModuleElement', () => {
    it('adds ng module import and returns a noop rule', () => {
      const el = parse<ModuleElement>('<module><name>FooModule</name><form>@x/y</form></module>', ModuleElement);
      sourceFile.addStatements('@NgModule({}) export class AppModule {}');
      el.handleComponentModule({ sourceFile, project, options: {} } as any);
      expect(sourceFile.getFullText()).toContain('FooModule');
      expect(typeof el.toValue({ project, options: {} } as any)).toBe('function');
    });
  });

  describe('MethodElement', () => {
    it('uses an external method', () => {
      const el = parse<MethodElement>('<method from="@x/y">DoMethod</method>', MethodElement);
      expect(el.toValue({ sourceFile, project } as any)).toBe('DoMethod');
      expect(sourceFile.getImportDeclarations()[0].getModuleSpecifierValue()).toBe('@x/y');
    });
    it('generates a method class', () => {
      const el = parse<MethodElement>('<method>do-it</method>', MethodElement);
      expect(el.toValue({ sourceFile, project } as any)).toBe('DoItMethod');
      const generated = project.getSourceFile('/methods/do-it.method.ts');
      expect(generated).toBeDefined();
      expect(generated!.getFullText()).toContain('DoItMethod');
    });
    it('generates a method class with parameter type', () => {
      const el = parse<MethodElement>('<method>x<type><name>P</name><from>./p</from></type></method>', MethodElement);
      el.parameterType = Object.assign(new TypeElement(), { name: 'P', from: './p' });
      el.name = 'load-method';
      expect(el.toValue({ sourceFile, project } as any)).toBe('LoadMethod');
      expect(project.getSourceFile('/methods/load.method.ts')!.getFullText()).toContain('P');
    });
  });

  describe('OpenApiRemoteMethodElement', () => {
    it('imports the remote method from the open api module', () => {
      const el = parse<OpenApiRemoteMethodElement>('<open-api-remote-method>get-user</open-api-remote-method>', OpenApiRemoteMethodElement);
      expect(el.toValue({ sourceFile, options: { openApiModule: '@api' } })).toBe('GetUserRemoteMethod');
      expect(sourceFile.getImportDeclarations()[0].getModuleSpecifierValue()).toBe('@api/remote-methods/get-user.remote-method');
    });
    it('throws without open api module', () => {
      const el = new OpenApiRemoteMethodElement();
      el.name = 'x';
      expect(() => el.toValue({ sourceFile, options: {} })).toThrow('open api module');
    });
  });

  it('exposes the method element list', () => {
    expect(Methods).toEqual([ MethodElement, OpenApiRemoteMethodElement ]);
    void HostTree;
  });
});
