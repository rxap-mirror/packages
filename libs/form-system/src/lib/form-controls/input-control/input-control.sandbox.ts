import { sandboxOf } from 'angular-playground';
import { RxapInputControlComponent } from './input-control.component';
import { RxapInputControlComponentModule } from './input-control.component.module';

export default sandboxOf(RxapInputControlComponent, {
  imports:          [
    RxapInputControlComponentModule.standalone()
  ],
  declareComponent: false
}).add('text', {
  template: '<rxap-input-control placeholder="type text" label="text input control"></rxap-input-control>'
}).add('number', {
  template: '<rxap-input-control type="number" placeholder="type number" label="number input control"></rxap-input-control>'
}).add('password', {
  template: '<rxap-input-control type="password" placeholder="type password" label="password input control"></rxap-input-control>'
}).add('date', {
  template: '<rxap-input-control type="date" placeholder="type date"></rxap-input-control>'
}).add('color', {
  template: '<rxap-input-control type="color" placeholder="type color" label="color input control"></rxap-input-control>'
}).add('datetime local', {
  template: '<rxap-input-control type="datetime-local" placeholder="type datetime-local"></rxap-input-control>'
}).add('email', {
  template: '<rxap-input-control type="email" placeholder="type email" label="email input control"></rxap-input-control>'
}).add('month', {
  template: '<rxap-input-control type="month" placeholder="type month"></rxap-input-control>'
}).add('search', {
  template: '<rxap-input-control type="search" placeholder="type search" label="search input control"></rxap-input-control>'
}).add('tel', {
  template: '<rxap-input-control type="tel" placeholder="type tel" label="tel input control"></rxap-input-control>'
}).add('time', {
  template: '<rxap-input-control type="time" placeholder="type time"></rxap-input-control>'
}).add('url', {
  template: '<rxap-input-control type="url" placeholder="type url" label="url input control"></rxap-input-control>'
}).add('week', {
  template: '<rxap-input-control type="week" placeholder="type week"></rxap-input-control>'
});
