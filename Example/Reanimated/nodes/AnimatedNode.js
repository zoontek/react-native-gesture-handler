import NativeAnimatedHelper from '../NativeAnimatedHelper';
import { evaluate } from '../CoreAnimated';

import invariant from 'fbjs/lib/invariant';

// Note(vjeux): this would be better as an interface but flow doesn't
// support them yet
export default class AnimatedNode {
  __attach() {}
  __detach() {
    if (this.__isNative && this.__nativeTag != null) {
      NativeAnimatedHelper.API.dropAnimatedNode(this.__nativeTag);
      this.__nativeTag = undefined;
    }
  }
  __getValue() {
    return evaluate(this);
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
