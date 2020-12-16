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

  @Input('rxapContenteditable')
  public method?: Method<any, string | null>;

  @Output()
  public change = new EventEmitter<string | null>();

  @Input()
  public set disabled(value: boolean | '') {
    this._disabled = coerceBoolean(value);
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
      this.method?.call(value);
      this.change.emit(value);
    }
  }

}

@NgModule({
  declarations: [ ContenteditableDirective ],
  exports:      [ ContenteditableDirective ]
})
export class ContenteditableDirectiveModule {}
