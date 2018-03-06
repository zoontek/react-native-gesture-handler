import AnimatedWithInput from './AnimatedWithInput';
import { val } from '../utils';

export default class AnimatedBlock extends AnimatedWithInput {
  _array;

  constructor(array) {
    super(array);
    this._array = array;
  }

  __onEvaluate() {
    let result;
    this._array.forEach(node => {
      result = val(node);
    });
    return result;
  }
}
