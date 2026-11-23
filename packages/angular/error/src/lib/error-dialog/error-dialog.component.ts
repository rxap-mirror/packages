import {
  ComponentPortal,
  PortalModule,
} from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  INJECTOR,
  Injector,
  output,
  signal,
  Signal,
  viewChild
} from '@angular/core';
import {
  RXAP_ERROR_DIALOG_COMPONENT,
  RXAP_ERROR_DIALOG_DATA,
  RXAP_ERROR_DIALOG_ERROR,
} from '../tokens';
import { Showcase } from '@ng-prism/core';

export interface IErrorDialogComponent<Error = any> {
  error: Error;
}

@Showcase<ErrorDialogComponent>({
  title: 'Error Dialog',
  category: 'Error',
  description: 'Native modal dialog that lists the captured errors and renders the active one with the `RXAP_ERROR_DIALOG_COMPONENT`. The styleguide host provides three demo errors. The dialog is opened as modal on render: close it with the close button to use the styleguide again.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    NgClass,
    PortalModule
]
})
export class ErrorDialogComponent {

  public readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  public readonly data: Signal<any[]> = inject(RXAP_ERROR_DIALOG_DATA);

  public readonly activeIndex = signal(0);
  public readonly displayedButtons = computed(() => {
    const start = Math.max(0, this.activeIndex() - 2);
    const end = Math.min(this.data().length, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  });
  public readonly closeDialog = output<void>();
  private readonly component = inject(RXAP_ERROR_DIALOG_COMPONENT);
  private readonly injector = inject(INJECTOR);
  public readonly componentPortal = computed(() => {
    const index = this.activeIndex();
    const data = this.data();
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: RXAP_ERROR_DIALOG_ERROR,
          useValue: data[index],
        },
      ],
    });
    return new ComponentPortal(this.component, null, injector);
  });

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  close() {
    this.dialog().nativeElement.close();
    this.closeDialog.emit();
  }

}
