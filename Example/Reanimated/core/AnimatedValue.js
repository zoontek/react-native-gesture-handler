import InteractionManager from 'InteractionManager';
import NativeAnimatedHelper from '../NativeAnimatedHelper';
import AnimatedNode from './AnimatedNode';
import { onNodeUpdated } from '../CoreAnimated';

const NativeAnimatedAPI = NativeAnimatedHelper.API;

let _uniqueId = 1;

export default class AnimatedValue extends AnimatedNode {
  constructor(value) {
    super('val', { value });
    this._startingValue = this._value = value;
    this._offset = 0;
    this._animation = null;
    this._listeners = {};
  }

  __detach() {
    this.stopAnimation();
    super.__detach();
  }

  __onEvaluate() {
    return this._value + this._offset;
  }

  __makeNative() {
    super.__makeNative();

    if (Object.keys(this._listeners).length) {
      this._startListeningToNativeValueUpdates();
    }
  }

  /**
   * Directly set the value.  This will stop any animations running on the value
   * and update all the bound properties.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#setvalue
   */
  setValue(value) {
    if (this._animation) {
      this._animation.stop();
      this._animation = null;
    }
    this._updateValue(
      value,
      !this.__isNative /* don't perform a flush for natively driven values */
    );
    if (this.__isNative) {
      NativeAnimatedAPI.setAnimatedNodeValue(this.__getNativeTag(), value);
    }
  }

  /**
   * Sets an offset that is applied on top of whatever value is set, whether via
   * `setValue`, an animation, or `Animated.event`.  Useful for compensating
   * things like the start of a pan gesture.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#setoffset
   */
  setOffset(offset) {
    this._offset = offset;
    if (this.__isNative) {
      NativeAnimatedAPI.setAnimatedNodeOffset(this.__getNativeTag(), offset);
    }
  }

  /**
   * Merges the offset value into the base value and resets the offset to zero.
   * The final output of the value is unchanged.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#flattenoffset
   */
  flattenOffset() {
    this._value += this._offset;
    this._offset = 0;
    if (this.__isNative) {
      NativeAnimatedAPI.flattenAnimatedNodeOffset(this.__getNativeTag());
    }
  }

  /**
   * Sets the offset value to the base value, and resets the base value to zero.
   * The final output of the value is unchanged.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#extractoffset
   */
  extractOffset() {
    this._offset += this._value;
    this._value = 0;
    if (this.__isNative) {
      NativeAnimatedAPI.extractAnimatedNodeOffset(this.__getNativeTag());
    }
  }

  /**
   * Adds an asynchronous listener to the value so you can observe updates from
   * animations.  This is useful because there is no way to
   * synchronously read the value because it might be driven natively.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#addlistener
   */
  addListener(callback) {
    const id = String(_uniqueId++);
    this._listeners[id] = callback;
    if (this.__isNative) {
      this._startListeningToNativeValueUpdates();
    }
    return id;
  }

  /**
   * Unregister a listener. The `id` param shall match the identifier
   * previously returned by `addListener()`.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#removelistener
   */
  removeListener(id) {
    delete this._listeners[id];
    if (this.__isNative && Object.keys(this._listeners).length === 0) {
      this._stopListeningForNativeValueUpdates();
    }
  }

  /**
   * Remove all registered listeners.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#removealllisteners
   */
  removeAllListeners() {
    this._listeners = {};
    if (this.__isNative) {
      this._stopListeningForNativeValueUpdates();
    }
  }

  _startListeningToNativeValueUpdates() {
    if (this.__nativeAnimatedValueListener) {
      return;
    }

    NativeAnimatedAPI.startListeningToAnimatedNodeValue(this.__getNativeTag());
    this.__nativeAnimatedValueListener = NativeAnimatedHelper.nativeEventEmitter.addListener(
      'onAnimatedValueUpdate',
      data => {
        if (data.tag !== this.__getNativeTag()) {
          return;
        }
        this._updateValue(data.value, false /* flush */);
      }
    );
  }

  _stopListeningForNativeValueUpdates() {
    if (!this.__nativeAnimatedValueListener) {
      return;
    }

    this.__nativeAnimatedValueListener.remove();
    this.__nativeAnimatedValueListener = null;
    NativeAnimatedAPI.stopListeningToAnimatedNodeValue(this.__getNativeTag());
  }

  /**
   * Stops any running animation or tracking. `callback` is invoked with the
   * final value after stopping the animation, which is useful for updating
   * state to match the animation position with layout.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#stopanimation
   */
  stopAnimation(callback) {
    this.stopTracking();
    this._animation && this._animation.stop();
    this._animation = null;
    callback && callback(this.__getValue());
  }

  /**
   * Stops any animation and resets the value to its original.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#resetanimation
   */
  resetAnimation(callback) {
    this.stopAnimation(callback);
    this._value = this._startingValue;
  }

  /**
   * Typically only used internally, but could be used by a custom Animation
   * class.
   *
   * See http://facebook.github.io/react-native/docs/animatedvalue.html#animate
   */
  animate(animation, callback) {
    let handle = null;
    if (animation.__isInteraction) {
      handle = InteractionManager.createInteractionHandle();
    }
    const previousAnimation = this._animation;
    this._animation && this._animation.stop();
    this._animation = animation;
    animation.start(this);
    //   this._value,
    //   value => {
    //     // Natively driven animations will never call into that callback, therefore we can always
    //     // pass flush = true to allow the updated value to propagate to native with setNativeProps
    //     this._updateValue(value, true /* flush */);
    //   },
    //   result => {
    //     this._animation = null;
    //     if (handle !== null) {
    //       InteractionManager.clearInteractionHandle(handle);
    //     }
    //     callback && callback(result);
    //   },
    //   previousAnimation,
    //   this,
    // );
  }

  /**
   * Typically only used internally.
   */
  stopTracking() {
    this._tracking && this._tracking.__detach();
    this._tracking = null;
  }

  /**
   * Typically only used internally.
   */
  track(tracking) {
    this.stopTracking();
    this._tracking = tracking;
  }

  _updateValue(value, flush) {
    this._value = value;
    onNodeUpdated(this, value);
    for (const key in this._listeners) {
      this._listeners[key]({ value: this.__getValue() });
    }
  }

  __getNativeConfig() {
    return {
      type: 'value',
      value: this._value,
      offset: this._offset,
    };
  }
}
