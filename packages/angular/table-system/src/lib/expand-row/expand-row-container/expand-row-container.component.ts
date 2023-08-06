import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Inject,
  Input,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import {
  ExpandCellContentDirectiveContext,
  ExpandRowContentDirective,
} from './expand-row-content.directive';
import {
  PortalModule,
  TemplatePortal,
} from '@angular/cdk/portal';
import { Required } from '@rxap/utilities';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ExpandRowService } from '../expand-row.service';
import { Subscription } from 'rxjs';
import {
  filter,
  tap,
} from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-expand-row]',
  templateUrl: './expand-row-container.component.html',
  styleUrls: [ './expand-row-container.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({
          height: '0px',
          minHeight: '0',
        }),
      ),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  standalone: true,
  imports: [ PortalModule, AsyncPipe ],
})
export class ExpandRowContainerComponent<Data extends Record<string, any>> implements AfterContentInit, OnDestroy {

  @Input({
    required: true,
    alias: 'rxap-expand-row',
  })
  public element!: Data;

  @ContentChild(ExpandRowContentDirective)
  public expandCellContent?: ExpandRowContentDirective<Data>;

  public portal: TemplatePortal<ExpandCellContentDirectiveContext<Data>> | null = null;

  private _subscription?: Subscription;

  constructor(
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(ExpandRowService)
    public readonly expandCell: ExpandRowService<Data>,
  ) {
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public ngAfterContentInit() {
    if (this.expandCellContent) {
      this._subscription = this.expandCell.isExpanded$(this.element).pipe(
        filter(Boolean),
        tap(() => {
          if (!this.portal) {
            this.portal =
              new TemplatePortal(this.expandCellContent!.template, this.viewContainerRef, { $implicit: this.element });
          }
        }),
      ).subscribe();
    }
  }

}
