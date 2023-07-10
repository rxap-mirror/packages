import {
  mixin,
  Mixin,
} from './mixin';
import {
  getMetadata,
  hasMetadata,
  setMetadata,
} from '@rxap/reflect-metadata';

describe('Mixin', () => {

  describe('@mixin', () => {

    class DisableFeature {

      public disabled = false;

      public disable(): void {
        this.disabled = true;
      }

      public enable(): void {
        this.disabled = false;
      }

    }

    class ValidateFeature {

      public get isInvalid(): boolean {
        return !this.isValid;
      }

      public isValid = true;

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      public validate(): void {
      }

    }

    it('should add mixin class to concrete class', () => {

      interface Concrete extends DisableFeature, ValidateFeature {
      }

      @mixin(DisableFeature, ValidateFeature)
      class Concrete {
      }

      const concrete = new Concrete();

      expect(typeof concrete.disable).toBe('function');
      expect(typeof concrete.enable).toBe('function');
      expect(typeof concrete.validate).toBe('function');
      expect(concrete).toHaveProperty('isInvalid');
      expect(concrete).not.toHaveProperty('isValid');
      expect(concrete).not.toHaveProperty('disabled');

    });

    // TODO : find a way to test this
    // it('should not change (Angular) injectable or providing functionality', () => {
    //
    //   interface Concrete extends DisableFeature, ValidateFeature {}
    //
    //   @mixin(DisableFeature, ValidateFeature)
    //   @Injectable()
    //   class Concrete {}
    //
    //   TestBed.resetTestingModule();
    //
    //   TestBed.configureTestingModule({
    //     providers: [
    //       Concrete
    //     ]
    //   });
    //
    //   const concrete = TestBed.get(Concrete);
    //
    //   expect(typeof concrete.disable).toBe('function');
    //   expect(typeof concrete.enable).toBe('function');
    //   expect(typeof concrete.validate).toBe('function');
    //   expect(concrete).toHaveProperty('isInvalid');
    //   expect(concrete).not.toHaveProperty('isValid');
    //   expect(concrete).not.toHaveProperty('disabled');
    //
    //
    // });

    it('should not overwrite methods', () => {

      interface Concrete extends DisableFeature, ValidateFeature {
      }

      @mixin(DisableFeature, ValidateFeature)
      class Concrete {

        public enabled = false;
        public disabled = true;

        public enable(): void {
          this.disabled = false;
          this.enabled = true;
        }

      }

      const concrete = new Concrete();

      expect(typeof concrete.disable).toBe('function');
      expect(typeof concrete.enable).toBe('function');
      expect(typeof concrete.validate).toBe('function');
      expect(concrete).toHaveProperty('isInvalid');
      expect(concrete).not.toHaveProperty('isValid');
      expect(concrete).toHaveProperty('disabled');
      expect(concrete).toHaveProperty('enabled');

      expect(concrete.disabled).toBeTruthy();
      expect(concrete.enabled).toBeFalsy();
      concrete.enable();
      expect(concrete.disabled).toBeFalsy();
      expect(concrete.enabled).toBeTruthy();

    });

    it('should be applied to child class', () => {

      interface Concrete extends DisableFeature, ValidateFeature {
      }

      @mixin(DisableFeature, ValidateFeature)
      class Concrete {
      }

      class Child extends Concrete {
      }

      const child = new Child();

      expect(typeof child.disable).toBe('function');
      expect(typeof child.enable).toBe('function');
      expect(typeof child.validate).toBe('function');
      expect(child).toHaveProperty('isInvalid');
      expect(child).not.toHaveProperty('isValid');
      expect(child).not.toHaveProperty('disabled');

    });

    it('should apply parent mixin class', () => {

      class ChildDisableFeature extends DisableFeature {

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public getChildren() {
        }

      }

      // eslint-disable-next-line @typescript-eslint/no-empty-interface
      interface Concrete extends ChildDisableFeature {
      }

      @mixin(ChildDisableFeature)
      class Concrete {
      }

      const concrete = new Concrete();

      expect(typeof concrete.disable).toBe('function');
      expect(typeof concrete.enable).toBe('function');
      expect(concrete).not.toHaveProperty('isValid');
      expect(concrete).not.toHaveProperty('disabled');

    });

    describe('Mixin with metadata', () => {

      function AddMetadata(data: any) {
        return function (target: any) {
          setMetadata('metadata', data, target);
          setMetadata('metadata', data, target.prototype);
        };
      }

      class WithMetadata {
      }

      it('should copy metadata', () => {

        AddMetadata({data: true})(WithMetadata);

        @Mixin(WithMetadata)
        class Target {
        }

        expect(hasMetadata('metadata', Target)).toBeTruthy();
        expect(hasMetadata('metadata', Target.prototype)).toBeTruthy();
        expect(getMetadata('metadata', Target)).toEqual({data: true});
        expect(getMetadata('metadata', Target.prototype)).toEqual({data: true});

      });

      it('should merge object metadata', () => {

        AddMetadata({data: true})(WithMetadata);

        @Mixin(WithMetadata)
        @AddMetadata({local: true})
        class Target {
        }

        expect(hasMetadata('metadata', Target)).toBeTruthy();
        expect(hasMetadata('metadata', Target.prototype)).toBeTruthy();
        expect(getMetadata('metadata', Target)).toEqual({data: true, local: true});
        expect(getMetadata('metadata', Target.prototype)).toEqual({data: true, local: true});

      });

      it('should merge array metadata', () => {

        AddMetadata(['item1'])(WithMetadata);

        @Mixin(WithMetadata)
        @AddMetadata(['item2'])
        class Target {
        }

        expect(hasMetadata('metadata', Target)).toBeTruthy();
        expect(hasMetadata('metadata', Target.prototype)).toBeTruthy();
        expect(getMetadata('metadata', Target)).toContain('item1');
        expect(getMetadata('metadata', Target)).toContain('item2');
        expect(getMetadata('metadata', Target.prototype)).toContain('item1');
        expect(getMetadata('metadata', Target.prototype)).toContain('item2');

      });

    });

  });

});
