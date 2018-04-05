#import "REANode.h"

@implementation REANode

- (instancetype)initWithID:(NSNumber *)nodeID config:(NSDictionary<NSString *,id> *)config
{
    if ((self = [super init])) {
        _nodeID = nodeID;
    }
    return self;
}

@end
