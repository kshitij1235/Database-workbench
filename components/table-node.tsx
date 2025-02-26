"use client"

import { useState, useEffect, useCallback } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Key, Edit2, Trash2 } from "lucide-react"

export function TableNode({ id, data, isConnectable, selected }: NodeProps) {
  const [newColumnName, setNewColumnName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tableName, setTableName] = useState(data.label)
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null)

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

  const handleColumnChange = (index: number, newName: string, newType: string) => {
    data.onUpdateColumn(id, index, newName, newType)
    setEditingColumnIndex(null)
  }

  const handleDeleteColumn = (index: number) => {
    data.onDeleteColumn(id, index)
  }

  return (
    <Card
      className={`shadow-lg rounded-lg border min-w-[250px] min-h-[150px] ${
        selected ? "border-blue-500 shadow-blue-500/50" : "border-gray-200 dark:border-gray-700"
      } dark:bg-gray-800 transition-all duration-300 ${selected ? "glow" : ""}`}
      style={{ width: "auto", minHeight: "150px" }}
    >
      <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-lg p-3 flex justify-between items-center">
        {isEditingName ? (
          <Input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            onKeyDown={handleTableNameKeyDown}
            onBlur={() => {
              setIsEditingName(false)
              data.onUpdateTableName(id, tableName)
            }}
            className="text-sm font-bold dark:bg-gray-600 dark:text-white"
            autoFocus
          />
        ) : (
          <CardTitle
            className="text-sm font-bold cursor-pointer dark:text-white"
            onClick={() => setIsEditingName(true)}
          >
            {data.label}
          </CardTitle>
        )}
      </CardHeader>

      <CardContent className="p-3 dark:bg-gray-800">
        <div className="space-y-2">
          {data.columns.map((column, index) => (
            <div key={index} className="relative flex items-center text-sm border-b dark:border-gray-700 pb-1">
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-${column.name}-target`}
                isConnectable={isConnectable}
                style={{ left: -18, height: 10, width: 10 }}
              />
              {editingColumnIndex === index ? (
                <div className="flex w-full">
                  <Input
                    value={`${column.name}:${column.type}`}
                    onChange={(e) => {
                      const [newName, newType] = e.target.value.split(":")
                      handleColumnChange(index, newName.trim(), newType ? newType.trim() : column.type)
                    }}
                    onBlur={(e) => {
                      const [newName, newType] = e.target.value.split(":")
                      handleColumnChange(index, newName.trim(), newType ? newType.trim() : column.type)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const [newName, newType] = e.currentTarget.value.split(":")
                        handleColumnChange(index, newName.trim(), newType ? newType.trim() : column.type)
                      } else if (e.key === "Escape") {
                        setEditingColumnIndex(null)
                      }
                      e.stopPropagation()
                    }}
                    className="text-sm w-full mr-2"
                    placeholder="name:type"
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <span className="ml-3 font-medium dark:text-white">{column.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-0 h-6 w-6 ml-1"
                    onClick={() => setEditingColumnIndex(index)}
                  >
                    <Edit2 size={12} />
                  </Button>
                </>
              )}
              <span className="ml-auto mr-3 text-gray-500 dark:text-gray-400">{column.type}</span>
              {column.isPrimaryKey && <Key size={14} className="text-yellow-500 mr-1" />}
              <Button
                size="sm"
                variant="ghost"
                className={`p-0 h-6 w-6 ${column.isPrimaryKey ? "text-yellow-500" : "text-gray-400 dark:text-gray-500"}`}
                onClick={() => togglePrimaryKey(column.name)}
              >
                🔑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-0 h-6 w-6 text-red-500"
                onClick={() => handleDeleteColumn(index)}
              >
                <Trash2 size={12} />
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
              className="text-sm dark:bg-gray-700 dark:text-white"
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
            className="w-full mt-3 flex items-center justify-center gap-1 dark:bg-gray-700 dark:text-white"
          >
            <Plus size={14} /> Add Column
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

