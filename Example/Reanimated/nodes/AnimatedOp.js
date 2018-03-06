import AnimatedWithInput from './AnimatedWithInput';
import { val } from '../utils';

export default class AnimatedOp extends AnimatedWithInput {
  _inputNodes;
  _processor;

  constructor(inputNodes, processor) {
    super(inputNodes);
    this._inputNodes = inputNodes;
    this._processor = processor;
  }

  __onEvaluate() {
    return this._processor(this._inputNodes.map(node => val(node)));
  }
}
