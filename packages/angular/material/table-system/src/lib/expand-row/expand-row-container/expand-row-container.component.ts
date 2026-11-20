import { ChangeDetectionStrategy, Component, ViewContainerRef, input, contentChild, inject, linkedSignal } from '@angular/core';
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

  public readonly element = input.required<Data>();

  public readonly expandCellContent = contentChild(ExpandRowContentDirective);

  /**
   * The portal is created with the first expand of the row and then kept.
   */
  public readonly portal = linkedSignal<
    { content: ExpandRowContentDirective<Data> | undefined, expanded: boolean },
    TemplatePortal<ExpandCellContentDirectiveContext<Data>> | null
  >({
    source: () => ({
      content: this.expandCellContent(),
      expanded: this.expandCell.isExpanded(this.element()),
    }),
    computation: ({ content, expanded }, previous) => {
      if (previous?.value) {
        return previous.value;
      }
      if (content && expanded) {
        return new TemplatePortal(content.template, this.viewContainerRef, { $implicit: this.element() });
      }
      return null;
    },
  });

}
