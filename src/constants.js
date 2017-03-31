/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

/* eslint-disable no-useless-escape, max-len */

import type { NodeConfig } from './types';

// https://blog.codinghorror.com/the-problem-with-urls/
// http://www.regular-expressions.info/email.html

type ConfigMap = { [key: string]: NodeConfig };
type FilterMap = { [key: string]: number };

// This pattern will be used at the start or end of other patterns,
// making it easier to apply matches without capturing special chars.
export const ALNUM_CHAR: string = '[a-z0-9]{1}';

export const HASHTAG_PATTERN: string = '#([-a-z0-9_]+)';

export const URL_CHAR_PART: string = 'a-z0-9-_~%!$&\'*+;:@'; // Disallow . , ( )
export const URL_SCHEME_PATTERN: string = '(https?://)?';
export const URL_AUTH_PATTERN: string = `([${URL_CHAR_PART}]+@)?`;
export const URL_HOST_PATTERN: string = `((?:www\\.)?${ALNUM_CHAR}[-a-z0-9.]*[-a-z0-9]+\\.[a-z]{2,63})`;
export const URL_PORT_PATTERN: string = '(:[0-9]+)?';
export const URL_PATH_PATTERN: string = `(/[${URL_CHAR_PART}/]*(?:\\.[a-z]{2,8})?)?`;
export const URL_QUERY_PATTERN: string = `(\\?[${URL_CHAR_PART}=\\[\\]/\\\\\]*)?`;
export const URL_FRAGMENT_PATTERN: string = '(#[\\w%/]*)?';
export const URL_PATTERN: string = [
  URL_SCHEME_PATTERN,
  URL_AUTH_PATTERN,
  URL_HOST_PATTERN,
  URL_PORT_PATTERN,
  URL_PATH_PATTERN,
  URL_QUERY_PATTERN,
  URL_FRAGMENT_PATTERN,
].join('');

export const IP_V4_PART: string = '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
export const IP_V4_PATTERN: string = `(${IP_V4_PART}\\.${IP_V4_PART}\\.${IP_V4_PART}\\.${IP_V4_PART})`;
export const IP_PATTERN: string = [
  URL_SCHEME_PATTERN,
  URL_AUTH_PATTERN,
  IP_V4_PATTERN,
  URL_PORT_PATTERN,
  URL_PATH_PATTERN,
  URL_QUERY_PATTERN,
  URL_FRAGMENT_PATTERN,
].join('');

export const EMAIL_CLASS_PART: string = '[a-z0-9!#$%&?*+=_{|}~-]+';
export const EMAIL_USERNAME_PATTERN: string = `(${ALNUM_CHAR}${EMAIL_CLASS_PART}(?:\\.${EMAIL_CLASS_PART})*${ALNUM_CHAR})`;
export const EMAIL_PATTERN: string = `${EMAIL_USERNAME_PATTERN}@${URL_HOST_PATTERN}`;

// Parser rules for HTML tags
export const PARSER_ALLOW: number = 1; // Allow element and children
export const PARSER_DENY: number = 2; // Do not render this element or its children

export const TYPE_INLINE: string = 'inline';
export const TYPE_BLOCK: string = 'block';
export const TYPE_INLINE_BLOCK: string = 'inline-block'; // Special case

export const CONFIG_INLINE: NodeConfig = {
  rule: PARSER_ALLOW,
  type: TYPE_INLINE,
  inline: true,
  block: false,
  self: false,
  void: false,
  parent: [],
  children: [],
};

export const CONFIG_BLOCK: NodeConfig = {
  rule: PARSER_ALLOW,
  type: TYPE_BLOCK,
  inline: true,
  block: true,
  self: true,
  void: false,
  parent: [],
  children: [],
};

// Tags not listed here will be marked as pass-through
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element
const tagConfigs = {
  a: {
    type: TYPE_INLINE_BLOCK,
    block: true,
  },
  address: {
    self: false,
  },
  audio: {
    children: ['track', 'source'],
  },
  br: {
    inline: false,
    void: true,
  },
  button: {
    type: TYPE_INLINE_BLOCK,
  },
  dd: {
    parent: ['dl'],
  },
  dl: {
    children: ['dt'],
  },
  dt: {
    parent: ['dl'],
    children: ['dd'],
  },
  figcaption: {
    parent: ['figure'],
  },
  footer: {
    self: false,
  },
  header: {
    self: false,
  },
  h1: {
    self: false,
  },
  h2: {
    self: false,
  },
  h3: {
    self: false,
  },
  h4: {
    self: false,
  },
  h5: {
    self: false,
  },
  h6: {
    self: false,
  },
  hr: {
    inline: false,
    block: false,
    void: true,
  },
  img: {
    inline: false,
    void: true,
  },
  li: {
    self: false,
    parent: ['ul', 'ol'],
  },
  main: {
    self: false,
  },
  ol: {
    children: ['li'],
  },
  picture: {
    children: ['source', 'img'],
  },
  source: {
    inline: false,
    parent: ['audio', 'video', 'picture'],
    void: true,
  },
  span: {
    self: true,
  },
  table: {
    children: ['thead', 'tbody', 'tfoot', 'tr'],
  },
  tbody: {
    parent: ['table'],
    children: ['tr'],
  },
  td: {
    parent: ['tr'],
  },
  tfoot: {
    parent: ['table'],
    children: ['tr'],
  },
  th: {
    parent: ['tr'],
  },
  thead: {
    parent: ['table'],
    children: ['tr'],
  },
  tr: {
    parent: ['table', 'tbody', 'thead', 'tfoot'],
    children: ['th', 'td'],
  },
  track: {
    inline: false,
    parent: ['audio', 'video'],
    void: true,
  },
  ul: {
    children: ['li'],
  },
  video: {
    children: ['track', 'source'],
  },
};

function createConfigBuilder(config: NodeConfig) {
  return (tagName: string) => {
    tagConfigs[tagName] = {
      ...config,
      ...(tagConfigs[tagName] || {}),
    };
  };
}

// Add inline tags
[
  'a', 'abbr', 'b', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'i', 'img', 'ins', 'kbd',
  'label', 'mark', 'output', 'picture', 'q', 's', 'samp', 'source', 'span', 'strong', 'sub', 'sup',
  'time', 'track', 'u', 'var', 'video',
].forEach(
  createConfigBuilder(CONFIG_INLINE),
);

// Add block tags
[
  'address', 'article', 'aside', 'audio', 'blockquote', 'dd', 'details', 'div', 'dl', 'dt',
  'fieldset', 'figcaption', 'figure', 'footer', 'header', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'legend', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'thead',
  'tbody', 'tfoot', 'tr', 'th', 'td', 'ul',
].forEach(
  createConfigBuilder(CONFIG_BLOCK),
);

// Disable this map from being modified
export const TAGS: ConfigMap = Object.freeze(tagConfigs);

// Tags that should never be allowed, even if the whitelist is disabled
export const TAGS_BLACKLIST: { [tagName: string]: boolean } = {
  applet: true,
  body: true,
  canvas: true,
  embed: true,
  frame: true,
  frameset: true,
  head: true,
  html: true,
  iframe: true,
  object: true,
  script: true,
  style: true,
};

// Filters apply to HTML attributes
export const FILTER_ALLOW: number = 1;
export const FILTER_DENY: number = 2;
export const FILTER_CAST_NUMBER: number = 3;
export const FILTER_CAST_BOOL: number = 4;

// Attributes not listed here will be denied
// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
export const ATTRIBUTES: FilterMap = Object.freeze({
  alt: FILTER_ALLOW,
  cite: FILTER_ALLOW,
  class: FILTER_ALLOW,
  colspan: FILTER_CAST_NUMBER,
  controls: FILTER_CAST_BOOL,
  datetime: FILTER_ALLOW,
  default: FILTER_CAST_BOOL,
  disabled: FILTER_CAST_BOOL,
  dir: FILTER_ALLOW,
  height: FILTER_ALLOW,
  href: FILTER_ALLOW,
  id: FILTER_ALLOW,
  kind: FILTER_ALLOW,
  label: FILTER_ALLOW,
  lang: FILTER_ALLOW,
  loop: FILTER_CAST_BOOL,
  muted: FILTER_CAST_BOOL,
  poster: FILTER_ALLOW,
  role: FILTER_ALLOW,
  rowspan: FILTER_CAST_NUMBER,
  span: FILTER_CAST_NUMBER,
  src: FILTER_ALLOW,
  target: FILTER_ALLOW,
  title: FILTER_ALLOW,
  width: FILTER_ALLOW,
});

// Attributes to camel case for React props
export const ATTRIBUTES_TO_PROPS: { [key: string]: string } = Object.freeze({
  class: 'className',
  colspan: 'colSpan',
  datetime: 'dateTime',
  rowspan: 'rowSpan',
});
