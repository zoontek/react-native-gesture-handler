import { val } from '../utils';
import AnimatedWithInput from './AnimatedWithInput';

export default class AnimatedCond extends AnimatedWithInput {
  _condition;
  _ifBlock;
  _elseBlock;

  constructor(condition, ifBlock, elseBlock) {
    super([condition, ifBlock, elseBlock]);
    this._condition = condition;
    this._ifBlock = ifBlock;
    this._elseBlock = elseBlock;
  }

  __onEvaluate() {
    if (val(this._condition)) {
      return val(this._ifBlock);
    } else {
      return this._elseBlock !== undefined ? val(this._elseBlock) : undefined;
    }
  }
}
