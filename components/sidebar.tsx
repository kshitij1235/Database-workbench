"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Sidebar({ onAddTable }) {
  const [tableName, setTableName] = useState("")

  const handleAddTable = () => {
    if (tableName.trim()) {
      onAddTable(tableName)
      setTableName("")
    }
  }

  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Add Table</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="tableName">Table Name</Label>
          <Input
            id="tableName"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
          />
        </div>
        <Button onClick={handleAddTable}>Add Table</Button>
      </div>
    </div>
  )
}

