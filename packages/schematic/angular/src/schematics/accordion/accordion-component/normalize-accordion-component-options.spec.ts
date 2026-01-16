import { BackendTypes } from '@rxap/schematic-angular';
import { UpstreamOptionsKinds } from '@rxap/ts-morph';
import { normalizeAccordionComponentOptions } from './normalize-accordion-component-options';
import { AccordionComponentOptions } from './schema';

describe('normalizeAccordionComponentOptions', () => {
  it('should normalize minimal accordion component options', () => {
    const options: AccordionComponentOptions = {
      name: 'test-accordion',
      project: 'ui-lib',
      itemList: [],
    };
    expect(normalizeAccordionComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex accordion component options', () => {
    const options: AccordionComponentOptions = {
      name: 'dashboard',
      project: 'ui-lib',
      backend: {
        kind: BackendTypes.NESTJS,
      },
      multiple: true,
      header: {
        property: {
          name: 'name',
        },
      },
      persistent: {
        property: {
          name: 'uuid',
        },
      },
      identifier: {
        source: 'route',
        property: {
          name: 'uuid',
        },
      },
      upstream: {
        kind: UpstreamOptionsKinds.OPEN_API,
        operationId: 'dashboard-controller-getByUuid@legacy',
      },
      propertyList: [
        {
          name: 'dashboardType',
          type: 'number',
          source: 'dashboardType!',
        },
        {
          name: 'name',
          source: 'name!',
        },
      ],
      itemList: [],
    };
    expect(normalizeAccordionComponentOptions(options)).toMatchSnapshot();
  });
});
