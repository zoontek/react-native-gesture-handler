package com.swmansion.reanimated;

import android.util.Log;
import android.util.SparseArray;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.ReactChoreographer;
import com.facebook.react.uimanager.GuardedFrameCallback;
import com.facebook.react.uimanager.UIImplementation;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcherListener;
import com.swmansion.reanimated.nodes.BezierNode;
import com.swmansion.reanimated.nodes.BlockNode;
import com.swmansion.reanimated.nodes.CondNode;
import com.swmansion.reanimated.nodes.DebugNode;
import com.swmansion.reanimated.nodes.Node;
import com.swmansion.reanimated.nodes.OperatorNode;
import com.swmansion.reanimated.nodes.PropsNode;
import com.swmansion.reanimated.nodes.SetNode;
import com.swmansion.reanimated.nodes.StyleNode;
import com.swmansion.reanimated.nodes.TransformNode;
import com.swmansion.reanimated.nodes.ValueNode;

import javax.annotation.Nullable;

public class NodesManager implements EventDispatcherListener {

  private final SparseArray<Node> mAnimatedNodes = new SparseArray<>();
  private final UIImplementation mUIImplementation;
  private final ReactChoreographer mReactChoreographer;
  private final GuardedFrameCallback mFrameCallbck;
  private boolean mCallbackPosted;
  private boolean mWantRunUpdates;

  public final UpdateContext updateContext;

  public NodesManager(ReactContext context) {
    UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
    updateContext = new UpdateContext();
    mUIImplementation = uiManager.getUIImplementation();
    uiManager.getEventDispatcher().addListener(this);

    mReactChoreographer = ReactChoreographer.getInstance();
    mFrameCallbck = new GuardedFrameCallback(context) {
      @Override
      protected void doFrameGuarded(long frameTimeNanos) {
        onAnimationFrame(frameTimeNanos);
      }
    };
  }

  public void onHostPause() {
    if (mCallbackPosted) {
      stopUpdatingOnAnimationFrame();
      mCallbackPosted = true;
    }
  }

  public void onHostResume() {
    if (mCallbackPosted) {
      mCallbackPosted = false;
      startUpdatingOnAnimationFrame();
    }
  }

  private void startUpdatingOnAnimationFrame() {
    if (!mCallbackPosted) {
      mCallbackPosted = true;
      mReactChoreographer.postFrameCallback(
              ReactChoreographer.CallbackType.NATIVE_ANIMATED_MODULE,
              mFrameCallbck);
    }
  }

  private void stopUpdatingOnAnimationFrame() {
    if (mCallbackPosted) {
      mCallbackPosted = false;
      mReactChoreographer.removeFrameCallback(
              ReactChoreographer.CallbackType.NATIVE_ANIMATED_MODULE,
              mFrameCallbck);
    }
  }

  private void onAnimationFrame(long frameTimeNanos) {
    // TODO: process enqueued events

    if (mWantRunUpdates) {
      Node.runUpdates(updateContext);
    }

    mCallbackPosted = false;
    mWantRunUpdates = false;
  }

  public @Nullable Node findNodeById(int id) {
    return mAnimatedNodes.get(id);
  }

  public void createNode(int nodeID, ReadableMap config) {
    if (mAnimatedNodes.get(nodeID) != null) {
      throw new JSApplicationIllegalArgumentException("Animated node with ID " + nodeID +
              " already exists");
    }
    String type = config.getString("type");
    final Node node;
    if ("props".equals(type)) {
      node = new PropsNode(nodeID, config, this, mUIImplementation);
    } else if ("style".equals(type)) {
      node = new StyleNode(nodeID, config, this);
    } else if ("transform".equals(type)) {
      node = new TransformNode(nodeID, config, this);
    } else if ("value".equals(type)) {
      node = new ValueNode(nodeID, config, this);
    } else if ("block".equals(type)) {
      node = new BlockNode(nodeID, config, this);
    } else if ("cond".equals(type)) {
      node = new CondNode(nodeID, config, this);
    } else if ("op".equals(type)) {
      node = new OperatorNode(nodeID, config, this);
    } else if ("set".equals(type)) {
      node = new SetNode(nodeID, config, this);
    } else if ("debug".equals(type)) {
      node = new DebugNode(nodeID, config, this);
    } else if ("clock".equals(type)) {
      throw new JSApplicationIllegalArgumentException("Unsupported node type: " + type);
    } else if ("clockStart".equals(type)) {
      throw new JSApplicationIllegalArgumentException("Unsupported node type: " + type);
    } else if ("clockStop".equals(type)) {
      throw new JSApplicationIllegalArgumentException("Unsupported node type: " + type);
    } else if ("clockTest".equals(type)) {
      throw new JSApplicationIllegalArgumentException("Unsupported node type: " + type);
    } else if ("call".equals(type)) {
      throw new JSApplicationIllegalArgumentException("Unsupported node type: " + type);
    } else if ("bezier".equals(type)) {
      node = new BezierNode(nodeID, config, this);
    } else if ("event".equals(type)) {
      throw new JSApplicationIllegalArgumentException("Unsupported node type: " + type);
    } else {
      throw new JSApplicationIllegalArgumentException("Unsupported node type: " + type);
    }
    mAnimatedNodes.put(nodeID, node);
  }

  public void dropNode(int tag) {
    mAnimatedNodes.remove(tag);
  }

  public void connectNodes(int parentID, int childID) {
    Node parentNode = mAnimatedNodes.get(parentID);
    if (parentNode == null) {
      throw new JSApplicationIllegalArgumentException("Animated node with ID " + parentID +
              " does not exists");
    }
    Node childNode = mAnimatedNodes.get(childID);
    if (childNode == null) {
      throw new JSApplicationIllegalArgumentException("Animated node with ID " + childID +
              " does not exists");
    }
    parentNode.addChild(childNode);
  }

  public void disconnectNodes(int parentID, int childID) {
    Node parentNode = mAnimatedNodes.get(parentID);
    if (parentNode == null) {
      throw new JSApplicationIllegalArgumentException("Animated node with ID " + parentID +
              " does not exists");
    }
    Node childNode = mAnimatedNodes.get(childID);
    if (childNode == null) {
      throw new JSApplicationIllegalArgumentException("Animated node with ID " + childID +
              " does not exists");
    }
    parentNode.removeChild(childNode);
  }

  public void connectNodeToView(int nodeID, int viewTag) {
    Node node = mAnimatedNodes.get(nodeID);
    if (node == null) {
      throw new JSApplicationIllegalArgumentException("Animated node with ID " + nodeID +
              " does not exists");
    }
    if (!(node instanceof PropsNode)) {
      throw new JSApplicationIllegalArgumentException("Animated node connected to view should be" +
              "of type " + PropsNode.class.getName());
    }
    ((PropsNode) node).connectToView(viewTag);
  }

  public void disconnectNodeFromView(int nodeID, int viewTag) {
    Node node = mAnimatedNodes.get(nodeID);
    if (node == null) {
      throw new JSApplicationIllegalArgumentException("Animated node with ID " + nodeID +
              " does not exists");
    }
    if (!(node instanceof PropsNode)) {
      throw new JSApplicationIllegalArgumentException("Animated node connected to view should be" +
              "of type " + PropsNode.class.getName());
    }
    ((PropsNode) node).disconnectFromView(viewTag);
  }

  public void attachEvent(int viewTag, String eventName, int eventNodeID) {
//    int nodeTag = eventMapping.getInt("animatedValueTag");
//    AnimatedNode node = mAnimatedNodes.get(nodeTag);
//    if (node == null) {
//      throw new JSApplicationIllegalArgumentException("Animated node with tag " + nodeTag +
//              " does not exists");
//    }
//    if (!(node instanceof ValueAnimatedNode)) {
//      throw new JSApplicationIllegalArgumentException("Animated node connected to event should be" +
//              "of type " + ValueAnimatedNode.class.getName());
//    }
//
//    ReadableArray path = eventMapping.getArray("nativeEventPath");
//    List<String> pathList = new ArrayList<>(path.size());
//    for (int i = 0; i < path.size(); i++) {
//      pathList.add(path.getString(i));
//    }
//
//    EventAnimationDriver event = new EventAnimationDriver(pathList, (ValueAnimatedNode) node);
//    String key = viewTag + eventName;
//    if (mEventDrivers.containsKey(key)) {
//      mEventDrivers.get(key).add(event);
//    } else {
//      List<EventAnimationDriver> drivers = new ArrayList<>(1);
//      drivers.add(event);
//      mEventDrivers.put(key, drivers);
//    }
  }

  public void detachEvent(int viewTag, String eventName, int eventNodeID) {
//    String key = viewTag + eventName;
//    if (mEventDrivers.containsKey(key)) {
//      List<EventAnimationDriver> driversForKey = mEventDrivers.get(key);
//      if (driversForKey.size() == 1) {
//        mEventDrivers.remove(viewTag + eventName);
//      } else {
//        ListIterator<EventAnimationDriver> it = driversForKey.listIterator();
//        while (it.hasNext()) {
//          if (it.next().mValueNode.mTag == animatedValueTag) {
//            it.remove();
//            break;
//          }
//        }
//      }
//    }
  }


  public void postRunUpdatesAfterAnimation() {
    mWantRunUpdates = true;
    startUpdatingOnAnimationFrame();
  }

//  public void restoreDefaultValues(int animatedNodeTag, int viewTag) {
//    AnimatedNode node = mAnimatedNodes.get(animatedNodeTag);
//    // Restoring default values needs to happen before UIManager operations so it is
//    // possible the node hasn't been created yet if it is being connected and
//    // disconnected in the same batch. In that case we don't need to restore
//    // default values since it will never actually update the view.
//    if (node == null) {
//      return;
//    }
//    if (!(node instanceof PropsAnimatedNode)) {
//      throw new JSApplicationIllegalArgumentException("Animated node connected to view should be" +
//              "of type " + PropsAnimatedNode.class.getName());
//    }
//    PropsAnimatedNode propsAnimatedNode = (PropsAnimatedNode) node;
//    propsAnimatedNode.restoreDefaultValues();
//  }
//

  @Override
  public void onEventDispatch(final Event event) {
//    // Events can be dispatched from any thread so we have to make sure handleEvent is run from the
//    // UI thread.
//    if (UiThreadUtil.isOnUiThread()) {
//      handleEvent(event);
//    } else {
//      UiThreadUtil.runOnUiThread(new Runnable() {
//        @Override
//        public void run() {
//          handleEvent(event);
//        }
//      });
//    }
//  }
//
//  private void handleEvent(Event event) {
//    if (!mEventDrivers.isEmpty()) {
//      // If the event has a different name in native convert it to it's JS name.
//      String eventName = mCustomEventNamesResolver.resolveCustomEventName(event.getEventName());
//      List<EventAnimationDriver> driversForKey = mEventDrivers.get(event.getViewTag() + eventName);
//      if (driversForKey != null) {
//        for (EventAnimationDriver driver : driversForKey) {
//          stopAnimationsForNode(driver.mValueNode);
//          event.dispatch(driver);
//          mRunUpdateNodeList.add(driver.mValueNode);
//        }
//        updateNodes(mRunUpdateNodeList);
//        mRunUpdateNodeList.clear();
//      }
//    }
  }

  public void runUpdates(long frameTimeNanos) {
//    UiThreadUtil.assertOnUiThread();
//    boolean hasFinishedAnimations = false;
//
//    for (int i = 0; i < mUpdatedNodes.size(); i++) {
//      AnimatedNode node = mUpdatedNodes.valueAt(i);
//      mRunUpdateNodeList.add(node);
//    }
//
//    // Clean mUpdatedNodes queue
//    mUpdatedNodes.clear();
//
//    for (int i = 0; i < mActiveAnimations.size(); i++) {
//      AnimationDriver animation = mActiveAnimations.valueAt(i);
//      animation.runAnimationStep(frameTimeNanos);
//      AnimatedNode valueNode = animation.mAnimatedValue;
//      mRunUpdateNodeList.add(valueNode);
//      if (animation.mHasFinished) {
//        hasFinishedAnimations = true;
//      }
//    }
//
//    updateNodes(mRunUpdateNodeList);
//    mRunUpdateNodeList.clear();
//
//    // Cleanup finished animations. Iterate over the array of animations and override ones that has
//    // finished, then resize `mActiveAnimations`.
//    if (hasFinishedAnimations) {
//      for (int i = mActiveAnimations.size() - 1; i >= 0; i--) {
//        AnimationDriver animation = mActiveAnimations.valueAt(i);
//        if (animation.mHasFinished) {
//          if (animation.mEndCallback != null) {
//            WritableMap endCallbackResponse = Arguments.createMap();
//            endCallbackResponse.putBoolean("finished", true);
//            animation.mEndCallback.invoke(endCallbackResponse);
//          }
//          mActiveAnimations.removeAt(i);
//        }
//      }
//    }
  }
}
