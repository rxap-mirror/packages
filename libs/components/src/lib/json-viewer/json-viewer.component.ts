import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  Inject,
  ChangeDetectorRef,
  forwardRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  isPromiseLike,
  clone
} from '@rxap/utilities';
import {
  JSON_VIEW_IGNORED_PROPERTIES,
  JSON_VIEW_IGNORED_TYPES
} from './json-viewer.tokens';
import { isTeardownLogic } from '@rxap/utilities/rxjs';
import {
  NgFor,
  NgClass,
  NgIf
} from '@angular/common';

export interface Segment {
  key: string;
  value: any;
  type: undefined | string;
  description: string;
  expanded: boolean;
}

@Component({
  selector:        'rxap-json-viewer',
  templateUrl:     './json-viewer.component.html',
  styleUrls:       [ './json-viewer.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-json-viewer' },
  standalone:      true,
  imports:         [ NgFor, NgClass, NgIf, forwardRef(() => JsonViewerComponent) ]
})
export class JsonViewerComponent implements OnInit, OnChanges {

  // TODO : add object input. The json input will not be cleaned
  @Input() public json: any;
  @Input() public expanded: any;

  public inspectValue: any;

  public ignoredProperties: Array<string | RegExp> = [];
  public ignoredTypes: any[]                       = [];

  public subscriptions = new Subscription();

  public segments: Segment[] = [];

  constructor(
    @Inject(JSON_VIEW_IGNORED_PROPERTIES) ignoredProperties: Array<string | RegExp | Array<string | RegExp>>,
    @Inject(JSON_VIEW_IGNORED_TYPES) ignoredTypes: Array<any | any[]>,
    @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef
  ) {
    function flat(acc: any[], cur: any | any[]): any[] {
      if (Array.isArray(cur)) {
        acc.push(...cur.reduce(flat, []));
      } else {
        acc.push(cur);
      }

      return acc;
    }

    this.ignoredProperties = ignoredProperties.reduce(flat, []);
    this.ignoredTypes      = ignoredTypes.reduce(flat, []);
  }

  public ngOnInit() {
    this.setInspectValue(this.json);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const jsonChange = changes[ 'json' ];
    if (jsonChange) {
      this.setInspectValue(jsonChange.currentValue);
    }
  }

  public cleanObject(obj: any, stack: any[] = []): any {
    if (stack.some(item => item === obj)) {
      return '__circular__';
    }
    stack = stack.slice();
    stack.unshift(obj);
    return Object
      .entries(obj)
      .filter(([ key, value ]) => !isPromiseLike(value))
      .filter(([ key, value ]) => !isTeardownLogic(value))
      .filter(([ key, value ]) => this.ignoredProperties.every(ip => typeof ip === 'string' ? key !== ip : !key.match(ip)))
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
      .sort((a, b) => a[ 0 ].localeCompare(b[ 0 ]))
      .reduce((controlView, [ key, value ]) => ({ ...controlView, [ key ]: value }), {});
  }

  public setInspectValue(json: any): void {
    if (typeof json !== 'object' || json === null || json === undefined) {
      console.warn('The inspection value is not an object!');
    } else {
      json = clone(json);
      let inspectValue: any;
      if (typeof json[ 'toJSON' ] === 'function') {
        inspectValue = json.toJSON();
      } else {
        inspectValue = this.cleanObject(json);
      }
      this.inspectValue = inspectValue;
      this.buildSegments(this.inspectValue);
      this.cdr.markForCheck();
    }
  }

  public buildSegments(inspectValue: any) {
    this.segments = [];

    if (typeof inspectValue === 'object') {
      Object.keys(inspectValue).forEach(key => {
        this.segments.push(this.parseKeyValue(key, inspectValue[ key ]));
      });
    } else {
      this.segments.push(this.parseKeyValue(`(${typeof inspectValue})`, inspectValue));
    }
  }

  public isExpandable(segment: Segment) {
    return segment.type === 'object' || segment.type === 'array';
  }

  public toggle(segment: Segment) {
    if (this.isExpandable(segment)) {
      segment.expanded = !segment.expanded;
    }
  }

  private parseKeyValue(key: any, value: any): Segment {
    const segment: Segment = {
      key:         key,
      value:       value,
      type:        undefined,
      description: '' + value,
      expanded:    this.expanded
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
        segment.type        = 'string';
        segment.description = '"' + segment.value + '"';
        break;
      }
      case 'undefined': {
        segment.type        = 'undefined';
        segment.description = 'undefined';
        break;
      }
      case 'object': {
        // yea, null is object
        if (segment.value === null) {
          segment.type        = 'null';
          segment.description = 'null';
        } else if (Array.isArray(segment.value)) {
          segment.type        = 'array';
          segment.description = 'Array[' + segment.value.length + '] ' + JSON.stringify(segment.value);
        } else if (segment.value instanceof Date) {
          segment.type = 'date';
        } else {
          segment.type        = 'object';
          segment.description = 'Object ' + JSON.stringify(segment.value);
        }
        break;
      }
    }

    return segment;
  }

}
