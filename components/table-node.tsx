"use client"

import { Hash, Database } from "lucide-react";
import { useState, useEffect, useCallback } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Key, Edit2, List } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ColumnActionsMenu } from "@/components/ColumnActionsMenu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export function TableNode({ id, data, isConnectable, selected }: NodeProps) {
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tableName, setTableName] = useState(data.label)
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null)
  const [editColumnName, setEditColumnName] = useState("")
  const [editColumnType, setEditColumnType] = useState("")
  const [enumValues, setEnumValues] = useState<string[]>([])
  const [isIndexed, setIsIndexed] = useState(false)
  const [editEnumValues, setEditEnumValues] = useState<string[]>([])

  useEffect(() => {
    setTableName(data.label)
  }, [data.label])

  const handleAddColumn = () => {
    if (newColumnName && newColumnType) {
      let finalType = newColumnType
      if (newColumnType === "ENUM" && enumValues.length > 0) {
        finalType = `ENUM(${enumValues.map((v) => `'${v}'`).join(", ")})`
      }
      data.onAddColumn(id, newColumnName, finalType, isIndexed)
      setNewColumnName("")
      setNewColumnType("")
      setEnumValues([])
      setIsIndexed(false)
      setIsAdding(false)
    }
  }

  const handleAddKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddColumn()
    } else if (e.key === "Escape") {
      setIsAdding(false)
      setNewColumnName("")
      setNewColumnType("")
      setEnumValues([])
      setIsIndexed(false)
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
      // Get column that's being toggled
      const column = data.columns.find((col) => col.name === columnName)

      // If already a primary key, just toggle it off
      if (column.isPrimaryKey) {
        data.onTogglePrimaryKey(id, columnName)
        return
      }

      // If setting a new primary key, ensure only this column is primary key
      // First, find any existing primary key columns
      const existingPKColumns = data.columns.filter((col) => col.isPrimaryKey)

      // Turn off all existing PKs first
      for (const pkCol of existingPKColumns) {
        data.onTogglePrimaryKey(id, pkCol.name)
      }

      // Then set this column as the new PK
      data.onTogglePrimaryKey(id, columnName)
    },
    [id, data],
  )

  const toggleIndex = useCallback(
    (columnName) => {
      if (typeof data.onToggleIndex === "function") {
        data.onToggleIndex(id, columnName)
      } else {
        console.error("onToggleIndex is not defined in data:", data)
      }
    },
    [id, data],
  )

  const parseEnumValuesFromType = (type) => {
    if (!type.startsWith("ENUM(")) return []

    try {
      const enumStr = type.substring(5, type.length - 1)
      return enumStr.split(",").map((val) => {
        // Remove quotes and trim
        return val.trim().replace(/^['"]|['"]$/g, "")
      })
    } catch (e) {
      console.error("Error parsing enum values:", e)
      return []
    }
  }

  const startEditingColumn = (index) => {
    const column = data.columns[index]
    setEditColumnName(column.name)
    setEditColumnType(column.type)

    // Handle ENUM type separately to populate enum values
    if (column.type.startsWith("ENUM(")) {
      const baseType = "ENUM"
      setEditColumnType(baseType)
      setEditEnumValues(parseEnumValuesFromType(column.type))
    } else {
      setEditEnumValues([])
    }

    setEditingColumnIndex(index)
  }

  const handleEditColumnKeyDown = (e, index) => {
    if (e.key === "Enter") {
      if (editColumnName) {
        applyColumnChanges(index)
      }
    } else if (e.key === "Escape") {
      cancelEditColumn()
    }
    e.stopPropagation()
  }

  const cancelEditColumn = () => {
    setEditingColumnIndex(null)
    setEditColumnName("")
    setEditColumnType("")
    setEditEnumValues([])
  }

  const applyColumnChanges = (index) => {
    let finalType = editColumnType

    if (editColumnType === "ENUM" && editEnumValues.length > 0) {
      finalType = `ENUM(${editEnumValues.map((v) => `'${v}'`).join(", ")})`
    }

    handleColumnChange(index, editColumnName, finalType)
  }

  const handleColumnChange = (index: number, newName: string, newType: string) => {
    data.onUpdateColumn(id, index, newName, newType)
    cancelEditColumn()
  }

  const handleDeleteColumn = (index: number) => {
    data.onDeleteColumn(id, index)
  }

  const handleAddEnumValue = () => {
    setEnumValues([...enumValues, ""])
  }

  const handleAddEditEnumValue = () => {
    setEditEnumValues([...editEnumValues, ""])
  }

  const handleUpdateEnumValue = (index: number, value: string) => {
    const newEnumValues = [...enumValues]
    newEnumValues[index] = value
    setEnumValues(newEnumValues)
  }

  const handleUpdateEditEnumValue = (index: number, value: string) => {
    const newEnumValues = [...editEnumValues]
    newEnumValues[index] = value
    setEditEnumValues(newEnumValues)
  }

  const handleRemoveEnumValue = (index: number) => {
    const newEnumValues = [...enumValues]
    newEnumValues.splice(index, 1)
    setEnumValues(newEnumValues)
  }

  const handleRemoveEditEnumValue = (index: number) => {
    const newEnumValues = [...editEnumValues]
    newEnumValues.splice(index, 1)
    setEditEnumValues(newEnumValues)
  }

  const EdgeLabel = ({ label }) => (
    <div
      style={{
        position: "absolute",
        padding: "2px 4px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: "bold",
        pointerEvents: "all",
      }}
    >
      {label}
    </div>
  )

  return (
    <Card
      className={`shadow-lg rounded-lg border min-w-[250px] min-h-[150px] ${
        selected ? "border-blue-500 shadow-blue-500/50" : "border-gray-200 dark:border-gray-700"
      } dark:bg-gray-800 transition-all duration-300 ${selected ? "glow" : ""}`}
      style={{ width: "auto", minHeight: "150px" }}
    >
        <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-lg p-3 flex flex-row justify-between items-center space-y-0">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-primary" />
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
          </div>
          <Badge variant="outline" className="text-xs">
            {data.columns.length} {data.columns.length === 1 ? "column" : "columns"}
          </Badge>
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
              >
                <EdgeLabel label={column.options} />
              </Handle>
              {editingColumnIndex === index ? (
                <div className="flex flex-col w-full space-y-2 py-2">
                  <div className="flex w-full space-x-2">
                    <Input
                      value={editColumnName}
                      onChange={(e) => setEditColumnName(e.target.value)}
                      onKeyDown={(e) => handleEditColumnKeyDown(e, index)}
                      className="text-sm"
                      placeholder="Column name"
                      autoFocus
                    />

                    <Select value={editColumnType} onValueChange={(value) => setEditColumnType(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.validColumnTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {editColumnType === "ENUM" && (
                    <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
                      {editEnumValues.map((value, enumIndex) => (
                        <div key={enumIndex} className="flex items-center space-x-2">
                          <Input
                            value={value}
                            onChange={(e) => handleUpdateEditEnumValue(enumIndex, e.target.value)}
                            placeholder={`Enum value ${enumIndex + 1}`}
                            className="text-sm dark:bg-gray-700 dark:text-white"
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveEditEnumValue(enumIndex)}>
                            <span>×</span>
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" onClick={handleAddEditEnumValue}>
                        Add Enum Value
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline" onClick={cancelEditColumn}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => applyColumnChanges(index)}
                      disabled={!editColumnName || !editColumnType}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="ml-1 font-medium dark:text-white truncate">
                      {column.name}
                      {column.isPrimaryKey && <Key size={12} className="inline text-yellow-500 ml-1" />}
                      {column.isIndexed && <List size={12} className="inline text-blue-500 ml-1" />}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-0 h-6 w-6 ml-1"
                      onClick={() => startEditingColumn(index)}
                    >
                      <Edit2 size={12} />
                    </Button>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[80px]">{column.type}</span>
                  <ColumnActionsMenu
                    isPrimaryKey={column.isPrimaryKey}
                    isIndexed={column.isIndexed}
                    onTogglePrimaryKey={() => togglePrimaryKey(column.name)}
                    onToggleIndex={() => toggleIndex(column.name)}
                    onDelete={() => handleDeleteColumn(index)}
                  />
                </>
              )}
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-${column.name}-source`}
                isConnectable={isConnectable}
                style={{ right: -18, height: 10, width: 10 }}
              >
                <EdgeLabel label={column.options} />
              </Handle>
            </div>
          ))}
        </div>

        {isAdding ? (
          <div className="mt-3 space-y-2">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              className="text-sm dark:bg-gray-700 dark:text-white"
              onKeyDown={handleAddKeyDown}
            />
            <Select onValueChange={(value) => setNewColumnType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select column type" />
              </SelectTrigger>
              <SelectContent>
                {data.validColumnTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newColumnType === "ENUM" && (
              <div className="space-y-2">
                {enumValues.map((value, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={value}
                      onChange={(e) => handleUpdateEnumValue(index, e.target.value)}
                      placeholder={`Enum value ${index + 1}`}
                      className="text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveEnumValue(index)}>
                      <span>×</span>
                    </Button>
                  </div>
                ))}
                <Button size="sm" onClick={handleAddEnumValue}>
                  Add Enum Value
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="indexed"
                checked={isIndexed}
                onCheckedChange={(checked) => setIsIndexed(checked === true)}
              />
              <Label htmlFor="indexed" className="text-sm">
                Create Index
              </Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddColumn} disabled={!newColumnName || !newColumnType}>
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

