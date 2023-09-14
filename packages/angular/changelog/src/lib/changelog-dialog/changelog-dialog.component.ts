import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockInstance } from 'ng-mocks';
import { ChangelogComponent } from '../changelog/changelog.component';

@Component({
  selector: 'rxap-changelog-dialog',
  standalone: true,
  imports: [ CommonModule, ChangelogComponent, FormsModule ],
  templateUrl: './changelog-dialog.component.html',
  styleUrls: [ './changelog-dialog.component.scss' ],
})
export class ChangelogDialogComponent implements AfterViewInit {

  @ViewChild('dialog', { static: true })
  public dialog!: ElementRef<HTMLDialogElement>;

  @Output()
  public closeDialog = new EventEmitter<boolean>();

  public remember = true;

  ngAfterViewInit() {
    this.dialog.nativeElement.showModal();
  }

  close(remember: boolean = this.remember) {
    this.dialog.nativeElement.close();
    this.closeDialog.emit(remember);
  }

}
