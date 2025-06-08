"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Node } from "@xyflow/react";
import DescendantRow from "@/components/system-detail-row";
import {
  getColorForUuid,
  getDescendantIds,
  getDeterministicPositionFromUuid,
} from "@/lib/util/node_util";
import Alert from "./alert";
import { supabaseConn as supabase } from "@/lib/supabase"; // Import the Supabase client

type SystemDetailProps = {
  nodes: Node[];
  currentSystem: string;
  setCurrentSystem: (id: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
};

const SystemDetail: React.FC<SystemDetailProps> = ({
  nodes,
  currentSystem,
  setCurrentSystem,
  setNodes,
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

  const updateNodeData = (
    orgId: string,
    newName: string,
    newCategory: string
  ) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === orgId) {
          return {
            ...node,
            id: newName,
            data: {
              ...node.data,
              label: newName,
              category: newCategory,
            },
          };
        }
        if (node.parentId) {
          if (node.parentId === orgId) {
            return {
              ...node,
              parentId: newName, // Update parentId to new name
            };
          }
        }
        return node;
      })
    );
  };

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
      updateNodeData(currentSystem, name, category);
      setCurrentSystem(name); // Update current system to new name
    }
  }

  // Create a new child system via inline form.
  async function handleSubmitCreateChild() {
    if (!childName) {
      setAlert({ message: "Please enter a child system name", type: "error" });
      return;
    }
    // Insert new system into the 'systems' table.
    const { data, error } = await supabase
      .from("systems")
      .insert([{ name: childName, category: childCategory }])
      .select();
    if (error || !data || data.length === 0) {
      console.error("Insert error", error);
      setAlert({ message: "Descendant system create failed", type: "error" });
      return;
    }
    // Create a parent-child relationship in the 'system_hierarchy' table.
    const { error: linkError } = await supabase
      .from("system_hierarchy")
      .insert([{ parent_id: currentSystem, child_id: childName }]);
    if (linkError) {
      setAlert({ message: "Descendant system create failed", type: "error" });
    } else {
      setAlert({ message: "Child system created", type: "success" });
      // Clear form and hide it.
      setChildName("");
      setChildCategory("");
      setShowChildForm(false);

      const newNode: Node = {
        id: childName,
        data: { label: childName, category: childCategory },
        position: getDeterministicPositionFromUuid(data[0].id),
        style: {
          background: getColorForUuid(data[0].id),
          color: "white",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "10px",
          width: 180,
        },
        parentId: currentSystem,
        expandParent: true, // Ensure parent is expanded if it exists
        hidden: false, // Ensure the children nodes are hidden by default
      };

      setNodes((nds) => nds.concat(newNode));
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
      setNodes((nds) => nds.filter((node) => node.id !== childId));
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
      updateNodeData(childId, newName, newCategory);
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
              className={`${
                showChildForm ? "bg-red-500" : "bg-green-500"
              } text-white px-3 py-1 rounded mb-2`}
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
