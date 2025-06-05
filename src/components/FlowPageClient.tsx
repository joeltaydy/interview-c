"use client";

import dynamic from "next/dynamic";
import { useNodesState, useEdgesState, Node, Edge } from "@xyflow/react";

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Supabase Database' },
    position: { x: 250, y: 25 },
    style: { background: '#3ECF8E', color: 'white', border: '1px solid #107969', borderRadius: '8px', padding: '10px', width: 180 },
  },
  {
    id: '2',
    data: { label: 'Next.js API Routes' },
    position: { x: 250, y: 150 },
    style: { background: '#000000', color: 'white', border: '1px solid #333', borderRadius: '8px', padding: '10px', width: 180 },
  },
  {
    id: '3',
    data: { label: 'React Components' },
    position: { x: 250, y: 275 },
    style: { background: '#0070f3', color: 'white', border: '1px solid #0050a3', borderRadius: '8px', padding: '10px', width: 180 },
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'User Interface' },
    position: { x: 250, y: 400 },
    style: { background: '#6b21a8', color: 'white', border: '1px solid #4a1072', borderRadius: '8px', padding: '10px', width: 180 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3ECF8E', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#000000', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#0070f3', strokeWidth: 2 } },
];

const FlowDiagram = dynamic(() => import("./FlowDiagram"), { ssr: false });
const SystemDetail = dynamic(() => import("./SystemDetail"), { ssr: false });
const InterfaceComponent = dynamic(() => import("./InterfaceComponent"), { ssr: false });

export default function FlowPageClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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