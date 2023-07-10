import { XmlParserService } from './xml-parser.service';
import { ParsedElement } from './elements/parsed-element';
import { ElementAttribute } from './decorators/element-attribute';
import { ElementDef } from './decorators/element-def';
import { ElementRequired } from './decorators/mixins/required-element.parser.mixin';
import { ElementChildren } from './decorators/element-children';

describe('XML Parser', () => {

  describe('Xml Parser Service', () => {

    let xmlParser: XmlParserService;

    beforeEach(() => {

      xmlParser = new XmlParserService();

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
    class UserElement {

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

      expect(userElement).toEqual({
        __tag: 'definition',
        __parent: null,
        username: 'my-username',
        projects: [
          {__parent: userElement, __tag: 'project', name: 'my-project-1'},
          {__parent: userElement, __tag: 'project', name: 'my-project-2'},
          {__parent: userElement, __tag: 'software-project', name: 'my-project-3', git: true},
        ],
      });

    });

  });

});
