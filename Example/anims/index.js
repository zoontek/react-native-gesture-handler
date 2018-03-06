import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import Animated from '../Reanimated/Animated';
import SpringNode from '../Reanimated/nodes/SpringNode';
import { clock } from '../Reanimated/nodes/AnimatedClock';

class Snappable extends Component {
  constructor(props) {
    super(props);
    this._dragX = new Animated.Value(0);
    this._state = new Animated.Value(-1);
    // this._transX = this._dragX.interpolate({
    //   inputRange: [-100, -50, 0, 50, 100],
    //   outputRange: [-30, -10, 0, 10, 30],
    // });
    this._onGestureEvent = Animated.event([
      { nativeEvent: { translationX: this._dragX } },
    ]);
    this._onHandlerStateChange = Animated.event([
      { nativeEvent: { state: this._state } },
    ]);

    const transX = new Animated.Value(0);

    const springFinished = new Animated.Value(0);
    const springVelocity = new Animated.Value(0);
    const springValue = new Animated.Value(0);
    const springTime = new Animated.Value(0);
    const springToValue = new Animated.Value(0);

    const ZERO = new Animated.Value(0);

    const springState = {
      finished: springFinished,
      velocity: springVelocity,
      position: springValue,
      time: springTime,
    };

    const springConfig = {
      damping: 7,
      mass: 1,
      stiffness: 121.6,
      overshootClamping: false,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      toValue: springToValue,
    };

    const springStep = new SpringNode(clock, springState, springConfig);
    const prevState = new Animated.Value(-1);

    const stash = new Animated.Value(0);
    const prev = new Animated.Value(0);

    this._transX = Animated.set(
      transX,
      Animated.block([
        Animated.cond(
          Animated.eq(this._state, State.ACTIVE),
          Animated.block([
            Animated.set(
              stash,
              Animated.add(
                transX,
                Animated.add(this._dragX, Animated.multiply(-1, prev))
              )
            ),
            Animated.set(prev, this._dragX),
          ]),
          Animated.block([
            Animated.cond(
              Animated.eq(prevState, State.ACTIVE),
              Animated.block([
                Animated.set(springFinished, ZERO),
                Animated.set(springVelocity, ZERO),
                Animated.set(springValue, transX),
                Animated.set(springTime, ZERO),
                Animated.set(prev, ZERO),
              ])
            ),
            springStep,
            Animated.set(stash, springValue),
          ])
        ),
        Animated.set(prevState, this._state),
        stash,
      ])
    );
  }
  // constructor(props) {
  //   super(props);
  //   this._dragX = new Animated.Value(0);
  //   this._transX = this._dragX.interpolate({
  //     inputRange: [-100, -50, 0, 50, 100],
  //     outputRange: [-30, -10, 0, 10, 30],
  //   });
  //   this._onGestureEvent = Animated.event([
  //     { nativeEvent: { translationX: this._dragX } },
  //   ]);
  // }
  // _onHandlerStateChange = event => {
  //   if (event.nativeEvent.oldState === State.ACTIVE) {
  //     Animated.spring(this._dragX, {
  //       velocity: event.nativeEvent.velocityX,
  //       tension: 10,
  //       friction: 2,
  //       toValue: 0,
  //     }).start();
  //   }
  // };
  render() {
    const { children } = this.props;
    return (
      <PanGestureHandler
        {...this.props}
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
