"use client"

import { useState, useCallback, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  type Edge,
  type Connection,
  useNodesState,
  useEdgesState,
} from "reactflow"
import "reactflow/dist/style.css"
import { TableNode } from "@/components/table-node"
import { Button } from "@/components/ui/button"
import { parseDbml } from "@/lib/dbmlParser"
import { exportToDbml } from "@/lib/dbmlExporter"
import { exportToSql } from "@/lib/sqlExporter"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { InfoBox } from "@/components/workbench-info-box"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { ExportDropdown } from "./exportOptionDropDown"

const nodeTypes = {
  table: TableNode,
}

export default function Workbench() {
  const { theme, setTheme } = useTheme()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodes, setSelectedNodes] = useState([])

  const onUpdateTableName = useCallback(
    (id, newName) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: newName } } : node)),
      )
    },
    [setNodes],
  )

  const onTogglePrimaryKey = useCallback(
    (id, columnName) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = node.data.columns.map((col) => ({
              ...col,
              isPrimaryKey: col.name === columnName ? !col.isPrimaryKey : false,
            }))
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const onUpdateColumn = useCallback(
    (id, index, newName, newType) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const updatedColumns = [...node.data.columns]
            updatedColumns[index] = { ...updatedColumns[index], name: newName, type: newType }
            return { ...node, data: { ...node.data, columns: updatedColumns } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const getNewNodePosition = useCallback(() => {
    const padding = 20
    const nodeWidth = 250
    const nodeHeight = 300
    const existingPositions = nodes.map((node) => node.position)
    const newPos = { x: padding, y: padding }

    while (
      existingPositions.some((pos) => Math.abs(pos.x - newPos.x) < nodeWidth && Math.abs(pos.y - newPos.y) < nodeHeight)
    ) {
      if (newPos.x + nodeWidth + padding < window.innerWidth) {
        newPos.x += nodeWidth + padding
      } else {
        newPos.x = padding
        newPos.y += nodeHeight + padding
      }
    }

    return newPos
  }, [nodes])

  const addTable = useCallback(() => {
    const newNode = {
      id: `table-${Date.now()}`,
      type: "table",
      position: getNewNodePosition(),
      data: {
        label: "New Table",
        columns: [],
        onAddColumn: (id, name, type) => {
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.id === id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      columns: [...node.data.columns, { name, type, isPrimaryKey: false }],
                    },
                  }
                : node,
            ),
          )
        },
        onUpdateTableName,
        onTogglePrimaryKey,
        onUpdateColumn,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }, [onUpdateTableName, onTogglePrimaryKey, onUpdateColumn, getNewNodePosition, setNodes])


  useEffect(() => {
    const dbml = localStorage.getItem("dbml")
    if (dbml) {
      let parsedNodes = parseDbml(dbml)

      parsedNodes = parsedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddColumn: (id, name, type) => {
            setNodes((prevNodes) =>
              prevNodes.map((node) =>
                node.id === id
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        columns: [...node.data.columns, { name, type, isPrimaryKey: false }],
                      },
                    }
                  : node,
              ),
            )
          },
          onUpdateTableName,
          onTogglePrimaryKey,
          onUpdateColumn,
        },
      }))

      setNodes(parsedNodes)
      localStorage.removeItem("dbml")
    }
  }, [onUpdateTableName, onTogglePrimaryKey, onUpdateColumn, setNodes])

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes.map((node) => node.id))
  }, [])

  const handleKeyDown = useCallback(
    (event) => {
      if ((event.ctrlKey && event.key === "e") || (event.ctrlKey && event.key === "E")) {
        event.preventDefault()
        addTable()
      } else if (event.key === "Delete") {
        if (selectedNodes.length > 0) {
          setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)))
          setSelectedNodes([])
        } else {
          setEdges((eds) => eds.filter((edge) => !edge.selected))
        }
      }
    },
    [addTable, selectedNodes, setNodes, setEdges],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])


  const handleExportDbml = () => {
    const dbml = exportToDbml(nodes, edges)
    const blob = new Blob([dbml], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "database.dbml"
    a.click()
  }

  const handleExportSql = () => {
    const sql = exportToSql(nodes, edges)
    const blob = new Blob([sql], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "database.sql"
    a.click()
  }

  return (
    <div className="h-screen flex flex-col dark:bg-gray-900">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
        <a className="text-2xl font-bold dark:text-white" href="/Database-workbench">
          Workbench
        </a>
        <div className="space-x-2 flex items-center">
        <ExportDropdown onExportDbml={handleExportDbml} onExportSql={handleExportSql} />

          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-grow relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          elementsSelectable={true}
          onSelectionChange={onSelectionChange}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
        >
          <Background />
          <Controls />
        </ReactFlow>
        {nodes.length === 0 && <InfoBox />}
      </div>
    </div>
  )
}

