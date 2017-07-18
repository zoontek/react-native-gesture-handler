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
  findNodeHandle,
  // ScrollView,
  Dimensions,
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

const USE_NATIVE_DRIVER = false;

// setInterval(() => {
//   let iters = 1e8, sum = 0;
//   while (iters-- > 0) sum += iters;
// }, 300);

class Snappable extends Component {
  constructor(props) {
    super(props);
    this._dragX = new Animated.Value(0);
    this._transX = this._dragX.interpolate({ inputRange: [-100, -50, 0, 50, 100], outputRange: [-30, -10, 0, 10, 30]})
    this._onGestureEvent = Animated.event(
       [{ nativeEvent: { translationX: this._dragX }}],
       { useNativeDriver: USE_NATIVE_DRIVER },
    )
  }
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this._dragX, {
        velocity: event.nativeEvent.velocityX,
        tension: 10,
        friction: 2,
        toValue: 0,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  }
  render() {
    const { children } = this.props;
    return (
      <PanGestureHandler
          {...this.props}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
      >
        <Animated.View style={{transform: [{ translateX: this._transX }]}}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

class Twistable extends Component {
  constructor(props) {
    super(props);
    this._gesture = new Animated.Value(0);

    this._rot = this._gesture
      .interpolate({ inputRange: [-1.2, -1, -0.5, 0, 0.5, 1, 1.2], outputRange: [-0.52, -0.5, -0.3, 0, 0.3, 0.5, 0.52] })
      .interpolate({ inputRange: [-100, 100], outputRange: ['-100rad', '100rad']});

    this._onGestureEvent = Animated.event(
       [{ nativeEvent: { rotation: this._gesture }}],
       { useNativeDriver: USE_NATIVE_DRIVER },
    )
  }
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this._gesture, {
        velocity: event.nativeEvent.velocity,
        tension: 10,
        friction: 0.2,
        toValue: 0,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  }
  render() {
    const { children } = this.props;
    return (
      <RotationGestureHandler
          {...this.props}
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
      >
        <Animated.View style={{transform: [{ rotate: this._rot }]}}>
          {children}
        </Animated.View>
      </RotationGestureHandler>
    );
  }
}

const START_X = 0;
const START_Y = 0;

class Tracking extends Component {
  constructor(props) {
    super(props);

    const tension = 0.8;
    const friction = 3;

    this._dragX = new Animated.Value(START_X);
    this._transX = new Animated.Value(START_X);
    this._follow1x = new Animated.Value(START_X);
    this._follow2x = new Animated.Value(START_X);
    Animated.spring(this._transX, {
      toValue: this._dragX,
      tension,
      friction,
    }).start();
    Animated.spring(this._follow1x, {
      toValue: this._transX,
      tension,
      friction,
    }).start();
    Animated.spring(this._follow2x, {
      toValue: this._follow1x,
      tension,
      friction,
    }).start();

    this._dragY = new Animated.Value(START_Y);
    this._transY = new Animated.Value(START_Y);
    this._follow1y = new Animated.Value(START_Y);
    this._follow2y = new Animated.Value(START_Y);
    Animated.spring(this._transY, {
      toValue: this._dragY,
      tension,
      friction,
    }).start();
    Animated.spring(this._follow1y, {
      toValue: this._transY,
      tension,
      friction,
    }).start();
    Animated.spring(this._follow2y, {
      toValue: this._follow1y,
      tension,
      friction,
    }).start();

    this._onGestureEvent = Animated.event(
       [{ nativeEvent: { translationX: this._dragX, translationY: this._dragY }}],
       { useNativeDriver: USE_NATIVE_DRIVER },
    )

    this._lastOffset = { x: START_X, y: START_Y };
  }
  _onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {

      const  { height, width } = Dimensions.get('window');

      const posX = this._lastOffset.x + event.nativeEvent.translationX;
      const posY = this._lastOffset.y + event.nativeEvent.translationY;

      const distFromTop = posY;
      const distFromBottom = height - posY - BOX_SIZE;
      const distFromLeft = posX;
      const distFromRight = width - posX - BOX_SIZE;

      this._lastOffset = { x: posX, y: posY };

      this._dragX.flattenOffset();
      this._dragY.flattenOffset();

      const minDist = Math.min(distFromTop, distFromBottom, distFromLeft, distFromRight);
      if (distFromTop === minDist) {
        this._dragY.setValue(- BOX_SIZE / 4);
        this._lastOffset.y = - BOX_SIZE / 4;
      } else if (distFromBottom === minDist) {
        this._dragY.setValue(height - BOX_SIZE / 2);
        this._lastOffset.y = height - BOX_SIZE / 2;
      } else if (distFromLeft === minDist) {
        this._dragX.setValue(- BOX_SIZE / 2);
        this._lastOffset.x = - BOX_SIZE / 2;
      } else if (distFromRight === minDist) {
        this._dragX.setValue(width - BOX_SIZE / 2);
        this._lastOffset.x = width - BOX_SIZE / 2;
      }

      this._dragX.extractOffset();
      this._dragY.extractOffset();
    }
  }
  render() {
    return (
      <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}>
        <Animated.Image
          style={[styles.box, { marginLeft: 10, marginTop: 10 }, { transform: [{ translateX: this._follow2x }, {translateY: this._follow2y }]}]}
          source={{ uri: 'https://swmansion.com/70fb4b9c93daf08add19a790d96ce2db.jpg' }}
        />
         <Animated.Image
          style={[styles.box, { marginLeft: 5, marginTop: 5}, { transform: [{ translateX: this._follow1x }, {translateY: this._follow1y }]}]}
          source={{ uri: 'https://swmansion.com/a1d401c2e6706af865aec0eb9301d6c1.jpg' }}
        />

        <PanGestureHandler
          onGestureEvent={this._onGestureEvent}
          onHandlerStateChange={this._onHandlerStateChange}
        >
          <Animated.Image
            style={[styles.box, { transform: [{ translateX: this._transX }, {translateY: this._transY }]}]}
            source={{ uri: 'https://swmansion.com/13f9de8560250cc35b7bd273849da7e7.jpg' }}
          />
        </PanGestureHandler>
      </View>
    )
  }
}


export default class Example extends Component {
  render() {
    return (
      <View style={styles.container}>
         <Tracking />
         {/* <Snappable>
            <View style={styles.box} />
        </Snappable> */}
      </View>
    );
  }
}

const BOX_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 20,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  box: {
    position: 'absolute',
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderColor: '#F5FCFF',
    // alignSelf: 'center',
    backgroundColor: 'plum',
    borderRadius: BOX_SIZE / 2,
    // margin: - BOX_SIZE / 2,
  },
});

