import AnimatedNode from './AnimatedNode';
import AnimatedWithInput from './AnimatedWithInput';

export default class AnimatedBlock extends AnimatedWithInput {
  _array;

  constructor(array) {
    super(array);
    this._array = array;
  }

  __onEvaluate() {
    let result;
    this._array.forEach(node => {
      result = node instanceof AnimatedNode ? node.__getValue() : node;
    });
    return result;
  }
}
