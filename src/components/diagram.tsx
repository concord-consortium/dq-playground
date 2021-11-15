import { getSnapshot, Instance } from "mobx-state-tree";
import React, { useState } from "react";
import ReactFlow, { addEdge, ArrowHeadType, Edge, Elements, OnConnectFunc, OnEdgeUpdateFunc, removeElements, updateEdge } from "react-flow-renderer";
import { DQNode, DQRoot } from "../models/dq-models";
import { NodeForm } from "./node-form";
import { QuantityNode } from "./quantity-node";

let nextId = 4;
const dqRoot = DQRoot.create({
  nodes: {
      "1": {
          id: "1",
          value: 124          
      },
      "2": {
          id: "2",
          previous: "1"
      },
      "3": {
        id: "3",
    }
  }
});

// For debugging
(window as any).dqRoot = dqRoot;
(window as any).getSnapshot = getSnapshot;

const initialElements: Elements = [
  {
    id: "1",
    type: "quantityNode", 
    data: { node:  dqRoot.nodes.get("1") },
    position: { x: 100, y: 100 },
  },
  {
    id: "2",
    type: "quantityNode", 
    data: { node:  dqRoot.nodes.get("2") },
    position: { x: 250, y: 50 },
  },
  {
    id: "3",
    type: "quantityNode", 
    data: { node:  dqRoot.nodes.get("3") },
    position: { x: 250, y: 150 },
  },
  { id: "e1-2", source: "1", target: "2", arrowHeadType: ArrowHeadType.Arrow },
];

const nodeTypes = {
  quantityNode: QuantityNode,
};

export const Diagram = () => {
  const [elements, setElements] = useState(initialElements);
  const [selectedNode, setSelectedNode] = useState<Instance<typeof DQNode> | undefined>();

  // gets called after end of edge gets dragged to another source or target
  const onEdgeUpdate: OnEdgeUpdateFunc = (oldEdge, newConnection) =>
    setElements((els) => updateEdge(oldEdge, newConnection, els));

  const onConnect: OnConnectFunc = (params) => {
    const { source, target } = params;
    if ( source && target ) {
      const targetModel = dqRoot.nodes.get(target);
      targetModel?.setPrevious(dqRoot.nodes.get(source));
    }
    setElements((els) => addEdge(params, els));
  };

  const onElementsRemove = (elementsToRemove: Elements) => {
    for(const element of elementsToRemove) {
      console.log(element);
      if ((element as any).target) {
        // This is a edge (I think)
        const edge = element as Edge;
        const targetModel = dqRoot.nodes.get(edge.target);
        targetModel?.setPrevious(undefined);        
      } 
      // else it is a node
    }
    setElements((els) => removeElements(elementsToRemove, els));

  };

  const onSelectionChange = (selectedElements: Elements | null) => {
    if (selectedElements?.[0]?.type === "quantityNode" ) {
      setSelectedNode(dqRoot.nodes.get(selectedElements[0].id));
    }
  };

  const addNode = () => {
    const dqNode = DQNode.create({
      id: nextId.toString()      
    });
    dqRoot.addNode(dqNode);
    setElements((els) => {
      // make a copy
      const newEls = els.map(el => el);
      newEls.push({
        id: nextId.toString(),
        type: "quantityNode",
        data: { node:  dqNode },
        position: { x: 350, y: 150 },
      });
      return newEls;
    });
    nextId++;
  };

  return (
    <div style={{ height: 600, width: 800 }}>
        <ReactFlow elements={elements} 
        nodeTypes={nodeTypes} 
        onEdgeUpdate={onEdgeUpdate}
        onConnect={onConnect}
        onElementsRemove={onElementsRemove}
        onSelectionChange={onSelectionChange}>
          { selectedNode && <NodeForm node={selectedNode}/> }
          <button style={{zIndex: 4, position: "absolute", right: 0, top: 0}} 
            onClick={addNode}>Add Node
          </button> 
        </ReactFlow>
    </div>
  );
};
