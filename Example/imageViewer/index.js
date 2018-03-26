import React, { Component } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import {
  PanGestureHandler,
  State,
  PinchGestureHandler,
} from 'react-native-gesture-handler';

import Animated from '../Reanimated/Animated';
import Easing from 'Easing';

const {
  set,
  cond,
  eq,
  or,
  add,
  pow,
  min,
  max,
  debug,
  multiply,
  divide,
  lessThan,
  spring,
  decay,
  timing,
  call,
  diff,
  block,
  startClock,
  stopClock,
  clockRunning,
  Value,
  Clock,
  event,
} = Animated;

function scaleDiff(value) {
  const tmp = new Value(1);
  const prev = new Value(1);
  return [set(tmp, divide(value, prev)), set(prev, value), tmp];
}

function dragDiff(value, updating) {
  const tmp = new Value(0);
  const prev = new Value(0);
  return cond(
    updating,
    [set(tmp, add(value, multiply(-1, prev))), set(prev, value), tmp],
    set(prev, 0)
  );
}

// returns linear friction coeff. When `value` is 0 coeff is 1 (no friction), then
// it grows linearly until it reaches `MAX_FRICTION` when `value` is equal
// to `MAX_VALUE`
function friction(value) {
  const MAX_FRICTION = 5;
  const MAX_VALUE = 100;
  return max(
    1,
    min(MAX_FRICTION, add(1, multiply(value, (MAX_FRICTION - 1) / MAX_VALUE)))
  );
}

function speed(value) {
  const clock = new Clock();
  const dt = diff(clock);
  return cond(lessThan(dt, 1), 0, multiply(1000, divide(diff(value), dt)));
}

const MIN_SCALE = 1;
const MAX_SCALE = 2;

function scaleOverLimit(value) {
  return cond(
    lessThan(value, MIN_SCALE),
    add(MIN_SCALE, multiply(-1, value)),
    cond(lessThan(MAX_SCALE, value), add(value, -MAX_SCALE), 0)
  );
}

function scaleRest(value) {
  return cond(
    lessThan(value, MIN_SCALE),
    MIN_SCALE,
    cond(lessThan(MAX_SCALE, value), MAX_SCALE, value)
  );
}

function scaleFriction(value, delta) {
  const MAX_FRICTION = 20;
  const MAX_VALUE = 0.5;
  const res = multiply(value, delta);
  const howFar = scaleOverLimit(res);
  const friction = max(
    1,
    min(MAX_FRICTION, add(1, multiply(howFar, (MAX_FRICTION - 1) / MAX_VALUE)))
  );
  return cond(
    lessThan(0, howFar),
    multiply(value, add(1, divide(add(delta, -1), friction))),
    res
  );
}

function bouncyPinch(value, gesture, gestureActive) {
  const clock = new Clock();

  const timingState = {
    finished: new Value(0),
    position: new Value(0),
    frameTime: new Value(0),
    time: new Value(0),
  };

  const timingConfig = {
    toValue: new Value(0),
    duration: 300,
    easing: Easing.inOut(Easing.cubic),
  };

  const delta = scaleDiff(gesture);

  return cond(
    [delta, gestureActive], // use gestureDelta here to make sure it gets updated even when gesture is inactive
    [stopClock(clock), scaleFriction(value, delta)],
    cond(
      or(clockRunning(clock), scaleOverLimit(value)),
      // when spring clock is running or we are "over limit" we want to animate to
      [
        cond(clockRunning(clock), 0, [
          set(timingState.finished, 0),
          set(timingState.frameTime, 0),
          set(timingState.time, 0),
          set(timingState.position, value),
          set(timingConfig.toValue, scaleRest(value)),
          startClock(clock),
        ]),
        timing(clock, timingState, timingConfig),
        cond(timingState.finished, stopClock(clock)),
        timingState.position,
      ],
      value
    )
  );
}

function abs(a) {
  return cond(lessThan(a, 0), multiply(-1, a), a);
}

function bouncy(
  value,
  gestureDiv,
  gestureActive,
  lowerBound,
  upperBound,
  friction
) {
  const timingClock = new Clock();
  const decayClock = new Clock();

  const timingState = {
    finished: new Value(0),
    position: new Value(0),
    frameTime: new Value(0),
    time: new Value(0),
  };

  const decayState = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const decayConfig = {
    deceleration: 0.99,
  };

  const velocity = speed(value);

  // did value go beyond the limits (lower, upper)
  const isOutOfBounds = or(
    lessThan(value, lowerBound),
    lessThan(upperBound, value)
  );
  // position to snap to (upper or lower is beyond or the current value elsewhere)
  const rest = cond(
    lessThan(value, lowerBound),
    lowerBound,
    cond(lessThan(upperBound, value), upperBound, value)
  );
  // how much the value exceeds the bounds, this is used to calculate friction
  const outOfBounds = abs(add(rest, multiply(-1, value)));

  const timingConfig = {
    toValue: rest,
    duration: 300,
    easing: Easing.inOut(Easing.cubic),
  };

  return cond(
    [gestureDiv, velocity, gestureActive],
    [
      stopClock(timingClock),
      stopClock(decayClock),
      add(value, divide(gestureDiv, friction(outOfBounds))),
    ],
    cond(
      or(clockRunning(timingClock), isOutOfBounds),
      // when timing clock is running or we are "over limit" we want to animate to
      [
        cond(clockRunning(timingClock), 0, [
          set(timingState.finished, 0),
          set(timingState.position, value),
          set(timingState.frameTime, 0),
          set(timingState.time, 0),
          startClock(timingClock),
        ]),
        stopClock(decayClock),
        set(timingState.position, value),
        timing(timingClock, timingState, timingConfig),
        cond(timingState.finished, stopClock(timingClock)),
        timingState.position,
      ],
      cond(
        or(clockRunning(decayClock), lessThan(5, abs(velocity))),
        [
          cond(clockRunning(decayClock), 0, [
            set(decayState.finished, 0),
            set(decayState.velocity, velocity),
            set(decayState.position, value),
            set(decayState.time, 0),
            startClock(decayClock),
          ]),
          set(decayState.position, value),
          decay(decayClock, decayState, decayConfig),
          cond(decayState.finished, stopClock(decayClock)),
          decayState.position,
        ],
        value
      )
    )
  );
}

/**
 * This method creates a translateX component that comes from adjusting the view
 * to scale around the pinch gesture focal point. We make sure that the location
 * on the image that is under gesture focal point stays in the same place before
 * and after zooming. For X axis the location is expressed by `pinchFocalX - panTransX`,
 * because focalX provided by the event is relative to the image view and we also
 * take into account that the image might have already been translated by `panTransX`.
 * Finally to calculate how the location would translate after scaling in a given
 * frame we multiply by `scaleDiv` which represents a change in scale for the
 * current frame. The whole formula goes as follows:
 * focalTransX = (pinchFocalX - panTransX) - (pinchFocalX - panTransX) * scaleDiv
 */
function focalDisplacement(gestureActive, position, focalPoint, scale) {
  const displacement = new Value(0);
  const scaleDiv = scaleDiff(scale);
  const focalCenter = new Value(0);
  const realPosition = add(
    displacement,
    cond(gestureActive, set(focalCenter, position), focalCenter)
  );
  return set(
    displacement,
    add(
      displacement,
      multiply(add(realPosition, multiply(-1, focalPoint)), add(scaleDiv, -1))
    )
  );
}

/**
 * This method calculates upper and lower bounds for the frame where image can
 * be panned around. The bounds are "dynamic" because they depend on how the
 * image is scaled and displaced by zooming in different areas of the image.
 * E.g. when we pinch to zoom close to the right edge the image will get displaced
 * to the left way further than when we pinch in the middle.
 *
 * On top of that when the scale goes below 1 (that is the image takes less space
 * than the view has) we pretend as if the scale was still 1. This is needed for
 * the "bounce back" animation to behave correctly, because if we were keep
 * adding displacement when the scale goes below 1 and when we stop pinching:
 *  a) there would be a conflict between constraints for the upper and lower
 *     bounds as they both cannot be satisfied in this circumstances
 *  b) because of the above we would try to animate translation of the image but
 *     that would also conflict with the scale animation that would bounce back
 *     to one.
 *
 * The upper bound for translation when there is no scaling is 0 and lower bound
 * is the size of the image. Since there could be a displacement that comes from
 * pinch (focal displacement) for the upper bound instead of 0 we take -displacement
 * and for the lower bound we just add the size. Finally since there could be
 * scaling involved the image can be larger than size by (scale * (size - 1))
 * and so we need to subtract this from the lower bound.
 *
 * Each time we reference "scale" here we use "boundScale" which means that we
 * use the original scale as long as its greater than 1 and we take 1 otherwise.
 */
function createDragBounds(gestureActive, position, focalPoint, scale, size) {
  const boundScale = max(1, scale);
  const displacementWithBoundScale = focalDisplacement(
    gestureActive,
    position,
    focalPoint,
    boundScale
  );
  const upperBound = multiply(-1, displacementWithBoundScale);
  const lowerBound = add(upperBound, add(size, multiply(boundScale, -size)));
  return [upperBound, lowerBound];
}

const WIDTH = 300;
const HEIGHT = 300;

class Viewer extends Component {
  constructor(props) {
    super(props);

    // PINCH
    const pinchScale = new Value(1);
    const pinchFocalX = new Value(0);
    const pinchFocalY = new Value(0);
    const pinchState = new Value(-1);

    this._onPinchEvent = event([
      {
        nativeEvent: {
          state: pinchState,
          scale: pinchScale,
          focalX: pinchFocalX,
          focalY: pinchFocalY,
        },
      },
    ]);

    // SCALE
    const scale = new Value(1);
    const pinchActive = eq(pinchState, State.ACTIVE);
    this._scale = set(scale, bouncyPinch(scale, pinchScale, pinchActive));

    // PAN
    const dragX = new Value(0);
    const dragY = new Value(0);
    const panState = new Value(-1);
    this._onPanEvent = event([
      {
        nativeEvent: {
          translationX: dragX,
          translationY: dragY,
          state: panState,
        },
      },
    ]);

    const panActive = eq(panState, State.ACTIVE);
    const panFriction = value => friction(value);

    // X
    const panTransX = new Value(0);
    this._focalDisplacementX = debug(
      'focal',
      focalDisplacement(pinchActive, panTransX, pinchFocalX, this._scale)
    );
    const [panUpX, panLowX] = createDragBounds(
      pinchActive,
      panTransX,
      pinchFocalX,
      this._scale,
      WIDTH
    );
    this._panTransX = set(
      panTransX,
      bouncy(
        panTransX,
        dragDiff(dragX, panActive),
        panActive,
        panLowX,
        panUpX,
        panFriction
      )
    );

    // Y
    // const panTransY = new Value(0);
    // this._focalDisplacementY = focalDisplacement(
    //   panTransY,
    //   pinchFocalY,
    //   this._scale
    // );
    // const [panUpY, panLowY] = createDragBounds(
    //   panTransY,
    //   pinchFocalY,
    //   this._scale,
    //   WIDTH
    // );
    // this._panTransY = set(
    //   panTransY,
    //   bouncy(
    //     panTransY,
    //     dragDiff(dragY, panActive),
    //     gesturesActive,
    //     panLowY,
    //     panUpY,
    //     panFriction
    //   )
    // );
    this._focalDisplacementY = new Value(0);
    this._panTransY = new Value(0);
  }
  render() {
    // The below two animated values makes it so that scale appears to be done
    // from the top left corner of the image view instead of its center. This
    // is required for the "scale focal point" math to work correctly
    const scaleTopLeftFixX = divide(multiply(WIDTH, add(this._scale, -1)), 2);
    const scaleTopLeftFixY = divide(multiply(HEIGHT, add(this._scale, -1)), 2);
    return (
      <PinchGestureHandler
        id="pinch"
        simultaneousHandlers="pan"
        onGestureEvent={this._onPinchEvent}
        onHandlerStateChange={this._onPinchEvent}>
        <PanGestureHandler
          id="pan"
          simultaneousHandlers="pinch"
          onGestureEvent={this._onPanEvent}
          onHandlerStateChange={this._onPanEvent}>
          <Animated.View style={styles.wrapper}>
            <Animated.Image
              style={[
                styles.image,
                {
                  transform: [
                    { translateX: this._panTransX },
                    { translateY: this._panTransY },
                    { translateX: this._focalDisplacementX },
                    { translateY: this._focalDisplacementY },
                    { translateX: scaleTopLeftFixX },
                    { translateY: scaleTopLeftFixY },
                    { scale: this._scale },
                  ],
                },
              ]}
              resizeMode="center"
              source={this.props.source}
            />
          </Animated.View>
        </PanGestureHandler>
      </PinchGestureHandler>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Viewer source={require('./grid.png')} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  wrapper: {
    borderColor: 'green',
    borderWidth: 2,
    overflow: 'hidden',
  },
  image: {
    width: 300,
    height: 300,
    backgroundColor: 'black',
  },
});
