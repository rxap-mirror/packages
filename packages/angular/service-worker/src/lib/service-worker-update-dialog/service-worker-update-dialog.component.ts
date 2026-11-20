
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  InjectionToken,
  Output,
  viewChild
} from '@angular/core';
import { VersionEvent } from '@angular/service-worker';

export const UPDATE_AVAILABLE_EVENT = new InjectionToken<VersionEvent>('UPDATE_AVAILABLE_EVENT');

@Component({
    selector: 'rxap-service-worker-update-dialog',
    imports: [],
    templateUrl: './service-worker-update-dialog.component.html',
    styleUrls: ['./service-worker-update-dialog.component.scss']
})
export class ServiceWorkerUpdateDialogComponent implements AfterViewInit {

  public readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  @Output()
  public closeDialog = new EventEmitter<void>();

  public readonly updateAvailableEvent = inject(UPDATE_AVAILABLE_EVENT);

  ngAfterViewInit() {
    this.dialog().nativeElement.showModal();
  }

  close() {
    this.dialog().nativeElement.close();
    this.closeDialog.emit();
  }

}
