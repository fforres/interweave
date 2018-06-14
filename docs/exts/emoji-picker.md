# Emoji Picker

A React based emoji picker powered by [Interweave](https://github.com/milesj/interweave) and
[Emojibase][emojibase]. Supports the following features:

- Customizable theme, styles, and icons.
- Configurable element and render order.
- Localized emoji annotations.
- Emoji grouping and categorization.
- Multi-word deep search.
- Skin tone palette selector.
- Enlarged preview on hover.
- Emoticons and shortcodes.
- Recently and frequently used.
- Virtualized rendering.
- And much more!

<img src="https://raw.githubusercontent.com/milesj/interweave/master/docs/img/slack.png" height="350">
<img src="https://raw.githubusercontent.com/milesj/interweave/master/docs/img/twitter.png" height="350">

> [Slack](https://github.com/milesj/interweave/blob/master/tests/slack.css) and
> [Twitter](https://github.com/milesj/interweave/blob/master/tests/twitter.css) themes provided as
> an example of the library's robustness.

## Requirements

- React 16.3+
- Interweave + Emoji
- [Emojibase][emojibase]

## Installation

```
yarn add interweave interweave-emoji interweave-emoji-picker emojibase
// Or
npm install interweave interweave-emoji interweave-emoji-picker emojibase --save
```

## Usage

To utilize the emoji picker, import and render the `EmojiPicker` component. The picker renders in
place, so any positioning or display toggling should be done manually.

```javascript
import EmojiPicker from 'emoji-picker';

<EmojiPicker />;
```

### Props

- `autoFocus` (bool) - Focus the search field on mount. Defaults to `false`.
- `blacklist` (string[]) - List of hexcodes to exclude.
- `classNames` (object) - Mapping of custom CSS class names.
- `columnCount` (number) - Number of columns in the list. Defaults to `10`.
- `commonMode` (enum) - Type of commonly used mode. Defaults to recently used.
  [View available modes](https://github.com/milesj/interweave/blob/master/packages/emoji-picker/src/constants.ts#L95).
- `defaultGroup` (enum) - Group tab selected by default. Defaults to common mode.
  [View available groups](https://github.com/milesj/interweave/blob/master/packages/emoji-picker/src/constants.ts#L45).
- `defaultSkinTone` (enum) - Skin tone selected by default. Defaults to none (yellow).
  [View available skin tones](https://github.com/milesj/interweave/blob/master/packages/emoji-picker/src/constants.js#L70).
- `disableCommonlyUsed` (bool) - Disable the commonly used feature. Defaults to `false`.
- `disableGroups` (bool) - Disable emoji group tabs and sections. Defaults to `false`.
- `disablePreview` (bool) - Disable and hide the emoji preview on hover. Defaults to `false`.
- `disableSearch` (bool) - Disable and hide the search bar. Defaults to `false`.
- `disableSkinTones` (bool) - Disable and hide the skin tone selector. Defaults to `false`.
- `displayOrder` (string[]) - Order in which UI components are rendered.
- `emojiLargeSize` (number) - Size of the preview emoji.
- `emojiPadding` (number) - Padding around the emoji icon. Defaults to `0`.
- `emojiPath` (string | function) - Handler to determine the emoji SVG/PNG path.
- `emojiSize` (string | number) - Size of the emoji within the grid.
- `groupIcons` (object) - Mapping of custom group icons.
- `hideEmoticon` (bool) - Hide emoticons in the preview bar. Defaults to `false`.
- `hideGroupHeaders` (bool) - Hide group headers within list sections. Defaults to `false`.
- `hideShortcodes` (bool) - Hide shortcodes in the preview bar. Defaults to `false`.
- `maxCommonlyUsed` (number) - Max number of commonly used emojis. Defaults to `30`.
- `maxEmojiVersion` (number) - Max official emoji version (yearly). Defaults to the latest spec.
- `messages` (object) - Mapping of custom localization messages.
- `onHoverEmoji` (function) - Callback triggered when hovering an emoji.
- `onScrollGroup` (function) - Callback triggered when a group is scrolled into view.
- `onSearch` (function) - Callback triggered when typing in the search bar.
- `onSelectEmoji` (function) - Callback triggered when an emoji is clicked.
- `onSelectGroup` (function) - Callback triggered when a group tab is clicked.
- `onSelectSkinTone` (function) - Callback triggered when a skin tone tab is clicked.
- `rowCount` (number) - Number of rows in the visible list. Defaults to `8`.
- `skinIcons` (object) - Mapping of custom skin tone icons.
- `virtual` (object) - Custom props to pass to [react-virtualized][react-virtualized].
- `whitelist` (string[]) - List of hexcodes to only display.

## Blacklist / Whitelist

Sometimes specific emojis should not be used, like the poop emoji. This can easily be achieved with
the `blacklist` prop, which accepts an array of hexcodes.

```javascript
<EmojiPicker
  blacklist={[
    '1F4A9', // poop
    '1F52B', // gun
  ]}
/>
```

The inverse, the `whitelist` prop, can be used for situations where a restricted list of emojis
should _only_ be used. This also accepts an array of hexcodes.

```javascript
// Only trees
<EmojiPicker
  whitelist={[
    '1F332', // evergreen
    '1F333', // deciduous
    '1F334', // palm
    '1F384', // christmas
    '1F38B', // tanabata
  ]}
/>
```

> Not sure where to find a hexcode? Dig around [Emojibase][emojibase].

## Commonly Used

When an emoji is selected (clicked on), we keep a history known as "commonly used", and display a
custom group within the emoji list. This history has two modes, recently used and frequently used,
and can be customized with the `commonMode` prop. Selected emojis that fall past the
`maxCommonlyUsed` prop are trimmed from the history.

- `recently-used` - Tracks selected emojis from most recently selected to oldest.
- `frequently-used` - Tracks selected emojis using a counter, in descending order.

```javascript
<EmojiPicker commonMode="frequently-used" />
```

The commonly used feature can be disabled with the `disableCommonlyUsed` prop.

> Commonly used emojis are stored in local storage.

## Changing Appearance

This picker is quite customizable, if not the most customizable, when it comes to its visual
appearance. Every aspect of the picker can be changed, whether it be the order of elements, hiding
or showing elements, the number of emojis to render, and more. I'll try to keep this rather short.

To change the number of visible emojis rendered in the list, define the `columnCount` and `rowCount`
props.

```javascript
<EmojiPicker columnCount={15} rowCount={5} />
```

To change the default selected group tab or skin tone palette, define the `defaultGroup` and
`defaultSkinTone` props respectively.

```javascript
<EmojiPicker defaultGroup="food-drink" defaultSkinTone="medium" />
```

By default, the picker renders elements in the following order: emoji being hovered preview at the
top, followed by the list of emojis, the search bar, and the group tabs. This order can be changed
with the `displayOrder` prop, which accepts an array of strings.

```javascript
<EmojiPicker displayOrder={['groups', 'search', 'emojis', 'preview']} />
```

To disable one of the elements mentioned previously, pass a `disableGroups`, `disablePreview`,
`disableSearch`, or `disableSkinTones` prop.

```javascript
<EmojiPicker disableSearch disableSkinTones />
```

To hide emoticons or shortcodes within the preview, pass the `hideEmoticon` or `hideShortcodes`
props. Furthermore, to hide group headers (but still use group tabs), pass `hideGroupHeaders`.

```javascript
<EmojiPicker hideEmoticon hideGroupHeaders />
```

And lastly, to customize the icons displayed in the group tabs, pass an object of nodes to the
`groupIcons`
([list](https://github.com/milesj/interweave/blob/master/packages/emoji-picker/src/constants.ts#L56))
prop. By default the picker uses native emoji but can render React components.

```javascript
<EmojiPicker
  groupIcons={{
    activities: <IconBasketball />,
  }}
/>
```

## Customizing Styles

The picker is not styled by default as it allows consumers to easily customize the CSS to match
their application. There are 2 approaches to styling the picker, the first by writing CSS that
follows the
[class names provided by Interweave](https://github.com/milesj/interweave/blob/master/packages/emoji-picker/src/constants.ts#L98).

```css
.interweave-picker__picker {
  position: 'absolute';
  bottom: 100%;
}
```

The second by writing CSS and passing an object of custom class names to the `classNames` prop. This
approach enables non-standard solutions, like CSS modules and CSS-in-JS.

```javascript
<EmojiPicker
  classNames={{
    picker: 'picker-7sa92dsd',
  }}
/>
```

The `emojiPadding` prop is an exception to the CSS pattern, as it pads the emoji button using inline
styles. This is necessary for accurately computing of widths and heights.

```javascript
<EmojiPicker emojiPadding={5} />
```

## Translating Messages

Localization is important, and thus, all messages within the picker can be translated with the
`messages` prop. This prop accepts an object of message keys to translated strings. The list of
[available messages can be found here](https://github.com/milesj/interweave/blob/master/packages/emoji-picker/src/constants.ts#L127).

```javascript
<EmojiPicker
  locale="ja"
  messages={{
    search: 'サーチ',
  }}
/>
```

> Messages are treated as React nodes and may contain elements / components.

[emojibase]: https://github.com/milesj/emojibase
[react-virtualized]: https://github.com/bvaughn/react-virtualized
