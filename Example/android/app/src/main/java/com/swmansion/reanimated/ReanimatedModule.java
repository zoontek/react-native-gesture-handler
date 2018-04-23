package com.swmansion.reanimated;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.UIManagerModuleListener;

import java.util.ArrayList;

import javax.annotation.Nullable;

@ReactModule(name = ReanimatedModule.NAME)
public class ReanimatedModule extends ReactContextBaseJavaModule implements
        LifecycleEventListener, UIManagerModuleListener {

  protected static final String NAME = "ReanimatedModule";

  private interface UIThreadOperation {
    void execute(NodesManager nodesManager);
  }

  private ArrayList<UIThreadOperation> mOperations = new ArrayList<>();

  private @Nullable NodesManager mNodesManager;

  public ReanimatedModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public void initialize() {
    ReactApplicationContext reactCtx = getReactApplicationContext();
    UIManagerModule uiManager = reactCtx.getNativeModule(UIManagerModule.class);
    reactCtx.addLifecycleEventListener(this);
    uiManager.addUIManagerListener(this);
  }

  @Override
  public void onHostPause() {
    if (mNodesManager != null) {
      mNodesManager.onHostPause();
    }
  }

  @Override
  public void onHostResume() {
    if (mNodesManager != null) {
      mNodesManager.onHostResume();
    }
  }

  @Override
  public void onHostDestroy() {
    // do nothing
  }

  @Override
  public void willDispatchViewUpdates(final UIManagerModule uiManager) {
    if (mOperations.isEmpty()) {
      return;
    }
    final ArrayList<UIThreadOperation> operations = mOperations;
    mOperations = new ArrayList<>();
    uiManager.addUIBlock(new UIBlock() {
      @Override
      public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
        NodesManager nodesManager = getNodesManager();
        for (UIThreadOperation operation : operations) {
          operation.execute(nodesManager);
        }
      }
    });
  }

  @Override
  public String getName() {
    return NAME;
  }

  private NodesManager getNodesManager() {
    if (mNodesManager == null) {
      mNodesManager = new NodesManager(getReactApplicationContext());
    }

    return mNodesManager;
  }

  @ReactMethod
  public void createNode(final int tag, final ReadableMap config) {
    mOperations.add(new UIThreadOperation() {
      @Override
      public void execute(NodesManager nodesManager) {
        nodesManager.createNode(tag, config);
      }
    });
  }

  @ReactMethod
  public void dropNode(final int tag) {
    mOperations.add(new UIThreadOperation() {
      @Override
      public void execute(NodesManager nodesManager) {
        nodesManager.dropNode(tag);
      }
    });
  }

  @ReactMethod
  public void connectNodes(final int parentID, final int childID) {
    mOperations.add(new UIThreadOperation() {
      @Override
      public void execute(NodesManager nodesManager) {
        nodesManager.connectNodes(parentID, childID);
      }
    });
  }

  @ReactMethod
  public void disconnectNodes(final int parentID, final int childID) {
    mOperations.add(new UIThreadOperation() {
      @Override
      public void execute(NodesManager nodesManager) {
        nodesManager.disconnectNodes(parentID, childID);
      }
    });
  }

  @ReactMethod
  public void connectNodeToView(final int nodeID, final int viewTag) {
    mOperations.add(new UIThreadOperation() {
      @Override
      public void execute(NodesManager nodesManager) {
        nodesManager.connectNodeToView(nodeID, viewTag);
      }
    });
  }

  @ReactMethod
  public void disconnectNodeFromView(final int nodeID, final int viewTag) {
    mOperations.add(new UIThreadOperation() {
      @Override
      public void execute(NodesManager nodesManager) {
        nodesManager.disconnectNodeFromView(nodeID, viewTag);
      }
    });
  }

  @ReactMethod
  public void attachEvent(final int viewTag, final String eventName, final int eventNodeID) {
    mOperations.add(new UIThreadOperation() {
      @Override
      public void execute(NodesManager nodesManager) {
        nodesManager.attachEvent(viewTag, eventName, eventNodeID);
      }
    });
  }

  @ReactMethod
  public void detachEvent(final int viewTag, final String eventName, final int eventNodeID) {
    mOperations.add(new UIThreadOperation() {
      @Override
      public void execute(NodesManager nodesManager) {
        nodesManager.detachEvent(viewTag, eventName, eventNodeID);
      }
    });
  }

//  private void clearFrameCallback() {
//    Assertions.assertNotNull(mReactChoreographer).removeFrameCallback(
//            ReactChoreographer.CallbackType.NATIVE_ANIMATED_MODULE,
//            mAnimatedFrameCallback);
//  }
//
//  private void enqueueFrameCallback() {
//    Assertions.assertNotNull(mReactChoreographer).postFrameCallback(
//            ReactChoreographer.CallbackType.NATIVE_ANIMATED_MODULE,
//            mAnimatedFrameCallback);
//  }
//
//  @VisibleForTesting
//  public void setNodesManager(NativeAnimatedNodesManager nodesManager) {
//    mNodesManager = nodesManager;
//  }
//  @ReactMethod
//  public void startListeningToAnimatedNodeValue(final int tag) {
//    final AnimatedNodeValueListener listener = new AnimatedNodeValueListener() {
//      public void onValueUpdate(double value) {
//        WritableMap onAnimatedValueData = Arguments.createMap();
//        onAnimatedValueData.putInt("tag", tag);
//        onAnimatedValueData.putDouble("value", value);
//        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                .emit("onAnimatedValueUpdate", onAnimatedValueData);
//      }
//    };
//
//    mOperations.add(new UIThreadOperation() {
//      @Override
//      public void execute(NativeAnimatedNodesManager animatedNodesManager) {
//        animatedNodesManager.startListeningToAnimatedNodeValue(tag, listener);
//      }
//    });
//  }
//
//  @ReactMethod
//  public void stopListeningToAnimatedNodeValue(final int tag) {
//    mOperations.add(new UIThreadOperation() {
//      @Override
//      public void execute(NativeAnimatedNodesManager animatedNodesManager) {
//        animatedNodesManager.stopListeningToAnimatedNodeValue(tag);
//      }
//    });
//  }
//
//
//  @ReactMethod
//  public void setAnimatedNodeValue(final int tag, final double value) {
//    mOperations.add(new UIThreadOperation() {
//      @Override
//      public void execute(NativeAnimatedNodesManager animatedNodesManager) {
//        animatedNodesManager.setAnimatedNodeValue(tag, value);
//      }
//    });
//  }
//
//  @ReactMethod
//  public void setAnimatedNodeOffset(final int tag, final double value) {
//    mOperations.add(new UIThreadOperation() {
//      @Override
//      public void execute(NativeAnimatedNodesManager animatedNodesManager) {
//        animatedNodesManager.setAnimatedNodeOffset(tag, value);
//      }
//    });
//  }
//
//  @ReactMethod
//  public void flattenAnimatedNodeOffset(final int tag) {
//    mOperations.add(new UIThreadOperation() {
//      @Override
//      public void execute(NativeAnimatedNodesManager animatedNodesManager) {
//        animatedNodesManager.flattenAnimatedNodeOffset(tag);
//      }
//    });
//  }
//
//  @ReactMethod
//  public void extractAnimatedNodeOffset(final int tag) {
//    mOperations.add(new UIThreadOperation() {
//      @Override
//      public void execute(NativeAnimatedNodesManager animatedNodesManager) {
//        animatedNodesManager.extractAnimatedNodeOffset(tag);
//      }
//    });
//  }
//
//  @ReactMethod
//  public void startAnimatingNode(
//          final int animationId,
//          final int animatedNodeTag,
//          final ReadableMap animationConfig,
//          final Callback endCallback) {
//    mOperations.add(new UIThreadOperation() {
//      @Override
//      public void execute(NativeAnimatedNodesManager animatedNodesManager) {
//        animatedNodesManager.startAnimatingNode(
//                animationId,
//                animatedNodeTag,
//                animationConfig,
//                endCallback);
//      }
//    });
//  }
//
//  @ReactMethod
//  public void stopAnimation(final int animationId) {
//    mOperations.add(new UIThreadOperation() {
//      @Override
//      public void execute(NativeAnimatedNodesManager animatedNodesManager) {
//        animatedNodesManager.stopAnimation(animationId);
//      }
//    });
//  }
//
}
