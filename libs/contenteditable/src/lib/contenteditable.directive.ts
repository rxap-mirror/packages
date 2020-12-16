import {
  Directive,
  NgModule,
  HostBinding,
  Input,
  EventEmitter,
  Output,
  HostListener
} from '@angular/core';
import {
  Method,
  DebounceCall,
  coerceBoolean
} from '@rxap/utilities';

@Directive({
  selector: '[rxapContenteditable]'
})
export class ContenteditableDirective {

  @HostBinding('attr.contenteditable')
  public contenteditable = true;

  // allow empty string
  @Input('rxapContenteditable')
  public set method(value: Method<any, string | null> | '') {
    if (value) {
      this._method = value;
    }
  }

  private _method?: Method<any, string | null>;

  @Output()
  public change = new EventEmitter<string | null>();

  @Input()
  public set disabled(value: boolean | '') {
    this._disabled       = coerceBoolean(value);
    this.contenteditable = !this._disabled;
  }

  private _disabled = false;

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

@NgModule({
  declarations: [ ContenteditableDirective ],
  exports:      [ ContenteditableDirective ]
})
export class ContenteditableDirectiveModule {}
