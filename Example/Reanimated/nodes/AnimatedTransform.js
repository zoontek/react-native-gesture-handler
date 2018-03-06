import AnimatedNode from './AnimatedNode';
import AnimatedWithInput from './AnimatedWithInput';
import NativeAnimatedHelper from '../NativeAnimatedHelper';

function extractAnimatedParentNodes(transforms) {
  const parents = [];
  transforms.forEach(transform => {
    const result = {};
    for (const key in transform) {
      const value = transform[key];
      if (value instanceof AnimatedNode) {
        parents.push(value);
      }
    }
  });
  return parents;
}

export default class AnimatedTransform extends AnimatedWithInput {
  constructor(transforms) {
    super(extractAnimatedParentNodes(transforms));
    this._transforms = transforms;
  }

  __makeNative() {
    super.__makeNative();
    this._transforms.forEach(transform => {
      for (const key in transform) {
        const value = transform[key];
        if (value instanceof AnimatedNode) {
          value.__makeNative();
        }
      }
    });
  }

  __getProps() {
    return this._transforms.map(transform => {
      const result = {};
      for (const key in transform) {
        const value = transform[key];
        if (value instanceof AnimatedNode) {
          result[key] = value.__getProps();
        } else {
          result[key] = value;
        }
      }
      return result;
    });
  }

  __onEvaluate() {
    return this._transforms.map(transform => {
      const result = {};
      for (const key in transform) {
        const value = transform[key];
        if (value instanceof AnimatedNode) {
          result[key] = value.__getValue();
        }
      }
      return result;
    });
  }

  __getNativeConfig() {
    const transConfigs = [];

    this._transforms.forEach(transform => {
      for (const key in transform) {
        const value = transform[key];
        if (value instanceof AnimatedNode) {
          transConfigs.push({
            type: 'animated',
            property: key,
            nodeTag: value.__getNativeTag(),
          });
        } else {
          transConfigs.push({
            type: 'static',
            property: key,
            value,
          });
        }
      }
    });

    NativeAnimatedHelper.validateTransform(transConfigs);
    return {
      type: 'transform',
      transforms: transConfigs,
    };
  }
}
