import AnimatedNode from './AnimatedNode';
import AnimatedTransform from './AnimatedTransform';
import AnimatedWithInput from './AnimatedWithInput';
import NativeAnimatedHelper from '../NativeAnimatedHelper';

import flattenStyle from 'flattenStyle';

export default class AnimatedStyle extends AnimatedWithInput {
  constructor(style) {
    style = flattenStyle(style) || {};
    if (style.transform) {
      style = {
        ...style,
        transform: new AnimatedTransform(style.transform),
      };
    }
    super(Object.values(style));
    this._style = style;
  }

  // Recursively get values for nested styles (like iOS's shadowOffset)
  _walkStyleAndGetValues(style) {
    const updatedStyle = {};
    for (const key in style) {
      const value = style[key];
      if (value instanceof AnimatedNode) {
        if (!value.__isNative) {
          // We cannot use value of natively driven nodes this way as the value we have access from
          // JS may not be up to date.
          updatedStyle[key] = value.__getProps();
        }
      } else if (value && !Array.isArray(value) && typeof value === 'object') {
        // Support animating nested values (for example: shadowOffset.height)
        updatedStyle[key] = this._walkStyleAndGetValues(value);
      } else {
        updatedStyle[key] = value;
      }
    }
    return updatedStyle;
  }

  __getProps() {
    return this._walkStyleAndGetValues(this._style);
  }

  _walkStyleAndGetAnimatedValues(style) {
    const updatedStyle = {};
    for (const key in style) {
      const value = style[key];
      if (value instanceof AnimatedNode) {
        updatedStyle[key] = value.__getValue();
      } else if (value && !Array.isArray(value) && typeof value === 'object') {
        // Support animating nested values (for example: shadowOffset.height)
        updatedStyle[key] = this._walkStyleAndGetAnimatedValues(value);
      }
    }
    return updatedStyle;
  }

  __onEvaluate() {
    return this._walkStyleAndGetAnimatedValues(this._style);
  }

  __makeNative() {
    super.__makeNative();
    for (const key in this._style) {
      const value = this._style[key];
      if (value instanceof AnimatedNode) {
        value.__makeNative();
      }
    }
  }

  __getNativeConfig() {
    const styleConfig = {};
    for (const styleKey in this._style) {
      if (this._style[styleKey] instanceof AnimatedNode) {
        styleConfig[styleKey] = this._style[styleKey].__getNativeTag();
      }
      // Non-animated styles are set using `setNativeProps`, no need
      // to pass those as a part of the node config
    }
    NativeAnimatedHelper.validateStyles(styleConfig);
    return {
      type: 'style',
      style: styleConfig,
    };
  }
}
