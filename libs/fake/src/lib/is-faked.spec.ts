import {
  IsFaked,
  FakedStatus
} from './is-faked';

describe('@rxap/fake', () => {

  describe('IsFaked', () => {

    afterEach(() => {
      FakedStatus.SetFakeStatus(true);
    });

    it('should always return true if map is not defined', () => {

      expect(IsFaked('table.test')).toBe(true);
      expect(IsFaked('user.path.read')).toBe(true);

    });

    it('should return shorting path value', () => {

      FakedStatus.SetFakeStatus({
        table: true,
        user:  {
          path: false
        }
      });

      expect(IsFaked('table.test')).toBe(true);
      expect(IsFaked('user.path.read')).toBe(false);

    });

    it('should return fill path value', () => {
      FakedStatus.SetFakeStatus({
        table: {
          test: true
        },
        user:  {
          path: {
            read: false
          }
        }
      });

      expect(IsFaked('table.test')).toBe(true);
      expect(IsFaked('user.path.read')).toBe(false);
    });

    it('should always return false if path does not exists', () => {

      FakedStatus.SetFakeStatus({});

      expect(IsFaked('table.test')).toBe(false);
      expect(IsFaked('user.path.read')).toBe(false);

    });


  });

});
