import { ComponentType } from '@angular/cdk/overlay';
import { MatDialogConfig } from '@angular/material/dialog';

export interface ComponentDialogData {
  component: ComponentType<any>,
  title?: string,
}

export type ComponentDialogConfig = MatDialogConfig<ComponentDialogData>
