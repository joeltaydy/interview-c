import { Node } from "@xyflow/react";

// Recursively get descendant ids based on edges (child relationship is assumed when an edge exists from parent to child).
export function getDescendantIds(
  currentId: string,
  nodes: Node[],
  visited = new Set<string>()
): Set<string> {
  nodes.forEach((node) => {
    if (node.parentId === currentId && !visited.has(node.id)) {
      visited.add(node.id);
      getDescendantIds(node.id, nodes, visited);
    }
  });
  return visited;
}
