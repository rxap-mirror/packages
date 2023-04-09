import type { Injector } from '@angular/core';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnChanges,
  Input,
  HostBinding,
  ElementRef,
  ChangeDetectorRef,
  SimpleChanges,
  Inject,
  Optional,
  ViewEncapsulation,
  HostListener,
  EventEmitter,
  Output,
  OnDestroy,
  INJECTOR
} from '@angular/core';
import {
  Required,
  Action,
  IsSvgIcon,
  IsMaterialIcon,
  IconConfig,
  applyContextToFunctionOrConstant
} from '@rxap/utilities';
import { Overlay } from '@angular/cdk/overlay';
import { MatButton } from '@angular/material/button';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { ConfirmDirective } from '../confirm/confirm.directive';
import { Subscription } from 'rxjs';
import {
  ButtonDefinition,
  ButtonTypes
} from '@rxap/utilities/rxjs';

const DEFAULT_ROUND_BUTTON_COLOR = 'accent';

const BUTTON_HOST_ATTRIBUTES = [
  'mat-button',
  'mat-flat-button',
  'mat-icon-button',
  'mat-raised-button',
  'mat-stroked-button',
  'mat-mini-fab',
  'mat-fab',
];

@Component({
  selector: 'button[rxap-button]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  inputs: ['disabled', 'disableRipple', 'color'],
  host: {
    '[attr.disabled]': 'disabled || null',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
    class: 'mat-focus-indicator',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent
  extends MatButton
  implements OnInit, OnChanges, OnDestroy
{
  @HostBinding('attr.data-svg-icon')
  public get svgIcon(): boolean {
    if (this.icon) {
      return IsSvgIcon(this.icon);
    }

    return false;
  }

  @HostBinding('attr.data-material-icon')
  public get materialIcon(): boolean {
    if (this.icon) {
      return IsMaterialIcon(this.icon);
    }

    return false;
  }

  @HostBinding('attr.data-icon')
  public get iconName(): string | null {
    if (this.icon) {
      if (IsSvgIcon(this.icon)) {
        return this.icon.svgIcon;
      } else {
        return this.icon.icon;
      }
    }

    return null;
  }

  @HostBinding('attr.data-name')
  public get name(): string {
    return this.definition.name;
  }

  @Input() public context?: any[];
  @Input() public contextAll?: any[][];

  @Input()
  public action: Action | null = null;

  @Input('rxap-button')
  @Required
  public definition!: ButtonDefinition<any[]>;

  @Input()
  public icon: IconConfig | null = null;

  @HostBinding('attr.data-tooltip')
  @Input()
  public tooltip = '';

  @HostBinding('attr.data-tooltip-disabled')
  @Input()
  public tooltipDisabled = false;

  @HostBinding('attr.data-disabled')
  @HostBinding('attr.data-label')
  @Input()
  public label = '';

  @HostBinding('attr.data-show')
  @Input()
  public show = true;

  @HostBinding('attr.data-confirm')
  @Input()
  public confirm = false;

  @Output('confirmed')
  public confirmed$ = new EventEmitter();

  @Output('unconfirmed')
  public unconfirmed$ = new EventEmitter();

  public readonly types = ButtonTypes;
  private _confirmDirective!: ConfirmDirective;
  private _subscription = new Subscription();

  constructor(
    @Inject(ChangeDetectorRef)
    public readonly cdr: ChangeDetectorRef,
    @Inject(Overlay)
    public readonly overlay: Overlay,
    @Inject(INJECTOR)
    public readonly injector: Injector,
    @Inject(ElementRef)
    public readonly elementRef: ElementRef,
    @Inject(FocusMonitor)
    _focusMonitor: FocusMonitor,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) _animationMode: string
  ) {
    super(elementRef, _focusMonitor, _animationMode);
  }

  public contextChange(context: any[] = []) {
    this.disabled = !!applyContextToFunctionOrConstant(
      this.definition.disabled,
      context,
      this.disabled
    );
    this.icon = applyContextToFunctionOrConstant(
      this.definition.icon,
      context,
      this.icon
    );
    this.label = applyContextToFunctionOrConstant(
      this.definition.label,
      context,
      this.label
    )!;
    this.tooltip = applyContextToFunctionOrConstant(
      this.definition.tooltip,
      context,
      this.tooltip
    )!;
    this.tooltipDisabled = !!applyContextToFunctionOrConstant(
      this.definition.tooltipDisabled,
      context,
      this.tooltipDisabled
    );
    this.confirm = applyContextToFunctionOrConstant(
      this.definition.confirm,
      context,
      this.confirm
    )!;
    this.color = applyContextToFunctionOrConstant(
      this.definition.theme,
      context,
      this.color
    ) as any;
    this.action = applyContextToFunctionOrConstant(
      this.definition.action,
      context,
      this.action
    );

    if (this.definition.hide) {
      this.show = !applyContextToFunctionOrConstant(
        this.definition.hide,
        context,
        this.show
      );
    }

    if (this.definition.show) {
      this.show = !!applyContextToFunctionOrConstant(
        this.definition.show,
        context,
        this.show
      );
    }
  }

  public contextAllChange(contextAll: any[][] = []) {
    this.cdr.detach();

    this.show = false;
    this.disabled = true;

    if (contextAll.length) {
      this.contextChange(contextAll[0]);
    }

    for (const context of contextAll) {
      this.disabled = !!applyContextToFunctionOrConstant(
        this.definition.disabled,
        context,
        this.disabled
      );
      if (this.definition.hide) {
        this.show = !applyContextToFunctionOrConstant(
          this.definition.hide,
          context,
          this.show
        );
      }

      if (this.definition.show) {
        this.show = !!applyContextToFunctionOrConstant(
          this.definition.show,
          context,
          this.show
        );
      }
    }

    this.cdr.reattach();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.context && !changes.context.firstChange) {
      this.contextChange(changes.context.currentValue);
    }
    if (changes.contextAll && !changes.contextAll.firstChange) {
      this.contextAllChange(changes.contextAll.currentValue);
    }
  }

  public ngOnInit() {
    if (this.context) {
      this.contextChange(this.context);
    }
    if (this.contextAll) {
      this.contextAllChange(this.contextAll);
    }
    if (!this.context && !this.contextAll) {
      this.contextChange();
    }
    this.updateClasses();
    this._confirmDirective = new ConfirmDirective(
      this.overlay,
      this.elementRef
    );
    this._subscription.add(
      this._confirmDirective.unconfirmed.subscribe(this.unconfirmed$)
    );
    this._subscription.add(
      this._confirmDirective.confirmed.subscribe(this.confirm)
    );
  }

  @HostListener('click', [ '$event' ])
  public onClick($event: Event) {
    if (this.confirm) {
      this._confirmDirective.onClick($event);
    }
    const actions = this.getActions();
    if (actions.length) {
      actions.forEach((action) => {
        this.emitClick(action);
      });
    } else {
      this.emitClick(null);
    }
  }

  public emitClick($event: Action | null): void {
    if (this.definition.click$) {
      this.definition.click$.next($event ?? null);
    }
  }

  public getActions(): Action[] {
    if (this.contextAll && this.contextAll.length) {
      return this.contextAll
        .map((context) =>
          applyContextToFunctionOrConstant(
            this.definition.action,
            context,
            null
          )
        )
        .filter(Boolean) as Action[];
    } else if (this.action) {
      return [this.action];
    }
    return [];
  }

  public _hasHostAttributes(...attributes: string[]): boolean {
    const descriptor = Object.getOwnPropertyDescriptor(this, 'definition');
    const hasDefinition = !!descriptor && descriptor.hasOwnProperty('value');

    if (hasDefinition) {
      for (const attribute of attributes) {
        switch (attribute) {
          case 'mat-icon-button':
            if (this.definition.type === ButtonTypes.Icon) {
              return true;
            }
            break;

          case 'mat-fab':
            if (this.definition.type === ButtonTypes.Fab) {
              return true;
            }
            break;

          case 'mat-mini-fab':
            if (this.definition.type === ButtonTypes.MiniFab) {
              return true;
            }
            break;

          case 'mat-raised-button':
            if (this.definition.type === ButtonTypes.Raised) {
              return true;
            }
            break;

          // TODO : add support for all mat button types
        }
      }
    }

    return super._hasHostAttributes(...attributes);
  }

  /** Whether the button is icon button. */
  public isIconButton: boolean = this._hasHostAttributes('mat-icon-button');
  public isRoundButton: boolean = this._hasHostAttributes(
    'mat-fab',
    'mat-mini-fab'
  );

  public ngOnDestroy() {
    super.ngOnDestroy();
    this._confirmDirective.ngOnDestroy();
    this._subscription.unsubscribe();
  }

  public updateClasses(): void {
    this.isRoundButton = this._hasHostAttributes('mat-fab', 'mat-mini-fab');
    this.isIconButton = this._hasHostAttributes('mat-icon-button');

    for (const attr of BUTTON_HOST_ATTRIBUTES) {
      if (this._hasHostAttributes(attr)) {
        (this._getHostElement() as HTMLElement).classList.add(attr);
      }
    }

    if (this.isRoundButton) {
      this.color = DEFAULT_ROUND_BUTTON_COLOR;
    }
  }
}
