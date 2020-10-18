import {
  Component,
  DebugElement
} from '@angular/core';
import {
  TestBed,
  ComponentFixture,
  async
} from '@angular/core/testing';
import {
  HttpRemoteMethodDirectiveModule,
  HttpRemoteMethodDirective
} from './http-remote-method.directive';
import { By } from '@angular/platform-browser';
import { RemoteMethodLoader } from '@rxap/remote-method';

describe('@rxap/remote-method/directive/button', () => {

  describe('HttpRemoteMethodDirective', () => {

    @Component({
      template: '<button rxapHttpRemoteMethod="test"></button>'
    })
    class TestComponent {}

    let componentfixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directive: HttpRemoteMethodDirective;


    beforeEach(async () => {

      await TestBed.configureTestingModule({
        imports:      [
          HttpRemoteMethodDirectiveModule
        ],
        declarations: [ TestComponent ],
        providers:    [
          {
            provide:  RemoteMethodLoader,
            useValue: {}
          }
        ]
      }).compileComponents();

      componentfixture = TestBed.createComponent(TestComponent);

      directiveElement = componentfixture.debugElement.query(By.directive(HttpRemoteMethodDirective));

      expect(directiveElement).not.toBeNull();

      directive = directiveElement.injector.get(HttpRemoteMethodDirective);

      expect(directive).toBeInstanceOf(HttpRemoteMethodDirective);

      componentfixture.detectChanges();

    });

    it('should call execute on button click', async(() => {

      const executeSpy = spyOn(directive, 'execute');

      const button = componentfixture.debugElement.query(By.css('button'));

      button.nativeElement.click();

      expect(executeSpy).toBeCalledTimes(1);

    }));

  });

});
