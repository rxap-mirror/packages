import { Slugify } from '@rxap/slugify';

describe('@rxap/slugify', () => {

  it('should create slugify string', () => {

    expect(new Slugify().replace('customer-value')).toEqual('customer-value');

  });

});
