import { Directive, input, inject } from '@angular/core';
import {
  DebounceCall,
  Required,
} from '@rxap/utilities';
import { HttpRemoteMethodLoader } from '@rxap/remote-method/http';

@Directive({
  selector: '[rxapContenteditable]',
  standalone: true,
  host: {
    '[attr.contenteditable]': 'contenteditable',
    '(click)': 'onClick($event)',
    '(input)': 'onInput($event)',
  },
})
export class ContenteditableDirective {
  private readonly httpRemoteMethodLoader = inject<HttpRemoteMethodLoader>(HttpRemoteMethodLoader);

  public contenteditable = true;

  public readonly remoteMethodId = input.required<string>({ alias: "rxapContenteditable" });

  public readonly property = input.required<string>();

  public readonly uuid = input.required<string>();

  public onClick($event: Event) {
    $event.stopPropagation();
  }

  @DebounceCall(1000)
  public onInput($event: any) {
    const value = ($event.target as HTMLElement).textContent;
    if (value && value.length > 3) {
      return this.httpRemoteMethodLoader.request$(this.remoteMethodId(), {
        pathParams: { uuid: this.uuid() },
        body: { [this.property()]: value },
      });
    }
    return Promise.resolve();
  }
}

/**
 * @deprecated removed
 */

