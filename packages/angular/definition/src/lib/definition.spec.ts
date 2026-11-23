import { Injector, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BaseDefinition } from './definition';
import { DefinitionLoader } from './definition.loader';
import {
  DefinitionMetadata,
  GetDefinitionClassName,
  GetDefinitionMetadata,
  GetDefinitionPackageName,
} from './definition.metadata';
import { RxapDefinitionError } from './error';
import { RXAP_DEFINITION_METADATA } from './tokens';

@DefinitionMetadata({ id: 'decorated', extra: { a: 1, b: 2 } }, 'Decorated', '@rxap/test')
class DecoratedDefinition extends BaseDefinition {}

@DefinitionMetadata('string-id', 'StringId', '@rxap/test')
class StringIdDefinition extends BaseDefinition {}

class UndecoratedDefinition extends BaseDefinition {}

describe('definition', () => {

  beforeEach(() => {
    BaseDefinition.instances.clear();
  });

  describe('metadata helpers', () => {
    it('stores metadata, class name and package name', () => {
      expect(GetDefinitionMetadata(DecoratedDefinition)).toEqual({ id: 'decorated', extra: { a: 1, b: 2 } });
      expect(GetDefinitionClassName(DecoratedDefinition)).toBe('Decorated');
      expect(GetDefinitionPackageName(DecoratedDefinition)).toBe('@rxap/test');
    });

    it('converts a string id to metadata', () => {
      expect(GetDefinitionMetadata(StringIdDefinition)).toEqual({ id: 'string-id' });
    });

    it('accepts instances', () => {
      const d = new DecoratedDefinition();
      expect(GetDefinitionMetadata(d)).toEqual({ id: 'decorated', extra: { a: 1, b: 2 } });
      expect(GetDefinitionClassName(d)).toBe('Decorated');
      expect(GetDefinitionPackageName(d)).toBe('@rxap/test');
    });

    it('returns null for undecorated classes', () => {
      expect(GetDefinitionMetadata(UndecoratedDefinition)).toBeNull();
      expect(GetDefinitionClassName(UndecoratedDefinition)).toBeNull();
    });
  });

  describe('BaseDefinition', () => {
    it('uses decorator metadata and exposes id', () => {
      const d = new DecoratedDefinition();
      expect(d.id).toBe('decorated');
      expect(d.getMetadata()).toEqual(d.metadata);
    });

    it('merges injected metadata over decorator metadata', () => {
      const d = new DecoratedDefinition({ id: 'override', extra: { b: 3 } });
      expect(d.id).toBe('override');
      expect(d.metadata['extra']).toEqual({ a: 1, b: 3 });
    });

    it('uses injected metadata when no decorator is present', () => {
      const d = new UndecoratedDefinition({ id: 'injected' });
      expect(d.id).toBe('injected');
    });

    it('throws when no metadata is available', () => {
      expect(() => new UndecoratedDefinition()).toThrow(RxapDefinitionError);
      expect(() => new UndecoratedDefinition()).toThrow('Definition metadata is not defined');
    });

    it('applyMetadata merges partial metadata', () => {
      const d = new DecoratedDefinition();
      d.applyMetadata({ extra: { b: 9 } });
      expect(d.metadata['extra']).toEqual({ a: 1, b: 9 });
      expect(d.id).toBe('decorated');
    });

    it('is created via DI with RXAP_DEFINITION_METADATA', () => {
      TestBed.configureTestingModule({
        providers: [
          DecoratedDefinition,
          { provide: RXAP_DEFINITION_METADATA, useValue: { id: 'di' } },
        ],
      });
      expect(TestBed.inject(DecoratedDefinition).id).toBe('di');
    });

    it('init registers once, calls ngOnInit and emits', () => {
      const ngOnInit = vi.fn();
      class WithInit extends DecoratedDefinition {
        ngOnInit = ngOnInit;
      }
      const d = new WithInit();
      const instInit = vi.fn();
      const staticInit = vi.fn();
      d.initialised$?.subscribe(instInit);
      const sub = BaseDefinition.initialised$.subscribe(staticInit);

      d.init();
      d.init();

      expect(ngOnInit).toHaveBeenCalledTimes(1);
      expect(instInit).toHaveBeenCalledTimes(1);
      expect(staticInit).toHaveBeenCalledWith(d);
      expect(BaseDefinition.instances.get(d.__id)).toBe(d);
      sub.unsubscribe();
    });

    it('init works without ngOnInit', () => {
      const d = new DecoratedDefinition();
      expect(() => d.init()).not.toThrow();
    });

    it('ngOnDestroy and destroy remove the instance and emit', () => {
      const d = new DecoratedDefinition();
      d.init();
      const destroyed = vi.fn();
      const staticDestroyed = vi.fn();
      d.destroyed$?.subscribe(destroyed);
      const sub = BaseDefinition.destroyed$.subscribe(staticDestroyed);

      d.ngOnDestroy();
      expect(BaseDefinition.instances.has(d.__id)).toBe(false);
      expect(destroyed).toHaveBeenCalledTimes(1);
      expect(staticDestroyed).toHaveBeenCalledWith(d);

      d.init(); // already initialised: no re-registration
      d.destroy();
      expect(destroyed).toHaveBeenCalledTimes(2);
      sub.unsubscribe();
    });

    it('generates unique ids', () => {
      expect(new DecoratedDefinition().__id).not.toBe(new DecoratedDefinition().__id);
    });
  });

  describe('DefinitionLoader', () => {
    let loader: DefinitionLoader;

    beforeEach(() => {
      loader = TestBed.inject(DefinitionLoader);
    });

    it('rejects string ids', () => {
      expect(() => loader.load('abc')).toThrow(RxapDefinitionError);
    });

    it('returns an instance and applies metadata', () => {
      const d = new DecoratedDefinition();
      expect(loader.load(d, { extra: { b: 5 } })).toBe(d);
      expect(d.metadata['extra']).toEqual({ a: 1, b: 5 });
    });

    it('returns an instance unchanged without metadata', () => {
      const d = new DecoratedDefinition();
      const spy = vi.spyOn(d, 'applyMetadata');
      expect(loader.load(d)).toBe(d);
      expect(spy).not.toHaveBeenCalled();
    });

    it('resolves a token from the default injector', () => {
      const token = new InjectionToken<BaseDefinition>('t');
      const d = new DecoratedDefinition();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [{ provide: token, useValue: d }] });
      expect(TestBed.inject(DefinitionLoader).load(token)).toBe(d);
    });

    it('uses a custom injector and notFoundValue', () => {
      const token = new InjectionToken<BaseDefinition>('t2');
      const fallback = new DecoratedDefinition();
      const injector = Injector.create({ providers: [] });
      expect(loader.load(token, undefined, injector, fallback)).toBe(fallback);
    });
  });
});
