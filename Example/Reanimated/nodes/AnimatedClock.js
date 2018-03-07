import AnimatedValue from './AnimatedValue';
import { val } from '../utils';

class AnimatedMainClock extends AnimatedValue {
  _frameCallback;

  constructor() {
    super(0);
  }

  _runFrame = () => {
    this._updateValue(+new Date());
    if (this.__children.length > 0) {
      this._frameCallback = requestAnimationFrame(this._runFrame);
    }
  };

  __attach() {
    super.__attach();
    if (!this._frameCallback) {
      this._frameCallback = requestAnimationFrame(this._runFrame);
    }
  }

  __detach() {
    if (this._frameCallback) {
      cancelAnimationFrame(this._frameCallback);
      this._frameCallback = null;
    }
    super.__detach();
  }
}

const mainClock = new AnimatedMainClock();

export default class AnimatedClock extends AnimatedValue {
  _started;
  _attached;

  __onEvaluate() {
    return val(mainClock);
  }

  __attach() {
    super.__attach();
    if (this._started && !this._attached) {
      mainClock.__addChild(this);
    }
    this._attached = true;
  }

  __detach() {
    if (this._started && this._attached) {
      mainClock.__removeChild(this);
    }
    this._attached = false;
    super.__detach();
  }

  start() {
    if (!this._started && this._attached) {
      mainClock.__addChild(this);
    }
    this._started = true;
  }

  stop() {
    if (this._started && this._attached) {
      mainClock.__removeChild(this);
    }
    this._started = false;
  }
}

const clock = mainClock;
export { clock };
