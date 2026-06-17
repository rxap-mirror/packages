import { ToggleSubject } from './toggle-subject';

describe('ToggleSubject', () => {

  it('toggle should invert the current value', () => {
    const subject = new ToggleSubject(false);
    subject.toggle();
    expect(subject.value).toBe(true);
    subject.toggle();
    expect(subject.value).toBe(false);
  });

  describe('enable', () => {

    it('with alwaysEmit=true should re-emit even when already enabled', () => {
      const subject = new ToggleSubject(true);
      const values: boolean[] = [];
      subject.subscribe(value => values.push(value));
      // initial emission from BehaviorSubject
      expect(values).toEqual([ true ]);
      subject.enable(true);
      expect(values).toEqual([ true, true ]);
    });

    it('by default (alwaysEmit=false) should not re-emit when already enabled', () => {
      const subject = new ToggleSubject(true);
      const values: boolean[] = [];
      subject.subscribe(value => values.push(value));
      subject.enable();
      // already true -> no additional emission
      expect(values).toEqual([ true ]);
    });

    it('by default should emit when currently disabled', () => {
      const subject = new ToggleSubject(false);
      const values: boolean[] = [];
      subject.subscribe(value => values.push(value));
      subject.enable();
      expect(values).toEqual([ false, true ]);
    });

  });

  describe('disable', () => {

    it('with alwaysEmit=true should re-emit even when already disabled', () => {
      const subject = new ToggleSubject(false);
      const values: boolean[] = [];
      subject.subscribe(value => values.push(value));
      subject.disable(true);
      expect(values).toEqual([ false, false ]);
    });

    it('by default (alwaysEmit=false) should not re-emit when already disabled', () => {
      const subject = new ToggleSubject(false);
      const values: boolean[] = [];
      subject.subscribe(value => values.push(value));
      subject.disable();
      expect(values).toEqual([ false ]);
    });

    it('by default should emit when currently enabled', () => {
      const subject = new ToggleSubject(true);
      const values: boolean[] = [];
      subject.subscribe(value => values.push(value));
      subject.disable();
      expect(values).toEqual([ true, false ]);
    });

  });

});
