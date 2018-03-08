import React, { Component } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import {
  PanGestureHandler,
  State,
  PinchGestureHandler,
} from 'react-native-gesture-handler';

import Animated from '../Reanimated/Animated';

const {
  set,
  cond,
  eq,
  add,
  multiply,
  divide,
  lessThan,
  spring,
  call,
  startClock,
  stopClock,
  Value,
  Clock,
  event,
} = Animated;

// Takes pan gesture state and gesture translation (X or Y) and returns an Animated
// value that represents a change since the last time that translation changed.
// This happens while making sure when the gesture stops the next time it activates
// the initial change would be 0.
function makeDragDiv(state, drag) {
  const tmp = new Value(1);
  const prev = new Value(0);
  return cond(
    eq(state, State.ACTIVE),
    [set(tmp, add(drag, multiply(-1, prev))), set(prev, drag), tmp],
    set(prev, 0)
  );
}

// This is very similar to makeDragDiv but works for the scale attribute of pinch
// gesture. The difference is that when the gesture is stationary we want 1 not 0
// and also the change is expressed as a quotient of current and previous scale
// values. That is when scale changes from 1.5 to 1.8 the change is 1.2 because
// 1.8 = 1.2 * 1.5
function makeScaleDiv(state, scale) {
  const tmp = new Value(1);
  const prev = new Value(1);
  return cond(
    eq(state, State.ACTIVE),
    [set(tmp, divide(scale, prev)), set(prev, scale), tmp],
    set(prev, 1)
  );
}

class Viewer extends Component {
  constructor(props) {
    super(props);

    const stash = new Value(1);

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
    const scaleDiv = makeScaleDiv(pinchState, pinchScale);
    const scale = new Value(1);
    this._scale = set(scale, multiply(scale, scaleDiv));

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

    // X
    const dragDivX = makeDragDiv(panState, dragX);
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
      add(panTransX, add(dragDivX, focalTransX))
    );

    // Y
    const dragDivY = makeDragDiv(panState, dragY);
    const panTransY = new Value(0);
    const focalTransY = multiply(
      add(panTransY, multiply(-1, pinchFocalY)),
      add(scaleDiv, -1)
    );
    this._panTransY = set(
      panTransY,
      add(panTransY, add(dragDivY, focalTransY))
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
