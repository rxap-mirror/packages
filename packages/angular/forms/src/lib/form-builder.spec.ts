import { RxapFormControl } from './form-control';
import { RxapFormGroup } from './form-group';
import {
  Injectable,
  Injector,
} from '@angular/core';
import { RxapFormBuilder } from './form-builder';
import { UseFormControl } from './decorators/use-form-control';
import { RxapForm } from './decorators/form';
import {
  UseFormArrayControl,
  UseFormArrayGroup,
} from './decorators/use-form-array';
import { UseFormGroup } from './decorators/use-form-group';
import {
  FormDefinitionArray,
  FormType,
} from './model';
import { RxapFormArray } from './form-array';

describe('@rxap/forms', () => {

  describe('FormBuilder', () => {

    interface IContactForm {
      zip: string;
    }

    @Injectable()
    @RxapForm('contact')
    class ContactForm implements FormType<IContactForm> {

      public rxapFormGroup!: RxapFormGroup<IContactForm>;

      @UseFormControl()
      public zip!: RxapFormControl<string>;

    }

    interface ITestFormWithSubGroup {
      username: string;
      contact: IContactForm;
    }

    @Injectable()
    @RxapForm({
      id: 'test',
      providers: [
        {
          provide: ContactForm,
          useClass: ContactForm,
          deps: [],
        },
      ],
    })
    class TestFormWithSubGroup implements FormType<ITestFormWithSubGroup> {

      public rxapFormGroup!: RxapFormGroup<ITestFormWithSubGroup>;

      @UseFormControl()
      public username!: RxapFormControl<string>;

      @UseFormGroup(ContactForm)
      public contact!: ContactForm;


    }

    interface ITestFormWithSubArray {
      username: string;
      contacts: IContactForm[];
    }

    @Injectable()
    @RxapForm({
      id: 'test',
      providers: [
        {
          provide: ContactForm,
          useClass: ContactForm,
          deps: [],
        },
      ],
    })
    class TestFormWithSubArray implements FormType<ITestFormWithSubArray> {

      public rxapFormGroup!: RxapFormGroup<ITestFormWithSubArray>;

      @UseFormControl()
      public username!: RxapFormControl<string>;

      @UseFormArrayGroup(ContactForm)
      public contacts!: FormDefinitionArray<ContactForm>;

    }

    interface ITestFormWithSubArrayControls {
      username: string;
      contacts: string[];
    }

    @Injectable()
    @RxapForm('test')
    class TestFormWithSubArrayControls implements FormType<ITestFormWithSubArrayControls> {

      public rxapFormGroup!: RxapFormGroup<ITestFormWithSubArrayControls>;

      @UseFormControl()
      public username!: RxapFormControl<string>;

      @UseFormArrayControl()
      public contacts!: FormDefinitionArray<RxapFormControl<string>>;

    }

    interface ITestForm {
      username: string;
      password: string;
    }

    @Injectable()
    @RxapForm('user')
    class TestForm implements FormType<ITestForm> {

      public rxapFormGroup!: RxapFormGroup<ITestForm>;

      @UseFormControl()
      public username!: RxapFormControl<string>;

      @UseFormControl()
      public password!: RxapFormControl<string>;

    }

    it('should build flat form', () => {

      const builder = new RxapFormBuilder<ITestForm>(TestForm, Injector.create({
        providers: [{
          provide: TestForm,
          useClass: TestForm,
          deps: [],
        }],
      }));

      const form = builder.build<TestForm>();

      expect(form).toBeInstanceOf(TestForm);
      expect(form.rxapFormGroup).toBeInstanceOf(RxapFormGroup);
      expect(form.rxapFormGroup!.controlId).toEqual('user');
      expect(form.rxapFormGroup!.controlPath).toEqual('');
      expect(form.rxapFormGroup!.fullControlPath).toEqual('user');
      expect(form.rxapFormGroup!.controls).toHaveProperty('username');
      expect(form.rxapFormGroup!.controls).toHaveProperty('password');

      expect(form.username).toBeInstanceOf(RxapFormControl);
      expect(form.username.controlId).toEqual('username');
      expect(form.username.fullControlPath).toEqual('user.username');
      expect(form.username.controlPath).toEqual('username');
      expect(form.username.value).toBeNull();
      expect(form.username).toBe(form.rxapFormGroup.controls.username);

      expect(form.password).toBeInstanceOf(RxapFormControl);
      expect(form.password.controlId).toEqual('password');
      expect(form.password.controlPath).toEqual('password');
      expect(form.password.fullControlPath).toEqual('user.password');
      expect(form.password.value).toBeNull();
      expect(form.password).toBe(form.rxapFormGroup.controls.password);

    });

    it('should build form with sub group', () => {

      const formBuilder = new RxapFormBuilder<ITestFormWithSubGroup>(TestFormWithSubGroup, Injector.NULL, [
        {
          provide: TestFormWithSubGroup,
          useClass: TestFormWithSubGroup,
          deps: [],
        },
      ]);

      const form = formBuilder.build<TestFormWithSubGroup>();

      expect(form.rxapFormGroup).toBeInstanceOf(RxapFormGroup);
      expect(form.rxapFormGroup!.controls).toHaveProperty('username');
      expect(form.rxapFormGroup!.controls).toHaveProperty('contact');

      const contactGroup: RxapFormGroup = form.rxapFormGroup!.controls.contact as any;

      expect(contactGroup).toBeInstanceOf(RxapFormGroup);
      expect(contactGroup.controls).toHaveProperty('zip');

      expect(form.rxapFormGroup!.value).toEqual({
        username: null,
        contact: {
          zip: null,
        },
      });

      expect(form.username).toBeInstanceOf(RxapFormControl);
      expect(form.contact).toBeInstanceOf(ContactForm);
      expect(form.contact.zip).toBeInstanceOf(RxapFormControl);

    });

    it('should build form with sub array', () => {

      const formBuilder = new RxapFormBuilder<ITestFormWithSubArray>(TestFormWithSubArray, Injector.NULL, [
        {
          provide: TestFormWithSubArray,
          useClass: TestFormWithSubArray,
          deps: [],
        },
      ]);

      const form = formBuilder.build<TestFormWithSubArray>();

      expect(form.rxapFormGroup).toBeInstanceOf(RxapFormGroup);
      expect(form.contacts).toBeInstanceOf(Array);
      expect(form.contacts.rxapFormArray).toBeInstanceOf(RxapFormArray);
      expect(form.contacts.length).toBe(0);
      expect(form.rxapFormGroup!.controls).toHaveProperty('username');
      expect(form.rxapFormGroup!.controls).toHaveProperty('contacts');
      expect(form.rxapFormGroup!.controls.contacts).toBeInstanceOf(RxapFormArray);
      expect(form.contacts.rxapFormArray).toBe(form.rxapFormGroup.controls.contacts);

    });

    it('should build form with sub array and initial value', () => {

      const formBuilder = new RxapFormBuilder<ITestFormWithSubArray>(TestFormWithSubArray, Injector.NULL, [
        {
          provide: TestFormWithSubArray,
          useClass: TestFormWithSubArray,
          deps: [],
        },
      ]);

      const form = formBuilder.build<TestFormWithSubArray>({
        username: 'rxap',
        contacts: [
          {zip: '6584214'},
          {zip: '653523'},
        ],
      });

      expect(form.username.value).toEqual('rxap');
      expect(form.contacts.length).toEqual(2);

      const contacts: RxapFormArray = form.rxapFormGroup?.controls.contacts as any;
      expect(contacts.controlId).toEqual('contacts');
      expect(contacts.controlPath).toEqual('contacts');

      const firstContact: ContactForm = form.contacts[0];
      const secondContact: ContactForm = form.contacts[1];

      expect(firstContact).not.toBe(secondContact);
      expect(firstContact.rxapFormGroup).not.toBe(secondContact.rxapFormGroup);

      expect(form.contacts.rxapFormArray.at(0)).toBe(firstContact.rxapFormGroup);

      expect(firstContact).toBeInstanceOf(ContactForm);
      expect(firstContact.zip).toBeInstanceOf(RxapFormControl);
      expect(firstContact.rxapFormGroup).toBeInstanceOf(RxapFormGroup);
      expect(firstContact.rxapFormGroup!.controlId).toEqual('0');
      expect(firstContact.rxapFormGroup!.parent).toBeInstanceOf(RxapFormArray);
      expect(firstContact.rxapFormGroup!.controlPath).toEqual('contacts.0');
      expect(firstContact.zip.controlPath).toEqual('contacts.0.zip');
      expect(firstContact.zip.parent).toBe(firstContact.rxapFormGroup);

      expect(firstContact.rxapFormGroup.controls.zip).toBeInstanceOf(RxapFormControl);
      expect(firstContact.rxapFormGroup.controls.zip).toBe(firstContact.zip);

      expect(secondContact).toBeInstanceOf(ContactForm);
      expect(secondContact.zip).toBeInstanceOf(RxapFormControl);
      expect(secondContact.rxapFormGroup).toBeInstanceOf(RxapFormGroup);
      expect(secondContact.rxapFormGroup!.controlId).toEqual('1');
      expect(secondContact.rxapFormGroup!.parent).toBeInstanceOf(RxapFormArray);
      expect(secondContact.rxapFormGroup!.controlPath).toEqual('contacts.1');
      expect(secondContact.zip.controlPath).toEqual('contacts.1.zip');
      expect(secondContact.zip.parent).toBe(secondContact.rxapFormGroup);
      expect(secondContact.rxapFormGroup.controls.zip).toBeInstanceOf(RxapFormControl);
      expect(secondContact.rxapFormGroup.controls.zip).toBe(secondContact.zip);

    });

    it('should build form with sub array controls', () => {

      const formBuilder = new RxapFormBuilder<ITestFormWithSubArrayControls>(TestFormWithSubArrayControls, Injector.NULL, [
        {
          provide: TestFormWithSubArrayControls,
          useClass: TestFormWithSubArrayControls,
          deps: [],
        },
      ]);

      const form = formBuilder.build<TestFormWithSubArrayControls>();

      expect(form.rxapFormGroup).toBeInstanceOf(RxapFormGroup);
      expect(form.contacts).toBeInstanceOf(Array);
      expect(form.contacts.rxapFormArray).toBeInstanceOf(RxapFormArray);
      expect(form.contacts.length).toBe(0);
      expect(form.rxapFormGroup!.controls).toHaveProperty('username');
      expect(form.rxapFormGroup!.controls).toHaveProperty('contacts');
      expect(form.rxapFormGroup!.controls.contacts).toBeInstanceOf(RxapFormArray);

    });

    it('should build form with sub array controls and initial value', () => {

      const formBuilder = new RxapFormBuilder<ITestFormWithSubArrayControls>(TestFormWithSubArrayControls, Injector.NULL, [
        {
          provide: TestFormWithSubArrayControls,
          useClass: TestFormWithSubArrayControls,
          deps: [],
        },
      ]);

      const form = formBuilder.build<TestFormWithSubArrayControls>({
        username: 'rxap',
        contacts: [
          '6584214',
          '653523',
        ],
      });

      expect(form.username.value).toEqual('rxap');
      expect(form.contacts.length).toEqual(2);

      const contacts: RxapFormArray = form.rxapFormGroup?.controls.contacts as any;
      expect(contacts.controlId).toEqual('contacts');
      expect(contacts.controlPath).toEqual('contacts');

      const firstContact: RxapFormControl = form.contacts[0];

      expect(firstContact).toBeInstanceOf(RxapFormControl);
      expect(firstContact.controlId).toEqual('0');
      expect(firstContact.parent).toBeInstanceOf(RxapFormArray);
      expect(firstContact.controlPath).toEqual('contacts.0');
      expect(firstContact.fullControlPath).toEqual('test.contacts.0');
      expect(firstContact.value).toEqual('6584214');

      const secondContact: RxapFormControl = form.contacts[1];

      expect(secondContact).toBeInstanceOf(RxapFormControl);
      expect(secondContact.controlId).toEqual('1');
      expect(secondContact.parent).toBeInstanceOf(RxapFormArray);
      expect(secondContact.controlPath).toEqual('contacts.1');
      expect(secondContact.fullControlPath).toEqual('test.contacts.1');
      expect(secondContact.value).toEqual('653523');

    });

    it('should build form with sub group and initial value', () => {

      const formBuilder = new RxapFormBuilder<ITestFormWithSubGroup>(TestFormWithSubGroup, Injector.NULL, [
        {
          provide: TestFormWithSubGroup,
          useClass: TestFormWithSubGroup,
          deps: [],
        },
      ]);

      const form = formBuilder.build<TestFormWithSubGroup>({
        username: 'rxap',
        contact: {zip: '4534'},
      });

      expect(form.username.value).toEqual('rxap');
      expect(form.contact.rxapFormGroup!.value).toEqual({zip: '4534'});
      expect(form.contact.zip.value).toEqual('4534');

    });

    it('should add new array group', () => {

      const formBuilder = new RxapFormBuilder<ITestFormWithSubArray>(TestFormWithSubArray, Injector.NULL, [
        {
          provide: TestFormWithSubArray,
          useClass: TestFormWithSubArray,
          deps: [],
        },
      ]);

      const form = formBuilder.build<TestFormWithSubArray>({
        username: 'rxap',
        contacts: [
          {zip: '6584214'},
          {zip: '653523'},
        ],
      });

      expect(form.rxapFormGroup.value).toEqual({
        username: 'rxap',
        contacts: [
          {zip: '6584214'},
          {zip: '653523'},
        ],
      });
      expect(form.contacts.length).toBe(2);
      form.contacts.rxapFormArray.insertAt(undefined, {zip: '44444'});
      expect(form.contacts.length).toBe(3);
      expect(form.rxapFormGroup.value).toEqual({
        username: 'rxap',
        contacts: [
          {zip: '6584214'},
          {zip: '653523'},
          {zip: '44444'},
        ],
      });
      expect(form.contacts[2].rxapFormGroup.controlId).toEqual('2');
      expect(form.contacts[2].rxapFormGroup.controlPath).toEqual('contacts.2');
      expect(form.contacts[2].rxapFormGroup.fullControlPath).toEqual('test.contacts.2');

    });

    it('should insert new array group', () => {

      const formBuilder = new RxapFormBuilder<ITestFormWithSubArray>(TestFormWithSubArray, Injector.NULL, [
        {
          provide: TestFormWithSubArray,
          useClass: TestFormWithSubArray,
          deps: [],
        },
      ]);

      const form = formBuilder.build<TestFormWithSubArray>({
        username: 'rxap',
        contacts: [
          {zip: '6584214'},
          {zip: '653523'},
        ],
      });

      expect(form.rxapFormGroup.value).toEqual({
        username: 'rxap',
        contacts: [
          {zip: '6584214'},
          {zip: '653523'},
        ],
      });
      expect(form.contacts.length).toBe(2);
      form.contacts.rxapFormArray.insertAt(0, {zip: '44444'});
      expect(form.contacts.length).toBe(3);
      expect(form.rxapFormGroup.value).toEqual({
        username: 'rxap',
        contacts: [
          {zip: '44444'},
          {zip: '6584214'},
          {zip: '653523'},
        ],
      });

      expect(form.contacts[0].rxapFormGroup.controlId).toEqual('0');
      expect(form.contacts[0].rxapFormGroup.controlPath).toEqual('contacts.0');
      expect(form.contacts[0].rxapFormGroup.fullControlPath).toEqual('test.contacts.0');

      expect(form.contacts[1].rxapFormGroup.controlId).toEqual('1');
      expect(form.contacts[1].rxapFormGroup.controlPath).toEqual('contacts.1');
      expect(form.contacts[1].rxapFormGroup.fullControlPath).toEqual('test.contacts.1');

      expect(form.contacts[2].rxapFormGroup.controlId).toEqual('2');
      expect(form.contacts[2].rxapFormGroup.controlPath).toEqual('contacts.2');
      expect(form.contacts[2].rxapFormGroup.fullControlPath).toEqual('test.contacts.2');

    });

  });

});
