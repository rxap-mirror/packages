import {
  slugify,
  Slugify,
} from './slugify';

describe('@rxap/slugify', () => {

  it('should create slugify string', () => {

    expect(new Slugify().replace('customer-value')).toEqual('customer-value');
    expect(new Slugify().replace('customer/value')).toEqual('customervalue');

  });

  it('should create with random suffix', () => {

    expect(slugify('value', { suffix: true })).toMatch(/^value-\w{12}$/);

  });

});
