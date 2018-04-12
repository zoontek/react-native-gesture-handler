#import "REANodesManager.h"

#import <React/RCTConvert.h>

#import "Nodes/REANode.h"
#import "Nodes/REAPropsNode.h"
#import "Nodes/REAStyleNode.h"
#import "Nodes/REATransformNode.h"
#import "Nodes/REAValueNode.h"
#import "Nodes/REABlockNode.h"
#import "Nodes/REACondNode.h"
#import "Nodes/REAOperatorNode.h"
#import "Nodes/REASetNode.h"
#import "Nodes/READebugNode.h"
#import "Nodes/REAClockNodes.h"
#import "Nodes/REAJSCallNode.h"
#import "Nodes/REABezierNode.h"

@implementation REANodesManager
{
  NSMutableDictionary<REANodeID, REANode *> *_nodes;
  // Mapping of a view tag and an event name to a list of event animation drivers. 99% of the time
  // there will be only one driver per mapping so all code code should be optimized around that.
//  NSMutableDictionary<NSString *, NSMutableArray<RCTEventAnimation *> *> *_eventDrivers;
//  NSMutableSet<id<RCTAnimationDriver>> *_activeAnimations;
  CADisplayLink *_displayLink;
  NSMutableArray<REAAfterAnimationCallback> *_afterAnimationCallbacks;
  NSMutableArray<REAOnAnimationCallback> *_onAnimationCallbacks;
}

- (instancetype)initWithModule:(REAModule *)reanimatedModule
                     uiManager:(RCTUIManager *)uiManager
{
  if ((self = [super init])) {
    _reanimatedModule = reanimatedModule;
    _uiManager = uiManager;
    _nodes = [NSMutableDictionary new];
    _onAnimationCallbacks = [NSMutableArray new];
    _afterAnimationCallbacks = [NSMutableArray new];
  }
  return self;
}

- (void)invalidate
{
  [self stopUpdatingOnAnimationFrame];
}

- (REANode *)findNodeByID:(REANodeID)nodeID
{
  return _nodes[nodeID];
}

- (void)postOnAnimation:(REAOnAnimationCallback)clb
{
  [_onAnimationCallbacks addObject:clb];
}

- (void)postAfterAnimation:(REAAfterAnimationCallback)clb
{
  [_afterAnimationCallbacks addObject:clb];
  [self startUpdatingOnAnimationFrame];
}

- (void)startUpdatingOnAnimationFrame
{
  if (!_displayLink) {
    _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(onAnimationFrame:)];
    [_displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
  }
}

- (void)stopUpdatingOnAnimationFrame
{
  if (_displayLink) {
    [_displayLink invalidate];
    _displayLink = nil;
  }
}

- (void)onAnimationFrame:(CADisplayLink *)displayLink
{
  NSArray<REAOnAnimationCallback> *callbacks = _onAnimationCallbacks;
  _onAnimationCallbacks = [NSMutableArray new];

  // When one of the callbacks would postOnAnimation callback we don't want
  // to process it until the next frame. This is why we cpy the array before
  // we iterate over it
  for (REAOnAnimationCallback block in callbacks) {
    block(displayLink);
  }

  // new items can be added to the _afterANimationCallback array during the
  // loop by the enqueued callbacks. In that case we want to run them immediately
  // and clear after animation queue once all the callbacks are done
  for (NSUInteger i = 0; i < _afterAnimationCallbacks.count; i++) {
    _afterAnimationCallbacks[i]();
  }

  if (_onAnimationCallbacks.count == 0) {
    [self stopUpdatingOnAnimationFrame];
  }
}

#pragma mark -- Graph

- (void)createNode:(REANodeID)nodeID
            config:(NSDictionary<NSString *, id> *)config
{
  static NSDictionary *map;
  static dispatch_once_t mapToken;
  dispatch_once(&mapToken, ^{
    map = @{@"props": [REAPropsNode class],
            @"style": [REAStyleNode class],
            @"transform": [REATransformNode class],
            @"value": [REAValueNode class],
            @"block": [REABlockNode class],
            @"cond": [REACondNode class],
            @"op": [REAOperatorNode class],
            @"set": [REASetNode class],
            @"debug": [READebugNode class],
            @"clock": [REAClockNode class],
            @"clockStart": [REAClockStartNode class],
            @"clockStop": [REAClockStopNode class],
            @"clockTest": [REAClockTestNode class],
            @"call": [REAJSCallNode class],
            @"bezier": [REABezierNode class],
//            @"listener": nil,
            };
  });

  NSString *nodeType = [RCTConvert NSString:config[@"type"]];

  Class nodeClass = map[nodeType];
  if (!nodeClass) {
    RCTLogError(@"Animated node type %@ not supported natively", nodeType);
    return;
  }

  REANode *node = [[nodeClass alloc] initWithID:nodeID config:config];
  node.nodesManager = self;
  _nodes[nodeID] = node;
}

- (void)dropNode:(REANodeID)nodeID
{
  REANode *node = _nodes[nodeID];
  if (node) {
//    [node detachNode];
    [_nodes removeObjectForKey:nodeID];
  }
}


- (void)connectNodes:(nonnull NSNumber *)parentID childID:(nonnull REANodeID)childID
{
  RCTAssertParam(parentID);
  RCTAssertParam(childID);

  REANode *parentNode = _nodes[parentID];
  REANode *childNode = _nodes[childID];

  RCTAssertParam(parentNode);
  RCTAssertParam(childNode);

  [parentNode addChild:childNode];
}

- (void)disconnectNodes:(REANodeID)parentID childID:(REANodeID)childID
{
  RCTAssertParam(parentID);
  RCTAssertParam(childID);

  REANode *parentNode = _nodes[parentID];
  REANode *childNode = _nodes[childID];

  RCTAssertParam(parentNode);
  RCTAssertParam(childNode);

  [parentNode removeChild:childNode];
}

- (void)connectNodeToView:(REANodeID)nodeID
                  viewTag:(NSNumber *)viewTag
                 viewName:(NSString *)viewName
{
  RCTAssertParam(nodeID);
  REANode *node = _nodes[nodeID];
  RCTAssertParam(node);

  if ([node isKindOfClass:[REAPropsNode class]]) {
    [(REAPropsNode *)node connectToView:viewTag viewName:viewName];
  }
}

//- (void)disconnectAnimatedNodeFromView:(nonnull NSNumber *)nodeTag
//                               viewTag:(nonnull NSNumber *)viewTag
//{
//  REAReanimatedNode *node = _animationNodes[nodeTag];
//  if ([node isKindOfClass:[RCTPropsAnimatedNode class]]) {
//    [(RCTPropsAnimatedNode *)node disconnectFromView:viewTag];
//  }
//}
//
//- (void)restoreDefaultValues:(nonnull NSNumber *)nodeTag
//{
//  REAReanimatedNode *node = _animationNodes[nodeTag];
//  // Restoring default values needs to happen before UIManager operations so it is
//  // possible the node hasn't been created yet if it is being connected and
//  // disconnected in the same batch. In that case we don't need to restore
//  // default values since it will never actually update the view.
//  if (node == nil) {
//    return;
//  }
//  if (![node isKindOfClass:[RCTPropsAnimatedNode class]]) {
//    RCTLogError(@"Not a props node.");
//  }
//  [(RCTPropsAnimatedNode *)node restoreDefaultValues];
//}
//
//
//#pragma mark -- Mutations
//
//- (void)setAnimatedNodeValue:(nonnull NSNumber *)nodeTag
//                       value:(nonnull NSNumber *)value
//{
//  REAReanimatedNode *node = _animationNodes[nodeTag];
//  if (![node isKindOfClass:[RCTValueAnimatedNode class]]) {
//    RCTLogError(@"Not a value node.");
//    return;
//  }
//  [self stopAnimationsForNode:node];
//
//  RCTValueAnimatedNode *valueNode = (RCTValueAnimatedNode *)node;
//  valueNode.value = value.floatValue;
//  [valueNode setNeedsUpdate];
//}
//
//- (void)setAnimatedNodeOffset:(nonnull NSNumber *)nodeTag
//                       offset:(nonnull NSNumber *)offset
//{
//  REAReanimatedNode *node = _animationNodes[nodeTag];
//  if (![node isKindOfClass:[RCTValueAnimatedNode class]]) {
//    RCTLogError(@"Not a value node.");
//    return;
//  }
//
//  RCTValueAnimatedNode *valueNode = (RCTValueAnimatedNode *)node;
//  [valueNode setOffset:offset.floatValue];
//  [valueNode setNeedsUpdate];
//}
//
//- (void)flattenAnimatedNodeOffset:(nonnull NSNumber *)nodeTag
//{
//  REAReanimatedNode *node = _animationNodes[nodeTag];
//  if (![node isKindOfClass:[RCTValueAnimatedNode class]]) {
//    RCTLogError(@"Not a value node.");
//    return;
//  }
//
//  RCTValueAnimatedNode *valueNode = (RCTValueAnimatedNode *)node;
//  [valueNode flattenOffset];
//}
//
//- (void)extractAnimatedNodeOffset:(nonnull NSNumber *)nodeTag
//{
//  REAReanimatedNode *node = _animationNodes[nodeTag];
//  if (![node isKindOfClass:[RCTValueAnimatedNode class]]) {
//    RCTLogError(@"Not a value node.");
//    return;
//  }
//
//  RCTValueAnimatedNode *valueNode = (RCTValueAnimatedNode *)node;
//  [valueNode extractOffset];
//}
//
//#pragma mark -- Drivers
//
//- (void)startAnimatingNode:(nonnull NSNumber *)animationId
//                   nodeTag:(nonnull NSNumber *)nodeTag
//                    config:(NSDictionary<NSString *, id> *)config
//               endCallback:(RCTResponseSenderBlock)callBack
//{
//  RCTValueAnimatedNode *valueNode = (RCTValueAnimatedNode *)_animationNodes[nodeTag];
//
//  NSString *type = config[@"type"];
//  id<RCTAnimationDriver> animationDriver;
//
//  if ([type isEqual:@"frames"]) {
//    animationDriver = [[RCTFrameAnimation alloc] initWithId:animationId
//                                                     config:config
//                                                    forNode:valueNode
//                                                   callBack:callBack];
//
//  } else if ([type isEqual:@"spring"]) {
//    animationDriver = [[RCTSpringAnimation alloc] initWithId:animationId
//                                                      config:config
//                                                     forNode:valueNode
//                                                    callBack:callBack];
//
//  } else if ([type isEqual:@"decay"]) {
//    animationDriver = [[RCTDecayAnimation alloc] initWithId:animationId
//                                                     config:config
//                                                    forNode:valueNode
//                                                   callBack:callBack];
//  } else {
//    RCTLogError(@"Unsupported animation type: %@", config[@"type"]);
//    return;
//  }
//
//  [_activeAnimations addObject:animationDriver];
//  [animationDriver startAnimation];
//  [self startAnimationLoopIfNeeded];
//}
//
//- (void)stopAnimation:(nonnull NSNumber *)animationId
//{
//  for (id<RCTAnimationDriver> driver in _activeAnimations) {
//    if ([driver.animationId isEqual:animationId]) {
//      [driver stopAnimation];
//      [_activeAnimations removeObject:driver];
//      break;
//    }
//  }
//}
//
//- (void)stopAnimationsForNode:(nonnull REAReanimatedNode *)node
//{
//    NSMutableArray<id<RCTAnimationDriver>> *discarded = [NSMutableArray new];
//    for (id<RCTAnimationDriver> driver in _activeAnimations) {
//        if ([driver.valueNode isEqual:node]) {
//            [discarded addObject:driver];
//        }
//    }
//    for (id<RCTAnimationDriver> driver in discarded) {
//        [driver stopAnimation];
//        [_activeAnimations removeObject:driver];
//    }
//}
//
//#pragma mark -- Events
//
//- (void)addAnimatedEventToView:(nonnull NSNumber *)viewTag
//                     eventName:(nonnull NSString *)eventName
//                  eventMapping:(NSDictionary<NSString *, id> *)eventMapping
//{
//  NSNumber *nodeTag = [RCTConvert NSNumber:eventMapping[@"animatedValueTag"]];
//  REAReanimatedNode *node = _animationNodes[nodeTag];
//
//  if (!node) {
//    RCTLogError(@"Animated node with tag %@ does not exists", nodeTag);
//    return;
//  }
//
//  if (![node isKindOfClass:[RCTValueAnimatedNode class]]) {
//    RCTLogError(@"Animated node connected to event should be of type RCTValueAnimatedNode");
//    return;
//  }
//
//  NSArray<NSString *> *eventPath = [RCTConvert NSStringArray:eventMapping[@"nativeEventPath"]];
//
//  RCTEventAnimation *driver =
//    [[RCTEventAnimation alloc] initWithEventPath:eventPath valueNode:(RCTValueAnimatedNode *)node];
//
//  NSString *key = [NSString stringWithFormat:@"%@%@", viewTag, eventName];
//  if (_eventDrivers[key] != nil) {
//    [_eventDrivers[key] addObject:driver];
//  } else {
//    NSMutableArray<RCTEventAnimation *> *drivers = [NSMutableArray new];
//    [drivers addObject:driver];
//    _eventDrivers[key] = drivers;
//  }
//}
//
//- (void)removeAnimatedEventFromView:(nonnull NSNumber *)viewTag
//                          eventName:(nonnull NSString *)eventName
//                    animatedNodeTag:(nonnull NSNumber *)animatedNodeTag
//{
//  NSString *key = [NSString stringWithFormat:@"%@%@", viewTag, eventName];
//  if (_eventDrivers[key] != nil) {
//    if (_eventDrivers[key].count == 1) {
//      [_eventDrivers removeObjectForKey:key];
//    } else {
//      NSMutableArray<RCTEventAnimation *> *driversForKey = _eventDrivers[key];
//      for (NSUInteger i = 0; i < driversForKey.count; i++) {
//        if (driversForKey[i].valueNode.nodeTag == animatedNodeTag) {
//          [driversForKey removeObjectAtIndex:i];
//          break;
//        }
//      }
//    }
//  }
//}
//
//- (void)handleAnimatedEvent:(id<RCTEvent>)event
//{
//  if (_eventDrivers.count == 0) {
//    return;
//  }
//
//  NSString *key = [NSString stringWithFormat:@"%@%@", event.viewTag, event.eventName];
//  NSMutableArray<RCTEventAnimation *> *driversForKey = _eventDrivers[key];
//  if (driversForKey) {
//    for (RCTEventAnimation *driver in driversForKey) {
//      [self stopAnimationsForNode:driver.valueNode];
//      [driver updateWithEvent:event];
//    }
//
//    [self updateAnimations];
//  }
//}
//
//#pragma mark -- Listeners
//
//- (void)startListeningToAnimatedNodeValue:(nonnull NSNumber *)tag
//                            valueObserver:(id<RCTValueAnimatedNodeObserver>)valueObserver
//{
//  REAReanimatedNode *node = _animationNodes[tag];
//  if ([node isKindOfClass:[RCTValueAnimatedNode class]]) {
//    ((RCTValueAnimatedNode *)node).valueObserver = valueObserver;
//  }
//}
//
//- (void)stopListeningToAnimatedNodeValue:(nonnull NSNumber *)tag
//{
//  REAReanimatedNode *node = _animationNodes[tag];
//  if ([node isKindOfClass:[RCTValueAnimatedNode class]]) {
//    ((RCTValueAnimatedNode *)node).valueObserver = nil;
//  }
//}
//
//
#pragma mark -- Animation Loop

//- (void)startAnimationLoopIfNeeded
//{
//  if (!_displayLink) {
//    _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(onFrame:)];
//    [_displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
//  }
//}
//
//- (void)stopAnimationLoopIfNeeded
//{
//
//}
//
//- (void)stopAnimationLoop
//{
//  if (_displayLink) {
//    [_displayLink invalidate];
//    _displayLink = nil;
//  }
//}
//
//- (void)onFrame:(CADisplayLink *)displayLink
//{
//  [REANode runPropUpdates];
////  [self stopAnimationLoopIfNeeded];
//}

//- (void)stepAnimations:(CADisplayLink *)displaylink
//{
//  NSTimeInterval time = displaylink.timestamp;
//  for (id<RCTAnimationDriver> animationDriver in _activeAnimations) {
//    [animationDriver stepAnimationWithTime:time];
//  }
//
//  [self updateAnimations];
//
//  for (id<RCTAnimationDriver> animationDriver in [_activeAnimations copy]) {
//    if (animationDriver.animationHasFinished) {
//      [animationDriver stopAnimation];
//      [_activeAnimations removeObject:animationDriver];
//    }
//  }
//
//  [self stopAnimationLoopIfNeeded];
//}
//
//
//#pragma mark -- Updates
//
//- (void)updateAnimations
//{
//  [_animationNodes enumerateKeysAndObjectsUsingBlock:^(NSNumber *key, REAReanimatedNode *node, BOOL *stop) {
//    if (node.needsUpdate) {
//      [node updateNodeIfNecessary];
//    }
//  }];
//}

@end
