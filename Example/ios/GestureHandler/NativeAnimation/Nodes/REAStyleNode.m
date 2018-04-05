#import "REAStyleNode.h"

@implementation REAStyleNode
{
  NSMutableDictionary<NSString *, NSObject *> *_propsDictionary;
}

- (instancetype)initWithID:(NSNumber *)nodeID
                     config:(NSDictionary<NSString *, id> *)config;
{
  if ((self = [super initWithID:nodeID config:config])) {
    _propsDictionary = [NSMutableDictionary new];
  }
  return self;
}

- (NSDictionary *)propsDictionary
{
  return _propsDictionary;
}

//- (void)performUpdate
//{
//  [super performUpdate];
//
//  NSDictionary<NSString *, NSNumber *> *style = self.config[@"style"];
//  [style enumerateKeysAndObjectsUsingBlock:^(NSString *property, NSNumber *nodeTag, __unused BOOL *stop) {
//    RCTAnimatedNode *node = [self.parentNodes objectForKey:nodeTag];
//    if (node) {
//      if ([node isKindOfClass:[RCTValueAnimatedNode class]]) {
//        RCTValueAnimatedNode *parentNode = (RCTValueAnimatedNode *)node;
//        [self->_propsDictionary setObject:@(parentNode.value) forKey:property];
//      } else if ([node isKindOfClass:[RCTTransformAnimatedNode class]]) {
//        RCTTransformAnimatedNode *parentNode = (RCTTransformAnimatedNode *)node;
//        [self->_propsDictionary addEntriesFromDictionary:parentNode.propsDictionary];
//      }
//    }
//  }];
//}

@end
