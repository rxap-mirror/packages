export function PrintTableActionHtmlCode(actionType: string) {
  const code = `<button
  rxapTableRowAction="${ actionType }"
  [element]="element"
  mat-icon-button
  *ngIf="element | rxapRowActionCheck: '${ actionType }'"
  matTooltip
>
  <mat-icon>${ actionType }</mat-icon>
  <mat-progress-bar
    *rxapTableRowActionExecuting
    mode="indeterminate"
  ></mat-progress-bar>
</button>`;
  const codeHeader = `<button
  rxapTableRowHeaderAction="${ actionType }"
  mat-icon-button
  *ngIf="selected | rxapRowActionCheck: '${ actionType }'"
  matTooltip
>
  <mat-icon>${ actionType }</mat-icon>
  <mat-progress-bar
    *rxapTableRowActionExecuting
    mode="indeterminate"
  ></mat-progress-bar>
</button>`;
  // console.log('Copy the following code into your table action html template:');
  // console.log('=================== ROW ====================');
  // console.log(code);
  // console.log('================== HEADER ==================');
  // console.log(codeHeader);
  // console.log('============================================');
}
