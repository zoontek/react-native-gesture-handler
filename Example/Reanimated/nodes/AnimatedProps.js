const { AnimatedEvent } = require('../AnimatedEvent');
const AnimatedNode = require('./AnimatedNode');
const AnimatedStyle = require('./AnimatedStyle');
const NativeAnimatedHelper = require('../NativeAnimatedHelper');
const ReactNative = require('ReactNative');

const invariant = require('fbjs/lib/invariant');

class AnimatedProps extends AnimatedNode {
  constructor(props, callback) {
    super();
    if (props.style) {
      props = {
        ...props,
        style: new AnimatedStyle(props.style),
      };
    }
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

  __attach() {
    for (const key in this._props) {
      const value = this._props[key];
      if (value instanceof AnimatedNode) {
        value.__addChild(this);
      }
    }
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
    if (this.__isNative && this._animatedView) {
      this.__disconnectAnimatedView();
    }
    for (const key in this._props) {
      const value = this._props[key];
      if (value instanceof AnimatedNode) {
        value.__removeChild(this);
      }
    }
    super.__detach();
  }

  update() {
    this._callback();
  }

  __makeNative() {
    if (!this.__isNative) {
      this.__isNative = true;
      for (const key in this._props) {
        const value = this._props[key];
        if (value instanceof AnimatedNode) {
          value.__makeNative();
        }
      }
      if (this._animatedView) {
        this.__connectAnimatedView();
      }
    }
  }

  setNativeView(animatedView) {
    if (this._animatedView === animatedView) {
      return;
    }
    this._animatedView = animatedView;
    if (this.__isNative) {
      this.__connectAnimatedView();
    }
  }

  __connectAnimatedView() {
    invariant(this.__isNative, 'Expected node to be marked as "native"');
    const nativeViewTag = ReactNative.findNodeHandle(this._animatedView);
    invariant(
      nativeViewTag != null,
      'Unable to locate attached view in the native tree'
    );
    NativeAnimatedHelper.API.connectAnimatedNodeToView(
      this.__getNativeTag(),
      nativeViewTag
    );
  }

  __disconnectAnimatedView() {
    invariant(this.__isNative, 'Expected node to be marked as "native"');
    const nativeViewTag = ReactNative.findNodeHandle(this._animatedView);
    invariant(
      nativeViewTag != null,
      'Unable to locate attached view in the native tree'
    );
    NativeAnimatedHelper.API.disconnectAnimatedNodeFromView(
      this.__getNativeTag(),
      nativeViewTag
    );
  }

  __getNativeConfig() {
    const propsConfig = {};
    for (const propKey in this._props) {
      const value = this._props[propKey];
      if (value instanceof AnimatedNode) {
        propsConfig[propKey] = value.__getNativeTag();
      }
    }
    return {
      type: 'props',
      props: propsConfig,
    };
  }
}

module.exports = AnimatedProps;
