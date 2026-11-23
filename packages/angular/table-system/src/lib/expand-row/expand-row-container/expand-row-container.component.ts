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
import { Showcase } from '@ng-prism/core';

@Showcase<ExpandRowContainerComponent<any>>({
  title: 'Expand Row Container (Basic)',
  category: 'Table System (Basic)',
  description: 'Table cell that holds the content of an expandable row. The content is shown with an animation if the row is expanded. The content is defined with the `rxapExpandRowContent` template.',
  status: 'stable',
  imports: [{ name: 'MatTableModule', from: '@angular/material/table' }],
  host: {
    template: `
      <table mat-table multiTemplateDataRows [dataSource]="[{ name: 'Alice', mail: 'alice@example.com' }, { name: 'Bob', mail: 'bob@example.com' }]">
        <ng-container matColumnDef="expand">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let element" [rxap-expand-controls-cell]="element"></td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>
        <ng-container matColumnDef="detail">
          <td mat-cell *matCellDef="let element" [rxap-expand-row]="element" colspan="2">
            <ng-template rxapExpandRowContent let-row>
              <p>Mail: {{ row.mail }}</p>
            </ng-template>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="['expand', 'name']"></tr>
        <tr mat-row *matRowDef="let element; columns: ['expand', 'name']" [rxapExpandRow]="element"></tr>
        <tr mat-row *matRowDef="let row; columns: ['detail']"></tr>
      </table>
    `,
  },
  variants: [
    { name: 'In a table', description: 'Click a row to expand the detail content.' },
  ],
})
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
