import {
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { WindowService } from '@rxap/window-system';

@Component({
  selector:    'rxap-root',
  templateUrl: './app.component.html',
  styleUrls:   [ './app.component.scss' ]
})
export class AppComponent {

  @ViewChild('window', { static: true }) public window!: TemplateRef<any>;

  constructor(
    public windowService: WindowService,
    public viewContainerRef: ViewContainerRef
  ) {}

  public open() {
    this.windowService.open({ template: this.window });
  }

}
