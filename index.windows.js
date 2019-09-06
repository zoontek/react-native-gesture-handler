import * as React from 'react';

export class BaseButton extends React.Component {
  render() {
    throw new Error(
      'this is not a good thing to happen! we should not get here'
    );
  }
}

export class PanGestureHandler extends React.Component {
  render() {
    return this.props.children;
  }
}

export State from './State';

export const Direction = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};
