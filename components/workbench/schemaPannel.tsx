"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Database, Search, ChevronRight, ChevronDown, Key, List, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CustomScrollArea } from "./scrollArea"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface Column {
  name: string
  type: string
  isPrimaryKey: boolean
  isIndexed: boolean
  description?: string
}

interface Node {
  id: string
  data: {
    label: string
    columns: Column[]
    description?: string
  }
}

interface SchemaPanelProps {
  onClose: () => void
  nodes: Node[]
  onNodeClick: (nodeId: string) => void
}

export function SchemaPanel({ onClose, nodes, onNodeClick }: SchemaPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})
  const initializedRef = useRef(false)

  // Initialize all tables as expanded only once
  useEffect(() => {
    if (!initializedRef.current && nodes.length > 0) {
      const initialExpandState = nodes.reduce(
        (acc, node) => {
          acc[node.id] = true
          return acc
        },
        {} as Record<string, boolean>,
      )
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
    <TooltipProvider>
      <div className="w-80 h-full border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-950 transition-all duration-300 ease-in-out">
        <Card className="border-0 rounded-none h-full flex flex-col shadow-none">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center font-medium">
              <Database className="mr-2 h-4 w-4" />
              Schema Explorer
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <Separator />

          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables and columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          <CustomScrollArea className="flex-grow">
            <div className="p-3 pt-0 space-y-2">
              {filteredNodes.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-sm">No tables found</div>
              ) : (
                filteredNodes.map((node) => (
                  <div
                    key={node.id}
                    className="rounded-md border border-border overflow-hidden transition-all duration-200 hover:border-primary/20"
                  >
                    <div
                      className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted group"
                      onClick={(e) => toggleTable(node.id, e)}
                    >
                      <div className="flex items-center overflow-hidden">
                        <div className="w-5 h-5 flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                          {expandedTables[node.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-medium text-sm truncate">{node.data.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs font-normal h-5 px-1.5">
                        {node.data.columns.length}
                      </Badge>
                    </div>

                    {expandedTables[node.id] && (
                      <div className="border-t border-border bg-muted/30">
                        {node.data.columns.length === 0 ? (
                          <div className="text-xs text-muted-foreground py-2 px-3">No columns</div>
                        ) : (
                          <div className="py-1">
                            {node.data.columns.map((column, idx) => {
                              const isHighlighted =
                                searchQuery && column.name.toLowerCase().includes(searchQuery.toLowerCase())

                              return (
                                <div
                                  key={idx}
                                  className={cn(
                                    "flex items-center justify-between py-1.5 px-3 text-sm hover:bg-muted/80 cursor-pointer transition-colors",
                                    isHighlighted && "bg-amber-100/50 dark:bg-amber-900/20",
                                  )}
                                  onClick={() => onNodeClick(node.id)}
                                >
                                  <div className="flex items-center space-x-1 overflow-hidden">
                                    <div className="flex min-w-0">
                                      <span className="truncate">{column.name}</span>
                                    </div>
                                    <div className="flex shrink-0 space-x-1">
                                      {column.isPrimaryKey && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span>
                                              <Key size={12} className="text-amber-500" />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="text-xs">
                                            Primary Key
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                      {column.isIndexed && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span>
                                              <List size={12} className="text-sky-500" />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="text-xs">
                                            Indexed
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                      {column.description && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span>
                                              <Info size={12} className="text-gray-400" />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="text-xs max-w-[200px]">
                                            {column.description}
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-xs text-muted-foreground truncate max-w-[100px] text-right">
                                        {column.type}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="text-xs">
                                      {column.type}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              )
                            })}
                          </div>
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
    </TooltipProvider>
  )
}

