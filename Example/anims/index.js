import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import Animated from '../Reanimated/Animated';

class Snappable extends Component {
  constructor(props) {
    super(props);

    const {
      set,
      cond,
      eq,
      add,
      multiply,
      lessThan,
      spring,
      startClock,
      stopClock,
      Value,
      Clock,
      event,
    } = Animated;

    const TOSS_SEC = 0.2;

    const dragX = new Value(0);
    const state = new Value(-1);
    const dragVX = new Value(0);

    this._onGestureEvent = event([
      { nativeEvent: { translationX: dragX, velocityX: dragVX } },
    ]);
    this._onHandlerStateChange = event([{ nativeEvent: { state: state } }]);

    const transX = new Value(0);
    const prevState = new Value(-1);
    const prevDragX = new Value(0);

    const clock = new Clock();

    const springState = {
      finished: new Value(0),
      velocity: new Value(0),
      position: new Value(0),
      time: new Value(0),
    };

    const springConfig = {
      damping: 7,
      mass: 1,
      stiffness: 121.6,
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      toValue: new Value(0),
    };

    this._transX = cond(
      eq(state, State.ACTIVE),
      [
        set(transX, add(transX, add(dragX, multiply(-1, prevDragX)))),
        set(springState.time, clock),
        set(prevDragX, dragX),
        set(prevState, state),
        transX,
      ],
      [
        cond(eq(prevState, State.ACTIVE), [
          set(springState.finished, 0),
          set(springState.velocity, dragVX),
          set(springState.position, transX),
          set(
            springConfig.toValue,
            cond(
              lessThan(add(transX, multiply(TOSS_SEC, dragVX)), 0),
              -100,
              100
            )
          ),
          set(prevDragX, 0),
          startClock(clock),
        ]),
        spring(clock, springState, springConfig),
        cond(springState.finished, stopClock(clock)),
        set(prevState, state),
        set(transX, springState.position),
      ]
    );
  }
  render() {
    const { children, ...rest } = this.props;
    return (
      <PanGestureHandler
        {...rest}
        maxPointers={1}
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}>
        <Animated.View style={{ transform: [{ translateX: this._transX }] }}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Snappable>
          <View style={styles.box} />
        </Snappable>
      </View>
    );
  }
}

const BOX_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderColor: '#F5FCFF',
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: BOX_SIZE / 2,
  },
});
