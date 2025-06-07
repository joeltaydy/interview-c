"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Node, Edge, applyNodeChanges, NodeReplaceChange } from "@xyflow/react";
import { createClient } from "@supabase/supabase-js";
import DescendantRow from "@/components/system-detail-row";
import { getDescendantIds } from "@/lib/util/node_util";
import Alert from "./alert";

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
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Find current system node from nodes array and initialize form state.
  const currentNode = nodes.find((node) => node.id === currentSystem);

  const [name, setName] = useState<string>(
    String(currentNode?.data?.label || "")
  );
  const [category, setCategory] = useState<string>(
    String(currentNode?.data?.category || "")
  );

  const [descendantNodes, setDescendantNodes] = useState<Node[]>([]);

  // States for creating a new child system.
  const [showChildForm, setShowChildForm] = useState<boolean>(false);
  const [childName, setChildName] = useState<string>("");
  const [childCategory, setChildCategory] = useState<string>("");

  // Update form state when current system changes.
  useEffect(() => {
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
  useEffect(() => {
    const filtered = nodes.filter((node) => descendantIds.includes(node.id));
    setDescendantNodes(filtered);
  }, [nodes, descendantIds]);

  // Update current system details.
  async function handleUpdateCurrent() {
    const { error } = await supabase
      .from("systems")
      .update({ name, category })
      .eq("name", currentSystem);
    if (error) {
      setAlert({ message: "Error updating current system", type: "error" });
    } else {
      setAlert({ message: "Current system updated", type: "success" });
    }
  }

  // Create a new child system via inline form.
  async function handleSubmitCreateChild() {
    if (!childName) {
      setAlert({ message: "Please enter a child system name", type: "error" });
      return;
    }
    // Insert new system into the 'systems' table.
    let { error } = await supabase
      .from("systems")
      .insert([{ name: childName, category: childCategory }]);
    if (error) {
      console.error("Insert error", error);
      setAlert({ message: "Descendant system create failed", type: "error" });
      return;
    }
    // Create a parent-child relationship in the 'system_hierarchy' table.
    ({ error } = await supabase
      .from("system_hierarchy")
      .insert([{ parent_id: currentSystem, child_id: childName }]));
    if (error) {
      setAlert({ message: "Descendant system create failed", type: "error" });
    } else {
      setAlert({ message: "Child system created", type: "success" });
      // Clear form and hide it.
      setChildName("");
      setChildCategory("");
      setShowChildForm(false);
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
      setAlert({ message: "Descendant system delete failed", type: "error" });
    } else {
      setAlert({ message: "Descendant system deleted", type: "success" });
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
      setAlert({ message: "Error updating descendant system", type: "error" });
    } else {
      setAlert({ message: "Descendant system updated", type: "success" });
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">System Details</h2>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onDismiss={() => setAlert(null)}
        />
      )}

      {currentSystem && (
        <div>
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
              onClick={() => setShowChildForm(!showChildForm)}
              className="bg-green-500 text-white px-3 py-1 rounded mb-2"
            >
              {showChildForm ? "Cancel" : "Create Child System"}
            </button>
            {showChildForm && (
              <div className="mb-4 border p-4">
                <div className="mb-2">
                  <label className="mr-2">Child Name:</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div className="mb-2">
                  <label className="mr-2">Child Category:</label>
                  <input
                    type="text"
                    value={childCategory}
                    onChange={(e) => setChildCategory(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <button
                  onClick={handleSubmitCreateChild}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Submit
                </button>
              </div>
            )}
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
      )}
    </div>
  );
};

export default SystemDetail;
