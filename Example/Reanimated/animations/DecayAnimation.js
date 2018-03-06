import Animation from './Animation';

import { shouldUseNativeDriver } from '../NativeAnimatedHelper';

class DecayAnimation extends Animation {
  constructor(config) {
    super();
    this._deceleration =
      config.deceleration !== undefined ? config.deceleration : 0.998;
    this._velocity = config.velocity;
    this._useNativeDriver = shouldUseNativeDriver(config);
    this.__isInteraction =
      config.isInteraction !== undefined ? config.isInteraction : true;
    this.__iterations = config.iterations !== undefined ? config.iterations : 1;
  }

  __getNativeAnimationConfig() {
    return {
      type: 'decay',
      deceleration: this._deceleration,
      velocity: this._velocity,
      iterations: this.__iterations,
    };
  }

  start(fromValue, onUpdate, onEnd, previousAnimation, animatedValue) {
    this.__active = true;
    this._lastValue = fromValue;
    this._fromValue = fromValue;
    this._onUpdate = onUpdate;
    this.__onEnd = onEnd;
    this._startTime = Date.now();
    if (this._useNativeDriver) {
      this.__startNativeAnimation(animatedValue);
    } else {
      this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this));
    }
  }

  onUpdate() {
    const now = Date.now();

    const value =
      this._fromValue +
      this._velocity /
        (1 - this._deceleration) *
        (1 - Math.exp(-(1 - this._deceleration) * (now - this._startTime)));

    this._onUpdate(value);

    if (Math.abs(this._lastValue - value) < 0.1) {
      this.__debouncedOnEnd({ finished: true });
      return;
    }

    this._lastValue = value;
    if (this.__active) {
      this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this));
    }
  }

  stop() {
    super.stop();
    this.__active = false;
    global.cancelAnimationFrame(this._animationFrame);
    this.__debouncedOnEnd({ finished: false });
  }
}

export default DecayAnimation;
