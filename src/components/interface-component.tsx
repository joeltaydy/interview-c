import React from "react";
import { Node, Edge } from "@xyflow/react";

type Props = {
  nodes: Node[];
  edges: Edge[];
};

const InterfaceComponent: React.FC<Props> = ({ nodes, edges }) => (
  <div>
    <h2 className="text-xl font-semibold mb-2">Interface</h2>
    <p>This section can use nodes and edges as needed.</p>
    {/* Example: Show node count */}
    <p>Node count: {nodes.length}</p>
    <p>Edge count: {edges.length}</p>
  </div>
);

export default InterfaceComponent;
