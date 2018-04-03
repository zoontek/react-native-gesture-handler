import { val } from '../utils';
import AnimatedNode from './AnimatedNode';

export default class AnimatedDebug extends AnimatedNode {
  _message;
  _value;

  constructor(message, value) {
    super('debug', { message }, [value]);
    this._message = message;
    this._value = value;
  }

  __onEvaluate() {
    console.log(this._message, val(this._value));
  }
}
