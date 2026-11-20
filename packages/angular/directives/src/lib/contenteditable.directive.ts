import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  input,
  output
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

  public readonly method = input<Method<any, ContenteditableEvent>>(undefined, { alias: "rxapContenteditable" });

  // eslint-disable-next-line @angular-eslint/no-output-native
public readonly change = output<ContenteditableEvent>({ alias: 'rxapContenteditable' });

  public readonly parameters = input<any>();

  public readonly initial = input<string>();

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
        parameters: this.parameters(),
      };
      this.change.emit(event);
      try {
        const result = await this.method()?.call(event);
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
        const initial = this.initial();
        if (initial) {
          this.elementRef.nativeElement.innerText = initial;
        }
      }
    }
  }

}



