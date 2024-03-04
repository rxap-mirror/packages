import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'rxap-large-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './large-window.component.html',
  styleUrls: ['./large-window.component.scss'],
})
export class LargeWindowComponent {

  items = Array.from({ length: 1000 }, (_, i) => i + ' __ ' + faker.lorem.words(i));

}
