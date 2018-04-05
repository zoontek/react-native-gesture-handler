#import "REATransformNode.h"

@implementation REATransformNode
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
//  NSArray<NSDictionary *> *transformConfigs = self.config[@"transforms"];
//  NSMutableArray<NSDictionary *> *transform = [NSMutableArray arrayWithCapacity:transformConfigs.count];
//  for (NSDictionary *transformConfig in transformConfigs) {
//    NSString *type = transformConfig[@"type"];
//    NSString *property = transformConfig[@"property"];
//    NSNumber *value;
//    if ([type isEqualToString: @"animated"]) {
//      NSNumber *nodeTag = transformConfig[@"nodeTag"];
//      RCTAnimatedNode *node = [self.parentNodes objectForKey:nodeTag];
//      if (![node isKindOfClass:[RCTValueAnimatedNode class]]) {
//        continue;
//      }
//      RCTValueAnimatedNode *parentNode = (RCTValueAnimatedNode *)node;
//      value = @(parentNode.value);
//    } else {
//      value = transformConfig[@"value"];
//    }
//    [transform addObject:@{property: value}];
//  }
//
//  _propsDictionary[@"transform"] = transform;
//}

@end

