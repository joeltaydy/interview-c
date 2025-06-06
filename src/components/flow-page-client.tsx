"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";

import dynamic from "next/dynamic";
import { useNodesState, useEdgesState, Node, Edge } from "@xyflow/react";
// Helper to generate a random hex color
function getRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FlowDiagram = dynamic(() => import("./flow-diagram"), { ssr: false });
const SystemDetail = dynamic(() => import("./system-detail"), { ssr: false });
const InterfaceComponent = dynamic(() => import("./interface-component"), {
  ssr: false,
});

export default function FlowPageClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: systems, error: systemsError } = await supabase
        .from("systems")
        .select("*");
      const { data: interfaces, error: interfacesError } = await supabase
        .from("interfaces_with")
        .select("*");

      if (systemsError || interfacesError) {
        console.error("Supabase fetch error", systemsError, interfacesError);
        return;
      }

      const fetchedNodes: Node[] = (systems || []).map((system) => ({
        id: system.name,
        data: { label: system.name },
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        type: undefined,
        style: {
          background: getRandomColor(),
          color: "white",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "10px",
          width: 180,
        },
      }));

      const fetchedEdges: Edge[] = (interfaces || []).map((iface) => ({
        id: `${iface.system_a_id}-${iface.system_b_id}`,
        source: iface.system_a_id,
        target: iface.system_b_id,
        label: iface.connection_type,
        animated: !!iface.directional,
        style: {},
      }));

      setNodes(fetchedNodes);
      setEdges(fetchedEdges);
    }

    fetchData();
  }, [setNodes, setEdges]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Next.js + Supabase + React Flow
      </h1>
      <div className="border rounded-lg overflow-hidden flex h-[70vh]">
        {/* Left: Flow Diagram */}
        <div className="flex-1 min-w-0 border-r">
          <FlowDiagram
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
          />
        </div>
        {/* Right: System Detail and Interface */}
        <div className="flex flex-col flex-[0.7] min-w-0">
          <div className="flex-1 border-b p-4 overflow-auto">
            <SystemDetail nodes={nodes} edges={edges} />
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <InterfaceComponent nodes={nodes} edges={edges} />
          </div>
        </div>
      </div>
    </div>
  );
}
