import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { faker } from '@faker-js/faker';

@Component({
    selector: 'rxap-small-window',
    imports: [CommonModule],
    templateUrl: './small-window.component.html',
    styleUrls: [ './small-window.component.scss']
})
export class SmallWindowComponent {

  items = Array.from({ length: 2 }, (_, i) => i + ' __ ' + faker.lorem.words(i));

}
