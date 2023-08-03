import {
  CoerceTarget,
  ProjectConfigurationWithTarget,
  Strategy,
  TargetConfiguration,
} from './coerce-target';

describe('CoerceTarget', () => {

  it('should add target if not exists for any strategy', () => {

    const projectConfiguration: ProjectConfigurationWithTarget = {};
    const target: TargetConfiguration = { executor: 'test' };

    CoerceTarget(projectConfiguration, 'default', target, Strategy.DEFAULT);
    CoerceTarget(projectConfiguration, 'merge', target, Strategy.MERGE);
    CoerceTarget(projectConfiguration, 'overwrite', target, Strategy.OVERWRITE);
    CoerceTarget(projectConfiguration, 'replace', target, Strategy.REPLACE);

    expect(projectConfiguration).toEqual({
      targets: {
        default: { executor: 'test' },
        merge: { executor: 'test' },
        overwrite: { executor: 'test' },
        replace: { executor: 'test' },
      },
    });

  });

  it('should not change target for default strategy', () => {

    const projectConfiguration: ProjectConfigurationWithTarget = {
      targets: {
        current: { executor: 'test' },
      },
    };
    const target: TargetConfiguration = { executor: 'new' };

    CoerceTarget(projectConfiguration, 'current', target, Strategy.DEFAULT);
    expect(projectConfiguration).toEqual({
      targets: {
        current: { executor: 'test' },
      },
    });

  });

  it('should overwrite target for overwrite strategy', () => {

    const projectConfiguration: ProjectConfigurationWithTarget = {
      targets: {
        current: {
          executor: 'test',
          options: {
            name: 'test',
            old: 'test',
          },
        },
      },
    };
    const target: TargetConfiguration = {
      executor: 'new',
      options: {
        name: 'new',
        new: 'new',
      },
    };

    CoerceTarget(projectConfiguration, 'current', target, Strategy.OVERWRITE);
    expect(projectConfiguration).toEqual({
      targets: {
        current: {
          executor: 'new',
          options: {
            name: 'new',
            new: 'new',
            old: 'test',
          },
        },
      },
    });

  });

  it('should merge target for merge strategy', () => {

    const projectConfiguration: ProjectConfigurationWithTarget = {
      targets: {
        current: {
          executor: 'test',
          options: {
            name: 'test',
            old: 'test',
          },
        },
      },
    };
    const target: TargetConfiguration = {
      executor: 'new',
      options: {
        name: 'new',
        new: 'new',
      },
    };

    CoerceTarget(projectConfiguration, 'current', target, Strategy.MERGE);
    expect(projectConfiguration).toEqual({
      targets: {
        current: {
          executor: 'test',
          options: {
            name: 'test',
            new: 'new',
            old: 'test',
          },
        },
      },
    });

  });

  it('should replace target for replace strategy', () => {

    const projectConfiguration: ProjectConfigurationWithTarget = {
      targets: {
        current: {
          executor: 'test',
          options: {
            name: 'test',
            old: 'test',
          },
        },
      },
    };
    const target: TargetConfiguration = {
      executor: 'new',
      options: {
        name: 'new',
        new: 'new',
      },
    };

    CoerceTarget(projectConfiguration, 'current', target, Strategy.REPLACE);
    expect(projectConfiguration).toEqual({
      targets: {
        current: {
          executor: 'new',
          options: {
            name: 'new',
            new: 'new',
          },
        },
      },
    });

  });

});
