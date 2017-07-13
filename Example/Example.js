import React, { Component } from 'react';
import {
  Alert,
  Animated,
  AppRegistry,
  StyleSheet,
  Switch,
  Text,
  View,
  Image,
  // ScrollView,
} from 'react-native';

import {
  LongPressGestureHandler,
  NativeViewGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  ScrollView,
  Slider,
  State,
  TapGestureHandler,
  TextInput,
  ToolbarAndroid,
  ViewPagerAndroid,
  DrawerLayoutAndroid,
  WebView,
} from 'react-native-gesture-handler';

class Gravity {
  constructor(anchorPoint = 0, acceleration = 0.9) {
    this._anchorPoint = anchorPoint;
    this._acceleration = acceleration;
  }

  force(x, v) {
    const dx = (x - this._anchorPoint);
    return dx < 0 ? this._acceleration : -this._acceleration;
  }
}

class Damping {
  constructor(coeff = 0.1) {
    this._coeff = coeff;
  }

  force(x, v) {
    return -this._coeff * v;
  }
}

class Drag {
  constructor(coeff = 0.1) {
    this._coeff = coeff;
  }

  force(x, v) {
    return -this._coeff * v * Math.abs(v);
  }
}

class Spring {
  constructor(anchorPoint = 0, tension = 0.8) {
    this._anchorPoint = anchorPoint;
    this._tension = tension;
  }

  force(x, v) {
    return -this._tension * (x - this._anchorPoint);
  }
}

class PhysicsAnimation extends Animated.Animation {
  _input;
  _forces;
  _lastTime;
  _onUpdate;
  _x = 0;
  _v = 0;

  constructor(config) {
    super();
    this._forces = config.forces;
  }

  start(fromValue, onUpdate, onEnd, previousAnimation, animatedValue) {
    this._lastTime = Date.now();
    this._onUpdate = onUpdate;
    this.__onEnd = onEnd;
    this._input = animatedValue;
    this._x = animatedValue.__getValue();
    this._v = animatedValue.__getVelocity();
    this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this));
  }

  _acceleration(x, v, dt) {
    return this._forces.reduce((acc, force) => acc + force.force(x, v), 0.0);
  }

  _integrate(dt) {
    // We are using a fixed time step and a maximum number of iterations.
    // The following post provides a lot of thoughts into how to build this
    // loop: http://gafferongames.com/game-physics/fix-your-timestep/
    const MAX_STEPS = 30;
    const STEPS_PER_SEC = 500;
    const deltaSteps = Math.floor(dt * STEPS_PER_SEC);

    const numSteps = Math.min(MAX_STEPS, Math.max(deltaSteps, 1));

    for (var i = 0; i < numSteps; ++i) {
      const step = 1 / STEPS_PER_SEC;

      // This is using RK4. A good blog post to understand how it works:
      // http://gafferongames.com/game-physics/integration-basics/
      const aVelocity = this._v;
      const aAcceleration = this._acceleration(this._x, aVelocity);

      const bVelocity = this._v + aAcceleration * step / 2.0;
      const bAcceleration = this._acceleration(this._x + aVelocity * step / 2.0, bVelocity);

      const cVelocity = this._v + bAcceleration * step / 2.0;
      const cAcceleration = this._acceleration(this._x + bVelocity * step / 2.0, cVelocity);

      const dVelocity = this._v + cAcceleration * step;
      const dAcceleration = this._acceleration(this._x + cVelocity * step, dVelocity);

      const dxdt = (aVelocity + dVelocity + 2.0 * (bVelocity + cVelocity)) / 6.0;
      const dvdt = (aAcceleration + dAcceleration + 2.0 * (bAcceleration + cAcceleration)) / 6.0;

      this._x += dxdt * step;
      this._v += dvdt * step;
    }
  }

  onUpdate() {
    const now = Date.now();
    const dt = (now - this._lastTime) / 1000.0;
    this._integrate(dt);
    this._onUpdate(this._x);
    this._lastTime = now;

    if (Math.abs(this._v) < 0.001) {
      this.__debouncedOnEnd({finished: true});
    } else {
      this._animationFrame = requestAnimationFrame(this.onUpdate.bind(this));
    }
  }

  stop() {
    super.stop();
    global.cancelAnimationFrame(this._animationFrame);
  }
}

class DraggableBox extends Component {
  constructor(props) {
    super(props);
    this._dragX = new Animated.Value(0);
    this._dragY = new Animated.Value(0);

    this._transX = this._dragX;
    this._transX = this._dragX.interpolate({ inputRange: [-100, -50, 0, 50, 100], outputRange: [-30, -10, 0, 10, 30]})

    this._animationConfig = {
      // forces: [new Gravity(100, 500), new Damping(6)],
      forces: [new Spring(0, 80), new Damping(15), new Spring(100, 100)],
    }

    this._onGestureEvent = Animated.event(
       [{ nativeEvent: { translationX: this._dragX, translationY: this._dragY }}],
    )
  }
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      this._dragX.stopAnimation();
      this._dragX.extractOffset();
    } else if (event.nativeEvent.oldState === State.ACTIVE) {
      this._dragX.flattenOffset();
      this._dragX.animate(new PhysicsAnimation(this._animationConfig), () => {
        this._dragX.extractOffset();
        this._dragY.extractOffset();
      });
    }
  }
  render() {
    return (
      <PanGestureHandler
          {...this.props}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
          id="dragbox">
        <Animated.View style={[styles.box, { transform: [
          {translateX: this._transX},
          /*{{translateY: this._translateY}}*/
        ]}]}/>
      </PanGestureHandler>
    );
  }
}

class TwistableBox extends Component {
  constructor(props) {
    super(props);
    this._gesture = new Animated.Value(0);

    this._rot = this._gesture
      .interpolate({ inputRange: [-1.2, -1, -0.5, 0, 0.5, 1, 1.2], outputRange: [-0.52, -0.5, -0.3, 0, 0.3, 0.5, 0.52] })
      .interpolate({ inputRange: [-100, 100], outputRange: ['-100rad', '100rad']});

    this._animationConfig = {
      forces: [new Spring(0, 120), new Damping(8)],
    }

    this._onGestureEvent = Animated.event(
       [{ nativeEvent: { rotation: this._gesture }}],
    )
  }
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      this._gesture.stopAnimation();
      this._gesture.extractOffset();
    } else if (event.nativeEvent.oldState === State.ACTIVE) {
      this._gesture.flattenOffset();
      this._gesture.animate(new PhysicsAnimation(this._animationConfig), () => {
        this._gesture.extractOffset();
      });
    }
  }
  render() {
    return (
      <RotationGestureHandler
          {...this.props}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
          id="dragbox">
        <Animated.View style={[styles.box, { transform: [
          {rotate: this._rot},
        ]}]}/>
      </RotationGestureHandler>
    );
  }
}

export default class Example extends Component {
  _onClick = () => {
    Alert.alert("I'm so touched");
  }
  render() {
    return (
      <View style={styles.container}>
        <TwistableBox/>
      </View>
    );
  }
}

const BOX_SIZE = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
  },
});

