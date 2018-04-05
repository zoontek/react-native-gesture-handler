#import <Foundation/Foundation.h>

@interface REANode : NSObject

- (instancetype)initWithID:(NSNumber *)nodeID
                     config:(NSDictionary<NSString *, id> *)config NS_DESIGNATED_INITIALIZER;

@property (nonatomic, readonly) NSNumber *nodeID;
@property (nonatomic, copy, readonly) NSDictionary<NSString *, id> *config;

@property (nonatomic, copy, readonly) NSMapTable<NSNumber *, REANode *> *childNodes;

@property (nonatomic, readonly) NSNumber *value;

/**
 * The node will update its value if necesarry and only after its parents have updated.
 */
- (void)updateNodeIfNecessary NS_REQUIRES_SUPER;

- (NSNumber *)evaluate;

/**
 * Where the actual update code lives. Called internally from updateNodeIfNecessary
 */
- (void)performUpdate NS_REQUIRES_SUPER;

- (void)addChild:(REANode *)child NS_REQUIRES_SUPER;
- (void)removeChild:(REANode *)child NS_REQUIRES_SUPER;

@end
