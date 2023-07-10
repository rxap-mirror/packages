import {Directive, Inject, Input, isDevMode, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {equals, getFromObject} from '@rxap/utilities';

@Directive({
  selector: 'mat-select[rxapCompareWith]',
  standalone: true,
})
export class CompareWithDirective implements OnInit {
  @Input('rxapCompareWith')
  public objectPath!: string;

  constructor(
    @Inject(MatSelect)
    private readonly matSelect: MatSelect,
  ) {
  }

  public ngOnInit() {
    this.matSelect.compareWith = this.compareWith.bind(this);
  }

  private compareWith(o1: any, o2: any): boolean {
    if (this.objectPath) {
      if (typeof o1 !== 'object' || typeof o2 !== 'object') {
        if (isDevMode()) {
          console.warn(
            'At least one of the select options value is not an object',
          );
        }
        return false;
      }
      if (o1 === null || o1 === undefined || o2 === null || o2 === undefined) {
        if (isDevMode()) {
          console.warn(
            'At least one of the select options value is undefined or null',
          );
        }
        return false;
      }
      const o1Value = getFromObject(o1, this.objectPath);
      const o2Value = getFromObject(o2, this.objectPath);
      if (o1Value === undefined || o2Value === undefined) {
        return false;
      }
      return o1Value === o2Value;
    } else {
      return equals(o1, o2);
    }
  }
}


