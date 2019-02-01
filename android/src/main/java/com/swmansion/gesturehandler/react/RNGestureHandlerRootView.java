package com.swmansion.gesturehandler.react;

import android.content.Context;
import android.view.MotionEvent;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.views.modal.ReactModalHostManager;
import com.facebook.react.views.modal.ReactModalHostView;
import com.facebook.react.views.view.ReactViewGroup;

import javax.annotation.Nullable;

public class RNGestureHandlerRootView extends ReactViewGroup {

  private @Nullable RNGestureHandlerRootHelper mRootHelper;
  private @Nullable ReactModalHostView mReactModalHostView;

  RNGestureHandlerRootView(Context context, ReactModalHostView reactModalHostView) {
    super(context);
    mReactModalHostView = reactModalHostView;
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    if (mRootHelper == null) {
      mRootHelper = new RNGestureHandlerRootHelper((ReactContext) getContext(), this);
    }
  }

  public void tearDown() {
    if (mRootHelper != null) {
      mRootHelper.tearDown();
    }
  }

  @Override
  public boolean dispatchTouchEvent(MotionEvent ev) {
    if (Assertions.assertNotNull(mRootHelper).dispatchTouchEvent(ev)) {
      return true;
    }
    return super.dispatchTouchEvent(ev);
  }

  @Override
  public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
    Assertions.assertNotNull(mRootHelper).requestDisallowInterceptTouchEvent(disallowIntercept);
    super.requestDisallowInterceptTouchEvent(disallowIntercept);
  }
}
