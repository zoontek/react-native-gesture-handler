import AnimatedNode from './AnimatedNode';
import AnimatedWithInput from './AnimatedWithInput';

export default class AnimatedOp extends AnimatedWithInput {
  _inputNodes;
  _processor;

  constructor(inputNodes, processor) {
    super(inputNodes);
    this._inputNodes = inputNodes;
    this._processor = processor;
  }

  __onEvaluate() {
    return this._processor(
      this._inputNodes.map(
        node => (node instanceof AnimatedNode ? node.__getValue() : node)
      )
    );
  }
}
