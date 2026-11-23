import { AfterViewInit, ChangeDetectorRef, Directive, OnDestroy, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import {
  ControlContainer,
  UntypedFormArray,
  UntypedFormGroup,
} from '@angular/forms';
import { RxapFormArray } from '@rxap/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  pairwise,
  startWith,
  Subscription,
  tap,
} from 'rxjs';
import { Showcase } from '@ng-prism/core';

export interface ForFormArrayItemsDirectiveContext {
  $implicit: UntypedFormGroup;
  index: number;
  last: boolean;
  first: boolean;
  even: boolean;
  odd: boolean;
  array: UntypedFormArray;
}

// TODO : move to rxap packages
@Showcase({
  title: 'For Form Array Items',
  description: 'Structural directive. Renders its template for each form group of the form array of the parent control container. The form group is the implicit context: `*rxapForFormArrayItem="let group; let index = index"`.',
  status: 'stable',
  partOf: '[rxapFormArrayItemAddButton]',
})
@Directive({
  selector: '[rxapForFormArrayItem]',
  standalone: true,
})
export class ForFormArrayItemsDirective implements AfterViewInit, OnDestroy {
  private readonly container = inject(ControlContainer, { skipSelf: true });
  private readonly template = inject<TemplateRef<ForFormArrayItemsDirectiveContext>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly cdr = inject(ChangeDetectorRef);


  private _formArrayValueSubscription?: Subscription;

  private formArray!: RxapFormArray;

  ngAfterViewInit() {
    if (this.container.control instanceof RxapFormArray) {
      this.formArray = this.container.control;
      this.container.control.value$.pipe(
        debounceTime(100),
        map(value => value.length),
        distinctUntilChanged(),
        startWith(0),
        pairwise(),
        tap(([ a, b ]) => {
          if (a !== b) {
            this.render(b);
          }
        }),
      ).subscribe();
    } else {
      throw new Error('The control container is not an instance of RxapFormArray');
    }
  }

  ngOnDestroy() {
    this._formArrayValueSubscription?.unsubscribe();
  }

  private render(length: number) {
    this.viewContainerRef.clear();
    for (let index = 0; index < length; index++) {
      const group = this.formArray.at(index);
      if (group instanceof UntypedFormGroup) {
        this.viewContainerRef.createEmbeddedView(
          this.template,
          {
            $implicit: group,
            index,
            first: index === 0,
            last: index === length - 1,
            even: index % 2 === 0,
            odd: index % 2 !== 0,
            array: this.formArray,
          },
        );
      } else {
        throw new Error('rxapForFormArrayItem only support FormArray with FormGroup as items');
      }
    }
    this.cdr.detectChanges();
  }

}
