import {
  Component,
  Renderer2,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmModule } from '@rxap/components';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputClearButtonDirective } from '@rxap/material-form-system';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ParentControlContainerDirective } from '@rxap/forms';

@Component({
  standalone: true,
  imports: [
    RouterModule, MatCardModule, MatButtonModule, ConfirmModule, FormsModule, InputClearButtonDirective,
    MatFormFieldModule, MatIconModule, MatInputModule, ParentControlContainerDirective, ReactiveFormsModule,
  ],
  selector: 'rxap-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent {
  title = 'angular';

  constructor(private readonly renderer: Renderer2) {}

  toggleDark() {
    if (document.body.classList.contains('dark')) {
      this.renderer.removeClass(document.body, 'dark');
    } else {
      this.renderer.addClass(document.body, 'dark');
    }
  }
}
