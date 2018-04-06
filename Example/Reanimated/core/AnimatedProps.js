import { AnimatedEvent } from '../AnimatedEvent';
import AnimatedNode from './AnimatedNode';
import AnimatedStyle from './AnimatedStyle';
import ReactNative from 'ReactNative';

import invariant from 'fbjs/lib/invariant';

function sanitizeProps(inputProps) {
  const props = {};
  for (const key in inputProps) {
    const value = inputProps[key];
    if (value instanceof AnimatedNode) {
      props[key] = value.__nodeID;
    }
  }
  return props;
}

export default class AnimatedProps extends AnimatedNode {
  constructor(props, callback) {
    if (props.style) {
      props = { ...props, style: new AnimatedStyle(props.style) };
    }
    super({ type: 'props', props: sanitizeProps(props) }, Object.values(props));
    this._props = props;
    this._callback = callback;
    this.__attach();
  }

  __getProps() {
    const props = {};
    for (const key in this._props) {
      const value = this._props[key];
      if (value instanceof AnimatedNode) {
        if (!value.__isNative || value instanceof AnimatedStyle) {
          // We cannot use value of natively driven nodes this way as the value we have access from
          // JS may not be up to date.
          props[key] = value.__getProps();
        }
      } else if (value instanceof AnimatedEvent) {
        props[key] = value.__getHandler();
      } else {
        props[key] = value;
      }
    }
    return props;
  }

  __onEvaluate() {
    const props = {};
    for (const key in this._props) {
      const value = this._props[key];
      if (value instanceof AnimatedNode) {
        props[key] = value.__getValue();
      }
    }
    return props;
  }

  __getParams() {
    const params = [];
    for (const key in this._props) {
      const value = this._props[key];
      if (value instanceof AnimatedNode) {
        params.push(value);
      }
    }
    return params;
  }

  __detach() {
    const nativeViewTag = ReactNative.findNodeHandle(this._animatedView);
    invariant(
      nativeViewTag != null,
      'Unable to locate attached view in the native tree'
    );
    this._disconnectAnimatedView(nativeViewTag);
    super.__detach();
  }

  update() {
    this._callback();
  }

  setNativeView(animatedView) {
    if (this._animatedView === animatedView) {
      return;
    }
    this._animatedView = animatedView;

    const nativeViewTag = ReactNative.findNodeHandle(this._animatedView);
    invariant(
      nativeViewTag != null,
      'Unable to locate attached view in the native tree'
    );
    this._connectAnimatedView(nativeViewTag);
  }
}
