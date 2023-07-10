import { Component, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmModule } from '@rxap/components';

@Component({
  standalone: true, imports: [
    RouterModule, MatCardModule, MatButtonModule, ConfirmModule,
  ], selector: 'rxap-root', templateUrl: './app.component.html', styleUrls: [ './app.component.scss' ],
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
