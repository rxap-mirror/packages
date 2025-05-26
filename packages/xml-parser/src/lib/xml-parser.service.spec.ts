import { ElementChild } from '@rxap/xml-parser';
import { DOMParser } from 'xmldom';
import { ElementAttribute } from './decorators/element-attribute';
import { ElementChildren } from './decorators/element-children';
import { ElementDef } from './decorators/element-def';
import { ElementRequired } from './decorators/mixins/required-element.mixin';
import { ParsedElement } from './elements/parsed-element';
import { XmlParserService } from './xml-parser.service';

describe('XML Parser', () => {

  describe.each([
    {
      name: 'native',
      DOMParser: window.DOMParser,
    }, {
      name: 'xmldom',
      DOMParser,
    },
  ])('Xml Parser Service', ({
    name,
    DOMParser,
  }) => {

    describe(name, () => {

      describe('should preserve the original tag name regardless of the case sensitive option', () => {


        @ElementDef('Element')
        class Element implements ParsedElement{

          __tag?: string;

        }

        @ElementDef('Root')
        class Root implements ParsedElement {

          __tag?: string;

          @ElementChildren(Element)
          children!: Element[];

        }

        const xml = `<Root><Element></Element><element></element></Root>`;

        it('defaults', () => {
          const xmlParserService = new XmlParserService(DOMParser);
          xmlParserService.setRootElement(Root);


          const root = xmlParserService.parseFromXml<Root>(xml);
          expect(root.__tag).toEqual('Root');
          expect(root.children).toHaveLength(2);
          expect(root.children[0].__tag).toEqual('Element');
          expect(root.children[1].__tag).toEqual('element');

        });

        it('caseSensitive = true', () => {

          const xmlParserService = new XmlParserService(DOMParser, { caseSensitive: true });
          xmlParserService.setRootElement(Root);


          const root = xmlParserService.parseFromXml<Root>(xml);
          expect(root.__tag).toEqual('Root');
          expect(root.children).toHaveLength(1);
          expect(root.children[0].__tag).toEqual('Element');

        });

        it('caseSensitive = false', () => {

          const xmlParserService = new XmlParserService(DOMParser, { caseSensitive: false });
          xmlParserService.setRootElement(Root);


          const root = xmlParserService.parseFromXml<Root>(xml);
          expect(root.__tag).toEqual('Root');
          expect(root.children).toHaveLength(2);
          expect(root.children[0].__tag).toEqual('Element');
          expect(root.children[1].__tag).toEqual('element');

        });

      });

      it('should parse xmlns', () => {

        @ElementDef('definition')
        class UserElement {

          public validate(): boolean {
            return true;
          }

        }

        const xmlParser = new XmlParserService(DOMParser);
        xmlParser.register(UserElement);
        const element = xmlParser.parseFromXml(
          '<definition xmlns="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>');
        expect(element).toBeDefined();
        expect(element.__xmlns).toBeDefined();
        expect(element.toJSON).toBeDefined();
        expect(typeof element.toJSON === 'function').toBeTruthy();
        expect(element.__xmlns?.keys()).toContain('');
        expect(element.__xmlns?.keys()).toContain('xsi');
        expect(Array.from(element.__xmlns?.entries() ?? [])).toEqual([
          [ '', 'http://www.w3.org/2001/XMLSchema-instance' ],
          [ 'xsi', 'http://www.w3.org/2001/XMLSchema-instance' ],
        ]);

      });

      describe('Full Example A', () => {

        let xmlParser: XmlParserService;

        beforeEach(() => {

          xmlParser = new XmlParserService(DOMParser);

        });

        @ElementDef('project')
        class ProjectElement implements ParsedElement {

          @ElementAttribute()
          @ElementRequired()
          public name!: string;

          public validate(): boolean {
            return true;
          }

        }

        @ElementDef('software-project')
        class SoftwareProjectElement extends ProjectElement {

          @ElementAttribute()
          @ElementRequired()
          public git!: boolean;

        }

        @ElementDef('definition')
        class UserElement implements ParsedElement {

          @ElementAttribute()
          @ElementRequired()
          public username!: string;

          @ElementChildren(SoftwareProjectElement)
          @ElementChildren(ProjectElement)
          public projects!: ProjectElement[];

          public validate(): boolean {
            return true;
          }

        }

        it('register parser', () => {

          expect(xmlParser.parsers.size).toBe(0);

          xmlParser.register(UserElement);
          expect(xmlParser.parsers.size).toBe(1);

          xmlParser.register(UserElement);
          expect(xmlParser.parsers.size).toBe(1);

          xmlParser.register(ProjectElement);
          expect(xmlParser.parsers.size).toBe(2);

          xmlParser.register(ProjectElement);
          expect(xmlParser.parsers.size).toBe(2);

          xmlParser.register(SoftwareProjectElement);
          expect(xmlParser.parsers.size).toBe(3);

          const userElementParser = xmlParser.parsers.get('definition')!;
          expect(userElementParser).toBeDefined();
          expect(userElementParser.parsers.length).toBe(3);

          const projectElementParser = xmlParser.parsers.get('project')!;
          expect(projectElementParser).toBeDefined();
          expect(projectElementParser.parsers.length).toBe(1);

          const softwareProjectElementParser = xmlParser.parsers.get('software-project')!;
          expect(softwareProjectElementParser).toBeDefined();
          expect(softwareProjectElementParser.parsers.length).toBe(2);

        });

        it('should parse xml file and use registered parsers and validate parsed elements', () => {

          xmlParser.register(UserElement);
          xmlParser.register(ProjectElement);
          xmlParser.register(SoftwareProjectElement);

          const template = `
<definition id="id1" username="my-username">
  <project name="my-project-1"/>
  <project name="my-project-2"/>
  <software-project name="my-project-3" git="true"/>
</definition>
      `;

          const userElement = xmlParser.parseFromXml<UserElement>(template);

          expect(userElement).toBeInstanceOf(UserElement);
          expect(userElement.validate()).toBeTruthy();

          expect(userElement.projects.length).toBe(3);
          expect(userElement.projects[0]).toBeInstanceOf(ProjectElement);
          expect(userElement.projects[1]).toBeInstanceOf(ProjectElement);
          expect(userElement.projects[2]).toBeInstanceOf(SoftwareProjectElement);

          expect(userElement.toJSON()).toEqual({
            "__tag": "definition",
            "__xmlns": {},
            "projects": [
              {
                "__parent": "definition",
                "__tag": "project",
                "__xmlns": {},
                "name": "my-project-1"
              },
              {
                "__parent": "definition",
                "__tag": "project",
                "__xmlns": {},
                "name": "my-project-2"
              },
              {
                "__parent": "definition",
                "__tag": "software-project",
                "__xmlns": {},
                "git": true,
                "name": "my-project-3"
              }
            ],
            "username": "my-username"
          });

        });

      });

      describe('With scoped element names', () => {

        @ElementDef('rdf:Label')
        class RdfLabelElement implements ParsedElement {

          validate(): boolean {
            return true;
          }

        }

        @ElementDef('rdf:RDF')
        class RdfElement implements ParsedElement {

          @ElementChild(RdfLabelElement, { required: true })
          label!: RdfLabelElement;

          validate(): boolean {
            return true;
          }

        }

        let xmlParser: XmlParserService;

        beforeEach(() => {
          xmlParser = new XmlParserService(DOMParser, {
            caseSensitive: true,
            withNamespace: true,
          });
          xmlParser.setRootElement(RdfElement);
        });

        it('should handle scoped element names', () => {

          const xml = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Label/></rdf:RDF>';

          const rdfElement = xmlParser.parseFromXml<RdfElement>(xml);

          expect(rdfElement).toBeInstanceOf(RdfElement);
          expect(rdfElement.label).toBeDefined();
          expect(rdfElement.label).toBeInstanceOf(RdfLabelElement);

        });

      });

    });

  });

});
