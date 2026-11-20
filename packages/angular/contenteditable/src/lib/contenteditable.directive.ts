import {
  computed,
  Directive,
  input,
  output,
} from '@angular/core';
import {
  coerceBoolean,
  DebounceCall,
} from '@rxap/utilities';
import { Method } from '@rxap/pattern';

@Directive({
  selector: '[rxapContenteditable]',
  standalone: true,
  host: {
    '[attr.contenteditable]': 'contenteditable()',
    '(click)': 'onClick($event)',
    '(input)': 'onInput($event)',
  },
})
export class ContenteditableDirective {

  // eslint-disable-next-line @angular-eslint/no-output-native
  public readonly change = output<string | null>();

  // allow empty string
  public readonly method = input<Method<any, string | null> | '' | undefined>(undefined, { alias: 'rxapContenteditable' });

  public readonly disabled = input(false, { transform: (value: boolean | '') => coerceBoolean(value) });

  public readonly contenteditable = computed(() => !this.disabled());

  public onClick($event: Event) {
    $event.stopPropagation();
  }

  @DebounceCall(1000)
  public onInput($event: any) {
    const value = ($event.target as HTMLElement).textContent;
    if (!this.disabled()) {
      const method = this.method();
      if (method) {
        method.call(value);
      }
      this.change.emit(value);
    }
  }

}
