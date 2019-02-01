package com.swmansion.gesturehandler.react;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewStructure;
import android.view.WindowManager;
import android.widget.FrameLayout;
import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.GuardedRunnable;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.JSTouchDispatcher;
import com.facebook.react.uimanager.RootView;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.views.common.ContextUtils;
import com.facebook.react.views.modal.ReactModalHostView;
import com.facebook.react.views.view.ReactViewGroup;
import javax.annotation.Nullable;


public class RNGestureHandlerModalHostView extends ReactModalHostView {
  public interface OnRequestCloseListener {
    void onRequestClose(DialogInterface dialog);
  }

  private DialogRootViewGroup mHostView;
  private @Nullable Dialog mDialog;
  private boolean mTransparent;
  private String mAnimationType;
  private boolean mHardwareAccelerated;
  private boolean mPropertyRequiresNewDialog;
  private @Nullable DialogInterface.OnShowListener mOnShowListener;
  private @Nullable OnRequestCloseListener mOnRequestCloseListener;

  public RNGestureHandlerModalHostView(Context context) {
    super(context);
    ((ReactContext) context).addLifecycleEventListener(this);
    mHostView = new DialogRootViewGroup(context);
  }

  @TargetApi(23)
  @Override
  public void dispatchProvideStructure(ViewStructure structure) {
    mHostView.dispatchProvideStructure(structure);
  }

  @Override
  public void addView(View child, int index) {
    mHostView.addView(child, index);
  }

  @Override
  public int getChildCount() {
    return mHostView.getChildCount();
  }

  @Override
  public View getChildAt(int index) {
    return mHostView.getChildAt(index);
  }

  @Override
  public void removeView(View child) {
    mHostView.removeView(child);
  }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent event) {
    return  super.onInterceptTouchEvent(event);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        return  super.onTouchEvent(event);
    }


  @Override
  public void removeViewAt(int index) {
    View child = getChildAt(index);
    mHostView.removeView(child);
  }

  public void onDropInstance() {
    ((ReactContext) getContext()).removeLifecycleEventListener(this);
    dismiss();
  }

  private void dismiss() {
    if (mDialog != null) {
      if (mDialog.isShowing()) {
        Activity dialogContext = ContextUtils.findContextOfType(mDialog.getContext(), Activity.class);
        if (dialogContext == null || !dialogContext.isFinishing()) {
          mDialog.dismiss();
        }
      }
      mDialog = null;
      ViewGroup parent = (ViewGroup) mHostView.getParent();
      parent.removeViewAt(0);
    }
  }

  protected void setOnRequestCloseListener(OnRequestCloseListener listener) {
    mOnRequestCloseListener = listener;
  }

  protected void setOnShowListener(DialogInterface.OnShowListener listener) {
    mOnShowListener = listener;
  }

  protected void setTransparent(boolean transparent) {
    mTransparent = transparent;
  }

  protected void setAnimationType(String animationType) {
    mAnimationType = animationType;
    mPropertyRequiresNewDialog = true;
  }

  protected void setHardwareAccelerated(boolean hardwareAccelerated) {
    mHardwareAccelerated = hardwareAccelerated;
    mPropertyRequiresNewDialog = true;
  }

  private @Nullable Activity getCurrentActivity() {
    return ((ReactContext) getContext()).getCurrentActivity();
  }

  protected void showOrUpdate() {
    if (mDialog != null) {
      if (mPropertyRequiresNewDialog) {
        dismiss();
      } else {
        updateProperties();
        return;
      }
    }

    // Reset the flag since we are going to create a new dialog
    mPropertyRequiresNewDialog = false;
    int theme = R.style.Theme_FullScreenDialog;
    if (mAnimationType.equals("fade")) {
      theme = R.style.Theme_FullScreenDialogAnimatedFade;
    } else if (mAnimationType.equals("slide")) {
      theme = R.style.Theme_FullScreenDialogAnimatedSlide;
    }
    Activity currentActivity = getCurrentActivity();
    Context context = currentActivity == null ? getContext() : currentActivity;
    mDialog = new Dialog(context, theme);

    mDialog.setContentView(getContentView());
    updateProperties();

    mDialog.setOnShowListener(mOnShowListener);
    mDialog.setOnKeyListener(
            new DialogInterface.OnKeyListener() {
              @Override
              public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
                if (event.getAction() == KeyEvent.ACTION_UP) {
                  // We need to stop the BACK button from closing the dialog by default so we capture that
                  // event and instead inform JS so that it can make the decision as to whether or not to
                  // allow the back button to close the dialog.  If it chooses to, it can just set visible
                  // to false on the Modal and the Modal will go away
                  if (keyCode == KeyEvent.KEYCODE_BACK) {
                    Assertions.assertNotNull(
                            mOnRequestCloseListener,
                            "setOnRequestCloseListener must be called by the manager");
                    mOnRequestCloseListener.onRequestClose(dialog);
                    return true;
                  } else {
                    // We redirect the rest of the key events to the current activity, since the activity
                    // expects to receive those events and react to them, ie. in the case of the dev menu
                    Activity currentActivity = ((ReactContext) getContext()).getCurrentActivity();
                    if (currentActivity != null) {
                      return currentActivity.onKeyUp(keyCode, event);
                    }
                  }
                }
                return false;
              }
            });

    mDialog.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
    if (mHardwareAccelerated) {
      mDialog.getWindow().addFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
    }
    if (currentActivity != null && !currentActivity.isFinishing()) {
      mDialog.show();
    }
  }

  private View getContentView() {
    FrameLayout frameLayout = new FrameLayout(getContext());
    frameLayout.addView(mHostView);
    frameLayout.setFitsSystemWindows(true);
    return frameLayout;
  }

  private void updateProperties() {
    Assertions.assertNotNull(mDialog, "mDialog must exist when we call updateProperties");

    Activity currentActivity = getCurrentActivity();
    if (currentActivity != null) {
      int activityWindowFlags = currentActivity.getWindow().getAttributes().flags;
      if ((activityWindowFlags
              & WindowManager.LayoutParams.FLAG_FULLSCREEN) != 0) {
        mDialog.getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
      } else {
        mDialog.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
      }
    }

    if (mTransparent) {
      mDialog.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
    } else {
      mDialog.getWindow().setDimAmount(0.5f);
      mDialog.getWindow().setFlags(
              WindowManager.LayoutParams.FLAG_DIM_BEHIND,
              WindowManager.LayoutParams.FLAG_DIM_BEHIND);
    }
  }

  static class DialogRootViewGroup extends ReactViewGroup implements RootView {

    private final JSTouchDispatcher mJSTouchDispatcher = new JSTouchDispatcher(this);

    public DialogRootViewGroup(Context context) {
      super(context);
    }

    @Override
    protected void onSizeChanged(final int w, final int h, int oldw, int oldh) {
      super.onSizeChanged(w, h, oldw, oldh);
      if (getChildCount() > 0) {
        final int viewTag = getChildAt(0).getId();
        ReactContext reactContext = getReactContext();
        reactContext.runOnNativeModulesQueueThread(
                new GuardedRunnable(reactContext) {
                  @Override
                  public void runGuarded() {
                    (getReactContext()).getNativeModule(UIManagerModule.class)
                            .updateNodeSize(viewTag, w, h);
                  }
                });
      }
    }

    @Override
    public void handleException(Throwable t) {
      getReactContext().handleException(new RuntimeException(t));
    }

    private ReactContext getReactContext() {
      return (ReactContext) getContext();
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent event) {

      mJSTouchDispatcher.handleTouchEvent(event, getEventDispatcher());
      return false;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
      mJSTouchDispatcher.handleTouchEvent(event, getEventDispatcher());
      super.onTouchEvent(event);
      return false;
    }

    @Override
    public void onChildStartedNativeGesture(MotionEvent androidEvent) {
      mJSTouchDispatcher.onChildStartedNativeGesture(androidEvent, getEventDispatcher());
    }

    @Override
    public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
    }

    private EventDispatcher getEventDispatcher() {
      ReactContext reactContext = getReactContext();
      return reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
    }
  }
}
