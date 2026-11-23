import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RxapFormArray, RxapFormControl, RxapFormGroup } from '@rxap/forms';
import { ForFormArrayItemsDirective } from './for-form-array-items.directive';
import { FormArrayAddItemButtonDirective } from './form-array-add-item-button.directive';
import { FormArrayRemovableDirective } from './form-array-removable.directive';
import { FormArrayItemRemoveButtonDirective } from './form-array-item-remove-button.directive';
import { FormArrayItemRestoreButtonDirective } from './form-array-item-restore-button.directive';

function buildItem(state: { name?: string } | undefined, controlId: string) {
  return new RxapFormGroup(
    { name: new RxapFormControl(state?.name ?? '', { controlId: 'name' }) } as any,
    { controlId },
  );
}

function buildArray(names: string[]) {
  const array: RxapFormArray = new RxapFormArray(
    names.map((name, i) => buildItem({ name }, String(i))),
    {
      controlId: 'items',
      builder: (state: any, opts: any) => buildItem(state, opts.controlId),
      controlInsertedFn: () => undefined,
      controlRemovedFn: () => undefined,
    } as any,
  );
  const root = new RxapFormGroup({ items: array } as any, { controlId: 'root' });
  return { array, root };
}

describe('form array directives', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe('ForFormArrayItemsDirective and add / remove / restore buttons', () => {
    @Component({
      imports: [
        ReactiveFormsModule,
        ForFormArrayItemsDirective,
        FormArrayAddItemButtonDirective,
        FormArrayItemRemoveButtonDirective,
        FormArrayItemRestoreButtonDirective,
      ],
      template: `
        <form [formGroup]="root">
          <div formArrayName="items">
            <div *rxapForFormArrayItem="let group; let i = index; let first = first; let last = last"
                 class="item" [formGroup]="group">
              <span class="meta">{{ i }}-{{ first }}-{{ last }}</span>
              <button class="remove" type="button" rxapFormArrayItemRemoveButton
                      [shouldTemporarilyDeleted]="soft"></button>
              <button class="restore" type="button" rxapFormArrayItemRestoreButton></button>
            </div>
            <button class="add" rxapFormArrayItemAddButton>add</button>
          </div>
        </form>
      `,
    })
    class HostComponent {
      readonly data = buildArray(['a', 'b']);
      readonly root = this.data.root;
      soft = (g: RxapFormGroup) => g.get('name')?.value === 'soft';
    }

    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    const q = (sel: string) => Array.from(fixture.nativeElement.querySelectorAll(sel)) as HTMLElement[];

    async function flush() {
      await vi.advanceTimersByTimeAsync(150);
      fixture.detectChanges();
    }

    beforeEach(async () => {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
      await flush();
    });

    it('renders an embedded view per item with context', () => {
      expect(q('.item').length).toBe(2);
      expect(q('.meta').map((e) => e.textContent)).toEqual(['0-true-false', '1-false-true']);
    });

    it('add button inserts a new item', async () => {
      q('.add')[0].click();
      await flush();
      expect(host.data.array.length).toBe(3);
      expect(q('.item').length).toBe(3);
    });

    it('add button is disabled with the array', async () => {
      host.data.array.disable();
      fixture.detectChanges();
      expect((q('.add')[0] as HTMLButtonElement).disabled).toBe(true);
    });

    it('remove button removes the item from the array', async () => {
      q('.remove')[0].click();
      await flush();
      expect(host.data.array.length).toBe(1);
      expect(host.data.array.at(0).get('name')?.value).toBe('b');
    });

    it('remove button marks an item as deleted when requested and restore reverts it', async () => {
      host.data.array.at(0).get('name')!.setValue('soft');
      q('.remove')[0].click();
      const group = host.data.array.at(0) as RxapFormGroup<any>;
      expect(group.get('deleted')?.value).toBe(true);
      expect(host.data.array.length).toBe(2);
      expect(q('.remove')[0].style.display).toBe('none');
      expect(q('.restore')[0].style.display).toBe('');
      q('.restore')[0].click();
      expect(group.get('deleted')?.value).toBe(false);
      expect(q('.remove')[0].style.display).toBe('');
      expect(q('.restore')[0].style.display).toBe('none');
    });

    it('buttons expose index and deleted state', () => {
      const btn = fixture.debugElement
        .queryAll((d) => d.nativeElement.classList?.contains('remove'))[1]
        .injector.get(FormArrayItemRemoveButtonDirective) as any;
      expect(btn.index).toBe(1);
      expect(btn.isDeleted).toBe(false);
      expect(btn.disabled).toBe(false);
    });
  });

  describe('mat button integration', () => {
    @Component({
      imports: [ReactiveFormsModule, MatButtonModule, ForFormArrayItemsDirective, FormArrayAddItemButtonDirective, FormArrayItemRemoveButtonDirective],
      template: `
        <form [formGroup]="root">
          <div formArrayName="items">
            <div *rxapForFormArrayItem="let group" [formGroup]="group">
              <button mat-button class="remove" rxapFormArrayItemRemoveButton></button>
            </div>
            <button mat-button class="add" rxapFormArrayItemAddButton></button>
          </div>
        </form>
      `,
    })
    class HostComponent {
      readonly data = buildArray(['a']);
      readonly root = this.data.root;
    }

    it('syncs the disabled state with the mat button', async () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(150);
      fixture.detectChanges();
      fixture.componentInstance.data.array.disable();
      fixture.detectChanges();
      expect((fixture.nativeElement.querySelector('.add') as HTMLButtonElement).disabled).toBe(true);
      expect((fixture.nativeElement.querySelector('.remove') as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe('FormArrayRemovableDirective', () => {
    @Component({
      imports: [ReactiveFormsModule, ForFormArrayItemsDirective, FormArrayRemovableDirective],
      template: `
        <form [formGroup]="root">
          <div formArrayName="items">
            <div *rxapForFormArrayItem="let group" [formGroup]="group" rxapFormArrayRemovable class="item"></div>
          </div>
        </form>
      `,
    })
    class HostComponent {
      readonly data = buildArray(['a']);
      readonly root = this.data.root;
    }

    it('disables the other controls of a deleted item and enables them again', async () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(150);
      fixture.detectChanges();
      const group = fixture.componentInstance.data.array.at(0) as RxapFormGroup<any>;
      const name = group.get('name')!;
      const deleted = group.get('deleted')!;
      expect(deleted).toBeInstanceOf(RxapFormControl);
      deleted.setValue(true);
      expect(name.disabled).toBe(true);
      deleted.setValue(false);
      expect(name.enabled).toBe(true);
    });

    it('does not re-enable controls when the array is disabled', async () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(150);
      fixture.detectChanges();
      const array = fixture.componentInstance.data.array;
      const group = array.at(0) as RxapFormGroup<any>;
      array.disable({ onlySelf: true });
      group.get('deleted')!.setValue(true);
      group.get('deleted')!.setValue(false);
      expect(group.get('name')!.disabled).toBe(true);
    });
  });

  describe('error handling', () => {
    it('ForFormArrayItemsDirective throws when the container is not a form array', () => {
      @Component({
        imports: [ReactiveFormsModule, ForFormArrayItemsDirective],
        template: `<form [formGroup]="root"><div formGroupName="g"><div *rxapForFormArrayItem="let g"></div></div></form>`,
      })
      class Bad {
        root = new RxapFormGroup({ g: new RxapFormGroup({}, { controlId: 'g' }) } as any, { controlId: 'root' });
      }
      const fixture = TestBed.createComponent(Bad);
      expect(() => fixture.detectChanges()).toThrow('not an instance of RxapFormArray');
    });

    it('item buttons throw when the parent is no form group', () => {
      @Component({
        imports: [ReactiveFormsModule, FormArrayItemRemoveButtonDirective],
        template: `<form [formGroup]="root"><div formArrayName="items"><button rxapFormArrayItemRemoveButton></button></div></form>`,
      })
      class Bad {
        root = buildArray(['a']).root;
      }
      const fixture = TestBed.createComponent(Bad);
      expect(() => fixture.detectChanges()).toThrow('The parent is not a form group instance');
    });

    it('removable throws when the group is not part of an array', () => {
      @Component({
        imports: [ReactiveFormsModule, FormArrayRemovableDirective],
        template: `<form [formGroup]="root"><div rxapFormArrayRemovable></div></form>`,
      })
      class Bad {
        root = new RxapFormGroup({}, { controlId: 'root' });
      }
      const fixture = TestBed.createComponent(Bad);
      expect(() => fixture.detectChanges()).toThrow('not a FormArray instance');
    });
  });
});
