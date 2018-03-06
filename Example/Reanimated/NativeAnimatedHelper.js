const NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;
const NativeEventEmitter = require('NativeEventEmitter');

const invariant = require('fbjs/lib/invariant');

let __nativeAnimatedNodeTagCount = 1; /* used for animated nodes */
let __nativeAnimationIdCount = 1; /* used for started animations */

let nativeEventEmitter;

/**
 * Simple wrappers around NativeAnimatedModule to provide flow and autocmplete support for
 * the native module methods
 */
const API = {
  createAnimatedNode: function(tag, config) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.createAnimatedNode(tag, config);
  },
  startListeningToAnimatedNodeValue: function(tag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.startListeningToAnimatedNodeValue(tag);
  },
  stopListeningToAnimatedNodeValue: function(tag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.stopListeningToAnimatedNodeValue(tag);
  },
  connectAnimatedNodes: function(parentTag, childTag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.connectAnimatedNodes(parentTag, childTag);
  },
  disconnectAnimatedNodes: function(parentTag, childTag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.disconnectAnimatedNodes(parentTag, childTag);
  },
  startAnimatingNode: function(animationId, nodeTag, config, endCallback) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.startAnimatingNode(
      animationId,
      nodeTag,
      config,
      endCallback
    );
  },
  stopAnimation: function(animationId) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.stopAnimation(animationId);
  },
  setAnimatedNodeValue: function(nodeTag, value) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.setAnimatedNodeValue(nodeTag, value);
  },
  setAnimatedNodeOffset: function(nodeTag, offset) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.setAnimatedNodeOffset(nodeTag, offset);
  },
  flattenAnimatedNodeOffset: function(nodeTag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.flattenAnimatedNodeOffset(nodeTag);
  },
  extractAnimatedNodeOffset: function(nodeTag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.extractAnimatedNodeOffset(nodeTag);
  },
  connectAnimatedNodeToView: function(nodeTag, viewTag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.connectAnimatedNodeToView(nodeTag, viewTag);
  },
  disconnectAnimatedNodeFromView: function(nodeTag, viewTag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.disconnectAnimatedNodeFromView(nodeTag, viewTag);
  },
  dropAnimatedNode: function(tag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.dropAnimatedNode(tag);
  },
  addAnimatedEventToView: function(viewTag, eventName, eventMapping) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.addAnimatedEventToView(
      viewTag,
      eventName,
      eventMapping
    );
  },
  removeAnimatedEventFromView(viewTag, eventName, animatedNodeTag) {
    assertNativeAnimatedModule();
    NativeAnimatedModule.removeAnimatedEventFromView(
      viewTag,
      eventName,
      animatedNodeTag
    );
  },
};

/**
 * Styles allowed by the native animated implementation.
 *
 * In general native animated implementation should support any numeric property that doesn't need
 * to be updated through the shadow view hierarchy (all non-layout properties).
 */
const STYLES_WHITELIST = {
  opacity: true,
  transform: true,
  /* ios styles */
  shadowOpacity: true,
  shadowRadius: true,
  /* legacy android transform properties */
  scaleX: true,
  scaleY: true,
  translateX: true,
  translateY: true,
};

const TRANSFORM_WHITELIST = {
  translateX: true,
  translateY: true,
  scale: true,
  scaleX: true,
  scaleY: true,
  rotate: true,
  rotateX: true,
  rotateY: true,
  perspective: true,
};

const SUPPORTED_INTERPOLATION_PARAMS = {
  inputRange: true,
  outputRange: true,
  extrapolate: true,
  extrapolateRight: true,
  extrapolateLeft: true,
};

function addWhitelistedStyleProp(prop) {
  STYLES_WHITELIST[prop] = true;
}

function addWhitelistedTransformProp(prop) {
  TRANSFORM_WHITELIST[prop] = true;
}

function addWhitelistedInterpolationParam(param) {
  SUPPORTED_INTERPOLATION_PARAMS[param] = true;
}

function validateTransform(configs) {
  configs.forEach(config => {
    if (!TRANSFORM_WHITELIST.hasOwnProperty(config.property)) {
      throw new Error(
        `Property '${config.property}' is not supported by native animated module`
      );
    }
  });
}

function validateStyles(styles) {
  for (var key in styles) {
    if (!STYLES_WHITELIST.hasOwnProperty(key)) {
      throw new Error(
        `Style property '${key}' is not supported by native animated module`
      );
    }
  }
}

function validateInterpolation(config) {
  for (var key in config) {
    if (!SUPPORTED_INTERPOLATION_PARAMS.hasOwnProperty(key)) {
      throw new Error(
        `Interpolation property '${key}' is not supported by native animated module`
      );
    }
  }
}

function generateNewNodeTag() {
  return __nativeAnimatedNodeTagCount++;
}

function generateNewAnimationId() {
  return __nativeAnimationIdCount++;
}

function assertNativeAnimatedModule() {
  invariant(NativeAnimatedModule, 'Native animated module is not available');
}

let _warnedMissingNativeAnimated = false;

function shouldUseNativeDriver(config) {
  if (config.useNativeDriver && !NativeAnimatedModule) {
    if (!_warnedMissingNativeAnimated) {
      console.warn(
        'Animated: `useNativeDriver` is not supported because the native ' +
          'animated module is missing. Falling back to JS-based animation. To ' +
          'resolve this, add `RCTAnimation` module to this app, or remove ' +
          '`useNativeDriver`. ' +
          'More info: https://github.com/facebook/react-native/issues/11094#issuecomment-263240420'
      );
      _warnedMissingNativeAnimated = true;
    }
    return false;
  }

  return config.useNativeDriver || false;
}

module.exports = {
  API,
  addWhitelistedStyleProp,
  addWhitelistedTransformProp,
  addWhitelistedInterpolationParam,
  validateStyles,
  validateTransform,
  validateInterpolation,
  generateNewNodeTag,
  generateNewAnimationId,
  assertNativeAnimatedModule,
  shouldUseNativeDriver,
  get nativeEventEmitter() {
    if (!nativeEventEmitter) {
      nativeEventEmitter = new NativeEventEmitter(NativeAnimatedModule);
    }
    return nativeEventEmitter;
  },
};
