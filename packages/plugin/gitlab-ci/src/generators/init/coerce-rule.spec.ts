import {
  CoerceRule,
  Rule,
  RuleWhen,
} from './coerce-rule';

describe('CoerceRule function', () => {
  it('throws error if rule has neither when nor if property', () => {
    const rulesList: Rule[] = [];
    const rule: Rule = {};
    expect(() => CoerceRule(rulesList, rule)).toThrowError('Rule must have either a when or if property');
  });

  it('adds rule to the list if it is the first rule', () => {
    const rule: Rule = {
      if: 'true',
    };
    const rulesList: Rule[] = [];
    CoerceRule(rulesList, rule);
    expect(rulesList).toEqual([ rule ]);
  });

  it('adds rule with "when" property to the end of the list if it is "always"', () => {
    const ruleA: Rule = {
      when: RuleWhen.NEVER,
      if: 'true',
    };
    const ruleB: Rule = {
      when: RuleWhen.ALWAYS,
      if: 'true',
    };
    const rulesList: Rule[] = [ ruleA ];
    CoerceRule(rulesList, ruleB);
    expect(rulesList).toEqual([ ruleA, ruleB ]);
  });

  it('add rule without "when" property to the end of the list if it is the last rule', () => {
    const ruleA: Rule = {
      when: RuleWhen.NEVER,
      if: 'true',
    };
    const ruleB: Rule = {
      if: 'true',
    };
    const rulesList: Rule[] = [ ruleA ];
    CoerceRule(rulesList, ruleB);
    expect(rulesList).toEqual([ ruleA, ruleB ]);
  });

  it('adds rule with "when" property to the start of the list if it is RuleWhen.NEVER', () => {
    const ruleA: Rule = {
      when: RuleWhen.ALWAYS,
      if: 'true',
    };
    const ruleB: Rule = {
      when: RuleWhen.NEVER,
      if: 'true',
    };
    const rulesList: Rule[] = [ ruleA ];
    CoerceRule(rulesList, ruleB);
    expect(rulesList).toEqual([ ruleB, ruleA ]);
  });

  it('adds rule with "if" property to the end of the list if "when" is not defined', () => {
    const ruleA: Rule = {
      when: RuleWhen.ALWAYS,
      if: 'true',
    };
    const ruleB: Rule = { if: 'true' };
    const rulesList: Rule[] = [ ruleA ];
    CoerceRule(rulesList, ruleB);
    expect(rulesList).toEqual([ ruleA, ruleB ]);
  });
});
