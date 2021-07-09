import {
  Directive,
  Input,
  HostListener,
  NgModule,
  HostBinding,
  EventEmitter,
  Output
} from '@angular/core';
import { DebounceCall } from '@rxap/utilities';
import { Method } from '@rxap/utilities/rxjs';

export interface ContenteditableEvent {
  value: string;
  parameters?: any;
}

@Directive({
  selector: '[rxapContenteditable]'
})
export class ContenteditableDirective {

  @HostBinding('attr.contenteditable')
  public contenteditable = true;

  @Input('rxapContenteditable')
  public method?: Method<any, ContenteditableEvent>;

  @Output('rxapContenteditable')
  public change = new EventEmitter<ContenteditableEvent>();

  @Input()
  public parameters?: any;

  @HostListener('click', [ '$event' ])
  public onClick($event: Event) {
    $event.stopPropagation();
  }

  @HostListener('input', [ '$event' ])
  @DebounceCall(1000)
  public async onInput($event: any) {
    const value = ($event.target as HTMLElement).textContent;
    if (value && value.length > 3) {
      const event: ContenteditableEvent = {
        value,
        parameters: this.parameters
      };
      this.change.emit(event);
      await this.method?.call(event);
    }
  }

}

@NgModule({
  declarations: [ ContenteditableDirective ],
  exports:      [ ContenteditableDirective ]
})
export class ContenteditableDirectiveModule {}
