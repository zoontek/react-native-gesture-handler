const UPDATED_NODES = [];

let loopID = 1;
let propUpdatesEnqueued = null;

function runPropUpdates() {
  const visitedNodes = new Set();
  const findAndUpdateNodes = node => {
    if (visitedNodes.has(node)) {
      return;
    } else {
      visitedNodes.add(node);
    }
    if (typeof node.update === 'function') {
      node.update();
    } else {
      node.__getChildren().forEach(findAndUpdateNodes);
    }
  };
  for (let i = 0; i < UPDATED_NODES.length; i++) {
    const node = UPDATED_NODES[i];
    findAndUpdateNodes(node);
  }
  UPDATED_NODES.length = 0; // clear array
  propUpdatesEnqueued = null;
  loopID += 1;
}

function onNodeUpdated(node, value) {
  node.__memoizedValue = value;
  UPDATED_NODES.push(node);
  if (!propUpdatesEnqueued) {
    propUpdatesEnqueued = setImmediate(runPropUpdates);
  }
}

function evaluate(node) {
  if (node.__lastLoopID < loopID) {
    node.__lastLoopID = loopID;
    return (node.__memoizedValue = node.__onEvaluate());
  }
  return node.__memoizedValue;
}

export { onNodeUpdated, evaluate };
