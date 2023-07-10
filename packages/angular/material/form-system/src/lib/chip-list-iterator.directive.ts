import {
  Directive,
  EmbeddedViewRef,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatChipEvent } from '@angular/material/chips';
import { Subscription } from 'rxjs';
import {
  filter,
  startWith,
  tap,
} from 'rxjs/operators';

function getTypeName(type: any): string {
  return type['name'] || typeof type;
}

export interface ChipListTemplateContext {
  $implicit: string;
  onRemoved: (event: MatChipEvent) => void;
}

class RecordViewTuple {
  constructor(
    public record: any,
    public view: EmbeddedViewRef<ChipListTemplateContext>,
  ) {
  }
}

@Directive({
  selector: '[rxapChipListIterator]',
  standalone: true,
})
export class ChipListIteratorDirective implements OnInit, OnDestroy {
  private _subscription?: Subscription;

  private _dirty = true;
  private _differ: IterableDiffer<string> | null = null;

  constructor(
    private readonly template: TemplateRef<ChipListTemplateContext>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly ngControl: NgControl,
    private readonly differs: IterableDiffers,
  ) {
  }

  public ngOnInit() {
    this._subscription = this.ngControl.valueChanges
                             ?.pipe(
                               startWith(this.ngControl.value),
                               filter((value) => Array.isArray(value)),
                               tap((items) => {
                                 this._dirty = false;
                                 // React on ngForOf changes only once all inputs have been initialized
                                 const value = items;
                                 if (!this._differ && value) {
                                   try {
                                     this._differ = this.differs.find(value).create((_, item) => item);
                                   } catch {
                                     throw new Error(
                                       `Cannot find a differ supporting object '${ value }' of type '${ getTypeName(
                                         value,
                                       ) }'. NgFor only supports binding to Iterables such as Arrays.`,
                                     );
                                   }
                                 }
                                 if (this._differ) {
                                   const changes = this._differ.diff(items);
                                   if (changes) {
                                     this.applyChanges(changes);
                                   }
                                 }
                               }),
                             )
                             .subscribe();
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  protected applyChanges(changes: IterableChanges<string>) {
    const insertTuples: RecordViewTuple[] = [];
    changes.forEachOperation(
      (
        item: IterableChangeRecord<any>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null,
      ) => {
        if (item.previousIndex == null) {
          // NgForOf is never "null" or "undefined" here because the differ detected
          // that a new item needs to be inserted from the iterable. This implies that
          // there is an iterable value for "_ngForOf".
          const view = this.viewContainerRef.createEmbeddedView(
            this.template,
            {
              $implicit: item.item,
              onRemoved: this.onRemoved.bind(this),
            },
            currentIndex === null ? undefined : currentIndex,
          );
          const tuple = new RecordViewTuple(item, view);
          insertTuples.push(tuple);
        } else if (currentIndex == null) {
          this.viewContainerRef.remove(
            adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex,
          );
        } else if (adjustedPreviousIndex !== null) {
          const view = this.viewContainerRef.get(adjustedPreviousIndex)!;
          this.viewContainerRef.move(view, currentIndex);
          const tuple = new RecordViewTuple(
            item,
            <EmbeddedViewRef<ChipListTemplateContext>>view,
          );
          insertTuples.push(tuple);
        }
      },
    );

    for (let i = 0; i < insertTuples.length; i++) {
      this.perViewChange(insertTuples[i].view, insertTuples[i].record);
    }

    changes.forEachIdentityChange((record: any) => {
      const viewRef = <EmbeddedViewRef<ChipListTemplateContext>>(
        this.viewContainerRef.get(record.currentIndex)
      );
      viewRef.context.$implicit = record.item;
    });
  }

  private onRemoved($event: MatChipEvent) {
    this.ngControl.control?.setValue(
      (this.ngControl.value ?? []).filter(
        (item: any) => item !== $event.chip.value,
      ),
    );
  }

  private perViewChange(
    view: EmbeddedViewRef<ChipListTemplateContext>,
    record: IterableChangeRecord<any>,
  ) {
    view.context.$implicit = record.item;
  }
}


