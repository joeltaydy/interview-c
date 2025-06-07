"use client";

import React, { useState, useMemo } from "react";
import { Node, Edge } from "@xyflow/react";
import { createClient } from "@supabase/supabase-js";
import DescendantRow from "@/components/system-detail-row";
import { getDescendantIds } from "@/lib/util/node_util";

type Props = {
  nodes: Node[];
  edges: Edge[];
  currentSystem: string;
  setCurrentSystem: (id: string) => void;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SystemDetail: React.FC<Props> = ({
  nodes,
  edges,
  currentSystem,
  setCurrentSystem,
}) => {
  // Find current system node from nodes array and initialize form state.
  const currentNode = nodes.find((node) => node.id === currentSystem);

  const [name, setName] = useState<string>(
    String(currentNode?.data?.label || "")
  );
  const [category, setCategory] = useState<string>(
    String(currentNode?.data?.category || "")
  );

  // Update form state when current system changes.
  React.useEffect(() => {
    if (currentNode) {
      setName(String(currentNode.data.label));
      setCategory(String(currentNode.data.category));
    }
  }, [currentNode]);

  // Get descendant node IDs.
  const descendantIds = useMemo(() => {
    if (!currentSystem) {
      return [];
    }
    return Array.from(getDescendantIds(currentSystem, nodes));
  }, [currentSystem, nodes]);

  // Filter descendant nodes.
  const descendantNodes = useMemo(() => {
    return nodes.filter((node) => descendantIds.includes(node.id));
  }, [nodes, descendantIds]);

  // Update current system details.
  async function handleUpdateCurrent() {
    const { error } = await supabase
      .from("systems")
      .update({ name, category })
      .eq("name", currentSystem);
    if (error) {
      console.error("Update error", error);
    } else {
      alert("Current system updated");
    }
  }

  // Create a new child system.
  async function handleCreateChild() {
    const childName = prompt("Enter new child system name");
    if (!childName) return;
    const childCategory = prompt("Enter new child system category") || "";
    // Insert new system into the 'systems' table.
    let { error } = await supabase
      .from("systems")
      .insert([{ name: childName, category: childCategory }]);
    if (error) {
      console.error("Insert error", error);
      return;
    }
    // Create a parent-child relationship in the 'system_hierarchy' table.
    ({ error } = await supabase
      .from("system_hierarchy")
      .insert([{ parent_id: currentSystem, child_id: childName }]));
    if (error) {
      console.error("Hierarchy insert error", error);
    } else {
      alert("Child system created");
    }
  }

  // Delete a child system.
  async function handleDeleteChild(childId: string) {
    if (!confirm(`Are you sure you want to delete ${childId}?`)) return;
    const { error } = await supabase
      .from("systems")
      .delete()
      .eq("name", childId);
    if (error) {
      console.error("Delete error", error);
    } else {
      alert("Child system deleted");
    }
  }

  // Update a descendant system (inline edit).
  async function handleUpdateDescendant(
    childId: string,
    newName: string,
    newCategory: string
  ) {
    const { error } = await supabase
      .from("systems")
      .update({ name: newName, category: newCategory })
      .eq("name", childId);
    if (error) {
      console.error("Update descendant error", error);
    } else {
      alert("Descendant system updated");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">System Details</h2>
      <div className="mb-4 border p-4">
        <h3 className="font-semibold mb-2">Current System</h3>
        <div className="mb-2">
          <label className="mr-2">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="mb-2">
          <label className="mr-2">Category:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={handleUpdateCurrent}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Update Current System
        </button>
      </div>
      <div className="mb-4 border p-4">
        <h3 className="font-semibold mb-2">Child Systems</h3>
        <button
          onClick={handleCreateChild}
          className="bg-green-500 text-white px-3 py-1 rounded mb-2"
        >
          Create Child System
        </button>
        <table className="table-auto w-full border mt-2">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {descendantNodes.map((node) => (
              <DescendantRow
                key={node.id}
                node={node}
                onSelect={() => setCurrentSystem(node.id)}
                onDelete={handleDeleteChild}
                onUpdate={handleUpdateDescendant}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemDetail;
