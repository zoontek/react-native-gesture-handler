import AnimatedWithInput from './AnimatedWithInput';
import { val } from '../utils';

export default class AnimatedSet extends AnimatedWithInput {
  _what;
  _value;

  constructor(what, value) {
    super([value]);
    this._what = what;
    this._value = value;
  }

  __onEvaluate() {
    const newValue = val(this._value);
    this._what._updateValue(newValue);
    return newValue;
  }
}
