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
  DebounceCall
} from '@rxap/utilities';

@Directive({
  selector: '[rxapContenteditable]'
})
export class ContenteditableDirective {

  @HostBinding('attr.contenteditable')
  public contenteditable = true;

  @Input()
  public method?: Method<any, string | null>;

  @Output()
  public change = new EventEmitter<string | null>();

  @HostListener('click', [ '$event' ])
  public onClick($event: Event) {
    $event.stopPropagation();
  }

  @HostListener('input', [ '$event' ])
  @DebounceCall(1000)
  public onInput($event: any) {
    const value = ($event.target as HTMLElement).textContent;
    this.method?.call(value);
    this.change.emit(value);
  }

}

@NgModule({
  declarations: [ ContenteditableDirective ],
  exports:      [ ContenteditableDirective ]
})
export class ContenteditableDirectiveModule {}
