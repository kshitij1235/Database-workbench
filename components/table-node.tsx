import { useState } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function TableNode({ id, data, isConnectable }) {
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddColumn = () => {
    if (newColumnName && newColumnType) {
      data.onAddColumn(id, newColumnName, newColumnType);
      setNewColumnName("");
      setNewColumnType("");
      setIsAdding(false);
    }
  };

  return (
    <Card className="w-64 shadow-lg rounded-lg border border-gray-200">
      <CardHeader className="bg-gray-100 rounded-t-lg p-3 flex justify-between items-center">
        <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {data.columns.map((column, index) => (
            <div key={index} className="flex justify-between text-sm border-b pb-1">
              <span className="font-medium">{column.name}</span>
              <span className="text-gray-500">{column.type}</span>
              <Handle
                type="source"
                position={Position.Right}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-blue-500"
              />
            </div>
          ))}
        </div>

        {isAdding ? (
          <div className="mt-3 space-y-2">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              className="text-sm"
            />
            <Input
              value={newColumnType}
              onChange={(e) => setNewColumnType(e.target.value)}
              placeholder="Column type"
              className="text-sm"
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddColumn}>Add</Button>
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