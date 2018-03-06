var AnimatedImplementation = require('AnimatedImplementation');

module.exports = {
  ...AnimatedImplementation,
  div: AnimatedImplementation.createAnimatedComponent('div'),
  span: AnimatedImplementation.createAnimatedComponent('span'),
  img: AnimatedImplementation.createAnimatedComponent('img'),
};
