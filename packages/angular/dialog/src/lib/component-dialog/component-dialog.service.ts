import { ComponentType } from '@angular/cdk/overlay';
import {
  inject,
  Injectable,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { ComponentDialogComponent } from './component-dialog.component';
import {
  ComponentDialogConfig,
  ComponentDialogData,
} from './types';

@Injectable({ providedIn: 'root' })
export class ComponentDialogService {

  protected readonly dialog = inject(MatDialog);

  public open<Result = any>(
    component: ComponentType<any>,
    config?: ComponentDialogConfig,
  ): Promise<Result | undefined> {
    const dialogRef = this.dialog.open<
      ComponentDialogComponent,
      ComponentDialogData,
      Result
    >(ComponentDialogComponent, {
      ...config,
      data: {
        ...config?.data,
        component,
      }
    });

    return firstValueFrom(dialogRef
      .afterClosed()
      .pipe(
        take(1),
      ));
  }

}
