import { Image, Text, View, ScrollView } from 'react-native';
import AnimatedClock from './core/AnimatedClock';
import AnimatedValue from './core/AnimatedValue';
import AnimatedNode from './core/AnimatedNode';
import * as base from './base';
import * as derived from './derived';
import createAnimatedComponent from './createAnimatedComponent';
import decay from './animations/decay';
import timing from './animations/timing';
import spring from './animations/spring';

const Animated = {
  // components
  View: createAnimatedComponent(View),
  Text: createAnimatedComponent(Text),
  Image: createAnimatedComponent(Image),
  ScrollView: createAnimatedComponent(ScrollView),

  // classes
  Clock: AnimatedClock,
  Value: AnimatedValue,
  Node: AnimatedNode,

  // operations
  ...base,
  ...derived,

  // animations
  decay,
  timing,
  spring,
};

export default Animated;
