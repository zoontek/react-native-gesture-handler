import AnimatedBlock from './nodes/AnimatedBlock';
import AnimatedNode from './nodes/AnimatedNode';

export function adapt(v) {
  return Array.isArray(v) ? new AnimatedBlock(v.map(node => adapt(node))) : v;
}

export function val(v) {
  return v.__getValue ? v.__getValue() : v;
}

export function proxyAnimatedObject(target) {
  const handler = {
    get(target, key) {
      return val(target[key]);
    },
    set(target, key, val) {
      const value = target[key];
      if (value instanceof AnimatedNode) {
        return value._updateValue(val);
      } else {
        target[key] = val;
      }
      return true;
    },
  };
  return new Proxy(target, handler);
}
