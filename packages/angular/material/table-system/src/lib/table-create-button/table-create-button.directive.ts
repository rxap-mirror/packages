import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Required } from '@rxap/utilities';
import {
  isObservable,
  Observable,
  Subject,
} from 'rxjs';
import { TableDataSourceDirective } from '../table-data-source.directive';
import { TABLE_CREATE_REMOTE_METHOD } from './tokens';
import { Method } from '@rxap/pattern';

@Directive({
  selector: 'button[rxapTableCreate]',
  standalone: true,
})
export class TableCreateButtonDirective<Data extends Record<string, any>>
  implements OnInit, OnDestroy {
  @Input({
    required: true,
    alias: 'rxapTableCreate',
  })
  public dataSource!: TableDataSourceDirective<Data>;

  private _createObservable?: Observable<any>;

  constructor(
    @Inject(TABLE_CREATE_REMOTE_METHOD)
    private readonly remoteMethod: Method<any, Data | Observable<Data>>,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef,
    @Inject(Renderer2)
    private readonly renderer: Renderer2,
  ) {
  }

  public ngOnInit() {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'margin-bottom',
      '6px',
    );
  }

  public ngOnDestroy() {
    if (this._createObservable instanceof Subject) {
      this._createObservable.complete();
    }
  }

  @HostListener('click')
  public async onClick() {
    const result = this._createObservable = await this.remoteMethod.call();
    if (isObservable(result)) {
      await result.toPromise();
    }
    this.dataSource.refresh();
  }
}


