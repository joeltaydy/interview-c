"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useNodesState, useEdgesState, Node, Edge } from "@xyflow/react";
import { supabaseConn as supabase } from "@/lib/supabase"; // Import the Supabase client
// Helper to generate a random hex color.
function getRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}

const FlowDiagram = dynamic(() => import("./flow-diagram"), { ssr: false });
const SystemDetail = dynamic(() => import("./system-detail"), { ssr: false });
const InterfaceComponent = dynamic(() => import("./interface-component"), {
  ssr: false,
});

export default function FlowPageClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [currentSystem, setCurrentSystem] = useState<string>("");

  // Fetch systems, interfaces, and hierarchy from Supabase and map them to React Flow nodes and edges.
  useEffect(() => {
    async function fetchFlowData() {
      // Retrieve systems, interfaces, and hierarchy records
      const [
        { data: systems, error: systemsError },
        { data: interfaces, error: interfacesError },
        { data: hierarchy, error: hierarchyError },
      ] = await Promise.all([
        // To improve on future requirements
        supabase.from("systems").select("*"),
        supabase.from("interfaces_with").select("*"),
        supabase.from("system_hierarchy").select("*"),
      ]);

      if (systemsError || interfacesError || hierarchyError) {
        console.error(
          "Supabase fetch error:",
          systemsError,
          interfacesError,
          hierarchyError
        );
        return;
      }

      // Create a mapping from child system to its parent.
      const parentMapping: Record<string, string> = {};
      hierarchy?.forEach((rel: any) => {
        parentMapping[rel.child_id] = rel.parent_id;
      });

      // Map systems into React Flow nodes.
      const flowNodes: Node[] = (systems || []).map((system: any) => {
        const node: Node = {
          id: system.name,
          data: { label: system.name, category: system.category },
          position: { x: Math.random() * 500, y: Math.random() * 500 },
          style: {
            background: getRandomColor(),
            color: "white",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "10px",
            width: 180,
          },
        };

        // If this system has a parent per the hierarchy, assign it.
        if (parentMapping[system.name]) {
          node.parentId = parentMapping[system.name];
          node.expandParent = true; // Ensure parent is expanded if it exists
          node.hidden = true; // Ensure the children nodes are hidden by default
        }

        return node;
      });

      // --- Begin: Sort nodes so that parents come before their descendants ---
      function sortNodesByHierarchy(nodes: Node[]): Node[] {
        // Build a mapping from parentId to its children.
        const childrenMap: Record<string, Node[]> = {};
        const nodeLookup: Record<string, Node> = {};
        nodes.forEach((node) => {
          nodeLookup[node.id] = node;
          if (node.parentId) {
            childrenMap[node.parentId] = childrenMap[node.parentId] || [];
            childrenMap[node.parentId].push(node);
          }
        });
        // Recursively traverse starting with all nodes that do not have a parent.
        const ordered: Node[] = [];
        function traverse(node: Node) {
          ordered.push(node);
          if (childrenMap[node.id]) {
            // Optionally sort children alphabetically by label or customize order here.
            childrenMap[node.id].forEach((child) => traverse(child));
          }
        }
        // Process roots (nodes with no parentId)
        nodes.forEach((node) => {
          if (!node.parentId) {
            traverse(node);
          }
        });
        return ordered;
      }
      const sortedFlowNodes = sortNodesByHierarchy(flowNodes);
      // --- End: Sorting ---

      // Map interfaces into React Flow edges.
      const flowEdges: Edge[] = (interfaces || []).map((iface: any) => ({
        id: `${iface.system_a_id}-${iface.system_b_id}`,
        source: iface.system_a_id,
        target: iface.system_b_id,
        label: iface.connection_type,
        animated: iface.directional,
        style: {},
      }));
      console.log("Flow Nodes:", sortedFlowNodes);
      console.log("Flow Edges:", flowEdges);
      setNodes(sortedFlowNodes);
      setEdges(flowEdges);
    }
    fetchFlowData();
  }, []);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.parentId) {
          if (node.parentId === currentSystem) {
            return {
              ...node,
              hidden: false,
            }; // Show children nodes if their parent is the current system
          } else {
            return {
              ...node,
              hidden: true,
            }; // Hide children nodes if their parent is not the current system
          }
        }
        return node;
      })
    );
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source === currentSystem || edge.target === currentSystem) {
          // If the edge is connected to the current system, show it.
          return {
            ...edge,
            hidden: false,
          };
        }

        return edge;
      })
    );
  }, [currentSystem, setNodes, setEdges]);

  return (
    <div className="min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4 p-4">System Traversal Tool</h1>
      <div className="border rounded-lg flex flex-1 overflow-hidden">
        {/* Left Pane: Flow Diagram */}
        <div className="flex-1 min-w-0 border-r">
          <FlowDiagram
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
            onNodeClick={(event, node) => setCurrentSystem(node.id)}
          />
        </div>
        {/* Right Pane: System Details & Interface */}
        <div className="flex flex-col flex-[0.7] min-w-0">
          <div className="flex-1 border-b p-4 overflow-auto">
            <SystemDetail
              nodes={nodes}
              edges={edges}
              currentSystem={currentSystem}
              setCurrentSystem={setCurrentSystem}
            />
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <InterfaceComponent
              nodes={nodes}
              edges={edges}
              currentSystem={currentSystem}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
