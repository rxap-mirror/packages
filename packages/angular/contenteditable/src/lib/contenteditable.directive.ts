import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
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
  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-native
  public change = new EventEmitter<string | null>();

  private _method?: Method<any, string | null>;

  // allow empty string
  @Input('rxapContenteditable')
  public set method(value: Method<any, string | null> | '') {
    if (value) {
      this._method = value;
    }
  }

  private _disabled = false;

  @Input()
  public set disabled(value: boolean | '') {
    this._disabled = coerceBoolean(value);
    this.contenteditable = !this._disabled;
  }

  @HostListener('click', ['$event'])
  public onClick($event: Event) {
    $event.stopPropagation();
  }

  @HostListener('input', ['$event'])
  @DebounceCall(1000)
  public onInput($event: any) {
    const value = ($event.target as HTMLElement).textContent;
    if (!this._disabled) {
      this._method?.call(value);
      this.change.emit(value);
    }
  }

}


