/**
 * @copyright   2016-2018, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import React from 'react';
import PropTypes from 'prop-types';
import withContext, { ContextProps } from './Context';
import { ContextShape } from './shapes';

export interface SearchBarProps {
  autoFocus: boolean;
  onChange: (query: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  searchQuery: string;
}

export class SearchBar extends React.PureComponent<SearchBarProps & ContextProps> {
  static propTypes = {
    autoFocus: PropTypes.bool.isRequired,
    context: ContextShape.isRequired,
    onChange: PropTypes.func.isRequired,
    onKeyUp: PropTypes.func.isRequired,
    searchQuery: PropTypes.string.isRequired,
  };

  inputRef = React.createRef<HTMLInputElement>();

  /**
   * Focus the input field if `autoFocus` is true.
   */
  componentDidMount() {
    if (this.props.autoFocus && this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  /**
   * Triggered when the input field value changes.
   */
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Check if were still mounted
    if (this.inputRef.current) {
      this.props.onChange(event.target.value.trim(), event);
    }
  };

  render() {
    const { classNames, messages } = this.props.context;
    const { onKeyUp } = this.props;

    return (
      <div className={classNames.search}>
        <input
          aria-label={messages.searchA11y}
          className={classNames.searchInput}
          placeholder={messages.search}
          ref={this.inputRef}
          type="search"
          value={this.props.searchQuery}
          onChange={this.handleChange}
          onKeyUp={onKeyUp}
        />
      </div>
    );
  }
}

export default withContext(SearchBar);
