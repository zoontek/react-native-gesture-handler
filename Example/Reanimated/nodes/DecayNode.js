import AnimatedWithInput from './AnimatedWithInput';
import { proxyAnimatedObject, val } from '../utils';

const VELOCITY_EPS = 5;

function decay(now, state, config) {
  const lastTimeMs = state.time || now;
  const lastVelocity = state.velocity;
  const lastPosition = state.position;

  const dtMs = now - lastTimeMs;

  // v0 = v / 1000
  // v = v0 * powf(deceleration, dt);
  // v = v * 1000;

  // x0 = x;
  // x = x0 + v0 * deceleration * (1 - powf(deceleration, dt)) / (1 - deceleration)
  const deceleration = config.deceleration;
  const kv = Math.pow(deceleration, dtMs);
  const kx = deceleration * (1 - kv) / (1 - deceleration);

  const v0 = lastVelocity / 1000;
  const v = v0 * kv * 1000;
  const x = lastPosition + v0 * kx;

  state.position = x;
  state.velocity = v;
  state.time = now;

  if (Math.abs(v) < VELOCITY_EPS) {
    state.finished = true;
  }
}

export default class DecayNode extends AnimatedWithInput {
  _clock;
  _state;
  _config;

  constructor(clock, state, config) {
    super([clock]);
    this._clock = clock;
    this._state = proxyAnimatedObject(state);
    this._config = config;
  }

  __onEvaluate() {
    decay(val(this._clock), this._state, this._config);
  }
}
