// Two hand-made Shiki themes that match the datasheet palette.
// Light = ink on paper. Dark = blueprint (navy + cyan).
// Every foreground here is checked for >= 4.5:1 contrast on its code background.

/** @param {string} name @param {'light'|'dark'} type @param {Record<string,string>} c */
function theme(name, type, c) {
  return {
    name,
    type,
    colors: { 'editor.background': c.bg, 'editor.foreground': c.fg },
    tokenColors: [
      { settings: { foreground: c.fg } },
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
      {
        scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new', 'variable.language'],
        settings: { foreground: c.keyword },
      },
      { scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], settings: { foreground: c.string } },
      { scope: ['constant.numeric', 'constant.language', 'support.constant'], settings: { foreground: c.number } },
      { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: c.fn } },
      { scope: ['entity.name.type', 'support.type', 'entity.name.class'], settings: { foreground: c.type } },
      { scope: ['variable.parameter', 'variable.other.property', 'meta.object-literal.key'], settings: { foreground: c.prop } },
      { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: c.punct } },
    ],
  };
}

export const inkLight = theme('shipstack-ink', 'light', {
  bg: '#EBE6DA',
  fg: '#141414',
  comment: '#5F5A50',
  keyword: '#A8380C',
  string: '#234070',
  number: '#234070',
  fn: '#141414',
  type: '#6B3A00',
  prop: '#3A3833',
  punct: '#55524B',
});

export const inkDark = theme('shipstack-blueprint', 'dark', {
  bg: '#0A1A30',
  fg: '#E4ECF5',
  comment: '#8FA6C4',
  keyword: '#FF8A5C',
  string: '#7FD6F7',
  number: '#7FD6F7',
  fn: '#FFFFFF',
  type: '#FFC99E',
  prop: '#C3D3E6',
  punct: '#9DB2CC',
});
