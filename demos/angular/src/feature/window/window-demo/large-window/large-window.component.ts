
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { faker } from '@faker-js/faker';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rxap-large-window',
    imports: [],
    templateUrl: './large-window.component.html',
    styleUrls: ['./large-window.component.scss']
})
export class LargeWindowComponent {

  items = Array.from({ length: 1000 }, (_, i) => i + ' __ ' + faker.lorem.words(i));

}
