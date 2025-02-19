import { useState } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function TableNode({ id, data, isConnectable }) {
  const [newColumnName, setNewColumnName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddColumn = () => {
    const parts = newColumnName.split(":");
    if (parts.length === 2) {
      const [name, type] = parts.map((part) => part.trim());
      if (name && type) {
        data.onAddColumn(id, name, type);
        setNewColumnName("");
        setIsAdding(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddColumn();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewColumnName("");
    }
  };

  return (
    <Card className="w-64 shadow-lg rounded-lg border border-gray-200">
      <CardHeader className="bg-gray-100 rounded-t-lg p-3 flex justify-between items-center">
        <CardTitle className="text-sm font-bold ">{data.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {data.columns.map((column, index) => (
            <div key={index} className="relative flex items-center text-sm border-b pb-1">
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-${column.name}-target`}
                isConnectable={isConnectable}
                style={{ left: -18 ,height : 10 , width:10 }}
              />
              <span className="ml-3 font-medium">{column.name}</span>
              <span className="ml-auto mr-3 text-gray-500">{column.type}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-${column.name}-source`}
                isConnectable={isConnectable}
                style={{ right: -18 , height : 10 , width:10}}
              />
            </div>
          ))}
        </div>

        {isAdding ? (
          <div className="mt-3 space-y-2">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Column name : type"
              className="text-sm"
            />
            <Button size="sm" variant="outline" className="bg-purple-500 text-white">
                🔑
            </Button>

            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddColumn} disabled={newColumnName.split(":").length !== 2}>
                Add
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="w-full mt-3 flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Add Column
          </Button>
        )}
      </CardContent>
    </Card>
  );
}