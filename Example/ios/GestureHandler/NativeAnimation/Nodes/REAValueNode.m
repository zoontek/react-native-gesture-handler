#import "REAValueNode.h"

@interface REAValueNode ()

@property (nonatomic, assign) CGFloat offset;

@end

@implementation REAValueNode

- (instancetype)initWithID:(REANodeID)nodeID
                    config:(NSDictionary<NSString *, id> *)config
{
    if (self = [super initWithID:nodeID config:config]) {
        _offset = [config[@"offset"] floatValue];
//        _value = [self.config[@"value"] floatValue];
    }
    return self;
}

//- (void)flattenOffset
//{
//    _value += _offset;
//    _offset = 0;
//}
//
//- (void)extractOffset
//{
//    _offset += _value;
//    _value = 0;
//}
//
//- (CGFloat)value
//{
//    return _value + _offset;
//}
//
//- (void)setValue:(CGFloat)value
//{
//    _value = value;
//
//    if (_valueObserver) {
//        [_valueObserver animatedNode:self didUpdateValue:_value];
//    }
//}

@end

