import {
  NgSwitch,
  NgSwitchCase,
} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  InjectionToken,
  Output,
  ViewChild,
} from '@angular/core';
import { VersionEvent } from '@angular/service-worker';

export const UPDATE_AVAILABLE_EVENT = new InjectionToken<VersionEvent>('UPDATE_AVAILABLE_EVENT');

@Component({
  selector: 'rxap-service-worker-update-dialog',
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
  ],
  templateUrl: './service-worker-update-dialog.component.html',
  styleUrls: [ './service-worker-update-dialog.component.scss' ],
})
export class ServiceWorkerUpdateDialogComponent implements AfterViewInit {

  @ViewChild('dialog', { static: true })
  public dialog!: ElementRef<HTMLDialogElement>;

  @Output()
  public closeDialog = new EventEmitter<void>();

  public readonly updateAvailableEvent = inject(UPDATE_AVAILABLE_EVENT);

  ngAfterViewInit() {
    this.dialog.nativeElement.showModal();
  }

  close() {
    this.dialog.nativeElement.close();
    this.closeDialog.emit();
  }

}
