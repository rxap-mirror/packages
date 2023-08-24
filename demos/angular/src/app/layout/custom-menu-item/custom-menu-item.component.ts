import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'rxap-custom-menu-item',
  standalone: true,
  imports: [ CommonModule, MatMenuModule ],
  templateUrl: './custom-menu-item.component.html',
  styleUrls: [ './custom-menu-item.component.scss' ],
})
export class CustomMenuItemComponent {}
