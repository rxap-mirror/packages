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
import { Showcase } from '@ng-prism/core';

@Showcase<ContenteditableDirective>({
  title: 'Contenteditable',
  category: 'Content Editing',
  description: 'Makes the text content of an element editable. The change output emits the new text one second after the last input.',
  status: 'stable',
  host: '<p style="min-width: 240px; padding: 4px; border: 1px dashed currentColor">Click here to edit this text</p>',
  variants: [
    { name: 'Editable' },
    { name: 'Disabled', inputs: { disabled: true } },
  ],
})
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
