#include <tgmath.h>

#import "REAOperatorNode.h"
#import "REANodesManager.h"

typedef id (^REAOperatorBlock)(NSArray<REANode *> *inputNodes);

#define REA_REDUCE(OP) ^(NSArray<REANode *> *inputNodes) { \
CGFloat acc = [[inputNodes[0] value] doubleValue]; \
for (NSUInteger i = 1; i < inputNodes.count; i++) { \
  CGFloat a = acc, b = [[inputNodes[i] value] doubleValue]; \
  acc = OP; \
} \
return @(acc); \
}

#define REA_REDUCE_FROM(OP, initial) ^(NSArray<REANode *> *inputNodes) { \
CGFloat acc = initial; \
for (NSUInteger i = 0; i < inputNodes.count; i++) { \
CGFloat a = acc, b = [[inputNodes[i] value] doubleValue]; \
acc = OP; \
} \
return @(acc); \
}

#define REA_SINGLE(OP) ^(NSArray<REANode *> *inputNodes) { \
CGFloat a = [[inputNodes[0] value] doubleValue]; \
return @(OP); \
}

#define REA_INFIX(OP) ^(NSArray<REANode *> *inputNodes) { \
CGFloat a = [[inputNodes[0] value] doubleValue]; \
CGFloat b = [[inputNodes[1] value] doubleValue]; \
return @(OP); \
}

@implementation REAOperatorNode {
  NSArray<NSNumber *> *_input;
  NSMutableArray<REANode *> *_inputNodes;
  REAOperatorBlock _op;
  id _config;
}

- (instancetype)initWithID:(REANodeID)nodeID config:(NSDictionary<NSString *,id> *)config
{
  static NSDictionary *OPS;
  static dispatch_once_t opsToken;
  dispatch_once(&opsToken, ^{
    OPS = @{
            // arithmetic
            @"add": REA_REDUCE(a + b),
            @"sub": REA_REDUCE(a - b),
            @"multiply": REA_REDUCE(a * b),
            @"divide": REA_REDUCE(a / b),
            @"pow": REA_REDUCE(pow(a, b)),
            @"modulo": REA_REDUCE(fmodf(fmodf(a, b) + b, b)),
            @"sqrt": REA_SINGLE(sqrt(a)),
            @"sin": REA_SINGLE(sin(a)),
            @"cos": REA_SINGLE(cos(a)),
            @"exp": REA_SINGLE(exp(a)),

            // logical
            @"and": REA_REDUCE_FROM(a && b, true),
            @"or": REA_REDUCE_FROM(a || b, false),
            @"not": REA_SINGLE(!a),
            @"defined": ^(NSArray<REANode *> *inputNodes) {
              id val = [inputNodes[0] value];
              return @(val != nil && isnan([val doubleValue]));
            },

            // comparing
            @"lessThan": REA_INFIX(a < b),
            @"eq": REA_INFIX(a == b),
            @"greaterThan": REA_INFIX(a > b),
            @"lessOrEq": REA_INFIX(a <= b),
            @"greaterOrEq": REA_INFIX(a >= b),
            @"neq": REA_INFIX(a != b),
            };
  });
  if ((self = [super initWithID:nodeID config:config])) {
    _config = config;
    _input = config[@"input"];
    _inputNodes = [NSMutableArray arrayWithCapacity:_input.count];
    _op = OPS[config[@"op"]];
    if (!_op) {
      RCTLogError(@"Operator '%@' not found", config[@"op"]);
    }
  }
  return self;
}

- (id)evaluate
{
  for (NSUInteger i = 0; i < _input.count; i++) {
    _inputNodes[i] = [self.nodesManager findNodeByID:_input[i]];
  }
  return _op(_inputNodes);
}

@end

