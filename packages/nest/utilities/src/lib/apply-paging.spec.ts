import { ApplyPaging } from './apply-paging';
import { ApplySort } from './apply-sort';

describe('ApplySort / ApplyPaging', () => {

  const data = [
    { id: 3, name: 'charlie' },
    { id: 1, name: 'alice' },
    { id: 2, name: 'bob' },
  ];

  it('ApplySort should sort ascending by the given field', () => {
    const rows = ApplySort([ ...data ], 'asc', 'name');
    expect(rows.map(r => r.name)).toEqual([ 'alice', 'bob', 'charlie' ]);
  });

  it('ApplySort should sort descending by the given field', () => {
    const rows = ApplySort([ ...data ], 'desc', 'name');
    expect(rows.map(r => r.name)).toEqual([ 'charlie', 'bob', 'alice' ]);
  });

  it('ApplyPaging should sort by the requested field and direction (args not swapped)', () => {
    const { total, rows } = ApplyPaging([ ...data ], 'name', 'asc', 10, 0);
    expect(total).toBe(3);
    expect(rows.map(r => r.name)).toEqual([ 'alice', 'bob', 'charlie' ]);
  });

  it('ApplyPaging should page after sorting', () => {
    const { total, rows } = ApplyPaging([ ...data ], 'id', 'asc', 2, 0);
    expect(total).toBe(3);
    expect(rows.map(r => r.id)).toEqual([ 1, 2 ]);
  });

});
