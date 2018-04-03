import NativeAnimatedHelper from '../NativeAnimatedHelper';

import invariant from 'fbjs/lib/invariant';

const UPDATED_NODES = [];

let loopID = 1;
let propUpdatesEnqueued = null;

function runPropUpdates() {
  const visitedNodes = new Set();
  const findAndUpdateNodes = node => {
    if (visitedNodes.has(node)) {
      return;
    } else {
      visitedNodes.add(node);
    }
    if (typeof node.update === 'function') {
      node.update();
    } else {
      node.__getChildren().forEach(findAndUpdateNodes);
    }
  };
  for (let i = 0; i < UPDATED_NODES.length; i++) {
    const node = UPDATED_NODES[i];
    findAndUpdateNodes(node);
  }
  UPDATED_NODES.length = 0; // clear array
  propUpdatesEnqueued = null;
  loopID += 1;
}

let nodeCount = 0;

export default class AnimatedNode {
  constructor(nodeName, nodeConfig, inputNodes) {
    this.__nodeID = ++nodeCount;
    this.__nodeName = nodeName;
    this.__nodeConfig = nodeConfig;
    this.__inputNodes =
      inputNodes && inputNodes.filter(node => node instanceof AnimatedNode);
  }

  __attach() {
    this.__inputNodes &&
      this.__inputNodes.forEach(node => node.__addChild(this));
    this.__attached = true;
  }

  __detach() {
    this.__inputNodes &&
      this.__inputNodes.forEach(node => node.__removeChild(this));
    this.__attached = false;
  }

  __lastLoopID;
  __memoizedValue;

  __getValue() {
    if (this.__lastLoopID < loopID) {
      this.__lastLoopID = loopID;
      return (this.__memoizedValue = this.__onEvaluate());
    }
    return this.__memoizedValue;
  }

  __forceUpdateCache(newValue) {
    this.__memoizedValue = newValue;
    this.__markUpdated();
  }

  __dangerouslyRescheduleEvaluate() {
    this.__lastLoopID = 0;
    this.__markUpdated();
  }

  __markUpdated() {
    UPDATED_NODES.push(this);
    if (!propUpdatesEnqueued) {
      propUpdatesEnqueued = setImmediate(runPropUpdates);
    }
  }

  __onEvaluate() {
    throw new Excaption('Missing implementation of onEvaluate');
  }

  __getProps() {
    return this.__getValue();
  }

  __getChildren() {
    return this.__children;
  }

  __addChild(child) {
    if (this.__children.length === 0) {
      this.__attach();
    }
    this.__children.push(child);
    if (this.__isNative) {
      // Only accept "native" animated nodes as children
      child.__makeNative();
      NativeAnimatedHelper.API.connectAnimatedNodes(
        this.__getNativeTag(),
        child.__getNativeTag()
      );
    }
  }

  __removeChild(child) {
    const index = this.__children.indexOf(child);
    if (index === -1) {
      console.warn("Trying to remove a child that doesn't exist");
      return;
    }
    if (this.__isNative && child.__isNative) {
      NativeAnimatedHelper.API.disconnectAnimatedNodes(
        this.__getNativeTag(),
        child.__getNativeTag()
      );
    }
    this.__children.splice(index, 1);
    if (this.__children.length === 0) {
      this.__detach();
    }
  }

  /* Methods and props used by native Animated impl */
  __lastLoopID = 0;
  __memoizedValue = null;

  __children = [];
  __makeNative() {
    if (!this.__isNative) {
      throw new Error('This node cannot be made a "native" animated node');
    }
  }
  __getNativeTag() {
    NativeAnimatedHelper.assertNativeAnimatedModule();
    invariant(
      this.__isNative,
      'Attempt to get native tag from node not marked as "native"'
    );
    if (this.__nativeTag == null) {
      const nativeTag = NativeAnimatedHelper.generateNewNodeTag();
      NativeAnimatedHelper.API.createAnimatedNode(
        nativeTag,
        this.__getNativeConfig()
      );
      this.__nativeTag = nativeTag;
    }
    return this.__nativeTag;
  }
  __getNativeConfig() {
    throw new Error(
      'This JS animated node type cannot be used as native animated node'
    );
  }
  toJSON() {
    return this.__getValue();
  }
}
