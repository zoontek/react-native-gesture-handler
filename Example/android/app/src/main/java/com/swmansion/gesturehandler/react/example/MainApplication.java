package com.swmansion.gesturehandler.react.example;

import android.app.Application;
import android.util.Log;
import android.view.MotionEvent;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.views.modal.ReactModalHostManager;
import com.facebook.react.views.modal.ReactModalHostView;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.swmansion.gesturehandler.react.RNGestureHandlerModalHostView;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private ReactModalHostView mReactModalHostView;
  private ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    void setModalHostView (ReactModalHostView reactModalHostView) {
      mReactModalHostView = reactModalHostView;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      ReactModalHostView modalHostView;
      return Arrays.<ReactPackage>asList(
          new MainReactPackage() {
            @Override
            public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
              List<ViewManager> oldViewManagers =  super.createViewManagers(reactContext);
              List<ViewManager> viewManagers = new ArrayList<>();
              for (ViewManager viewManager: oldViewManagers) {
                if (viewManager instanceof ReactModalHostManager) {
                  viewManagers.add(new ReactModalHostManager(){
                    @Override
                    protected ReactModalHostView createViewInstance(ThemedReactContext reactContext) {
                      return new RNGestureHandlerModalHostView(reactContext);
                    }

                  });
                } else {
                  viewManagers.add(viewManager);
                }
              }
              return viewManagers;
            }
          },
            new VectorIconsPackage(),
          new RNGestureHandlerPackage(mReactModalHostView)
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
