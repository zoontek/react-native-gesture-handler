#import "REAModule.h"

#import "REANodesManager.h"

typedef void (^AnimatedOperation)(REANodesManager *nodesManager);

@implementation REAModule
{
  REANodesManager *_nodesManager;
  NSMutableArray<AnimatedOperation> *_operations;
}

RCT_EXPORT_MODULE(ReanimatedModule);

- (void)invalidate
{
  [_nodesManager stopAnimationLoop];
  [self.bridge.eventDispatcher removeDispatchObserver:self];
  [self.bridge.uiManager.observerCoordinator removeObserver:self];
}

- (dispatch_queue_t)methodQueue
{
  // This module needs to be on the same queue as the UIManager to avoid
  // having to lock `_operations` and `_preOperations` since `uiManagerWillPerformMounting`
  // will be called from that queue.
  return RCTGetUIManagerQueue();
}

- (void)setBridge:(RCTBridge *)bridge
{
  [super setBridge:bridge];

  _nodesManager = [[REANodesManager alloc] initWithUIManager:self.bridge.uiManager];
  _operations = [NSMutableArray new];

  [bridge.eventDispatcher addDispatchObserver:self];
  [bridge.uiManager.observerCoordinator addObserver:self];
}

#pragma mark -- API

RCT_EXPORT_METHOD(createNode:(nonnull NSNumber *)tag
                  config:(NSDictionary<NSString *, id> *)config)
{
  [self addOperationBlock:^(REANodesManager *nodesManager) {
    [nodesManager createNode:tag config:config];
  }];
}

RCT_EXPORT_METHOD(dropNode:(nonnull NSNumber *)tag)
{
  [self addOperationBlock:^(REANodesManager *nodesManager) {
    [nodesManager dropNode:tag];
  }];
}

//RCT_EXPORT_METHOD(connectAnimatedNodes:(nonnull NSNumber *)parentTag
//                  childTag:(nonnull NSNumber *)childTag)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager connectAnimatedNodes:parentTag childTag:childTag];
//  }];
//}
//
//RCT_EXPORT_METHOD(disconnectAnimatedNodes:(nonnull NSNumber *)parentTag
//                  childTag:(nonnull NSNumber *)childTag)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager disconnectAnimatedNodes:parentTag childTag:childTag];
//  }];
//}
//
//RCT_EXPORT_METHOD(startAnimatingNode:(nonnull NSNumber *)animationId
//                  nodeTag:(nonnull NSNumber *)nodeTag
//                  config:(NSDictionary<NSString *, id> *)config
//                  endCallback:(RCTResponseSenderBlock)callBack)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager startAnimatingNode:animationId nodeTag:nodeTag config:config endCallback:callBack];
//  }];
//}
//
//RCT_EXPORT_METHOD(stopAnimation:(nonnull NSNumber *)animationId)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager stopAnimation:animationId];
//  }];
//}
//
//RCT_EXPORT_METHOD(setAnimatedNodeValue:(nonnull NSNumber *)nodeTag
//                  value:(nonnull NSNumber *)value)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager setAnimatedNodeValue:nodeTag value:value];
//  }];
//}
//
//RCT_EXPORT_METHOD(setAnimatedNodeOffset:(nonnull NSNumber *)nodeTag
//                  offset:(nonnull NSNumber *)offset)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager setAnimatedNodeOffset:nodeTag offset:offset];
//  }];
//}
//
//RCT_EXPORT_METHOD(flattenAnimatedNodeOffset:(nonnull NSNumber *)nodeTag)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager flattenAnimatedNodeOffset:nodeTag];
//  }];
//}
//
//RCT_EXPORT_METHOD(extractAnimatedNodeOffset:(nonnull NSNumber *)nodeTag)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager extractAnimatedNodeOffset:nodeTag];
//  }];
//}
//
//RCT_EXPORT_METHOD(connectAnimatedNodeToView:(nonnull NSNumber *)nodeTag
//                  viewTag:(nonnull NSNumber *)viewTag)
//{
//  NSString *viewName = [self.bridge.uiManager viewNameForReactTag:viewTag];
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager connectAnimatedNodeToView:nodeTag viewTag:viewTag viewName:viewName];
//  }];
//}
//
//RCT_EXPORT_METHOD(disconnectAnimatedNodeFromView:(nonnull NSNumber *)nodeTag
//                  viewTag:(nonnull NSNumber *)viewTag)
//{
//  [self addPreOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager restoreDefaultValues:nodeTag];
//  }];
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager disconnectAnimatedNodeFromView:nodeTag viewTag:viewTag];
//  }];
//}
//
//RCT_EXPORT_METHOD(dropAnimatedNode:(nonnull NSNumber *)tag)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager dropAnimatedNode:tag];
//  }];
//}
//
//RCT_EXPORT_METHOD(startListeningToAnimatedNodeValue:(nonnull NSNumber *)tag)
//{
//  __weak id<RCTValueAnimatedNodeObserver> valueObserver = self;
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager startListeningToAnimatedNodeValue:tag valueObserver:valueObserver];
//  }];
//}
//
//RCT_EXPORT_METHOD(stopListeningToAnimatedNodeValue:(nonnull NSNumber *)tag)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager stopListeningToAnimatedNodeValue:tag];
//  }];
//}
//
//RCT_EXPORT_METHOD(addAnimatedEventToView:(nonnull NSNumber *)viewTag
//                  eventName:(nonnull NSString *)eventName
//                  eventMapping:(NSDictionary<NSString *, id> *)eventMapping)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager addAnimatedEventToView:viewTag eventName:eventName eventMapping:eventMapping];
//  }];
//}
//
//RCT_EXPORT_METHOD(removeAnimatedEventFromView:(nonnull NSNumber *)viewTag
//                  eventName:(nonnull NSString *)eventName
//            animatedNodeTag:(nonnull NSNumber *)animatedNodeTag)
//{
//  [self addOperationBlock:^(REAReanimatedNodesManager *nodesManager) {
//    [nodesManager removeAnimatedEventFromView:viewTag eventName:eventName animatedNodeTag:animatedNodeTag];
//  }];
//}

#pragma mark -- Batch handling

- (void)addOperationBlock:(AnimatedOperation)operation
{
  [_operations addObject:operation];
}

#pragma mark - RCTUIManagerObserver

- (void)uiManagerWillPerformMounting:(RCTUIManager *)uiManager
{
  if (_operations.count == 0) {
    return;
  }

  NSArray<AnimatedOperation> *operations = _operations;
  _operations = [NSMutableArray new];

  [uiManager addUIBlock:^(__unused RCTUIManager *manager, __unused NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    for (AnimatedOperation operation in operations) {
      operation(self->_nodesManager);
    }

    [self->_nodesManager updateAnimations];
  }];
}

#pragma mark -- Events

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"onRenimatedValueUpdate"];
}

//- (void)animatedNode:(RCTValueAnimatedNode *)node didUpdateValue:(CGFloat)value
//{
//  [self sendEventWithName:@"onAnimatedValueUpdate"
//                     body:@{@"id": node.nodeID, @"value": @(value)}];
//}

- (void)eventDispatcherWillDispatchEvent:(id<RCTEvent>)event
{
  // Events can be dispatched from any queue so we have to make sure handleAnimatedEvent
  // is run from the main queue.
//  RCTExecuteOnMainQueue(^{
//    [self->_nodesManager handleAnimatedEvent:event];
//  });
}

@end
