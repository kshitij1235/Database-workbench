"use client"

import { useState, useEffect, useCallback } from "react"
import { Handle, Position } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Key } from "lucide-react"

export function TableNode({ id, data, isConnectable }) {
  const [newColumnName, setNewColumnName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tableName, setTableName] = useState(data.label)

  useEffect(() => {
    setTableName(data.label)
  }, [data.label])

  const handleAddColumn = () => {
    const parts = newColumnName.split(":")
    if (parts.length === 2) {
      const [name, type] = parts.map((part) => part.trim())
      if (name && type) {
        data.onAddColumn(id, name, type)
        setNewColumnName("")
        setIsAdding(false)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddColumn()
    } else if (e.key === "Escape") {
      setIsAdding(false)
      setNewColumnName("")
    }
  }

  const handleTableNameKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditingName(false)
      data.onUpdateTableName(id, tableName)
    } else if (e.key === "Escape") {
      setIsEditingName(false)
      setTableName(data.label)
    }
  }

  const togglePrimaryKey = useCallback(
    (columnName) => {
      data.onTogglePrimaryKey(id, columnName)
    },
    [id, data],
  )

  return (
    <Card className="w-64 shadow-lg rounded-lg border border-gray-200">
      <CardHeader className="bg-gray-100 rounded-t-lg p-3 flex justify-between items-center">
        {isEditingName ? (
          <Input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            onKeyDown={handleTableNameKeyDown}
            onBlur={() => {
              setIsEditingName(false)
              data.onUpdateTableName(id, tableName)
            }}
            className="text-sm font-bold"
            autoFocus
          />
        ) : (
          <CardTitle className="text-sm font-bold cursor-pointer" onClick={() => setIsEditingName(true)}>
            {data.label}
          </CardTitle>
        )}
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
                style={{ left: -18, height: 10, width: 10 }}
              />
              <span className="ml-3 font-medium">{column.name}</span>
              <span className="ml-auto mr-3 text-gray-500">{column.type}</span>
              {column.isPrimaryKey && <Key size={14} className="text-yellow-500 mr-1" />}
              <Button
                size="sm"
                variant="ghost"
                className={`p-0 h-6 w-6 ${column.isPrimaryKey ? "text-yellow-500" : "text-gray-400"}`}
                onClick={() => togglePrimaryKey(column.name)}
              >
                🔑
              </Button>
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-${column.name}-source`}
                isConnectable={isConnectable}
                style={{ right: -18, height: 10, width: 10 }}
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
  )
}

