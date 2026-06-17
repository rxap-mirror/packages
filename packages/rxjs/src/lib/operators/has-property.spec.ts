import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { hasProperty } from './has-property';

describe('hasProperty operator', () => {

  it('should only emit items that have the property', async () => {
    const result = await of<Array<{ id?: number; name?: string }>>(
      { id: 1 },
      { name: 'no-id' },
      { id: 2 },
    ).pipe(
      hasProperty<{ id?: number }, { id: number }>('id'),
      toArray(),
    ).toPromise();
    expect(result).toEqual([ { id: 1 }, { id: 2 } ]);
  });

  it('should not throw for null-prototype objects and still match the property', async () => {
    const nullProto: any = Object.create(null);
    nullProto.id = 1;
    const result = await of<any>(nullProto).pipe(
      hasProperty<any, { id: number }>('id'),
      toArray(),
    ).toPromise();
    expect(result).toEqual([ nullProto ]);
  });

  it('should match against a provided value', async () => {
    const result = await of<any>({ id: 1 }, { id: 2 }).pipe(
      hasProperty<any, { id: number }>('id', 2),
      toArray(),
    ).toPromise();
    expect(result).toEqual([ { id: 2 } ]);
  });

});
