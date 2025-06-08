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

export function getColorForUuid(uuid: string): string {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // keep it 32-bit
  }

  let color = "#";
  for (let i = 0; i < 3; i++) {
    const byte = (hash >> (i * 8)) & 0xff;
    color += byte.toString(16).padStart(2, "0");
  }
  return color;
}

export function getDeterministicPositionFromUuid(
  uuid: string,
  maxX = 500,
  maxY = 500
): { x: number; y: number } {
  let hash1 = 0,
    hash2 = 0;
  for (let i = 0; i < uuid.length; i++) {
    const charCode = uuid.charCodeAt(i);
    hash1 = charCode + ((hash1 << 5) - hash1); // mix for x
    hash2 = charCode + ((hash2 << 7) - hash2); // different mix for y
  }

  // Normalize to a range within 0 to maxX / maxY
  const x = Math.abs(hash1) % maxX;
  const y = Math.abs(hash2) % maxY;

  return { x, y };
}
