import { ChangeDetectionStrategy, Component, ViewContainerRef, input, contentChild, inject, linkedSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  ExpandCellContentDirectiveContext,
  ExpandRowContentDirective,
} from './expand-row-content.directive';
import {
  PortalModule,
  TemplatePortal,
} from '@angular/cdk/portal';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ExpandRowService } from '../expand-row.service';
import { switchMap } from 'rxjs/operators';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[rxap-expand-row]',
    templateUrl: './expand-row-container.component.html',
    styleUrls: ['./expand-row-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({
                height: '0px',
                minHeight: '0',
            })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    imports: [PortalModule]
})
export class ExpandRowContainerComponent<Data extends Record<string, any>> {
  private readonly viewContainerRef = inject<ViewContainerRef>(ViewContainerRef);
  readonly expandCell = inject<ExpandRowService<Data>>(ExpandRowService);


  public readonly element = input.required<Data>({ alias: "rxap-expand-row" });

  public readonly expandCellContent = contentChild(ExpandRowContentDirective);

  public readonly expanded = toSignal(
    toObservable(this.element).pipe(switchMap(element => this.expandCell.isExpanded$(element))),
    { initialValue: false },
  );

  public readonly portal = linkedSignal<{ expanded: boolean, content: ExpandRowContentDirective<Data> | undefined }, TemplatePortal<ExpandCellContentDirectiveContext<Data>> | null>({
    source: () => ({ expanded: this.expanded(), content: this.expandCellContent() }),
    computation: ({ expanded, content }, previous) => previous?.value ??
      (expanded && content ?
        new TemplatePortal(content.template, this.viewContainerRef, { $implicit: this.element() }) :
        null),
  });

}
