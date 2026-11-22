describe('angular-material cypress commands', () => {
  const commands: Record<string, { fn: (...a: any[]) => any; opts?: any }> = {};
  let cy: any;

  beforeAll(() => {
    cy = {
      get: jest.fn(),
      wrap: jest.fn(),
    };
    (global as any).cy = cy;
    (global as any).Cypress = {
      Commands: {
        add: (name: string, a: any, b?: any) => {
          commands[name] = b ? { opts: a, fn: b } : { fn: a };
        },
      },
    };
    require('./angular-material');
  });

  afterAll(() => {
    delete (global as any).cy;
    delete (global as any).Cypress;
  });

  it('registers all commands', () => {
    expect(Object.keys(commands).sort()).toEqual(['matError', 'matFormField', 'matInput', 'matType']);
    expect(commands['matFormField'].opts).toBeUndefined();
    expect(commands['matError'].opts).toEqual({ prevSubject: true });
    expect(commands['matType'].opts).toEqual({ prevSubject: true });
    expect(commands['matInput'].opts).toEqual({ prevSubject: true });
  });

  it('matFormField finds the parent mat-form-field of the control input', () => {
    const first = jest.fn().mockReturnValue('field');
    const parents = jest.fn().mockReturnValue({ first });
    cy.get.mockReturnValue({ parents });
    expect(commands['matFormField'].fn('name')).toBe('field');
    expect(cy.get).toHaveBeenCalledWith('mat-form-field input[formcontrolname="name"]');
    expect(parents).toHaveBeenCalledWith('mat-form-field');
  });

  it('matError finds mat-error inside the subject', () => {
    const find = jest.fn().mockReturnValue('err');
    cy.wrap.mockReturnValue({ find });
    expect(commands['matError'].fn('subject')).toBe('err');
    expect(cy.wrap).toHaveBeenCalledWith('subject');
    expect(find).toHaveBeenCalledWith('mat-error');
  });

  it('matInput finds and re-wraps the input element', () => {
    const $input = {} as any;
    const find = jest.fn().mockReturnValue({ then: (cb: any) => cb($input) });
    cy.wrap.mockReset().mockImplementation((v: any) => (v === 'subject' ? { find } : 'wrapped'));
    expect(commands['matInput'].fn('subject')).toBe('wrapped');
    expect(find).toHaveBeenCalledWith('input');
    expect(cy.wrap).toHaveBeenCalledWith($input);
  });

  it('matType clicks the subject and types into its input', () => {
    const type = jest.fn();
    const click = jest.fn();
    const matInput = jest.fn().mockReturnValue({ type });
    cy.wrap.mockReset().mockReturnValue({ click, matInput });
    expect(commands['matType'].fn('subject', 'hello')).toBeUndefined();
    expect(click).toHaveBeenCalled();
    expect(type).toHaveBeenCalledWith('hello');
  });
});
