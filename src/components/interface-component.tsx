"use client";

import React, { useMemo } from "react";
import { Node, Edge } from "@xyflow/react";
import { getDescendantIds } from "@/lib/util/node_util";

type Props = {
  nodes: Node[];
  edges: Edge[];
  currentSystem: string;
};

const InterfaceComponent: React.FC<Props> = ({
  nodes,
  edges,
  currentSystem,
}) => {
  // Get IDs of descendant systems for the current system.
  const descendantIds = useMemo(() => {
    if (!currentSystem) return [];
    return Array.from(getDescendantIds(currentSystem, nodes));
  }, [currentSystem, nodes]);

  // Compute the list of relevant system IDs (current + descendants).
  const relevantSystemIds = useMemo(() => {
    return currentSystem ? [currentSystem, ...descendantIds] : [];
  }, [currentSystem, descendantIds]);

  // Filter edges where the source is among the relevant systems.
  const relevantEdges = useMemo(() => {
    return edges.filter(
      (edge) =>
        relevantSystemIds.includes(edge.source) ||
        relevantSystemIds.includes(edge.target)
    );
  }, [edges, relevantSystemIds]);

  // Build a lookup map for node details.
  const nodeMap = useMemo(() => {
    return nodes.reduce<Record<string, Node>>((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
  }, [nodes]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Interfaces</h2>
      <div className="flex flex-wrap gap-4">
        {relevantEdges.map((edge) => {
          const otherNode = nodeMap[edge.target];
          return (
            <div
              key={edge.id}
              className="bg-white border rounded shadow-md p-4 w-64 flex-shrink-0"
            >
              <h3 className="font-bold mb-2">Interface: {edge.id}</h3>
              <p>
                <span className="font-semibold">From:</span> {edge.source}
              </p>
              <p>
                <span className="font-semibold">To:</span> {edge.target}
              </p>
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {edge.label || "N/A"}
              </p>
              {otherNode && (
                <div className="mt-2 border-t pt-2">
                  <p className="font-semibold">Other System Details:</p>
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {String(otherNode.data?.label || otherNode.id)}
                  </p>
                  <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {String(otherNode.data?.category || "N/A")}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterfaceComponent;
