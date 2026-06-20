
import { Component } from '@angular/core';
import { faker } from '@faker-js/faker';

@Component({
    selector: 'rxap-small-window',
    imports: [],
    templateUrl: './small-window.component.html',
    styleUrls: [ './small-window.component.scss']
})
export class SmallWindowComponent {

  items = Array.from({ length: 2 }, (_, i) => i + ' __ ' + faker.lorem.words(i));

}
