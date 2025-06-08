"use client";

import React, { useMemo, useState } from "react";
import { Node, Edge } from "@xyflow/react";
import { getDescendantIds } from "@/lib/util/node_util";
import { supabaseConn as supabase } from "@/lib/supabase"; // Import the Supabase client
import Alert from "./alert";
import InterfaceCard from "./interface-card";
import { useEffect } from "react";
import { Interface } from "@/lib/definitions";

type Props = {
  nodes: Node[];
  edges: Edge[];
  currentSystem: string;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
};

const InterfaceComponent: React.FC<Props> = ({
  nodes,
  edges,
  currentSystem,
  setEdges,
}) => {
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [showNewInterfaceForm, setShowNewInterfaceForm] =
    useState<boolean>(false);
  const [newInterfaceData, setNewInterfaceData] = useState<Partial<Interface>>({
    system_a_id: currentSystem,
    system_b_id: "",
    connection_type: "",
    directional: 1,
  });

  // Get IDs of descendant systems for the current system.
  const descendantIds = useMemo(() => {
    if (!currentSystem) return [];
    return Array.from(getDescendantIds(currentSystem, nodes));
  }, [currentSystem, nodes]);

  // Compute the list of relevant system IDs (current + descendants).
  const relevantSystemIds = useMemo(() => {
    return currentSystem ? [currentSystem, ...descendantIds] : [];
  }, [currentSystem, descendantIds]);

  // Filter edges where the source (or target) is among the relevant systems.
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

  useEffect(() => {
    // If currentSystem changes, reset the new interface data.
    setNewInterfaceData({
      system_a_id: currentSystem,
      system_b_id: "",
      connection_type: "",
      directional: 1,
    });
  }, [currentSystem]);

  // Create dropdown options:
  // "From" dropdown: current system plus grandchildren (descendants that are not direct children)
  const fromOptions = useMemo(() => {
    const currentOption = nodes.find((n) => n.id === currentSystem);
    const descendantOptions = nodes.filter(
      (n) =>
        n.id !== currentSystem && descendantIds.includes(n.id) && n.parentId
    );
    return currentOption
      ? [currentOption, ...descendantOptions]
      : descendantOptions;
  }, [nodes, currentSystem, descendantIds]);

  // "To" dropdown: all nodes not related to the current system (i.e. not in currentSystem nor its descendants)
  const toOptions = useMemo(() => {
    return nodes.filter(
      (n) => ![currentSystem, ...descendantIds].includes(n.id)
    );
  }, [nodes, currentSystem, descendantIds]);

  // DELETE Interface
  async function handleDeleteInterface(id: string) {
    const { error } = await supabase
      .from("interfaces_with")
      .delete()
      .eq("id", id);
    if (error) {
      setAlert({ message: "Failed to delete interface", type: "error" });
    } else {
      setAlert({ message: "Interface deleted", type: "success" });
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    }
  }

  // CREATE Interface
  async function handleCreateInterface() {
    // console.log("Creating interface with data:", newInterfaceData);
    if (
      !newInterfaceData.system_a_id ||
      !newInterfaceData.system_b_id ||
      !newInterfaceData.connection_type
    ) {
      setAlert({ message: "All fields are required", type: "error" });
      return;
    }
    const { data, error } = await supabase
      .from("interfaces_with")
      .insert([newInterfaceData])
      .select();
    if (error || !data || data.length === 0) {
      setAlert({ message: "Failed to create interface", type: "error" });
    } else {
      setAlert({ message: "Interface created", type: "success" });
      setShowNewInterfaceForm(false);
      setNewInterfaceData({
        system_a_id: currentSystem,
        system_b_id: "",
        connection_type: "",
        directional: 1,
      });
      const sqlData = data[0];
      const newEdge: Edge = {
        id: sqlData.id,
        source: sqlData.system_a_id,
        target: sqlData.system_b_id,
        label: sqlData.connection_type,
        animated: true,
        style: {},
        data: {
          directional: sqlData.directional,
          connection_type: sqlData.connection_type,
        },
      };
      setEdges((eds) => eds.concat(newEdge));
    }
  }

  return (
    <div className="p-4">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onDismiss={() => setAlert(null)}
        />
      )}
      <h2 className="text-xl font-semibold mb-4">Interfaces</h2>
      <div className="mb-4">
        <button
          onClick={() => setShowNewInterfaceForm(!showNewInterfaceForm)}
          className={`${
            showNewInterfaceForm ? "bg-red-500" : "bg-green-500"
          } text-white px-3 py-1 rounded`}
          hidden={!currentSystem || !toOptions.length}
        >
          {showNewInterfaceForm ? "Cancel" : "New Interface"}
        </button>
        {showNewInterfaceForm && (
          <div className="mt-2 p-4 border rounded">
            <div className="mb-2">
              <label className="mr-2">From (System A):</label>
              <select
                value={newInterfaceData.system_a_id}
                onChange={(e) =>
                  setNewInterfaceData({
                    ...newInterfaceData,
                    system_a_id: e.target.value,
                  })
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
              <label className="mr-2">To (System B):</label>
              <select
                value={toOptions[0].id || newInterfaceData.system_b_id}
                onChange={(e) =>
                  setNewInterfaceData({
                    ...newInterfaceData,
                    system_b_id: e.target.value,
                  })
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
              <label className="mr-2">Connection Type:</label>
              <input
                type="text"
                value={newInterfaceData.connection_type}
                onChange={(e) =>
                  setNewInterfaceData({
                    ...newInterfaceData,
                    connection_type: e.target.value,
                  })
                }
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="mb-2">
              <label className="mr-2">Directional:</label>
              <input
                type="number"
                value={newInterfaceData.directional}
                onChange={(e) =>
                  setNewInterfaceData({
                    ...newInterfaceData,
                    directional: Number(e.target.value),
                  })
                }
                className="border rounded px-2 py-1"
              />
            </div>
            <button
              onClick={handleCreateInterface}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Create Interface
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {relevantEdges.map((edge) => {
          const otherNode = nodeMap[edge.target];
          return (
            <InterfaceCard
              key={edge.id}
              edge={edge}
              otherNode={otherNode}
              onDelete={handleDeleteInterface}
              setAlert={setAlert}
              fromOptions={fromOptions}
              toOptions={toOptions}
              setEdges={setEdges}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InterfaceComponent;
