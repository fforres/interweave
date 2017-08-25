/**
 * @copyright   2016, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import React from 'react';
import PropTypes from 'prop-types';

import type { LinkProps } from '../types';

export default function Link({ children, href, onClick, newWindow }: LinkProps) {
  return (
    <a
      href={href}
      className="interweave__link"
      target={newWindow ? '_blank' : null}
      onClick={onClick}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

Link.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
  newWindow: PropTypes.bool,
  onClick: PropTypes.func,
};

Link.defaultProps = {
  newWindow: false,
  onClick: null,
};