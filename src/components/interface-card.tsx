"use client";

import React from "react";
import { Node, Edge } from "@xyflow/react";
import { useState } from "react";
import { supabaseConn as supabase } from "@/lib/supabase"; // Import the Supabase client
import { Interface } from "@/lib/definitions"; // Adjust the import path as necessary

type InterfaceCardProps = {
  edge: Edge;
  otherNode?: Node;
  onDelete: (id: string) => void;
  fromOptions: Node[];
  toOptions: Node[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setAlert: React.Dispatch<
    React.SetStateAction<{
      message: string;
      type: "success" | "error";
    } | null>
  >;
};

const InterfaceCard: React.FC<InterfaceCardProps> = ({
  edge,
  otherNode,
  onDelete,
  setAlert,
  fromOptions,
  toOptions,
  setEdges,
}) => {
  const [editData, setEditData] = useState<Partial<Interface>>({
    system_a_id: edge.source,
    system_b_id: edge.target,
    connection_type: String(edge.data?.connection_type || ""),
    directional: Number(edge.data?.directional) || 1,
  });
  const [editMode, setEditMode] = useState<boolean>(false);

  // UPDATE Interface
  async function handleUpdateInterface(id: string) {
    // console.log("Updating interface with ID:", id);
    // console.log("Edit Data:", editData);
    const { error } = await supabase
      .from("interfaces_with")
      .update({
        system_a_id: editData.system_a_id,
        system_b_id: editData.system_b_id,
        connection_type: editData.connection_type,
        directional: editData.directional,
      })
      .eq("id", id);
    if (error) {
      console.error("Error updating interface:", error);
      setAlert({ message: "Failed to update interface", type: "error" });
    } else {
      setAlert({ message: "Interface updated", type: "success" });
      setEditMode(!editMode);
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      const newEdge: Edge = {
        id: id,
        source: String(editData.system_a_id),
        target: String(editData.system_b_id),
        label: String(editData.connection_type),
        animated: true,
        style: {},
        data: {
          directional: editData.directional,
          connection_type: editData.connection_type,
        },
      };
      setEdges((eds) => eds.concat(newEdge));
    }
  }

  return (
    <div className="bg-white border rounded shadow-md p-4 w-64 flex-shrink-0">
      {editMode ? (
        <>
          <div className="mb-2">
            <label className="font-semibold">From:</label>
            <select
              value={editData.system_a_id ?? edge.source}
              onChange={(e) =>
                setEditData({ ...editData, system_a_id: e.target.value })
              }
              className="border rounded px-2 py-1"
            >
              {fromOptions.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.id}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="font-semibold">To:</label>
            <select
              value={editData.system_b_id ?? edge.target}
              onChange={(e) =>
                setEditData({ ...editData, system_b_id: e.target.value })
              }
              className="border rounded px-2 py-1"
            >
              {toOptions.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.id}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="font-semibold">Type:</label>
            <input
              type="text"
              value={editData.connection_type ?? String(edge.label ?? "")}
              onChange={(e) =>
                setEditData({ ...editData, connection_type: e.target.value })
              }
              className="border rounded px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="font-semibold">Directional:</label>
            <input
              type="number"
              value={
                editData.directional ?? Number(edge.data?.directional) ?? 1
              }
              onChange={(e) =>
                setEditData({
                  ...editData,
                  directional: Number(e.target.value),
                })
              }
              className="border rounded px-2 py-1"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateInterface(edge.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-bold mb-2">
            Interface: {edge.source}-{edge.target}
          </h3>
          <p>
            <span className="font-semibold">From:</span> {edge.source}
          </p>
          <p>
            <span className="font-semibold">To:</span> {edge.target}
          </p>
          <p>
            <span className="font-semibold">Type:</span> {edge.label || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Directional:</span>
            {typeof edge.data?.directional === "number"
              ? edge.data.directional
              : 0}
          </p>
          {otherNode && (
            <div className="mt-2 border-t pt-2">
              <p className="font-semibold">Other System:</p>
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
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(edge.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InterfaceCard;
