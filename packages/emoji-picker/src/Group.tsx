/**
 * @copyright   2016-2018, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import React from 'react';
import PropTypes from 'prop-types';
import camelCase from 'lodash/camelCase';
import withContext, { ContextProps } from './Context';
import { GROUP_KEY_COMMONLY_USED } from './constants';
import { ContextShape } from './shapes';
import { CommonMode, GroupKey } from './types';

export interface GroupProps {
  activeGroup: GroupKey;
  children: React.ReactNode;
  commonMode: CommonMode;
  group: GroupKey;
  onSelect: (group: GroupKey, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export class Group extends React.PureComponent<GroupProps & ContextProps> {
  static propTypes = {
    activeGroup: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    commonMode: PropTypes.string.isRequired,
    context: ContextShape.isRequired,
    group: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
  };

  /**
   * Triggered when the button is clicked.
   */
  private handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    this.props.onSelect(this.props.group, event);
  };

  render() {
    const {
      activeGroup,
      children,
      commonMode,
      context: { classNames, messages },
      group,
    } = this.props;
    const key = camelCase(group === GROUP_KEY_COMMONLY_USED ? commonMode : group);
    const className = [classNames.group];

    if (group === activeGroup) {
      className.push(classNames.groupActive);
    }

    return (
      <button
        className={className.join(' ')}
        title={messages[key]}
        type="button"
        onClick={this.handleClick}
      >
        {children}
      </button>
    );
  }
}

export default withContext(Group);
