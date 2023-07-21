import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'rxap-tab-navigation',
  standalone: true,
  imports: [ CommonModule, RouterOutlet, MatTabsModule, RouterLink ],
  templateUrl: './tab-navigation.component.html',
  styleUrls: [ './tab-navigation.component.scss' ],
})
export default class TabNavigationComponent {}
