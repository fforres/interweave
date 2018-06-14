/**
 * @copyright   2016-2018, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { CanonicalEmoji, EmojiShape, Path, PathShape, Source, SourceShape } from 'interweave-emoji';
import withContext, { ContextProps } from './Context';
import EmojiButton from './Emoji';
import GroupListHeader from './GroupListHeader';
import {
  GROUPS,
  GROUP_KEY_COMMONLY_USED,
  GROUP_KEY_SEARCH_RESULTS,
  GROUP_KEY_SMILEYS_PEOPLE,
  GROUP_KEY_NONE,
  SCROLL_BUFFER,
  SCROLL_DEBOUNCE,
} from './constants';
import { ContextShape } from './shapes';
import { CommonMode, GroupKey, GroupEmojiMap } from './types';

export interface EmojiListProps {
  activeEmoji?: CanonicalEmoji | null;
  activeGroup: GroupKey;
  clearIcon?: React.ReactNode;
  commonMode: CommonMode;
  emojiPadding: number;
  emojiPath: Path;
  emojiSize: number;
  emojiSource: Source;
  groupedEmojis: GroupEmojiMap;
  hideGroupHeaders: boolean;
  onClear: () => void;
  onEnterEmoji: (emoji: CanonicalEmoji, event: React.MouseEvent<HTMLButtonElement>) => void;
  onLeaveEmoji: (emoji: CanonicalEmoji, event: React.MouseEvent<HTMLButtonElement>) => void;
  onScroll: () => void;
  onScrollGroup: (group: GroupKey) => void;
  onSelectEmoji: (emoji: CanonicalEmoji, event: React.MouseEvent<HTMLButtonElement>) => void;
  scrollToGroup: GroupKey | '';
  searching: boolean;
  skinTonePalette?: React.ReactNode;
}

export interface EmojiListState {
  loadedGroups: Set<GroupKey>;
}

export type EmojiListUnifiedProps = EmojiListProps & ContextProps;

export class EmojiList extends React.PureComponent<EmojiListUnifiedProps, EmojiListState> {
  static propTypes = {
    activeEmoji: EmojiShape,
    activeGroup: PropTypes.string.isRequired,
    clearIcon: PropTypes.node,
    commonMode: PropTypes.string.isRequired,
    context: ContextShape.isRequired,
    emojiPadding: PropTypes.number.isRequired,
    emojiPath: PathShape.isRequired,
    emojiSize: PropTypes.number.isRequired,
    emojiSource: SourceShape.isRequired,
    groupedEmojis: PropTypes.objectOf(
      PropTypes.shape({
        emojis: PropTypes.arrayOf(EmojiShape).isRequired,
        group: PropTypes.string.isRequired,
      }),
    ).isRequired,
    hideGroupHeaders: PropTypes.bool.isRequired,
    onClear: PropTypes.func.isRequired,
    onEnterEmoji: PropTypes.func.isRequired,
    onLeaveEmoji: PropTypes.func.isRequired,
    onScroll: PropTypes.func.isRequired,
    onScrollGroup: PropTypes.func.isRequired,
    onSelectEmoji: PropTypes.func.isRequired,
    scrollToGroup: PropTypes.string.isRequired,
    searching: PropTypes.bool.isRequired,
    skinTonePalette: PropTypes.node,
  };

  static defaultProps = {
    activeEmoji: null,
    clearIcon: null,
    skinTonePalette: null,
  };

  containerRef = React.createRef<HTMLDivElement>();

  constructor(props: EmojiListUnifiedProps) {
    super(props);

    const { activeGroup } = props;
    const loadedGroups: GroupKey[] = [
      activeGroup,
      GROUP_KEY_COMMONLY_USED,
      GROUP_KEY_SEARCH_RESULTS,
      GROUP_KEY_NONE,
    ];

    // When commonly used emojis are rendered,
    // the smileys group is usually within view as well,
    // so we should preload both of them.
    if (activeGroup && activeGroup === GROUP_KEY_COMMONLY_USED) {
      loadedGroups.push(GROUP_KEY_SMILEYS_PEOPLE);
    }

    this.state = {
      loadedGroups: new Set(loadedGroups),
    };
  }

  /**
   * Load emojis after the ref has been set.
   */
  componentDidMount() {
    setTimeout(() => {
      if (this.containerRef.current) {
        this.scrollToGroup(this.props.activeGroup);
      }
    }, 0);
  }

  /**
   * Update scroll position after the list has rendered.
   */
  componentDidUpdate(prevProps: EmojiListUnifiedProps) {
    const { activeGroup, searching, scrollToGroup } = this.props;

    // Search query has changed
    if (searching !== prevProps.searching) {
      if (searching) {
        this.scrollToGroup(GROUP_KEY_SEARCH_RESULTS);
      } else {
        this.scrollToGroup(activeGroup);
      }
    }

    // Scroll to group when the tab is clicked
    if (scrollToGroup && scrollToGroup !== prevProps.scrollToGroup) {
      this.scrollToGroup(scrollToGroup);
    }
  }

  /**
   * Triggered when the container is scrolled.
   */
  handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.persist();

    this.handleScrollDebounced(event);
  };

  /**
   * A scroll handler that is debounced for performance.
   */
  private handleScrollDebounced = debounce(event => {
    this.loadEmojiImages(event.target as HTMLDivElement, event);
    this.props.onScroll();
  }, SCROLL_DEBOUNCE);

  /**
   * Loop over each group section within the scrollable container
   * and determine the active group and whether to load emoji images.
   */
  loadEmojiImages(container: HTMLDivElement, event?: React.SyntheticEvent<any>) {
    const { scrollTop } = container;
    const { searching } = this.props;
    const { loadedGroups } = this.state;
    let updateState = false;
    let lastGroup = '';

    Array.from(container.children).some(child => {
      const section = child as HTMLDivElement;
      const group = (section.getAttribute('data-group') || '') as GroupKey;
      let loadImages = false;

      // Special case for commonly used and smileys,
      // as they usually both render in the same view
      if (scrollTop === 0) {
        if (section.offsetTop === 0) {
          loadImages = true;
          lastGroup = group;
        }

        // While a group section is partially within view, update the active group
      } else if (
        !searching &&
        // Top is partially in view
        section.offsetTop - SCROLL_BUFFER <= scrollTop &&
        // Bottom is partially in view
        section.offsetTop + section.offsetHeight - SCROLL_BUFFER > scrollTop
      ) {
        loadImages = true;
        lastGroup = group;
      }

      // Before a group section is scrolled into view, lazy load emoji images
      if (section.offsetTop <= scrollTop + container.offsetHeight + SCROLL_BUFFER) {
        loadImages = true;
      }

      // Only update if not loaded
      if (loadImages && group && !loadedGroups.has(group)) {
        loadedGroups.add(group);
        updateState = true;
      }

      return section.offsetTop > scrollTop;
    });

    // Only update during a scroll event and if a different group
    if (event && lastGroup !== this.props.activeGroup) {
      this.props.onScrollGroup(lastGroup as GroupKey);
    }

    if (updateState) {
      this.setState({
        loadedGroups: new Set(loadedGroups),
      });
    }
  }

  /**
   * Scroll a group section to the top of the scrollable container.
   */
  scrollToGroup(group: string) {
    if (!this.containerRef.current) {
      return;
    }

    const { current } = this.containerRef;
    const element: HTMLDivElement | null = current.querySelector(`section[data-group="${group}"]`);

    if (!element || !current) {
      return;
    }

    // Scroll to the container
    current.scrollTop = element.offsetTop;

    // Eager load emoji images
    this.loadEmojiImages(current);
  }

  render() {
    const {
      activeEmoji,
      clearIcon,
      commonMode,
      context: { classNames, messages },
      emojiPadding,
      emojiPath,
      emojiSize,
      emojiSource,
      groupedEmojis,
      hideGroupHeaders,
      skinTonePalette,
      onClear,
      onEnterEmoji,
      onLeaveEmoji,
      onSelectEmoji,
    } = this.props;
    const { loadedGroups } = this.state;
    const noResults = Object.keys(groupedEmojis).length === 0;

    return (
      <div className={classNames.emojis} ref={this.containerRef} onScroll={this.handleScroll}>
        {noResults ? (
          <div className={classNames.noResults}>{messages.noResults}</div>
        ) : (
          Object.values(groupedEmojis).map(({ emojis, group }) => (
            <section key={group} className={classNames.emojisSection} data-group={group}>
              {!hideGroupHeaders && (
                <GroupListHeader
                  clearIcon={clearIcon}
                  commonMode={commonMode}
                  group={group}
                  onClear={onClear}
                  skinTonePalette={skinTonePalette}
                />
              )}

              <div className={classNames.emojisBody}>
                {emojis.map((emoji, index) => (
                  <EmojiButton
                    key={emoji.hexcode}
                    active={activeEmoji ? activeEmoji.hexcode === emoji.hexcode : false}
                    emoji={emoji}
                    emojiPadding={emojiPadding}
                    emojiPath={emojiPath}
                    emojiSize={emojiSize}
                    emojiSource={emojiSource}
                    showImage={loadedGroups.has(group)}
                    onEnter={onEnterEmoji}
                    onLeave={onLeaveEmoji}
                    onSelect={onSelectEmoji}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    );
  }
}

export default withContext(EmojiList);
