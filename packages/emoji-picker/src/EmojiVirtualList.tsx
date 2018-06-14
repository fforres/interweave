/**
 * @copyright   2016-2018, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import React from 'react';
import PropTypes from 'prop-types';
import { List, ListRowProps } from 'react-virtualized';
import chunk from 'lodash/chunk';
import { CanonicalEmoji, EmojiShape, PathShape, SourceShape } from 'interweave-emoji';
import withContext, { ContextProps } from './Context';
import EmojiButton from './Emoji';
import { EmojiListProps } from './EmojiList';
import GroupListHeader from './GroupListHeader';
import {
  GROUPS,
  GROUP_KEY_COMMONLY_USED,
  GROUP_KEY_SEARCH_RESULTS,
  GROUP_KEY_NONE,
} from './constants';
import { ContextShape } from './shapes';
import { GroupKey, GroupEmojiMap, GroupIndexMap } from './types';

export type VirtualRow = string | CanonicalEmoji[];

export interface EmojiVirtualListProps extends EmojiListProps {
  columnCount: number;
  columnPadding?: number;
  rowCount: number;
  rowPadding?: number;
  onScroll: () => void;
}

export interface EmojiVirtualListState {
  groupIndices: GroupIndexMap;
  rows: VirtualRow[];
}

export type EmojiVirtualListUnifiedProps = EmojiVirtualListProps & ContextProps;

export class EmojiVirtualList extends React.PureComponent<
  EmojiVirtualListUnifiedProps,
  EmojiVirtualListState
> {
  static propTypes = {
    activeEmoji: EmojiShape,
    activeGroup: PropTypes.string.isRequired,
    clearIcon: PropTypes.node,
    columnCount: PropTypes.number.isRequired,
    columnPadding: PropTypes.number,
    commonEmojis: PropTypes.arrayOf(EmojiShape).isRequired,
    commonMode: PropTypes.string.isRequired,
    context: ContextShape.isRequired,
    emojiPadding: PropTypes.number.isRequired,
    emojiPath: PathShape.isRequired,
    emojis: PropTypes.arrayOf(EmojiShape).isRequired,
    emojiSize: PropTypes.number.isRequired,
    emojiSource: SourceShape.isRequired,
    hideGroupHeaders: PropTypes.bool.isRequired,
    onClear: PropTypes.func.isRequired,
    onEnterEmoji: PropTypes.func.isRequired,
    onLeaveEmoji: PropTypes.func.isRequired,
    onScroll: PropTypes.func.isRequired,
    onScrollGroup: PropTypes.func.isRequired,
    onSelectEmoji: PropTypes.func.isRequired,
    rowCount: PropTypes.number.isRequired,
    rowPadding: PropTypes.number,
    scrollToGroup: PropTypes.string.isRequired,
    searching: PropTypes.bool.isRequired,
    skinTonePalette: PropTypes.node,
  };

  static defaultProps = {
    activeEmoji: null,
    clearIcon: null,
    columnPadding: 0,
    rowPadding: 0,
    skinTonePalette: null,
  };

  constructor(props: EmojiVirtualListUnifiedProps) {
    super(props);

    // This doesn't type properly when a property
    this.state = this.groupEmojisIntoRows();
  }

  // componentDidUpdate(prevProps: EmojiVirtualListUnifiedProps) {
  //   const { activeEmoji, commonEmojis, emojis, searching } = this.props;

  //   // We re-use the same array for emojis unless it has been rebuilt,
  //   // so this check will work correctly. No lengthy checks needed.
  //   if (
  //     activeEmoji !== prevProps.activeEmoji ||
  //     commonEmojis !== prevProps.commonEmojis ||
  //     emojis !== prevProps.emojis ||
  //     searching !== prevProps.searching
  //   ) {
  //     // TODO
  //     // eslint-disable-next-line
  //     this.setState(this.groupEmojisIntoRows());
  //   }
  // }

  /**
   * Partition the dataset into multiple rows based on the group they belong to.
   */
  groupEmojisIntoRows(): EmojiVirtualListState {
    const {
      columnCount,
      // commonEmojis,
      // disableGroups,
      // emojis,
      hideGroupHeaders,
      searching,
    } = this.props;
    const groups: GroupEmojiMap = {};
    const rows: VirtualRow[] = [];
    const groupIndices: GroupIndexMap = {
      // Handle empty scroll to's
      '': -1,
    };

    // Sort each group and chunk into rows
    Object.keys(groups).forEach(group => {
      groupIndices[group] = rows.length;

      if (!hideGroupHeaders) {
        rows.push(group);
      }

      rows.push(...chunk(groups[group].emojis, columnCount));
    });

    return {
      groupIndices,
      rows,
    };
  }

  /**
   * Loop over each group section within the scrollable container
   * and determine the active group.
   */
  handleRendered = (event: {
    overscanStartIndex: number;
    overscanStopIndex: number;
    startIndex: number;
    stopIndex: number;
  }) => {
    const { startIndex, stopIndex } = event;
    const { activeGroup, rowCount } = this.props;
    const { groupIndices } = this.state;
    let lastGroup = '';

    Object.keys(groupIndices).some(group => {
      const index = groupIndices[group];

      // Special case for commonly used and smileys,
      // as they usually both render in the same view
      if (index === 0 && startIndex === 0) {
        lastGroup = group;

        return true;
      }

      // Next group is about to be shown, but highlight the previous group
      if (index + rowCount / 2 >= stopIndex) {
        return true;
      }

      lastGroup = group;

      return false;
    });

    // Only update if a different group
    if (lastGroup && lastGroup !== activeGroup) {
      this.props.onScrollGroup(lastGroup as GroupKey);
    }
  };

  /**
   * Render a no results view.
   */
  renderNoResults = () => {
    const { classNames, messages } = this.props.context;

    return <div className={classNames.noResults}>{messages.noResults}</div>;
  };

  /**
   * Render the list row. Either a group header or a row of emoji columns.
   */
  renderRow = (props: ListRowProps) => {
    const { key, index, isVisible, style } = props;
    const {
      activeEmoji,
      clearIcon,
      commonMode,
      context: { classNames },
      emojiPadding,
      emojiPath,
      emojiSize,
      emojiSource,
      skinTonePalette,
      onClear,
      onEnterEmoji,
      onLeaveEmoji,
      onSelectEmoji,
    } = this.props;
    const row = this.state.rows[index];

    return (
      <div key={key} style={style} className={classNames.emojisRow}>
        {Array.isArray(row) ? (
          <div className={classNames.emojisBody}>
            {row.map((emoji, i) => (
              <EmojiButton
                key={emoji.hexcode}
                active={activeEmoji ? activeEmoji.hexcode === emoji.hexcode : false}
                emoji={emoji}
                emojiPadding={emojiPadding}
                emojiPath={emojiPath}
                emojiSize={emojiSize}
                emojiSource={emojiSource}
                showImage={isVisible}
                onEnter={onEnterEmoji}
                onLeave={onLeaveEmoji}
                onSelect={onSelectEmoji}
              />
            ))}
          </div>
        ) : (
          <GroupListHeader
            clearIcon={clearIcon}
            commonMode={commonMode}
            group={row as GroupKey}
            onClear={onClear}
            skinTonePalette={skinTonePalette}
          />
        )}
      </div>
    );
  };

  render() {
    const {
      activeEmoji,
      columnCount,
      columnPadding = 0,
      emojiPadding,
      emojiSize,
      groupedEmojis,
      rowCount,
      rowPadding = 0,
      scrollToGroup,
      searching,
      onScroll,
    } = this.props;
    const { classNames } = this.props.context;
    const { groupIndices, rows } = this.state;
    const size = emojiSize + emojiPadding * 2;
    const rowHeight = size + rowPadding * 2;
    const columnWidth = size + columnPadding * 2;

    // `List` utilizes shallow comparison by extending PureComponent.
    // Because of this, row changes may not be reflected without
    // re-rendering the entire list. To circumvent this,
    // we can pass our own props to trigger the re-render.
    const renderProps = {
      activeEmoji,
      // commonEmojis,
      groupedEmojis,
      searching,
    };

    return (
      <div className={classNames.emojis}>
        <List
          className={classNames.emojisContainer}
          height={rowHeight * rowCount}
          noRowsRenderer={this.renderNoResults}
          overscanRowCount={rowCount}
          rowCount={rows.length}
          rowHeight={rowHeight}
          rowRenderer={this.renderRow}
          scrollToAlignment="start"
          scrollToIndex={groupIndices[scrollToGroup] || -1}
          width={columnWidth * columnCount}
          onRowsRendered={this.handleRendered}
          onScroll={onScroll}
          {...renderProps}
        />
      </div>
    );
  }
}

export default withContext(EmojiVirtualList);
