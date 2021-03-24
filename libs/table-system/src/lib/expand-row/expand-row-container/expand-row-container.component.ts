import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ContentChild,
  ViewContainerRef,
  OnDestroy,
  AfterContentInit,
  Inject
} from '@angular/core';
import {
  ExpandRowContentDirective,
  ExpandCellContentDirectiveContext
} from './expand-row-content.directive';
import { TemplatePortal } from '@angular/cdk/portal';
import { Required } from '@rxap/utilities';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { ExpandRowService } from '../expand-row.service';
import { Subscription } from 'rxjs';
import {
  tap,
  filter
} from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector:        'td[rxap-expand-row]',
  templateUrl:     './expand-row-container.component.html',
  styleUrls:       [ './expand-row-container.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-expand-row' },
  animations:      [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class ExpandRowContainerComponent<Data extends Record<string, any>> implements AfterContentInit, OnDestroy {

  @Input('rxap-expand-row')
  @Required
  public element!: Data;

  @ContentChild(ExpandRowContentDirective)
  public expandCellContent?: ExpandRowContentDirective<Data>;

  public portal: TemplatePortal<ExpandCellContentDirectiveContext<Data>> | null = null;

  private _subscription?: Subscription;

  constructor(
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ExpandRowService)
    public readonly expandCell: ExpandRowService<Data>
  ) {}

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngAfterContentInit() {
    if (this.expandCellContent) {
      this._subscription = this.expandCell.isExpanded$(this.element).pipe(
        filter(Boolean),
        tap(() => {
          if (!this.portal) {
            this.portal = new TemplatePortal(this.expandCellContent!.template, this.viewContainerRef, { $implicit: this.element });
          }
        })
      ).subscribe();
    }
  }

}
