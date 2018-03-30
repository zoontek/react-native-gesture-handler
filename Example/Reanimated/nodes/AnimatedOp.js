import AnimatedNode from '../core/AnimatedNode';
import { val } from '../utils';

export default class AnimatedOp extends AnimatedNode {
  _inputNodes;
  _processor;

  constructor(inputNodes, processor) {
    super('op', undefined, inputNodes);
    this._inputNodes = inputNodes;
    this._processor = processor;
  }

  __onEvaluate() {
    return this._processor(this._inputNodes.map(node => val(node)));
  }
}
