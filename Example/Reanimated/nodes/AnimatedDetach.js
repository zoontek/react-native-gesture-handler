import AnimatedNode from './AnimatedNode';

export default class AnimatedDetach extends AnimatedNode {
  _nodeToDetach;

  constructor(nodeToDetach) {
    super();
    this._nodeToDetach = nodeToDetach;
  }

  __onEvaluate() {
    this._nodeToDetach.__detach();
    return 0;
  }
}
