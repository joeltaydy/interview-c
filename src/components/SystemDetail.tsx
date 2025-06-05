import React from "react";
import { Node, Edge } from "@xyflow/react";

type Props = {
  nodes: Node[];
  edges: Edge[];
};

const SystemDetail: React.FC<Props> = ({ nodes, edges }) => (
  <div>
    <h2 className="text-xl font-semibold mb-2">Nodes</h2>
    <table className="table-auto w-full mb-4 border">
      <thead>
        <tr>
          <th className="border px-2 py-1">ID</th>
          <th className="border px-2 py-1">Label</th>
        </tr>
      </thead>
      <tbody>
        {nodes.map((node) => (
          <tr key={node.id}>
            <td className="border px-2 py-1">{node.id}</td>
            <td className="border px-2 py-1">{node.data?.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <h2 className="text-xl font-semibold mb-2">Edges</h2>
    <table className="table-auto w-full border">
      <thead>
        <tr>
          <th className="border px-2 py-1">ID</th>
          <th className="border px-2 py-1">Source</th>
          <th className="border px-2 py-1">Target</th>
        </tr>
      </thead>
      <tbody>
        {edges.map((edge) => (
          <tr key={edge.id}>
            <td className="border px-2 py-1">{edge.id}</td>
            <td className="border px-2 py-1">{edge.source}</td>
            <td className="border px-2 py-1">{edge.target}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SystemDetail;
