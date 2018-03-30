import AnimatedNode from '../core/AnimatedNode';
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
    const progress = config.easing(frameTime / config.duration);
    const distanceLeft = config.toValue - position;
    const fullDistance = distanceLeft / (1 - progress);
    const startPosition = config.toValue - fullDistance;
    const nextProgress = config.easing((frameTime + dt) / config.duration);
    const nextPosition = startPosition + fullDistance * nextProgress;
    state.position = nextPosition;
  }
  state.frameTime = frameTime + dt;
  state.time = now;
}

export default class TimingNode extends AnimatedNode {
  _state;
  _config;
  _easing;
  _clock;

  constructor(clock, state, config) {
    super('timing', undefined, [clock]);
    this._clock = clock;
    this._state = proxyAnimatedObject(state);
    this._config = proxyAnimatedObject(config);
  }

  __onEvaluate() {
    timing(val(this._clock), this._state, this._config);
  }
}
