import {
  Component,
  OnInit
} from '@angular/core';
import { WindowService } from '@rxap/window-system';
import { InnerComponent } from './inner/inner.component';

@Component({
  selector:    'rxap-root',
  templateUrl: './app.component.html',
  styleUrls:   [ './app.component.scss' ]
})
export class AppComponent implements OnInit {

  constructor(private readonly windowService: WindowService) {}

  ngOnInit() {
    this.windowService.open({
      component: InnerComponent,
      title:     'The title'
    });
  }

}
