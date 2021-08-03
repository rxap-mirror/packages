import {
  Injectable,
  Inject
} from '@angular/core';
import {
  MatDialog,
  DialogPosition
} from '@angular/material/dialog';
import { Direction } from '@angular/cdk/bidi';
import { ScrollStrategy } from '@angular/cdk/overlay';
import {
  map,
  take
} from 'rxjs/operators';
import { MessageDialogComponent } from './message-dialog.component';
import { MessageDialogData } from './types';

export interface MessageDialogConfig {
  /** Custom class for the overlay pane. */
  panelClass?: string | string[];
  /** Whether the dialog has a backdrop. */
  hasBackdrop?: boolean;
  /** Custom class for the backdrop. */
  backdropClass?: string;
  /** Width of the dialog. */
  width?: string;
  /** Height of the dialog. */
  height?: string;
  /** Min-width of the dialog. If a number is provided, assumes pixel units. */
  minWidth?: number | string;
  /** Min-height of the dialog. If a number is provided, assumes pixel units. */
  minHeight?: number | string;
  /** Max-width of the dialog. If a number is provided, assumes pixel units. Defaults to 80vw. */
  maxWidth?: number | string;
  /** Max-height of the dialog. If a number is provided, assumes pixel units. */
  maxHeight?: number | string;
  /** Position overrides. */
  position?: DialogPosition;
  /** Layout direction for the dialog's content. */
  direction?: Direction;
  /** ID of the element that describes the dialog. */
  ariaDescribedBy?: string | null;
  /** ID of the element that labels the dialog. */
  ariaLabelledBy?: string | null;
  /** Aria label to assign to the dialog element. */
  ariaLabel?: string | null;
  /** Whether the dialog should focus the first focusable element on open. */
  autoFocus?: boolean;
  /**
   * Whether the dialog should restore focus to the
   * previously-focused element, after it's closed.
   */
  restoreFocus?: boolean;
  /** Scroll strategy to be used for the dialog. */
  scrollStrategy?: ScrollStrategy;
  /**
   * Whether the dialog should close when the user goes backwards/forwards in history.
   * Note that this usually doesn't include clicking on links (unless the user is using
   * the `HashLocationStrategy`).
   */
  closeOnNavigation?: boolean;
}

@Injectable()
export class MessageDialogService {
  constructor(
    @Inject(MatDialog)
    private readonly dialog: MatDialog
  ) {}

  public open(
    message: string,
    actions: MessageDialogData['actions'],
    config?: MessageDialogConfig
  ): Promise<boolean> {
    const dialogRef = this.dialog.open<MessageDialogComponent,
      MessageDialogData,
      boolean>(MessageDialogComponent, {
      ...config,
      data: {
        message,
        actions
      }
    });

    return dialogRef
      .afterClosed()
      .pipe(
        take(1),
        map((result) => !!result)
      )
      .toPromise();
  }
}
