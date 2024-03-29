import {
  COMMA,
  ENTER,
} from '@angular/cdk/keycodes';
import {
  Directive,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatChipInput } from '@angular/material/chips';
import { unique } from '@rxap/utilities';
import { Subscription } from 'rxjs';
import {
  filter,
  tap,
} from 'rxjs/operators';

@Directive({
  selector: '[matChipInputFor][rxapChipInputAdapter]',
  standalone: true,
})
export class ChipInputAdapterDirective implements OnDestroy, OnInit {
  private _subscription?: Subscription;

  constructor(
    private readonly matChipInput: MatChipInput,
    private readonly ngControl: NgControl,
  ) {
    this.matChipInput.separatorKeyCodes = [ ENTER, COMMA ] as const;
    this.matChipInput.addOnBlur = true;
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngOnInit() {
    this._subscription = this.matChipInput.chipEnd
                             .pipe(
                               filter((add) => !!add.value?.trim()),
                               tap((add) => {
                                 const value = this.ngControl.value ?? [];
                                 this.ngControl.control?.setValue(
                                   [ ...value, add.value ].filter(unique()),
                                 );
                                 this.matChipInput.clear();
                               }),
                             )
                             .subscribe();
  }
}


