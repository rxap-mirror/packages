import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faker } from '@faker-js/faker';

@Component({
    selector: 'rxap-large-content',
    imports: [CommonModule],
    templateUrl: './large-content.component.html',
    styleUrl: './large-content.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LargeContentComponent {

  content = faker.lorem.paragraphs(100);

}

export default LargeContentComponent;
