import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  NgModule,
  OnInit,
  Renderer2
} from '@angular/core';
import { Required } from '@rxap/utilities';
import {
  isObservable,
  Observable
} from 'rxjs';
import { TableDataSourceDirective } from '../table-data-source.directive';
import { TABLE_CREATE_REMOTE_METHOD } from './tokens';
import { Method } from '@rxap/utilities/rxjs';

@Directive({
  selector: 'button[rxapTableCreate]',
})
export class TableCreateButtonDirective<Data extends Record<string, any>>
  implements OnInit
{
  @Input('rxapTableCreate')
  @Required
  public dataSource!: TableDataSourceDirective<Data>;

  constructor(
    @Inject(TABLE_CREATE_REMOTE_METHOD)
    private readonly remoteMethod: Method<any, Data | Observable<Data>>,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef,
    @Inject(Renderer2)
    private readonly renderer: Renderer2
  ) {}

  public ngOnInit() {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'margin-bottom',
      '6px'
    );
  }

  @HostListener('click')
  public async onClick() {
    const result = await this.remoteMethod.call();
    if (isObservable(result)) {
      await result.toPromise();
    }
    this.dataSource.refresh();
  }
}

@NgModule({
  declarations: [TableCreateButtonDirective],
  exports: [TableCreateButtonDirective],
})
export class TableCreateButtonDirectiveModule {}
