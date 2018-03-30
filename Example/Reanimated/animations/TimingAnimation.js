import AnimatedValue from '../core/AnimatedValue';
import TimingNode from '../nodes/TimingNode';
import Animation from './Animation';

import { clock } from '../core/AnimatedClock';
import AnimatedOnChange from '../core/AnimatedOnChange';
import AnimatedDetach from '../core/AnimatedDetach';

import { shouldUseNativeDriver } from '../NativeAnimatedHelper';

let _easeInOut;
function easeInOut() {
  if (!_easeInOut) {
    const Easing = require('Easing');
    _easeInOut = Easing.inOut(Easing.ease);
  }
  return _easeInOut;
}

export default class TimingAnimation extends Animation {
  _startTime;
  _fromValue;
  _toValue;
  _duration;
  _delay;
  _easing;
  _onUpdate;
  _animationFrame;
  _timeout;
  _useNativeDriver;

  _finished;

  constructor(config) {
    super();
    this._config = { ...config };
    this._toValue = config.toValue;
    this._easing = config.easing !== undefined ? config.easing : easeInOut();
    this._duration = config.duration !== undefined ? config.duration : 500;
    this._delay = config.delay !== undefined ? config.delay : 0;
    this.__iterations = config.iterations !== undefined ? config.iterations : 1;
    this.__isInteraction =
      config.isInteraction !== undefined ? config.isInteraction : true;
    this._useNativeDriver = shouldUseNativeDriver(config);
  }

  start(value) {
    this._finished = new AnimatedValue(0);
    const state = {
      finished: this._finished,
      position: value,
      time: 0,
      frameTime: 0,
    };

    const config = {
      duration: this._duration,
      toValue: this._toValue,
      easing: this._easing,
    };

    const step = new TimingNode(clock, state, config);
    new AnimatedOnChange(this._finished, new AnimatedDetach(step)).__attach();
    step.__attach();
  }

  stop() {
    this._finished && this._finished.setValue(1);
  }
}
