const AnimatedNode = require('./AnimatedNode');
const NativeAnimatedHelper = require('../NativeAnimatedHelper');

class AnimatedWithInput extends AnimatedNode {
  constructor(inputNodes) {
    super();
    this.__inputNodes =
      inputNodes && inputNodes.filter(node => node instanceof AnimatedNode);
  }

  __attach() {
    super.__attach();
    this.__inputNodes &&
      this.__inputNodes.forEach(node => node.__addChild(this));
  }

  __detach() {
    this.__inputNodes &&
      this.__inputNodes.forEach(node => node.__removeChild(this));
    super.__detach();
  }
}

module.exports = AnimatedWithInput;
