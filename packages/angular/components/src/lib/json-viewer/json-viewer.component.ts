import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, forwardRef, isDevMode, signal, untracked, input, inject } from '@angular/core';
import { isTeardownLogic } from '@rxap/rxjs';
import {
  clone,
  isPromiseLike,
} from '@rxap/utilities';
import { Subscription } from 'rxjs';
import {
  JSON_VIEW_IGNORED_PROPERTIES,
  JSON_VIEW_IGNORED_TYPES,
} from './json-viewer.tokens';

export interface Segment {
  key: string;
  value: any;
  type: undefined | string;
  description: string;
  expanded: boolean;
}

@Component({
    selector: 'rxap-json-viewer',
    templateUrl: './json-viewer.component.html',
    styleUrls: ['./json-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'rxap-json-viewer' },
    imports: [NgClass, forwardRef(() => JsonViewerComponent)]
})
export class JsonViewerComponent {

  public readonly json = input<object | Record<string | number | symbol, unknown>>({});
  public readonly expanded = input(false);

  public readonly inspectValue = signal<any>(undefined);

  public ignoredProperties: Array<string | RegExp> = [];
  public ignoredTypes: any[] = [];

  public subscriptions = new Subscription();

  public readonly segments = signal<Segment[]>([]);

  constructor() {
    const ignoredProperties = inject<Array<string | RegExp | Array<string | RegExp>>>(JSON_VIEW_IGNORED_PROPERTIES);
    const ignoredTypes = inject<Array<any | any[]>>(JSON_VIEW_IGNORED_TYPES);

    function flat(acc: any[], cur: any | any[]): any[] {
      if (Array.isArray(cur)) {
        acc.push(...cur.reduce(flat, []));
      } else {
        acc.push(cur);
      }

      return acc;
    }

    this.ignoredProperties = ignoredProperties.reduce(flat, []);
    this.ignoredTypes = ignoredTypes.reduce(flat, []);

    effect(() => {
      const json = this.json();
      untracked(() => {
        if (isDevMode() && this.initialized) {
          console.debug('json change');
        }
        this.initialized = true;
        this.setInspectValue(json);
      });
    });
  }

  private initialized = false;

  public cleanObject(obj: any, stack: any[] = []): any {
    if (typeof obj === 'string') {
      return obj;
    }
    if (stack.some(item => item === obj)) {
      return '__circular__';
    }
    stack = stack.slice();
    stack.unshift(obj);
    return Object
      .entries(obj)
      .filter(([ key, value ]) => !isPromiseLike(value))
      .filter(([ key, value ]) => !isTeardownLogic(value))
      .filter(([ key, value ]) => this.ignoredProperties.every(ip => typeof ip === 'string' ?
        key !== ip :
        !key.match(ip)))
      .filter(([ key, value ]) => [ ...this.ignoredTypes ].every(type => !(value instanceof type)))
      .map(([ key, value ]) => {
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            return [ key, value.map(item => this.cleanObject(item, stack)) ];
          }
          if (typeof value === 'object') {
            return [ key, this.cleanObject(value, stack) ];
          }
        }
        return [ key, value ];
      })
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((controlView, [ key, value ]) => ({
        ...controlView,
        [key]: value,
      }), {});
  }

  public setInspectValue(json: any): void {
    if (typeof json !== 'object' || json === null || json === undefined) {
      console.warn('The inspection value is not an object!');
    } else {
      if (typeof json['toJSON'] === 'function') {
        json = json.toJSON();
      }
      const inspectValue = this.cleanObject(clone(json));
      this.inspectValue.set(inspectValue);
      this.buildSegments(inspectValue);
    }
  }

  public buildSegments(inspectValue: any) {
    if (typeof inspectValue === 'object') {
      this.segments.set(Object.keys(inspectValue).map(key => this.parseKeyValue(key, inspectValue[key])));
    } else {
      this.segments.set([ this.parseKeyValue(`(${ typeof inspectValue })`, inspectValue) ]);
    }
  }

  public isExpandable(segment: Segment) {
    return segment.type === 'object' || segment.type === 'array';
  }

  public toggle(segment: Segment) {
    if (this.isExpandable(segment)) {
      segment.expanded = !segment.expanded;
      this.segments.update(segments => [ ...segments ]);
    }
  }

  private parseKeyValue(key: any, value: any): Segment {
    const segment: Segment = {
      key: key,
      value: value,
      type: undefined,
      description: '' + value,
      expanded: this.expanded(),
    };

    switch (typeof segment.value) {
      case 'number': {
        segment.type = 'number';
        break;
      }
      case 'boolean': {
        segment.type = 'boolean';
        break;
      }
      case 'function': {
        segment.type = 'function';
        break;
      }
      case 'string': {
        segment.type = 'string';
        segment.description = '"' + segment.value + '"';
        break;
      }
      case 'undefined': {
        segment.type = 'undefined';
        segment.description = 'undefined';
        break;
      }
      case 'object': {
        // yea, null is object
        if (segment.value === null) {
          segment.type = 'null';
          segment.description = 'null';
        } else if (Array.isArray(segment.value)) {
          segment.type = 'array';
          segment.description = 'Array[' + segment.value.length + '] ' + JSON.stringify(segment.value);
        } else if (segment.value instanceof Date) {
          segment.type = 'date';
        } else {
          segment.type = 'object';
          segment.description = 'Object ' + JSON.stringify(segment.value);
        }
        break;
      }
    }

    return segment;
  }

}
