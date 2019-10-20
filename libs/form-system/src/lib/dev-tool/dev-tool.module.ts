import { NgModule } from '@angular/core';
import { FormSystemDevToolService } from './form-system-dev-tool.service';


@NgModule({
  providers: [ FormSystemDevToolService ]
})
export class RxapFormSystemDevToolModule {

  constructor(formSystemDevToolService: FormSystemDevToolService) {
    formSystemDevToolService.start();
  }

}
