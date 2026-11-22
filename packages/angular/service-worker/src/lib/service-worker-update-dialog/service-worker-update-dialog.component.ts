
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  InjectionToken,
  output,
  viewChild
} from '@angular/core';
import { VersionEvent } from '@angular/service-worker';
import { Showcase } from '@ng-prism/core';

export const UPDATE_AVAILABLE_EVENT = new InjectionToken<VersionEvent>('UPDATE_AVAILABLE_EVENT');

@Showcase({
  title: 'Service Worker Update Dialog',
  category: 'Service Worker',
  description: 'Modal dialog that informs the user about an available app update. The `UPDATE_AVAILABLE_EVENT` is provided by the styleguide host.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-service-worker-update-dialog',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './service-worker-update-dialog.component.html',
    styleUrls: ['./service-worker-update-dialog.component.scss']
})
export class ServiceWorkerUpdateDialogComponent {

  public readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  public readonly closeDialog = output<void>();

  public readonly updateAvailableEvent = inject(UPDATE_AVAILABLE_EVENT);

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  close() {
    this.dialog().nativeElement.close();
    this.closeDialog.emit();
  }

}
