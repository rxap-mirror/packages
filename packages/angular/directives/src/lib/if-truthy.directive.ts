import { Directive, effect, inject, input, TemplateRef, untracked, ViewContainerRef } from '@angular/core';
import { Method } from '@rxap/pattern';

export interface IfTruthyDirectiveTemplateContext<Data> {
  $implicit: Data;
}

// TODO : mv to rxap package

@Directive({
  selector: '[rxapIfTruthy]',
  standalone: true,
})
export class IfTruthyDirective<Data, Parameters = any> {
  private readonly templateRef = inject<TemplateRef<IfTruthyDirectiveTemplateContext<Data>>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);


  public readonly method = input.required<Method<Data, Parameters>>({ alias: "rxapIfTruthy" });
  public readonly parameters = input.required<Parameters>({ alias: "rxapIfTruthyParameters" });
  public readonly trackBy = input<((data: Data) => any) | undefined>(undefined, { alias: "rxapIfTruthyTrackBy" });
  private _last?: Data;

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

  constructor() {
    effect(() => {
      const method = this.method();
      const parameters = this.parameters();
      if (method && parameters) {
        untracked(() => this.execute());
      }
    });
  }

  protected async execute() {

    const result = await this.method().call(this.parameters());

    if (this.hasChanged(result)) {

      this.viewContainerRef.clear();

      if (result) {
        this.viewContainerRef.createEmbeddedView(this.templateRef, { $implicit: result }).markForCheck();
      }

      // remember the last applied result so unchanged values don't rebuild the view
      this._last = result;

    }

  }

  protected hasChanged(current: Data) {
    if (this._last !== undefined) {
      const trackBy = this.trackBy();
      const currentTrackBy = trackBy ? trackBy(current) : current;
      const lastTrackBy = trackBy ? trackBy(this._last) : this._last;
      return currentTrackBy !== lastTrackBy;
    }

    return true;
  }


}


