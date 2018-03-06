import { Image, Text, View, ScrollView } from 'react-native';
import AnimatedImplementation from './AnimatedImplementation';

const Animated = {
  View: AnimatedImplementation.createAnimatedComponent(View),
  Text: AnimatedImplementation.createAnimatedComponent(Text),
  Image: AnimatedImplementation.createAnimatedComponent(Image),
  ScrollView: AnimatedImplementation.createAnimatedComponent(ScrollView),
};

Object.assign(Animated, AnimatedImplementation);

export default Animated;
