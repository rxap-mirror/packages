import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { FormDetailsService } from '../form-details/form-details.service';
import { Subscription } from 'rxjs';
import {
  tap,
  skipWhile,
  debounceTime,
  startWith
} from 'rxjs/operators';
import { NgModel } from '@angular/forms';

@Component({
  selector:    'rxap-template-editor',
  templateUrl: './template-editor.component.html',
  styleUrls:   [ './template-editor.component.scss' ]
})
export class TemplateEditorComponent implements OnInit, OnDestroy {

  public template = '';

  public editorOptions = { theme: 'vs-dark', language: 'xml' };

  public autoUpdate = false;

  @ViewChild('editorModel', { static: true }) public editorModel: NgModel;

  private _subscriptions = new Subscription();

  constructor(public formDetails: FormDetailsService) { }

  public ngOnInit() {

    this._subscriptions.add(this.formDetails.update$.pipe(
      startWith(null),
      tap(() => this.template = this.formDetails.formTemplate),
      tap(() => console.log('update template', this.template))
    ).subscribe());

    this._subscriptions.add(this.editorModel.valueChanges.pipe(
      skipWhile(() => !this.autoUpdate),
      debounceTime(500),
      tap(template => this.formDetails.updateTemplate(template))
    ).subscribe());

  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

}
