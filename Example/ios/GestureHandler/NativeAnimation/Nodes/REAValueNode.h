#import <UIKit/UIKit.h>

#import "REANode.h"

@class REAValueNode;

@interface REAValueNode : REANode

@property (nonatomic, nonnull) NSNumber *value;

@end
