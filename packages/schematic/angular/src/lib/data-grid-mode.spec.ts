import { DataGridMode } from './data-grid-mode';

describe('DataGridMode', () => {
  it('should have the correct enum values', () => {
    expect(DataGridMode.Form).toBe('form');
    expect(DataGridMode.Plain).toBe('plain');
  });
});
