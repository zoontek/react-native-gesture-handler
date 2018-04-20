package com.swmansion.reanimated;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import java.util.HashMap;
import java.util.Map;

public class Utils {

  public static Map<String, Integer> processMapping(ReadableMap style) {
    ReadableMapKeySetIterator iter = style.keySetIterator();
    HashMap<String, Integer> mapping = new HashMap<>();
    while (iter.hasNextKey()) {
      String propKey = iter.nextKey();
      int nodeIndex = style.getInt(propKey);
      mapping.put(propKey, nodeIndex);
    }
    return mapping;
  }

}
