import {
  ChangeDetectorRef,
  Directive,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { Method } from '@rxap/utilities/rxjs';

export interface IfTruthyDirectiveTemplateContext<Data> {
  $implicit: Data;
}

// TODO : mv to rxap package

@Directive({
  selector: '[rxapIfTruthy]'
})
export class IfTruthyDirective<Data, Parameters = any> implements OnChanges {

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(
    dir: IfTruthyDirective<T>,
    ctx: any
  ): ctx is IfTruthyDirectiveTemplateContext<T> {
    return true;
  }

  @Input('rxapIfTruthy')
  public method!: Method<Data, Parameters>;
  @Input('rxapIfTruthyParameters')
  public parameters!: Parameters;
  @Input('rxapIfTruthyTrackBy')
  public trackBy!: (data: Data) => any;
  private _last?: Data;

  constructor(
    private readonly templateRef: TemplateRef<IfTruthyDirectiveTemplateContext<Data>>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  public ngOnChanges(changes: SimpleChanges) {

    if (this.method && this.parameters) {
      this.execute();
    }

  }

  protected async execute() {

    const result = await this.method.call(this.parameters);

    if (this.hasChanged(result)) {

      this.viewContainerRef.clear();

      if (result) {
        this.viewContainerRef.createEmbeddedView(this.templateRef, { $implicit: result });
      }

    }

    this.cdr.detectChanges();

  }

  protected hasChanged(current: Data) {
    if (this._last !== undefined) {
      const currentTrackBy = this.trackBy ? this.trackBy(current) : current;
      const lastTrackBy = this.trackBy ? this.trackBy(this._last) : this._last;
      return currentTrackBy !== lastTrackBy;
    }

    return true;
  }


}

@NgModule({
  declarations: [ IfTruthyDirective ],
  exports: [ IfTruthyDirective ]
})
export class IfTruthyDirectiveModule {
}
