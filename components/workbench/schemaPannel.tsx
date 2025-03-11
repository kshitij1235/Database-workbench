"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Database, Search, ChevronRight, ChevronDown, Key, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CustomScrollArea } from "./scrollArea"
import { cn } from "@/lib/utils"

interface SchemaPanelProps {
  onClose: () => void
  nodes: any[]
  onNodeClick: (nodeId: string) => void
}

export function SchemaPanel({ onClose, nodes, onNodeClick }: SchemaPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})
  const initializedRef = useRef(false)

  // Initialize all tables as expanded only once
  useEffect(() => {
    if (!initializedRef.current && nodes.length > 0) {
      const initialExpandState = nodes.reduce((acc, node) => {
        acc[node.id] = true
        return acc
      }, {})
      setExpandedTables(initialExpandState)
      initializedRef.current = true
    }
  }, [nodes])

  const toggleTable = (tableId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedTables((prev) => ({
      ...prev,
      [tableId]: !prev[tableId],
    }))
  }

  const filteredNodes = nodes.filter(
    (node) =>
      node.data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.data.columns.some((col) => col.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="w-80 h-full border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out">
      <Card className="border-0 rounded-none h-full flex flex-col">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Schema Explorer
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <Separator />

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables and columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <CustomScrollArea className="flex-grow">
          <div className="p-4 pt-0 space-y-2">
            {filteredNodes.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No tables found</div>
            ) : (
              filteredNodes.map((node) => (
                <div key={node.id} className="rounded-md border border-border">
                  <div
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted"
                    onClick={(e) => toggleTable(node.id, e)}
                  >
                    <div className="flex items-center">
                      {expandedTables[node.id] ? (
                        <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                      )}
                      <span className="font-medium">{node.data.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {node.data.columns.length} {node.data.columns.length === 1 ? "column" : "columns"}
                    </span>
                  </div>

                  {expandedTables[node.id] && (
                    <div className="pl-8 pr-2 pb-2 space-y-1">
                      {node.data.columns.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-1">No columns</div>
                      ) : (
                        node.data.columns.map((column, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-center justify-between py-1 px-2 text-sm rounded-sm",
                              searchQuery && column.name.toLowerCase().includes(searchQuery.toLowerCase())
                                ? "bg-yellow-100 dark:bg-yellow-900/20"
                                : "hover:bg-muted",
                            )}
                            onClick={() => onNodeClick(node.id)}
                          >
                            <div className="flex items-center">
                              <span className="mr-1">{column.name}</span>
                              {column.isPrimaryKey && <Key size={12} className="text-yellow-500 mr-1" />}
                              {column.isIndexed && <List size={12} className="text-blue-500 mr-1" />}
                            </div>
                            <span className="text-xs text-muted-foreground">{column.type}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CustomScrollArea>
      </Card>
    </div>
  )
}

