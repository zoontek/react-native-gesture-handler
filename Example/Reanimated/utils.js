import AnimatedBlock from './nodes/AnimatedBlock';

export function adapt(v) {
  return Array.isArray(v)
    ? new AnimatedBlock(array.map(node => adapt(node)))
    : v;
}

export function val(v) {
  return v.__getValue ? v.__getValue() : v;
}
