
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangelogComponent } from '../changelog/changelog.component';

@Component({
    selector: 'rxap-changelog-dialog',
    imports: [ChangelogComponent, FormsModule],
    templateUrl: './changelog-dialog.component.html',
    styleUrls: ['./changelog-dialog.component.scss']
})
export class ChangelogDialogComponent implements AfterViewInit {

  public readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  @Output()
  public closeDialog = new EventEmitter<boolean>();

  public remember = true;

  ngAfterViewInit() {
    this.dialog().nativeElement.showModal();
  }

  close(remember: boolean = this.remember) {
    this.dialog().nativeElement.close();
    this.closeDialog.emit(remember);
  }

}
