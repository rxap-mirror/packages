import {
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { SidenavContentComponentService } from './sidenav-content.component.service';
import {
  HeaderService,
  FooterService
} from '@rxap/services';
import { RouterTestingModule } from '@angular/router/testing';
import createSpy = jasmine.createSpy;

describe('Layout', () => {

  describe('Sidenav Content', () => {

    describe('Service', () => {

      let service: SidenavContentComponentService;
      let footer: FooterService;
      let header: HeaderService;

      beforeEach(() => {

        TestBed.configureTestingModule({
          imports: [
            RouterTestingModule
          ]
        });

        header  = TestBed.inject(HeaderService);
        footer  = TestBed.inject(FooterService);
        service = TestBed.inject(SidenavContentComponentService);
      });

      it('should calc and update margin top', fakeAsync(() => {

        const marginTopSpy = createSpy();

        service.marginTop$.subscribe(marginTopSpy);

        tick();

        expect(header.countComponent).toBe(1);
        expect(marginTopSpy).toBeCalled();
        expect(marginTopSpy).toBeCalledWith('64px');

        marginTopSpy.calls.reset();
        header.addComponent(class {});

        tick();

        expect(header.countComponent).toBe(2);
        expect(marginTopSpy).toBeCalled();
        expect(marginTopSpy).toBeCalledWith('128px');

      }));

      it('should calc and update margin bottom', fakeAsync(() => {

        const marginBottomSpy = createSpy();

        service.marginBottom$.subscribe(marginBottomSpy);

        tick();

        expect(footer.countComponent).toBe(0);
        expect(marginBottomSpy).toBeCalled();
        expect(marginBottomSpy).toBeCalledWith('0px');

        marginBottomSpy.calls.reset();
        footer.addComponent(class {});

        tick();

        expect(footer.countComponent).toBe(1);
        expect(marginBottomSpy).toBeCalled();
        expect(marginBottomSpy).toBeCalledWith('64px');

      }));

      it('should calc and update inner height', fakeAsync(() => {

        const innerHeightSpy = createSpy();

        service.innerHeight$.subscribe(innerHeightSpy);

        tick();

        expect(footer.countComponent).toBe(0);
        expect(header.countComponent).toBe(1);
        expect(innerHeightSpy).toBeCalled();
        expect(innerHeightSpy).toBeCalledWith('calc(100% - 64px)');

        innerHeightSpy.calls.reset();
        footer.addComponent(class {});

        tick();

        expect(footer.countComponent).toBe(1);
        expect(header.countComponent).toBe(1);
        expect(innerHeightSpy).toBeCalled();
        expect(innerHeightSpy).toBeCalledWith('calc(100% - 128px)');

        innerHeightSpy.calls.reset();
        header.addComponent(class {});

        tick();

        expect(footer.countComponent).toBe(1);
        expect(header.countComponent).toBe(2);
        expect(innerHeightSpy).toBeCalled();
        expect(innerHeightSpy).toBeCalledWith('calc(100% - 192px)');

      }));

    });

  });

});
