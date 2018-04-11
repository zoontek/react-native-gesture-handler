#import <Foundation/Foundation.h>

#import "REANode.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTUIManager.h>

typedef void (^REAOnAnimationCallback)(CADisplayLink *displayLink);
typedef void (^REAAfterAnimationCallback)();

@interface REANodesManager : NSObject

@property (nonatomic, weak, nullable) RCTUIManager *uiManager;

- (nonnull instancetype)initWithUIManager:(nonnull RCTUIManager *)uiManager;

- (REANode* _Nullable)findNodeByID:(nonnull REANodeID)nodeID;

//

- (void)postOnAnimation:(REAOnAnimationCallback)clb;
- (void)postAfterAnimation:(REAAfterAnimationCallback)clb;

// graph

- (void)createNode:(nonnull REANodeID)tag
            config:(NSDictionary<NSString *, id> *__nonnull)config;

- (void)dropNode:(nonnull REANodeID)tag;

- (void)connectNodes:(nonnull REANodeID)parentID
             childID:(nonnull REANodeID)childID;

- (void)disconnectNodes:(nonnull REANodeID)parentID
                childID:(nonnull REANodeID)childID;

- (void)connectNodeToView:(nonnull REANodeID)nodeID
                  viewTag:(nonnull NSNumber *)viewTag
                 viewName:(nonnull NSString *)viewName;

//- (void)restoreDefaultValues:(nonnull NSNumber *)nodeTag;

- (void)disconnectNodeFromView:(nonnull NSNumber *)nodeTag
                       viewTag:(nonnull NSNumber *)viewTag;



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
