import AnimatedWithInput from './AnimatedWithInput';
import { val, proxyAnimatedObject } from '../utils';

function timing(now, state, config) {
  const time = state.time || now;
  const dt = now - time;
  const frameTime = state.frameTime;
  const position = state.position;

  if (frameTime + dt >= config.duration) {
    state.position = config.toValue;
    state.finished = 1;
  } else {
    const lastProgress = config.easing(frameTime / config.duration);
    const dp = config.easing((frameTime + dt) / config.duration) - lastProgress;
    const remaining = config.toValue - position;
    state.position = position + remaining * dp / (1 - lastProgress);
  }
  state.frameTime = frameTime + dt;
  state.time = now;
}

export default class TimingNode extends AnimatedWithInput {
  _state;
  _config;
  _easing;
  _clock;

  constructor(clock, state, config) {
    super([clock]);
    this._clock = clock;
    this._state = proxyAnimatedObject(state);
    this._config = proxyAnimatedObject(config);
  }

  update() {
    val(this);
  }

  __onEvaluate() {
    timing(val(this._clock), this._state, this._config);
  }
}
