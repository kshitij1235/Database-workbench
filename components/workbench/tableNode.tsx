"use client"

import { useState, useEffect, useCallback } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Key, Edit2, List, Database, Lock, Hash, AlertCircle, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { ColumnActionsMenu } from "@/components/workbench/ColumnActionsMenu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function TableNode({ id, data, isConnectable, selected }: NodeProps) {
  const { theme } = useTheme()
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

  // New column properties
  const [isNotNull, setIsNotNull] = useState(false)
  const [isUnique, setIsUnique] = useState(false)
  const [isAutoIncrement, setIsAutoIncrement] = useState(false)
  const [defaultValue, setDefaultValue] = useState("")
  const [checkConstraint, setCheckConstraint] = useState("")
  // Add isPrimaryKey state for new columns
  const [isPrimaryKey, setIsPrimaryKey] = useState(false)

  // Edit column properties
  const [editIsNotNull, setEditIsNotNull] = useState(false)
  const [editIsUnique, setEditIsUnique] = useState(false)
  const [editIsAutoIncrement, setEditIsAutoIncrement] = useState(false)
  const [editDefaultValue, setEditDefaultValue] = useState("")
  const [editCheckConstraint, setEditCheckConstraint] = useState("")
  // Add editIsPrimaryKey state
  const [editIsPrimaryKey, setEditIsPrimaryKey] = useState(false)

  useEffect(() => {
    setTableName(data.label)
  }, [data.label])

  // Check if the table already has a primary key
  const hasPrimaryKey = useCallback(() => {
    return data.columns.some((col) => col.isPrimaryKey)
  }, [data.columns])

  // Change the handleAddColumn function to pass separate parameters instead of an object
  const handleAddColumn = () => {
    if (newColumnName && newColumnType) {
      let finalType = newColumnType
      if (newColumnType === "ENUM" && enumValues.length > 0) {
        finalType = `ENUM(${enumValues.map((v) => `'${v}'`).join(", ")})`
      }

      // If this column is set as primary key, we need to unset any existing primary keys
      if (isPrimaryKey) {
        // First, find any existing primary key columns and turn them off
        const existingPKColumns = data.columns.filter((col) => col.isPrimaryKey)
        for (const pkCol of existingPKColumns) {
          data.onTogglePrimaryKey(id, pkCol.name)
        }
      }

      // Pass individual parameters instead of an object
      data.onAddColumn(
        id,
        newColumnName,
        finalType,
        isIndexed,
        isPrimaryKey, // Add this parameter
        isNotNull,
        isUnique,
        isAutoIncrement,
        defaultValue || null,
        checkConstraint || null,
      )

      // Reset all fields
      setNewColumnName("")
      setNewColumnType("")
      setEnumValues([])
      setIsIndexed(false)
      setIsNotNull(false)
      setIsUnique(false)
      setIsAutoIncrement(false)
      setDefaultValue("")
      setCheckConstraint("")
      // Reset isPrimaryKey in handleAddColumn and handleAddKeyDown
      setIsPrimaryKey(false)
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
      setIsNotNull(false)
      setIsUnique(false)
      setIsAutoIncrement(false)
      setDefaultValue("")
      setCheckConstraint("")
      // Reset isPrimaryKey in handleAddColumn and handleAddKeyDown
      setIsPrimaryKey(false)
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

    // Set additional properties if they exist
    setEditIsNotNull(column.isNotNull || false)
    setEditIsUnique(column.isUnique || false)
    setEditIsAutoIncrement(column.isAutoIncrement || false)
    setEditDefaultValue(column.defaultValue || "")
    setEditCheckConstraint(column.checkConstraint || "")
    // In startEditingColumn, set editIsPrimaryKey
    setEditIsPrimaryKey(column.isPrimaryKey || false)

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
    setEditIsNotNull(false)
    setEditIsUnique(false)
    setEditIsAutoIncrement(false)
    setEditDefaultValue("")
    setEditCheckConstraint("")
    setEditIsPrimaryKey(false)
  }

  // Also update the applyColumnChanges function to use separate parameters
  const applyColumnChanges = (index) => {
    let finalType = editColumnType

    if (editColumnType === "ENUM" && editEnumValues.length > 0) {
      finalType = `ENUM(${editEnumValues.map((v) => `'${v}'`).join(", ")})`
    }

    // If this column is being set as primary key and it wasn't before,
    // we need to unset any existing primary keys
    const currentColumn = data.columns[index]
    if (editIsPrimaryKey && !currentColumn.isPrimaryKey) {
      // First, find any existing primary key columns (excluding the current one)
      const existingPKColumns = data.columns.filter((col, idx) => col.isPrimaryKey && idx !== index)

      // Turn off all existing PKs
      for (const pkCol of existingPKColumns) {
        data.onTogglePrimaryKey(id, pkCol.name)
      }
    }

    // Use separate parameters instead of an object
    data.onUpdateColumn(
      id,
      index,
      editColumnName,
      finalType,
      editIsPrimaryKey, // Add this parameter
      editIsNotNull,
      editIsUnique,
      editIsAutoIncrement,
      editDefaultValue || null,
      editCheckConstraint || null,
    )

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

  // Custom edge label component that adapts to theme
  const EdgeLabel = ({ label }) => (
    <div
      className={`absolute px-1.5 py-1 rounded text-xs font-medium ${
        theme === "dark" ? "bg-gray-800/80 text-gray-200" : "bg-white/80 text-gray-700"
      } backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 shadow-sm`}
      style={{
        pointerEvents: "all",
        transform: "translate(-50%, -50%)",
        marginLeft: "15px",
        marginTop: "15px",
        zIndex: 10,
        whiteSpace: "nowrap",
        maxWidth: "150px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {label || "FK"}
    </div>
  )

  return (
    <TooltipProvider>
      <Card
        className={`shadow-lg rounded-lg border min-w-[280px] min-h-[150px] ${
          selected ? "border-blue-500 shadow-blue-500/50" : "border-gray-200 dark:border-gray-700"
        } dark:bg-gray-800 transition-all duration-300 rounded-t-lg ${selected ? "glow" : ""}`}
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

        <CardContent className="p-3 dark:bg-gray-800 rounded-b-lg">
          <div className="space-y-2">
            {data.columns.map((column, index) => (
              <div key={index} className="relative flex items-center text-sm border-b dark:border-gray-700 pb-1">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${id}-${column.name}-target`}
                  isConnectable={isConnectable}
                  style={{
                    left: -18,
                    height: 10,
                    width: 10,
                    background: column.isPrimaryKey ? "#f59e0b" : "#60a5fa",
                    border: "2px solid #fff",
                    zIndex: 5,
                  }}
                >
                
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

                    {/* Column constraints section */}
                    <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-primary-key"
                          checked={editIsPrimaryKey}
                          onCheckedChange={(checked) => {
                            setEditIsPrimaryKey(checked)
                            // If primary key is checked, automatically set NOT NULL and disable it
                            if (checked) {
                              setEditIsNotNull(true)
                              setEditIsUnique(true)
                            }
                          }}
                          // Disable if another column is already PK and this one isn't
                          disabled={hasPrimaryKey() && !column.isPrimaryKey}
                        />
                        <Label htmlFor="edit-primary-key" className="text-xs flex items-center">
                          <Key className="h-3 w-3 mr-1 text-yellow-500" /> PRIMARY KEY
                        </Label>
                        {hasPrimaryKey() && !column.isPrimaryKey && (
                          <span className="text-xs text-red-500 ml-1">(Table already has a primary key)</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-indexed"
                          checked={isIndexed}
                          onCheckedChange={setIsIndexed}
                          disabled={editIsPrimaryKey} // Primary keys are implicitly indexed
                        />
                        <Label htmlFor="edit-indexed" className="text-xs flex items-center">
                          <List className="h-3 w-3 mr-1 text-blue-500" /> INDEXED
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-not-null"
                          checked={editIsNotNull}
                          onCheckedChange={setEditIsNotNull}
                          disabled={editIsPrimaryKey} // Primary keys are implicitly NOT NULL
                        />
                        <Label htmlFor="edit-not-null" className="text-xs flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> NOT NULL
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-unique"
                          checked={editIsUnique}
                          onCheckedChange={setEditIsUnique}
                          disabled={editIsPrimaryKey} // Primary keys are implicitly UNIQUE
                        />
                        <Label htmlFor="edit-unique" className="text-xs flex items-center">
                          <Lock className="h-3 w-3 mr-1" /> UNIQUE
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-auto-increment"
                          checked={editIsAutoIncrement}
                          onCheckedChange={setEditIsAutoIncrement}
                        />
                        <Label htmlFor="edit-auto-increment" className="text-xs flex items-center">
                          <Hash className="h-3 w-3 mr-1" /> AUTO INCREMENT
                        </Label>
                      </div>

                      {!editIsPrimaryKey && !editIsUnique && (
                        <div className="flex flex-col space-y-1">
                          <Label htmlFor="edit-default-value" className="text-xs">
                            DEFAULT Value
                          </Label>
                          <Input
                            id="edit-default-value"
                            value={editDefaultValue}
                            onChange={(e) => setEditDefaultValue(e.target.value)}
                            placeholder="Default value"
                            className="text-xs h-7 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}

                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="edit-check-constraint" className="text-xs">
                          CHECK Constraint
                        </Label>
                        <Input
                          id="edit-check-constraint"
                          value={editCheckConstraint}
                          onChange={(e) => setEditCheckConstraint(e.target.value)}
                          placeholder="e.g. value > 0"
                          className="text-xs h-7 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

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
                        {column.isNotNull && <AlertCircle size={12} className="inline text-red-500 ml-1" />}
                        {column.isUnique && <Lock size={12} className="inline text-purple-500 ml-1" />}
                        {column.isAutoIncrement && <Hash size={12} className="inline text-green-500 ml-1" />}
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
                    <div className="flex items-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[80px] mr-2">
                        {column.type}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-0 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteColumn(index)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Delete column</p>
                        </TooltipContent>
                      </Tooltip>
                      <ColumnActionsMenu
                        isPrimaryKey={column.isPrimaryKey}
                        isIndexed={column.isIndexed}
                        isNotNull={column.isNotNull}
                        isUnique={column.isUnique}
                        isAutoIncrement={column.isAutoIncrement}
                        onTogglePrimaryKey={() => togglePrimaryKey(column.name)}
                        onToggleIndex={() => toggleIndex(column.name)}
                        onDelete={() => handleDeleteColumn(index)}
                        onToggleNotNull={() => data.onToggleNotNull?.(id, column.name)}
                        onToggleUnique={() => data.onToggleUnique?.(id, column.name)}
                        onToggleAutoIncrement={() => data.onToggleAutoIncrement?.(id, column.name)}
                      />
                    </div>
                  </>
                )}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${id}-${column.name}-source`}
                  isConnectable={isConnectable}
                  style={{
                    right: -18,
                    height: 10,
                    width: 10,
                    background: column.isPrimaryKey ? "#f59e0b" : "#60a5fa",
                    border: "2px solid #fff",
                    zIndex: 5,
                  }}
                >
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

              {/* Column constraints section for new columns */}
              <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="primary-key"
                    checked={isPrimaryKey}
                    onCheckedChange={(checked) => {
                      setIsPrimaryKey(checked)
                      // If primary key is checked, automatically set NOT NULL and disable it
                      if (checked) {
                        setIsNotNull(true)
                        setIsUnique(true)
                      }
                    }}
                    // Disable if the table already has a primary key
                    disabled={hasPrimaryKey()}
                  />
                  <Label htmlFor="primary-key" className="text-xs flex items-center">
                    <Key className="h-3 w-3 mr-1 text-yellow-500" /> PRIMARY KEY
                  </Label>
                  {hasPrimaryKey() && (
                    <span className="text-xs text-red-500 ml-1">(Table already has a primary key)</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="indexed"
                    checked={isIndexed}
                    onCheckedChange={setIsIndexed}
                    disabled={isPrimaryKey} // Primary keys are implicitly indexed
                  />
                  <Label htmlFor="indexed" className="text-xs flex items-center">
                    <List className="h-3 w-3 mr-1 text-blue-500" /> INDEXED
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="not-null"
                    checked={isNotNull}
                    onCheckedChange={setIsNotNull}
                    disabled={isPrimaryKey} // Primary keys are implicitly NOT NULL
                  />
                  <Label htmlFor="not-null" className="text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" /> NOT NULL
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="unique"
                    checked={isUnique}
                    onCheckedChange={setIsUnique}
                    disabled={isPrimaryKey} // Primary keys are implicitly UNIQUE
                  />
                  <Label htmlFor="unique" className="text-xs flex items-center">
                    <Lock className="h-3 w-3 mr-1" /> UNIQUE
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-increment" checked={isAutoIncrement} onCheckedChange={setIsAutoIncrement} />
                  <Label htmlFor="auto-increment" className="text-xs flex items-center">
                    <Hash className="h-3 w-3 mr-1" /> AUTO INCREMENT
                  </Label>
                </div>

                {!isPrimaryKey && !isUnique && (
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="default-value" className="text-xs">
                      DEFAULT Value
                    </Label>
                    <Input
                      id="default-value"
                      value={defaultValue}
                      onChange={(e) => setDefaultValue(e.target.value)}
                      placeholder="Default value"
                      className="text-xs h-7 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                <div className="flex flex-col space-y-1">
                  <Label htmlFor="check-constraint" className="text-xs">
                    CHECK Constraint
                  </Label>
                  <Input
                    id="check-constraint"
                    value={checkConstraint}
                    onChange={(e) => setCheckConstraint(e.target.value)}
                    placeholder="e.g. value > 0"
                    className="text-xs h-7 dark:bg-gray-700 dark:text-white"
                  />
                </div>
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
    </TooltipProvider>
  )
}

