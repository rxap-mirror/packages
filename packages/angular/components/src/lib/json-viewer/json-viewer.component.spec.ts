import { TestBed } from '@angular/core/testing';

import { JsonViewerComponent } from './json-viewer.component';
import { ChangeDetectorRef } from '@angular/core';
import { EMPTY } from 'rxjs';

describe('JsonViewerComponent', () => {
  let component: JsonViewerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JsonViewerComponent,
        {
          provide: ChangeDetectorRef,
          useValue: {
            markForCheck: () => {
            },
          },
        },
      ],
    });

    component = TestBed.get(JsonViewerComponent);
  });

  it('create', () => {

    expect(component.ignoredProperties.length !== 0).toBeTruthy();
    expect(component.ignoredTypes.length !== 0).toBeTruthy();

  });

  it('should clean flat object', () => {

    expect(component.cleanObject({
      promise: Promise.resolve(),
      observable: EMPTY,
      async$: null,
    })).toEqual({});

  });

  it('should clean deep object', () => {

    expect(component.cleanObject({
      promise: Promise.resolve(),
      observable: EMPTY,
      async$: null,
      deep: {
        promise: Promise.resolve(),
        observable: EMPTY,
        async$: null,
        deep: {
          promise: Promise.resolve(),
          observable: EMPTY,
          async$: null,
        },
      },
    })).toEqual({ deep: { deep: {} } });

  });

  it('should clean circular object', () => {

    const obj3: any = {};

    const obj2 = {
      promise: Promise.resolve(),
      observable: EMPTY,
      async$: null,
      obj3,
    };

    const obj1 = {
      promise: Promise.resolve(),
      observable: EMPTY,
      async$: null,
      obj2,
    };

    obj3.promise = Promise.resolve();
    obj3.obj1 = obj1;

    expect(component.cleanObject(obj1)).toEqual({ obj2: { obj3: { obj1: '__circular__' } } });

  });

  describe('setInspectValue', () => {

    it('should call toJSON method if defined', () => {

      const obj = {
        name: 'name',
        age: 4,
        type: 'person',
        toJSON() {
          return 'toJSON';
        },
      };

      component.setInspectValue(obj);

      expect(component.inspectValue).toEqual('toJSON');

    });

    it('should use cleanObject if toJSON method is not defined', () => {

      const obj = {
        name: 'name',
        age: 4,
        type: 'person',
      };

      const cleanObjectSpy = jest.spyOn(component, 'cleanObject');

      component.setInspectValue(obj);

      expect(cleanObjectSpy).toBeCalledTimes(1);

    });

    it('should not use cleanObject if object is not an object', () => {

      const cleanObjectSpy = jest.spyOn(component, 'cleanObject');

      component.setInspectValue(undefined);
      component.setInspectValue(null);
      component.setInspectValue(true);
      component.setInspectValue('value');
      component.setInspectValue(34);

      expect(cleanObjectSpy).not.toBeCalled();

    });

  });

});
