import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { SidenavContentComponentService } from './sidenav-content.component.service';
import {
  FooterService,
  HeaderService,
} from '@rxap/services';
import { RouterTestingModule } from '@angular/router/testing';

describe('Layout', () => {

  describe('Sidenav Content', () => {

    describe('Service', () => {

      let service: SidenavContentComponentService;
      let footer: FooterService;
      let header: HeaderService;

      beforeEach(() => {

        TestBed.configureTestingModule({
          imports: [
            RouterTestingModule,
          ],
        });

        header = TestBed.inject(HeaderService);
        footer = TestBed.inject(FooterService);
        service = TestBed.inject(SidenavContentComponentService);
      });

      it('should calc and update margin top', fakeAsync(() => {

        const marginTopSpy = jest.fn();

        service.marginTop$.subscribe(marginTopSpy);

        tick();

        expect(header.countComponent).toBe(1);
        expect(marginTopSpy).toBeCalled();
        expect(marginTopSpy).toBeCalledWith('64px');

        marginTopSpy.mockReset();
        header.addComponent(class {
        });

        tick();

        expect(header.countComponent).toBe(2);
        expect(marginTopSpy).toBeCalled();
        expect(marginTopSpy).toBeCalledWith('128px');

      }));

      it('should calc and update margin bottom', fakeAsync(() => {

        const marginBottomSpy = jest.fn();

        service.marginBottom$.subscribe(marginBottomSpy);

        tick();

        expect(footer.countComponent).toBe(0);
        expect(marginBottomSpy).toBeCalled();
        expect(marginBottomSpy).toBeCalledWith('0px');

        marginBottomSpy.mockReset();
        footer.addComponent(class {
        });

        tick();

        expect(footer.countComponent).toBe(1);
        expect(marginBottomSpy).toBeCalled();
        expect(marginBottomSpy).toBeCalledWith('64px');

      }));

      it('should calc and update inner height', fakeAsync(() => {

        const innerHeightSpy = jest.fn();

        service.innerHeight$.subscribe(innerHeightSpy);

        tick();

        expect(footer.countComponent).toBe(0);
        expect(header.countComponent).toBe(1);
        expect(innerHeightSpy).toBeCalled();
        expect(innerHeightSpy).toBeCalledWith('calc(100% - 64px)');

        innerHeightSpy.mockReset();
        footer.addComponent(class {
        });

        tick();

        expect(footer.countComponent).toBe(1);
        expect(header.countComponent).toBe(1);
        expect(innerHeightSpy).toBeCalled();
        expect(innerHeightSpy).toBeCalledWith('calc(100% - 128px)');

        innerHeightSpy.mockReset();
        header.addComponent(class {
        });

        tick();

        expect(footer.countComponent).toBe(1);
        expect(header.countComponent).toBe(2);
        expect(innerHeightSpy).toBeCalled();
        expect(innerHeightSpy).toBeCalledWith('calc(100% - 192px)');

      }));

    });

  });

});
