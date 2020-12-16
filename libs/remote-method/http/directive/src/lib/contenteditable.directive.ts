import {
  Directive,
  Input,
  HostListener,
  NgModule,
  HostBinding
} from '@angular/core';
import {
  Required,
  DebounceCall
} from '@rxap/utilities';
import { HttpRemoteMethodLoader } from '@rxap/remote-method/http';

@Directive({
  selector: '[rxapContenteditable]'
})
export class ContenteditableDirective {

  @HostBinding('attr.contenteditable')
  public contenteditable = true;

  @Input('rxapContenteditable')
  @Required
  public remoteMethodId!: string;

  @Input()
  @Required
  public property!: string;

  @Input()
  @Required
  public uuid!: string;

  constructor(private readonly httpRemoteMethodLoader: HttpRemoteMethodLoader) { }

  @HostListener('click', [ '$event' ])
  public onClick($event: Event) {
    $event.stopPropagation();
  }

  @HostListener('input', [ '$event' ])
  @DebounceCall(1000)
  public onInput($event: any) {
    const value = ($event.target as HTMLElement).textContent;
    if (value && value.length > 3) {
      return this.httpRemoteMethodLoader.request$(
        this.remoteMethodId,
        {
          pathParams: { uuid: this.uuid },
          body:       { [ this.property ]: value }
        }
      );
    }
    return Promise.resolve();
  }

}

/**
 * @deprecated removed
 */
@NgModule({
  declarations: [ ContenteditableDirective ],
  exports:      [ ContenteditableDirective ]
})
export class ContenteditableDirectiveModule {}
