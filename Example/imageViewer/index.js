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

// calculates how far is the image view translated beyond the visible bounds.
// E.g. when the image is at the left edge and start dragging right.
function overLimit(value, scale, length) {
  const rightEdge = add(value, multiply(length, scale));
  return cond(
    lessThan(0, value),
    value,
    max(0, add(length, multiply(-1, rightEdge)))
  );
}

function rest(value, scale, length) {
  return cond(
    lessThan(0, value),
    0,
    add(length, multiply(-1, multiply(scale, length)))
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

function bouncy(value, gesture, gestureActive, scale, length) {
  const timingClock = new Clock();
  const decayClock = new Clock();

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

  const decayState = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const decayConfig = {
    deceleration: 0.99,
  };

  const delta = diff(gesture);
  const velocity = speed(value);

  return cond(
    [delta, velocity, gestureActive], // use delta here to make sure it gets updated even when gesture is inactive
    [
      stopClock(timingClock),
      stopClock(decayClock),
      add(
        value,
        divide(delta, friction(overLimit(add(value, delta), scale, length)))
      ),
    ],
    cond(
      or(
        clockRunning(timingClock),
        lessThan(0, overLimit(value, scale, length))
      ),
      // when timing clock is running or we are "over limit" we want to animate to
      [
        cond(clockRunning(timingClock), 0, [
          set(timingState.finished, 0),
          set(timingState.position, value),
          set(timingState.frameTime, 0),
          set(timingState.time, 0),
          set(timingConfig.toValue, rest(value, scale, length)),
          startClock(timingClock),
        ]),
        stopClock(decayClock),
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
    const scaleDiv = scaleDiff(this._scale);

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

    const gesturesActive = or(
      eq(panState, State.ACTIVE),
      eq(pinchState, State.ACTIVE)
    );

    // X
    const panTransX = new Value(0);
    // translateX component that comes from adjusting the view to scale around
    // the pinch gesture focal point. We make sure that the location on the image
    // that is under gesture focal point stays in the same place before and after
    // zooming. The location is expressed by `pinchFocalX - panTransX`, because
    // focalX provided by the event is relative to the image view and we also
    // take to account the image might have already been translated by `panTransX`.
    // Finally to calculate how the location would translate after scaling we just
    // multiply by `scaleDiv` so the whole formula goes as follows:
    // focalTransX = (pinchFocalX - panTransX) - (pinchFocalX - panTransX) * scaleDiv
    // which can be expressed as:
    // focalTransX = (panTransX - pinchFocalX) * (scaleDiv - 1)
    const focalTransX = multiply(
      add(panTransX, multiply(-1, pinchFocalX)),
      add(scaleDiv, -1)
    );
    // We update translateX with the component that comes from the scaling focal
    // point (`focalTransX`) and component that comes from panning (`dragDivX`).
    this._panTransX = set(
      panTransX,
      bouncy(
        add(panTransX, focalTransX), // we always want to add focal component to the value as opposed to drag component that we may want to apply friction to
        dragX,
        gesturesActive,
        scale,
        300 // width
      )
    );

    // Y
    const panTransY = new Value(0);
    const focalTransY = multiply(
      add(panTransY, multiply(-1, pinchFocalY)),
      add(scaleDiv, -1)
    );
    this._panTransY = set(
      panTransY,
      bouncy(
        add(panTransY, focalTransY), // we always want to add focal component to the value as opposed to drag component that we may want to apply friction to
        dragY,
        gesturesActive,
        scale,
        300 // height
      )
    );
  }
  render() {
    const WIDTH = 300;
    const HEIGHT = 300;
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
