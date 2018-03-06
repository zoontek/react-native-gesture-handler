import NativeAnimatedHelper from 'NativeAnimatedHelper';

// Important note: start() and stop() will only be called at most once.
// Once an animation has been stopped or finished its course, it will
// not be reused.
class Animation {
  start(fromValue, onUpdate, onEnd, previousAnimation, animatedValue) {}
  stop() {
    if (this.__nativeId) {
      NativeAnimatedHelper.API.stopAnimation(this.__nativeId);
    }
  }
  __getNativeAnimationConfig() {
    // Subclasses that have corresponding animation implementation done in native
    // should override this method
    throw new Error('This animation type cannot be offloaded to native');
  }
  // Helper function for subclasses to make sure onEnd is only called once.
  __debouncedOnEnd(result) {
    const onEnd = this.__onEnd;
    this.__onEnd = null;
    onEnd && onEnd(result);
  }
  __startNativeAnimation(animatedValue) {
    animatedValue.__makeNative();
    this.__nativeId = NativeAnimatedHelper.generateNewAnimationId();
    NativeAnimatedHelper.API.startAnimatingNode(
      this.__nativeId,
      animatedValue.__getNativeTag(),
      this.__getNativeAnimationConfig(),
      this.__debouncedOnEnd.bind(this)
    );
  }
}

export default Animation;
