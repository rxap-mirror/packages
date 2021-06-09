import { Component, ElementRef, Input, Inject } from '@angular/core';
import { coerceBoolean, Required } from '@rxap/utilities';

@Component({
  selector: 'rxap-table-column-option',
  templateUrl: './table-column-option.component.html',
  styleUrls: ['./table-column-option.component.css'],
})
export class TableColumnOptionComponent {
  @Input()
  @Required
  public name!: string;

  @Input()
  public active: boolean = true;

  /**
   * The displayed value of the option. It is necessary to show the selected option in the
   * select's trigger.
   */
  get display(): string {
    return (this._element.nativeElement.textContent || '').trim();
  }

  @Input()
  public set inactive(value: boolean | '') {
    this.active = !coerceBoolean(value);
  }

  @Input()
  public set hidden(value: boolean | '') {
    this._hidden = coerceBoolean(value);
  }

  public get hidden(): boolean | '' {
    return this._hidden;
  }

  private _hidden = false;

  @Input()
  public set show(value: boolean) {
    this._hidden = !value;
  }

  constructor(
    @Inject(ElementRef)
    private _element: ElementRef<HTMLElement>
  ) {}

  public toggle(): void {
    this.active = !this.active;
  }

  public activate() {
    this.active = true;
  }

  public deactivate() {
    this.active = false;
  }
}
