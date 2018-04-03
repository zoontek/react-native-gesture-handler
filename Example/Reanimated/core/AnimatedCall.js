import { val } from '../utils';
import AnimatedNode from './AnimatedNode';

export default class AnimatedCall extends AnimatedNode {
  _callback;
  _args;

  constructor(args, jsFunction) {
    const callbackID = ++CALLBACK_ID;
    super('call', { callbackID }, args);
    this._callback = jsFunction;
    this._args = args;
  }

  __onEvaluate() {
    this._callback(this._args.map(val));
    return 0;
  }
}
