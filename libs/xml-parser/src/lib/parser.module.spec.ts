import { XmlParserService } from './xml-parser.service';
import {
  RootParserModule,
  RegisterParserModule
} from './parser.module';
import {
  NgModule,
  InjectionToken,
  ModuleWithProviders,
  Inject,
  Injectable
} from '@angular/core';
import { Type } from '@rxap/utilities';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ParsedElement } from './elements/parsed-element';
import { ElementParser } from './decorators/element-parser';

describe('XML Parser', () => {

  describe('Parser Module', () => {

    const ROOT_ELEMENT_PARSER     = new InjectionToken('root');
    const REGISTER_ELEMENT_PARSER = new InjectionToken('register');

    @NgModule()
    class TestParserModule {

      public static forRoot(elementParser: Type<Array<ParsedElement>>): ModuleWithProviders<TestRootParserModule> {
        return {
          ngModule:  TestRootParserModule,
          providers: [
            {
              provide:  ROOT_ELEMENT_PARSER,
              useValue: elementParser
            }
          ]
        };
      }

      public static register(elementParser: Type<Array<ParsedElement>>): ModuleWithProviders<TestRegisterParserModule> {
        return {
          ngModule:  TestRegisterParserModule,
          providers: [
            {
              provide:  REGISTER_ELEMENT_PARSER,
              useValue: elementParser,
              multi:    true
            }
          ]
        };
      }

    }

    @Injectable({ providedIn: 'root' })
    class TestXmlParserService extends XmlParserService {}

    @NgModule()
    class TestRootParserModule extends RootParserModule {

      constructor(
        @Inject(TestXmlParserService) xmlParser: TestXmlParserService,
        @Inject(ROOT_ELEMENT_PARSER) parsedElements: any[]
      ) {
        super(xmlParser, parsedElements);
      }

    }

    @NgModule()
    class TestRegisterParserModule extends RegisterParserModule {

      constructor(
        @Inject(TestRootParserModule) root: TestRootParserModule,
        @Inject(REGISTER_ELEMENT_PARSER) parsedElements: any[][]
      ) {
        super(root, parsedElements);
      }

    }

    @ElementParser('test-0')
    class Test0Element implements ParsedElement {
      validate(): boolean {
        return true;
      }
    }

    @ElementParser('test-1')
    class Test1Element implements ParsedElement {
      validate(): boolean {
        return true;
      }
    }

    @ElementParser('test-2')
    class Test2Element implements ParsedElement {
      validate(): boolean {
        return true;
      }
    }

    it('should register element parser with TestParserModule.forRoot', () => {

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          TestParserModule.forRoot([ Test0Element ] as any)
        ]
      });

      const xmlParser: TestXmlParserService = TestBed.inject<TestXmlParserService>(TestXmlParserService);

      expect(xmlParser.parsers.size).toBe(1);

    });

    it('should register element parser TestRegisterParserModule.register', () => {

      @NgModule({
        imports: [
          TestParserModule.register([ Test1Element, Test2Element ] as any)
        ]
      })
      class SubModule {}

      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          TestParserModule.forRoot([ Test0Element ] as any),
          SubModule
        ]
      });

      const xmlParser: TestXmlParserService = TestBed.get(TestXmlParserService);

      expect(xmlParser.parsers.size).toBe(3);

    });

  });

});
