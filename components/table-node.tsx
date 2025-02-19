"use client"

import { useState } from "react"
import { Handle, Position } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export function TableNode({ id, data, isConnectable }) {
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddColumn = () => {
    if (newColumnName && newColumnType) {
      data.onAddColumn(id, newColumnName, newColumnType)
      setNewColumnName("")
      setNewColumnType("")
      setIsAdding(false)
    }
  }

  return (
    <Card className="w-[250px]">
      <CardHeader>
        <CardTitle>{data.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 mb-2">
          {data.columns.map((column, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <span>{column.name}</span>
              <span className="text-xs text-gray-500">{column.type}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-${column.name}`}
                isConnectable={isConnectable}
                className="w-3 h-3"
              />
            </li>
          ))}
        </ul>
        {isAdding ? (
          <div className="space-y-2">
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
            <Button onClick={handleAddColumn} size="sm" className="w-full">
              Add
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Column
          </Button>
        )}
      </CardContent>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3" />
    </Card>
  )
}

