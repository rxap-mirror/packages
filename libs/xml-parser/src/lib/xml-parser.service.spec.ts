import { XmlParserService } from './xml-parser.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RxapElement } from './element';
import { ParsedElement } from './elements/parsed-element';
import { ElementParser } from './decorators/element-parser';
import {
  BaseDefinitionElement,
  ParseBaseDefinitionElement
} from './elements/definition.element';
import { RequiredProperty } from './decorators/required-property';

describe('XML Parser', () => {

  describe('Xml Parser Service', () => {

    let xmlParser: XmlParserService;

    beforeEach(() => {

      TestBed.configureTestingModule({
        imports:   [
          HttpClientTestingModule
        ],
        providers: [
          XmlParserService
        ]
      });

      xmlParser = TestBed.get(XmlParserService);

    });

    function ParseUserElement(parser: XmlParserService, element: RxapElement, user: UserElement = new UserElement()): UserElement {
      user.id                = element.getString('id', user.id);
      user.username          = element.getString('username', user.username);
      const projects         = element.getChildren('project').map(project => parser.parse<ProjectElement>(project));
      const softwareProjects = element.getChildren('software-project').map(project => parser.parse<SoftwareProjectElement>(project));
      user.projects          = [ ...projects, ...softwareProjects ];
      return user;
    }

    @ElementParser(
      'definition',
      ParseUserElement,
      ParseBaseDefinitionElement
    )
    class UserElement extends BaseDefinitionElement {

      @RequiredProperty() public username!: string;
      public projects: ProjectElement[] = [];

      public validate(): boolean {
        return true;
      }

    }

    function ParseProjectElement(parser: XmlParserService, element: RxapElement, project: ProjectElement = new ProjectElement()): ProjectElement {
      project.name = element.getString('name', project.name);
      return project;
    }

    @ElementParser(
      'project',
      ParseProjectElement
    )
    class ProjectElement implements ParsedElement {

      @RequiredProperty() public name!: string;

      public validate(): boolean {
        return true;
      }

    }

    function ParseSoftwareProjectElement(
      parser: XmlParserService,
      element: RxapElement,
      project: SoftwareProjectElement = new SoftwareProjectElement()
    ): SoftwareProjectElement {
      project.git = element.getBoolean('git', false)!;
      return project;
    }

    @ElementParser(
      'software-project',
      ParseProjectElement,
      ParseSoftwareProjectElement
    )
    class SoftwareProjectElement extends ProjectElement {

      @RequiredProperty() public git!: boolean;

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
      expect(userElementParser.parsers.length).toBe(2);

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
      expect(userElement.projects[ 0 ]).toBeInstanceOf(ProjectElement);
      expect(userElement.projects[ 1 ]).toBeInstanceOf(ProjectElement);
      expect(userElement.projects[ 2 ]).toBeInstanceOf(SoftwareProjectElement);

      expect(userElement).toEqual({
        id:       'id1',
        username: 'my-username',
        metadata: {},
        projects: [
          { name: 'my-project-1' },
          { name: 'my-project-2' },
          { name: 'my-project-3', git: true }
        ]
      });

    });

  });

});
