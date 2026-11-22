import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangelogComponent } from '../changelog/changelog.component';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Changelog Dialog',
  category: 'Changelog',
  description: 'Modal dialog that shows the changelog of the latest release.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-changelog-dialog',
    imports: [ChangelogComponent, FormsModule],
    templateUrl: './changelog-dialog.component.html',
    styleUrls: ['./changelog-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangelogDialogComponent {

  public readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  public readonly closeDialog = output<boolean>();

  public readonly remember = signal(true);

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  close(remember: boolean = this.remember()) {
    this.dialog().nativeElement.close();
    this.closeDialog.emit(remember);
  }

}
