import AnimatedWithInput from './AnimatedWithInput';
import { val } from '../utils';

function timing(now, state, config, easing) {
  const time = state.time || now;
  const dt = now - time;
  const frameTime = state.frameTime;
  const position = state.position;

  if (frameTime + dt >= config.duration) {
    state.position = config.toValue;
    state.finished = 1;
  } else {
    const lastProgress = easing(frameTime / config.duration);
    const dp = easing((frameTime + dt) / config.duration) - lastProgress;
    const remaining = config.toValue - position;
    state.position = position + remaining * dp / (1 - lastProgress);
  }
  state.frameTime = frameTime + dt;
  state.time = now;
}

export default class TimingStep extends AnimatedWithInput {
  _state;
  _config;
  _easing;
  _clock;

  constructor(clock, state, config, easing) {
    super([clock]);
    this._clock = clock;
    this._state = state;
    this._config = config;
    this._easing = easing;
  }

  update() {
    val(this);
  }

  __onEvaluate() {
    timing(val(this._clock), this._state, this._config, this._easing);
  }
}
