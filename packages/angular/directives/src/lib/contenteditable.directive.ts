import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { DebounceCall } from '@rxap/utilities';
import { Method } from '@rxap/pattern';

export interface ContenteditableEvent {
  value: string;
  parameters?: any;
}

@Directive({
  selector: '[rxapContenteditable]',
  standalone: true,
})
export class ContenteditableDirective {

  @HostBinding('attr.contenteditable')
  public contenteditable = true;

  @HostBinding('attr.spellcheck')
  public spellcheck = false;

  @Input('rxapContenteditable')
  public method?: Method<any, ContenteditableEvent>;

  @Output('rxapContenteditable')
  // eslint-disable-next-line @angular-eslint/no-output-native
  public change = new EventEmitter<ContenteditableEvent>();

  @Input()
  public parameters?: any;

  @Input()
  public initial?: string;

  constructor(private readonly elementRef: ElementRef) {
  }

  @HostListener('click', [ '$event' ])
  public onClick($event: Event) {
    $event.stopPropagation();
  }

  @HostListener('input', [ '$event' ])
  @DebounceCall(1000)
  public async onInput($event: any) {
    const value = (($event.target as HTMLElement).textContent)?.trim();
    if (value && value.length >= 2) {
      const event: ContenteditableEvent = {
        value,
        parameters: this.parameters,
      };
      this.change.emit(event);
      try {
        const result = await this.method?.call(event);
        if (result && typeof result === 'string') {
          // the handler returned a canonical value - apply and remember it
          this.initial = this.elementRef.nativeElement.innerText = result;
        } else {
          // successful save without a return value - keep the user's text and
          // update the baseline (do NOT revert what was just typed)
          this.initial = value;
        }
      } catch {
        // the save failed - revert to the last known good value if available
        if (this.initial) {
          this.elementRef.nativeElement.innerText = this.initial;
        }
      }
    }
  }

}



