import React, { useState } from "react";
import { Node } from "@xyflow/react";

type DescendantRowProps = {
  node: Node;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newName: string, newCategory: string) => void;
};

const DescendantRow: React.FC<DescendantRowProps> = ({
  node,
  onSelect,
  onDelete,
  onUpdate,
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(
    String(node.data?.label || "")
  );
  const [editCategory, setEditCategory] = useState<string>(
    String(node.data?.category || "")
  );

  return (
    <tr>
      <td className="border px-2 py-1">
        {editMode ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border rounded px-2 py-1"
          />
        ) : (
          <button
            onClick={onSelect}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            {node.id}
          </button>
        )}
      </td>
      <td className="border px-2 py-1">
        {editMode ? (
          <input
            type="text"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="border rounded px-2 py-1"
          />
        ) : (
          String(node.data?.category || "")
        )}
      </td>
      <td className="border px-2 py-1">
        {editMode ? (
          <>
            <button
              onClick={() => {
                onUpdate(node.id, editName, editCategory);
                setEditMode(false);
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-500 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditMode(true)}
              className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(node.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default DescendantRow;
