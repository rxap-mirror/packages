import {
  ElementChild,
  ElementDef,
  ParsedElement,
  ElementAttribute,
  ElementChildren,
} from '@rxap/xml-parser';
import { createElement } from './create-element';
import { isParsedElement } from './utilities/is-parsed-element';


describe('createElement', () => {

  @ElementDef('dateOfCreation')
  class DateOfCreationElement implements ParsedElement {
    __tag?: string;
    __parent?: ParsedElement;

    @ElementAttribute()
    value!: string;
  }

  @ElementDef('rdfs:label')
  class RdfsLabelElement implements ParsedElement {
    __tag?: string;
    __parent?: ParsedElement;

    @ElementAttribute()
    value!: string;
  }

  @ElementDef('informationSubject')
  class InformationSubjectElement implements ParsedElement {
    __tag?: string;
    __parent?: ParsedElement;

    @ElementAttribute()
    about!: string;

    @ElementChildren(RdfsLabelElement)
    labelList?: RdfsLabelElement[];
  }

  @ElementDef('hasSubject')
  class HasSubjectElement implements ParsedElement {
    __tag?: string;
    __parent?: ParsedElement;

    @ElementAttribute()
    _instance!: InformationSubjectElement;
  }

  @ElementDef('iirds:Topic')
  class TopicElement implements ParsedElement {
    __tag?: string;
    __xmlns?: Map<string, string>;
    __parent?: ParsedElement;

    @ElementAttribute()
    about?: string;

    @ElementAttribute()
    title?: string;

    @ElementChild(DateOfCreationElement)
    dateOfCreation?: DateOfCreationElement;

    @ElementChildren(HasSubjectElement)
    hasInformationTypeList?: HasSubjectElement[];

    get subjectList(): InformationSubjectElement[] {
      return this.hasInformationTypeList?.map(has => has._instance) ?? [];
    }
  }

  it('should set the parent element and add is self as child', () => {
    @ElementDef('child')
    class Child implements ParsedElement {
      __tag?: string;
      __parent?: ParsedElement;
    }

    @ElementDef('root')
    class Root implements ParsedElement {
      __tag?: string;

      @ElementChild(Child)
      child!: Child;
    }

    const root = createElement(Root);
    expect(isParsedElement(root)).toBe(true);
    const element = createElement(Child, root);

    expect(element.__parent).toBe(root);
  });

  it('should create an TopicElement from a class', () => {
    const element = createElement(TopicElement);
    expect(element).toBeInstanceOf(TopicElement);
    expect(element.__tag).toBe('iirds:Topic');
    expect(element.__xmlns).toBeDefined();
  });

  it('should create an TopicElement from an instance', () => {
    const element = createElement(new TopicElement());
    expect(element).toBeInstanceOf(TopicElement);
    expect(element.__tag).toBe('iirds:Topic');
    expect(element.__xmlns).toBeDefined();
  });

  it('should create an TopicElement with properties', () => {
    const element = createElement(TopicElement, {
      about: 'http://myCompany.com/products/TableFan',
      title: 'Table fan',
    });
    expect(element).toBeInstanceOf(TopicElement);
    expect(element.__tag).toBe('iirds:Topic');
    expect(element.__xmlns).toBeDefined();
    expect(element.about).toEqual('http://myCompany.com/products/TableFan');
    expect(element.title).toEqual('Table fan');
  });

  it('should set the __parent property of the child element', () => {
    const value = new Date().toISOString();
    const element = createElement(TopicElement, {
      about: 'http://myCompany.com/products/TableFan',
      title: 'Table fan',
      dateOfCreation: createElement(DateOfCreationElement, { value }),
    });

    expect(element.dateOfCreation).toBeInstanceOf(DateOfCreationElement);
    expect(element.dateOfCreation!.__parent).toBe(element);
    expect(element.dateOfCreation!.value).toEqual(value);
  });

  it('should set the __parent property of the children elements', () => {
    const subject = createElement(InformationSubjectElement, {
      about: 'http://myCompany.com/subject/TableFan',
      labelList: [
        createElement(RdfsLabelElement, { value: 'Table fan' }),
        createElement(RdfsLabelElement, { value: 'Row fan' }),
      ],
    });

    const hasSubject = createElement(HasSubjectElement, {
      _instance: subject,
    });

    const element = createElement(TopicElement, {
      hasInformationTypeList: [hasSubject],
    });

    expect(element.hasInformationTypeList).toHaveLength(1);
    expect(element.hasInformationTypeList![0]).toBeInstanceOf(HasSubjectElement);
    expect(
      element.hasInformationTypeList!.filter(
        (i) => i instanceof HasSubjectElement
      )
    ).toHaveLength(1);
    expect(element.subjectList).toHaveLength(1);
    expect(element.subjectList[0]).toBeInstanceOf(InformationSubjectElement);
    expect(element.subjectList[0].labelList).toHaveLength(2);
    expect(element.subjectList[0].labelList![0]).toBeInstanceOf(
      RdfsLabelElement
    );
    expect(element.subjectList[0].labelList![0].__parent).toBe(
      element.subjectList[0]
    );
    expect(element.subjectList[0].labelList![0].value).toEqual('Table fan');
    expect(element.subjectList[0].labelList![1]).toBeInstanceOf(
      RdfsLabelElement
    );
    expect(element.subjectList[0].labelList![1].__parent).toBe(
      element.subjectList[0]
    );
  });
});
