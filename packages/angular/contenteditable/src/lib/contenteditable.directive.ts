import {
  Directive,
  HostBinding,
  HostListener,
  Input,
  output
} from '@angular/core';
import {
  coerceBoolean,
  DebounceCall,
} from '@rxap/utilities';
import { Method } from '@rxap/pattern';

@Directive({
  selector: '[rxapContenteditable]',
  standalone: true,
})
export class ContenteditableDirective {

  @HostBinding('attr.contenteditable')
  public contenteditable = true;
  // eslint-disable-next-line @angular-eslint/no-output-native
public readonly change = output<string | null>();

  private _method?: Method<any, string | null>;

  // allow empty string
  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input('rxapContenteditable')
  public set method(value: Method<any, string | null> | '') {
    if (value) {
      this._method = value;
    }
  }

  private _disabled = false;

  // TODO: Skipped for migration because:
  //  Accessor inputs cannot be migrated as they are too complex.
  @Input()
  public set disabled(value: boolean | '') {
    this._disabled = coerceBoolean(value);
    this.contenteditable = !this._disabled;
  }

  @HostListener('click', [ '$event' ])
  public onClick($event: Event) {
    $event.stopPropagation();
  }

  @HostListener('input', [ '$event' ])
  @DebounceCall(1000)
  public onInput($event: any) {
    const value = ($event.target as HTMLElement).textContent;
    if (!this._disabled) {
      this._method?.call(value);
      this.change.emit(value);
    }
  }

}


