import {
  Component,
  OnInit
} from '@angular/core';
import { ToggleSubject } from '@rxap/utilities';

@Component({
  selector:    'rxap-inner',
  templateUrl: './inner.component.html',
  styleUrls:   [ './inner.component.css' ]
})
export class InnerComponent implements OnInit {

  public loading$ = new ToggleSubject();

  constructor() { }

  ngOnInit(): void {
    this.loading$.enable();
    setTimeout(() => {
      console.log('disable');
      this.loading$.disable();
    }, 15000);
  }

}
