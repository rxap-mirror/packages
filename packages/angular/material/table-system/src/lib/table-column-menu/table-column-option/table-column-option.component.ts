import {
  Component,
  ElementRef,
  Input,
  Inject,
  OnInit,
} from '@angular/core';
import {Router} from '@angular/router';
import {
  coerceBoolean,
  Required,
} from '@rxap/utilities';

@Component({
  selector: 'rxap-table-column-option',
  templateUrl: './table-column-option.component.html',
  styleUrls: ['./table-column-option.component.css'],
  standalone: true,
})
export class TableColumnOptionComponent implements OnInit {
  @Input()
  @Required
  public name!: string;

  @Input()
  public active = true;

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

  private get cacheId(): string {
    return this.router.url + '--' + this.name;
  }

  constructor(
    @Inject(ElementRef)
    private _element: ElementRef<HTMLElement>,
    private readonly router: Router,
  ) {
  }

  public ngOnInit() {
    const cachedValue = localStorage.getItem(this.cacheId);
    if (cachedValue === 'true') {
      this.active = true;
    }
    if (cachedValue === 'false') {
      this.active = false;
    }
  }

  public toggle(): void {
    this.active = !this.active;
    localStorage.setItem(this.cacheId, this.active ? 'true' : 'false');
  }

  public activate() {
    this.active = true;
    localStorage.setItem(this.cacheId, 'true');
  }

  public deactivate() {
    this.active = false;
    localStorage.setItem(this.cacheId, 'false');
  }
}
