import {
  ChangeDetectorRef,
  Directive,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
  input
} from '@angular/core';
import { Method } from '@rxap/pattern';

export interface IfTruthyDirectiveTemplateContext<Data> {
  $implicit: Data;
}

// TODO : mv to rxap package

@Directive({
  selector: '[rxapIfTruthy]',
  standalone: true,
})
export class IfTruthyDirective<Data, Parameters = any> implements OnChanges {

  public readonly method = input.required<Method<Data, Parameters>>({ alias: "rxapIfTruthy" });
  public readonly parameters = input.required<Parameters>({ alias: "rxapIfTruthyParameters" });
  public readonly trackBy = input.required<(data: Data) => any>({ alias: "rxapIfTruthyTrackBy" });
  private _last?: Data;

  constructor(
    private readonly templateRef: TemplateRef<IfTruthyDirectiveTemplateContext<Data>>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly cdr: ChangeDetectorRef,
  ) {
  }

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(
    dir: IfTruthyDirective<T>,
    ctx: any,
  ): ctx is IfTruthyDirectiveTemplateContext<T> {
    return true;
  }

  public ngOnChanges(changes: SimpleChanges) {

    if (this.method() && this.parameters()) {
      this.execute();
    }

  }

  protected async execute() {

    const result = await this.method().call(this.parameters());

    if (this.hasChanged(result)) {

      this.viewContainerRef.clear();

      if (result) {
        this.viewContainerRef.createEmbeddedView(this.templateRef, { $implicit: result });
      }

      // remember the last applied result so unchanged values don't rebuild the view
      this._last = result;

    }

    this.cdr.detectChanges();

  }

  protected hasChanged(current: Data) {
    if (this._last !== undefined) {
      const trackBy = this.trackBy();
      const currentTrackBy = trackBy ? trackBy(current) : current;
      const trackByValue = this.trackBy();
      const lastTrackBy = trackByValue ? trackByValue(this._last) : this._last;
      return currentTrackBy !== lastTrackBy;
    }

    return true;
  }


}


