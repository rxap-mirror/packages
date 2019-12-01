import { Parser } from './parser';
import { Form } from './form';
import { Control } from './control';
import {
  Column,
  Row
} from './layout';
import { Stepper } from './stepper';
import { Step } from './step';

describe('Form System', () => {

  describe('Form View', () => {

    describe('Parser', () => {

      it('parse template with one control', () => {

        const template = `
<form id="test" xmlns="https://schema.rxap.dev/form-template.xsd">
<control id="control"/>
</form>`;

        const form = Parser.CreateFormFromXml(template);

        expect(form).toBeInstanceOf(Form);
        expect(form.components.length).toBe(1);
        const column = form.components[ 0 ];
        expect(column).toBeInstanceOf(Column);
        expect(column.components.length).toBe(1);
        expect(column.components[ 0 ]).toBeInstanceOf(Control);

        expect(form).toEqual({
          id:         'test',
          dataSource: undefined,
          subTitle:   undefined,
          title:      undefined,
          components: [
            {
              orientation: 'column',
              gap:         undefined,
              align:       undefined,
              flex:        'nogrow',
              components:  [
                {
                  id:           'control',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                }
              ]
            }
          ]
        });

        expect(form.controls.length).toBe(1);
        expect(form.controls).toEqual([
          {
            id:           'control',
            flex:         'nogrow',
            formId:       'test',
            controlTypId: 'input',
            componentId:  undefined,
            components:   []
          }
        ]);

      });

      it('parse template with multiple controls', () => {

        const template = `<form id="test" xmlns="https://schema.rxap.dev/form-template.xsd">
<control id="control1"/>
<control id="control2"/>
<control id="control3"/>
<control id="control4"/>
</form>`;

        const form = Parser.CreateFormFromXml(template);

        expect(form).toBeInstanceOf(Form);
        expect(form.components.length).toBe(1);
        const column = form.components[ 0 ];
        expect(column).toBeInstanceOf(Column);
        expect(column.components.length).toBe(4);
        expect(column.components[ 0 ]).toBeInstanceOf(Control);
        expect(column.components[ 1 ]).toBeInstanceOf(Control);
        expect(column.components[ 2 ]).toBeInstanceOf(Control);
        expect(column.components[ 3 ]).toBeInstanceOf(Control);

        expect(form).toEqual({
          id:         'test',
          dataSource: undefined,
          subTitle:   undefined,
          title:      undefined,
          components: [
            {
              orientation: 'column',
              gap:         undefined,
              align:       undefined,
              flex:        'nogrow',
              components:  [
                {
                  id:           'control1',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                },
                {
                  id:           'control2',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                },
                {
                  id:           'control3',
                  flex:         'nogrow',
                  controlTypId: 'input',
                  componentId:  undefined,
                  components:   []
                },
                {
                  id:           'control4',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                }
              ]
            }
          ]
        });

        expect(form.controls.length).toBe(4);
        expect(form.controls).toEqual([
          {
            id:           'control1',
            controlTypId: 'input',
            flex:         'nogrow',
            componentId:  undefined,
            formId:       'test',
            components:   []
          },
          {
            id:           'control2',
            formId:       'test',
            flex:         'nogrow',
            controlTypId: 'input',
            componentId:  undefined,
            components:   []
          },
          {
            formId:       'test',
            id:           'control3',
            controlTypId: 'input',
            flex:         'nogrow',
            componentId:  undefined,
            components:   []
          },
          {
            id:           'control4',
            controlTypId: 'input',
            flex:         'nogrow',
            formId:       'test',
            componentId:  undefined,
            components:   []
          }
        ]);

      });

      it('parse template with multiple controls and one layout element', () => {

        const template = `
<form id="test" xmlns="https://schema.rxap.dev/form-template.xsd">
  <row gap="32px" horizontal="end" vertical="center">
    <control id="control1"/>
    <control id="control2"/>
    <control id="control3"/>
    <control id="control4"/>
  </row>
</form>`;

        const form = Parser.CreateFormFromXml(template);

        expect(form).toBeInstanceOf(Form);
        expect(form.components.length).toBe(1);
        const row = form.components[ 0 ];
        expect(row).toBeInstanceOf(Row);
        expect(row.components.length).toBe(4);
        expect(row.components[ 0 ]).toBeInstanceOf(Control);
        expect(row.components[ 1 ]).toBeInstanceOf(Control);
        expect(row.components[ 2 ]).toBeInstanceOf(Control);
        expect(row.components[ 3 ]).toBeInstanceOf(Control);

        expect(form).toEqual({
          id:         'test',
          dataSource: undefined,
          subTitle:   undefined,
          title:      undefined,
          components: [
            {
              orientation: 'row',
              gap:         '32px',
              align:       'end center',
              flex:        'nogrow',
              components:  [
                {
                  id:           'control1',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                },
                {
                  id:           'control2',
                  flex:         'nogrow',
                  controlTypId: 'input',
                  componentId:  undefined,
                  components:   []
                },
                {
                  id:           'control3',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                },
                {
                  id:           'control4',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                }
              ]
            }
          ]
        });

        expect(form.controls.length).toBe(4);
        expect(form.controls).toEqual([
          {
            id:           'control1',
            flex:         'nogrow',
            componentId:  undefined,
            formId:       'test',
            controlTypId: 'input',
            components:   []
          },
          {
            id:           'control2',
            formId:       'test',
            flex:         'nogrow',
            componentId:  undefined,
            controlTypId: 'input',
            components:   []
          },
          {
            id:           'control3',
            flex:         'nogrow',
            controlTypId: 'input',
            componentId:  undefined,
            formId:       'test',
            components:   []
          },
          {
            id:           'control4',
            flex:         'nogrow',
            formId:       'test',
            controlTypId: 'input',
            componentId:  undefined,
            components:   []
          }
        ]);

      });

      it('parse template with a mix of multiple controls and multiple layout elements', () => {

        const template = `
<form id="test" xmlns="https://schema.rxap.dev/form-template.xsd">
  <row gap="32px" horizontal="end" vertical="center">
    <control id="control1"/>
    <control flex="40px" id="control2"/>
    <control id="control3"/>
    <control id="control4"/>
  </row>
  <control id="control5"/>
  <control id="control6"/>
  <column gap="32px" horizontal="space-around" vertical="end">
    <control id="control7"/>
    <control id="control8"/>
  </column>
</form>`;

        const form = Parser.CreateFormFromXml(template);

        expect(form).toBeInstanceOf(Form);
        expect(form.components.length).toBe(3);
        const row     = form.components[ 0 ];
        const column  = form.components[ 1 ];
        const column1 = form.components[ 2 ];
        expect(row).toBeInstanceOf(Row);
        expect(column).toBeInstanceOf(Column);
        expect(column1).toBeInstanceOf(Column);
        expect(row.components.length).toBe(4);
        expect(row.components[ 0 ]).toBeInstanceOf(Control);
        expect(row.components[ 1 ]).toBeInstanceOf(Control);
        expect(row.components[ 2 ]).toBeInstanceOf(Control);
        expect(row.components[ 3 ]).toBeInstanceOf(Control);
        expect(column.components.length).toBe(2);
        expect(column.components[ 0 ]).toBeInstanceOf(Control);
        expect(column.components[ 1 ]).toBeInstanceOf(Control);
        expect(column1.components.length).toBe(2);
        expect(column1.components[ 0 ]).toBeInstanceOf(Control);
        expect(column1.components[ 1 ]).toBeInstanceOf(Control);

        expect(form).toEqual({
          id:         'test',
          dataSource: undefined,
          subTitle:   undefined,
          title:      undefined,
          components: [
            {
              orientation: 'row',
              gap:         '32px',
              align:       'end center',
              flex:        'nogrow',
              components:  [
                {
                  id:           'control1',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                },
                {
                  id:           'control2',
                  flex:         '40px',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                },
                {
                  id:           'control3',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                },
                {
                  id:           'control4',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                }
              ]
            },
            {
              orientation: 'column',
              gap:         undefined,
              align:       undefined,
              flex:        'nogrow',
              components:  [
                {
                  id:           'control5',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                },
                {
                  id:           'control6',
                  flex:         'nogrow',
                  componentId:  undefined,
                  controlTypId: 'input',
                  components:   []
                }
              ]
            },
            {
              orientation: 'column',
              gap:         '32px',
              align:       'space-around end',
              flex:        'nogrow',
              components:  [
                {
                  id:           'control7',
                  flex:         'nogrow',
                  controlTypId: 'input',
                  componentId:  undefined,
                  components:   []
                },
                {
                  id:           'control8',
                  flex:         'nogrow',
                  controlTypId: 'input',
                  componentId:  undefined,
                  components:   []
                }
              ]
            }
          ]
        });

        expect(form.controls.length).toBe(8);
        expect(form.controls).toEqual([
          {
            id:           'control1',
            flex:         'nogrow',
            formId:       'test',
            componentId:  undefined,
            controlTypId: 'input',
            components:   []
          },
          {
            id:           'control2',
            flex:         '40px',
            componentId:  undefined,
            controlTypId: 'input',
            formId:       'test',
            components:   []
          },
          {
            id:           'control3',
            flex:         'nogrow',
            componentId:  undefined,
            controlTypId: 'input',
            formId:       'test',
            components:   []
          },
          {
            id:           'control4',
            flex:         'nogrow',
            componentId:  undefined,
            controlTypId: 'input',
            formId:       'test',
            components:   []
          },
          {
            id:           'control5',
            flex:         'nogrow',
            formId:       'test',
            componentId:  undefined,
            controlTypId: 'input',
            components:   []
          },
          {
            id:           'control6',
            flex:         'nogrow',
            componentId:  undefined,
            formId:       'test',
            controlTypId: 'input',
            components:   []
          },
          {
            id:           'control7',
            flex:         'nogrow',
            componentId:  undefined,
            formId:       'test',
            controlTypId: 'input',
            components:   []
          },
          {
            id:           'control8',
            flex:         'nogrow',
            controlTypId: 'input',
            formId:       'test',
            componentId:  undefined,
            components:   []
          }
        ]);

      });

      it('parse template with stepper', () => {

        const template = `
<form id="test" xmlns="https://schema.rxap.dev/form-template.xsd">
  <stepper>
    <step label="step1">
      <control id="control1"></control>
    </step>
    <step label="step2">
      <row>
        <control id="control2"></control>
      </row>
    </step>
  </stepper>
</form>`;

        const form = Parser.CreateFormFromXml(template);

        expect(form).toBeInstanceOf(Form);
        expect(form.components.length).toBe(1);
        const stepper = form.components[ 0 ];
        expect(stepper).toBeInstanceOf(Stepper);
        expect(stepper.components.length).toBe(2);
        const step0 = stepper.components[ 0 ];
        const step1 = stepper.components[ 1 ];
        expect(step0).toBeInstanceOf(Step);
        expect(step1).toBeInstanceOf(Step);

        expect(step0.components.length).toBe(1);
        expect(step1.components.length).toBe(1);

        const step0Column = step0.components[ 0 ];
        expect(step0Column).toBeInstanceOf(Column);
        expect(step0Column.components.length).toBe(1);
        expect(step0Column.components[ 0 ]).toBeInstanceOf(Control);

        const step1Row = step1.components[ 0 ];
        expect(step1Row).toBeInstanceOf(Row);
        expect(step1Row.components.length).toBe(1);
        expect(step1Row.components[ 0 ]).toBeInstanceOf(Control);

        expect(form).toEqual({
          id:         'test',
          dataSource: undefined,
          subTitle:   undefined,
          title:      undefined,
          components: [
            {
              flex:       'nogrow',
              components: [
                {
                  label:      'step1',
                  flex:       'nogrow',
                  components: [
                    {
                      orientation: 'column',
                      gap:         undefined,
                      align:       undefined,
                      flex:        'nogrow',
                      components:  [
                        {
                          id:           'control1',
                          flex:         'nogrow',
                          controlTypId: 'input',
                          componentId:  undefined,
                          components:   []
                        }
                      ]
                    }
                  ]
                },
                {
                  label:      'step2',
                  flex:       'nogrow',
                  components: [
                    {
                      orientation: 'row',
                      gap:         undefined,
                      align:       undefined,
                      flex:        'nogrow',
                      components:  [
                        {
                          id:           'control2',
                          controlTypId: 'input',
                          flex:         'nogrow',
                          componentId:  undefined,
                          components:   []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        });

        expect(form.controls.length).toBe(2);
        expect(form.controls).toEqual([
          {
            id:           'control1',
            flex:         'nogrow',
            controlTypId: 'input',
            componentId:  undefined,
            formId:       'test',
            components:   []
          },
          {
            id:           'control2',
            flex:         'nogrow',
            controlTypId: 'input',
            formId:       'test',
            componentId:  undefined,
            components:   []
          }
        ]);


      });

    });

  });

});
