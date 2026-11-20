import { ChangeDetectionStrategy, Component, ElementRef, computed, input, inject, linkedSignal } from '@angular/core';
import { Router } from '@angular/router';
import { coerceBoolean } from '@rxap/utilities';

@Component({
  selector: 'rxap-table-column-option',
  templateUrl: './table-column-option.component.html',
  styleUrls: [ './table-column-option.component.css' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TableColumnOptionComponent {
  private _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);

  public readonly name = input.required<string>();

  /**
   * The initial active state. Use the inactive input as shorthand for active = false
   */
  public readonly activeInput = input(true, { alias: 'active' });

  public readonly inactive = input(false, { transform: coerceBoolean });

  public readonly hidden = input(false, { transform: coerceBoolean });

  public readonly show = input<boolean>(true);

  /**
   * The current active state. Initialised from the active/inactive inputs
   * and the cached value, can be changed with toggle/activate/deactivate.
   */
  public readonly active = linkedSignal(() => {
    const cachedValue = this.cachedValue();
    if (cachedValue !== null) {
      return cachedValue;
    }
    return this.activeInput() && !this.inactive();
  });

  public readonly isHidden = computed(() => this.hidden() || !this.show());

  /**
   * The displayed value of the option. It is necessary to show the selected option in the
   * select's trigger.
   */
  get display(): string {
    return (this._element.nativeElement.textContent || '').trim();
  }

  private get cacheId(): string {
    return this.router.url + '--' + this.name();
  }

  private cachedValue(): boolean | null {
    const cachedValue = localStorage.getItem(this.cacheId);
    if (cachedValue === 'true') {
      return true;
    }
    if (cachedValue === 'false') {
      return false;
    }
    return null;
  }

  public toggle(): void {
    this.active.update(active => !active);
    localStorage.setItem(this.cacheId, this.active() ? 'true' : 'false');
  }

  public activate() {
    this.active.set(true);
    localStorage.setItem(this.cacheId, 'true');
  }

  public deactivate() {
    this.active.set(false);
    localStorage.setItem(this.cacheId, 'false');
  }
}
