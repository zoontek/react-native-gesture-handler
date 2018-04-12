import { NativeEventEmitter, NativeModules } from 'react-native';

import { val } from '../utils';
import AnimatedNode from './AnimatedNode';

const { ReanimatedModule } = NativeModules;
const EVENT_EMITTER = new NativeEventEmitter(ReanimatedModule);

export default class AnimatedCall extends AnimatedNode {
  _callback;
  _args;

  constructor(args, jsFunction) {
    super({ type: 'call', input: args.map(n => n.__nodeID) }, args);
    this._callback = jsFunction;
    this._args = args;
  }

  _listener = data => {
    if (data.id !== this.__nodeID) {
      return;
    }
    this._callback(data.args);
  };

  __attach() {
    super.__attach();
    EVENT_EMITTER.addListener('onReanimatedCall', this._listener);
  }

  __detach() {
    EVENT_EMITTER.removeListener('onReanimatedCall', this._listener);
  }

  __onEvaluate() {
    this._callback(this._args.map(val));
    return 0;
  }
}
