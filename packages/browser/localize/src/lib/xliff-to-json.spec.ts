import { xliffToJson } from './xliff-to-json';

const wrap = (units: string) => `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="de">
  <file id="ngi18n" original="ng.template">${units}</file>
</xliff>`;

const unit = (id: string, target: string) =>
  `<unit id="${id}"><segment><source>x</source><target>${target}</target></segment></unit>`;

describe('xliffToJson', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it('converts plain targets', async () => {
    expect(await xliffToJson(wrap(unit('hello', 'Hallo')))).toEqual({ hello: 'Hallo' });
  });

  it('converts placeholders to $localize syntax', async () => {
    const json = await xliffToJson(wrap(unit('greet', 'Hallo <ph id="INTERPOLATION"/>!')));
    expect(json['greet']).toBe('Hallo {$INTERPOLATION}!');
  });

  it('converts a placeholder only target', async () => {
    const json = await xliffToJson(wrap(unit('only', '<ph id="NAME"/>')));
    expect(json['only']).toBe('{$NAME}');
  });

  it('converts spans containing text and placeholders', async () => {
    const json = await xliffToJson(wrap(unit('span', 'a <pc id="0" equivStart="START_BOLD" equivEnd="CLOSE_BOLD">bold</pc> <ph id="X"/>')));
    expect(typeof json['span']).toBe('string');
    expect(json['span']).toContain('{$X}');
    expect(json['span']).not.toContain('{{');
  });

  it('skips and warns for units without usable target', async () => {
    const json = await xliffToJson(wrap(`<unit id="none"><segment><source>x</source></segment></unit>` + unit('ok', 'fine')));
    expect(json).toEqual({ ok: 'fine' });
    expect(console.warn).toHaveBeenCalled();
  });
});
