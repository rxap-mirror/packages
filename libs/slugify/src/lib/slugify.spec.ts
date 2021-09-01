import {
  Slugify,
  slugify
} from '@rxap/slugify';

describe('@rxap/slugify', () => {

  it('should create slugify string', () => {

    expect(new Slugify().replace('customer-value')).toEqual('customer-value');

  });

  it('should create with random suffix', () => {

    expect(slugify('value', { suffix: true })).toMatch(/^value-\w{12}$/);

  });

});
