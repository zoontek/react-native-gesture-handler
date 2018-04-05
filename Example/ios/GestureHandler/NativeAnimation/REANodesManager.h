#import <Foundation/Foundation.h>

#import "REAValueNode.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTUIManager.h>

@interface REANodesManager : NSObject

- (nonnull instancetype)initWithUIManager:(nonnull RCTUIManager *)uiManager;

- (void)updateAnimations;

- (void)stepAnimations:(nonnull CADisplayLink *)displaylink;

// graph

- (void)createNode:(nonnull NSNumber *)tag
            config:(NSDictionary<NSString *, id> *__nonnull)config;

- (void)dropNode:(nonnull NSNumber *)tag;

//- (void)connectAnimatedNodes:(nonnull NSNumber *)parentTag
//                    childTag:(nonnull NSNumber *)childTag;
//
//- (void)disconnectAnimatedNodes:(nonnull NSNumber *)parentTag
//                       childTag:(nonnull NSNumber *)childTag;
//
//- (void)connectAnimatedNodeToView:(nonnull NSNumber *)nodeTag
//                          viewTag:(nonnull NSNumber *)viewTag
//                         viewName:(nonnull NSString *)viewName;
//
//- (void)restoreDefaultValues:(nonnull NSNumber *)nodeTag;
//
//- (void)disconnectAnimatedNodeFromView:(nonnull NSNumber *)nodeTag
//                               viewTag:(nonnull NSNumber *)viewTag;



// mutations

//- (void)setAnimatedNodeValue:(nonnull NSNumber *)nodeTag
//                       value:(nonnull NSNumber *)value;
//
//- (void)setAnimatedNodeOffset:(nonnull NSNumber *)nodeTag
//                       offset:(nonnull NSNumber *)offset;
//
//- (void)flattenAnimatedNodeOffset:(nonnull NSNumber *)nodeTag;
//
//- (void)extractAnimatedNodeOffset:(nonnull NSNumber *)nodeTag;
//
//// drivers
//
//- (void)startAnimatingNode:(nonnull NSNumber *)animationId
//                   nodeTag:(nonnull NSNumber *)nodeTag
//                    config:(NSDictionary<NSString *, id> *__nonnull)config
//               endCallback:(nullable RCTResponseSenderBlock)callBack;
//
//- (void)stopAnimation:(nonnull NSNumber *)animationId;

- (void)stopAnimationLoop;

//// events
//
//- (void)addAnimatedEventToView:(nonnull NSNumber *)viewTag
//                     eventName:(nonnull NSString *)eventName
//                  eventMapping:(NSDictionary<NSString *, id> *__nonnull)eventMapping;
//
//- (void)removeAnimatedEventFromView:(nonnull NSNumber *)viewTag
//                          eventName:(nonnull NSString *)eventName
//                    animatedNodeTag:(nonnull NSNumber *)animatedNodeTag;
//
//- (void)handleAnimatedEvent:(nonnull id<RCTEvent>)event;
//
//// listeners
//
//- (void)startListeningToAnimatedNodeValue:(nonnull NSNumber *)tag
//                            valueObserver:(nonnull id<RCTValueAnimatedNodeObserver>)valueObserver;
//
//- (void)stopListeningToAnimatedNodeValue:(nonnull NSNumber *)tag;

@end
